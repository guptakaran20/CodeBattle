"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [formData, setFormData] = useState({ bio: '', college: '', country: '', name: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const router = useRouter();

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        const userData = res.data.data.user;
        setUser(userData);
        setFormData({
          bio: userData.bio || '',
          college: userData.college || '',
          country: userData.country || '',
          name: userData.name || ''
        });
      }
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      router.push('/login');
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    try {
      const res = await api.patch('/users/me', formData);
      if (res.data.success) {
        setUser({ ...user, ...res.data.data.user });
        setEditing(false);
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Failed to update profile', error);
    }
  };

  const handleLinkSuccess = async (credentialResponse: any) => {
    try {
      const res = await api.post('/auth/google/link', { credential: credentialResponse.credential });
      if (res.data.success) {
        setUser(res.data.data.user);
        toast.success('Account successfully verified with Google!');
      }
    } catch (error) {
      toast.error('Failed to verify account');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const res = await api.patch('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (res.data.success) {
        toast.success('Password updated successfully');
        setChangingPassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center font-semibold text-lg text-gray-600">Loading your arena profile...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Gladiator Profile</h1>
          <Button variant="destructive" onClick={handleLogout} className="font-semibold">Logout</Button>
        </div>
        
        {!user.isGoogleVerified && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-blue-900">Verification Required</h3>
              <p className="text-blue-700 text-sm mt-1">You must verify your account with Google to participate in contests and update your profile.</p>
            </div>
            <div className="mt-4 sm:mt-0 flex-shrink-0">
              <GoogleLogin onSuccess={handleLinkSuccess} theme="filled_blue" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="md:col-span-1 shadow-md">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-32 h-32 rounded-full border-4 border-blue-100 shadow-sm" />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold text-3xl">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
              <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
              <p className="text-gray-500 font-medium">@{user.username}</p>
              <span className="inline-block mt-3 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                {user.rank}
              </span>
            </CardHeader>
            <CardContent className="text-center pt-4">
              {editing ? (
                <div className="space-y-4 text-left">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Input value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} placeholder="Code warrior..." />
                  </div>
                  <div className="space-y-2">
                    <Label>College</Label>
                    <Input value={formData.college} onChange={(e) => setFormData({...formData, college: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button className="w-full" onClick={handleSave}>Save</Button>
                    <Button variant="outline" className="w-full" onClick={() => setEditing(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {user.bio && <p className="text-gray-700 italic">"{user.bio}"</p>}
                  {user.college && <p className="text-sm text-gray-600">🎓 {user.college}</p>}
                  {user.country && <p className="text-sm text-gray-600">🌍 {user.country}</p>}
                  <Button variant="outline" className="w-full mt-4" onClick={() => setEditing(true)}>Edit Profile</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-8">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">Battle Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-100 rounded-xl flex flex-col items-center justify-center">
                    <p className="text-sm text-gray-500 font-medium">Rating</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-1">{user.rating}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl flex flex-col items-center justify-center border border-green-100">
                    <p className="text-sm text-green-600 font-medium">Wins</p>
                    <p className="text-3xl font-extrabold text-green-700 mt-1">{user.wins}</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-xl flex flex-col items-center justify-center border border-red-100">
                    <p className="text-sm text-red-600 font-medium">Losses</p>
                    <p className="text-3xl font-extrabold text-red-700 mt-1">{user.losses}</p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-xl flex flex-col items-center justify-center">
                    <p className="text-sm text-gray-500 font-medium">Draws</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-1">{user.draws}</p>
                  </div>
                </div>
                  <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                  <p className="text-gray-500 font-medium">Total Battles Played</p>
                  <p className="text-2xl font-bold">{user.battlesPlayed}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">Account Security</CardTitle>
              </CardHeader>
              <CardContent>
                {changingPassword ? (
                  <div className="space-y-4 max-w-sm">
                    {user.hasPassword && (
                      <div className="space-y-2">
                        <Label>Current Password</Label>
                        <Input type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm New Password</Label>
                      <Input type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleChangePassword}>Update Password</Button>
                      <Button variant="outline" onClick={() => setChangingPassword(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Keep your account secure by updating your password regularly.
                    </p>
                    <Button variant="outline" onClick={() => setChangingPassword(true)}>
                      {user.hasPassword ? 'Change Password' : 'Set Password'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
