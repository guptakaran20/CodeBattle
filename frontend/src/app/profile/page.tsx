"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
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
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated) {
      fetchProfile();
    }
  }, [authLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      await logout();
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
      toast.error('Failed to update profile');
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
      toast.error('Keys do not match');
      return;
    }
    try {
      const res = await api.patch('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (res.data.success) {
        toast.success('Security key updated successfully');
        setChangingPassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update key');
    }
  };

  if (authLoading || loading || !user) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const getRank = (elo: number) => {
    if (elo < 1200) return 'Novice';
    if (elo < 1500) return 'Apprentice';
    if (elo < 1800) return 'Pro';
    if (elo < 2100) return 'Master';
    return 'Grandmaster';
  };

  return (
    <div className="max-w-[1280px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 font-body-md text-on-surface">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg text-[28px] md:text-[32px] font-bold tracking-tight text-on-surface mb-2">
            Gladiator Profile
          </h1>
          <p className="font-code-sm text-sm text-on-surface-variant">
            Manage your public identity and account security.
          </p>
        </div>
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-2 bg-error/10 text-error hover:bg-error/20 px-4 py-2 rounded-lg font-label-caps text-xs tracking-widest uppercase transition-colors border border-error/20"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Sign Out
        </button>
      </div>
      
      {/* Google Link Warning */}
      {!user.isGoogleVerified && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-primary/10 to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-primary font-headline-lg">Verification Required</h3>
            <p className="text-on-surface-variant text-sm mt-1 font-code-sm">Link your Google terminal to unlock competitive battles and profile customization.</p>
          </div>
          <div className="mt-4 sm:mt-0 flex-shrink-0 relative z-10">
            <GoogleLogin onSuccess={handleLinkSuccess} theme="outline" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Identity Card */}
        <div className="md:col-span-4 space-y-8">
          <div className="bg-surface-container border border-surface-variant rounded-xl overflow-hidden shadow-lg relative">
            <div className="absolute top-0 left-0 w-full h-32 bg-surface-container-high border-b border-surface-variant"></div>
            
            <div className="p-6 relative z-10 flex flex-col items-center text-center mt-8">
              <div className="w-32 h-32 rounded-xl bg-surface-variant border-4 border-surface-container flex items-center justify-center font-bold text-primary text-5xl shadow-xl overflow-hidden mb-4">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.name?.charAt(0).toUpperCase() || 'D'
                )}
              </div>
              
              <h2 className="text-2xl font-bold font-headline-lg">{user.name}</h2>
              <p className="text-primary font-code-sm font-semibold tracking-wider">@{user.username}</p>
              
              <div className="inline-block mt-4 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm font-label-caps tracking-widest uppercase font-bold shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                {getRank(user.rating)}
              </div>
            </div>

            <div className="px-6 pb-8 text-center border-t border-surface-variant pt-6 bg-surface-container-low">
              {editing ? (
                <div className="space-y-4 text-left">
                  <div className="space-y-2">
                    <label className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider">Display Name</label>
                    <input 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      className="w-full bg-surface-dim border border-surface-bright rounded-lg py-2.5 px-4 font-code-sm text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider">Bio</label>
                    <input 
                      value={formData.bio} 
                      onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                      placeholder="Code warrior..." 
                      className="w-full bg-surface-dim border border-surface-bright rounded-lg py-2.5 px-4 font-code-sm text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider">College</label>
                    <input 
                      value={formData.college} 
                      onChange={(e) => setFormData({...formData, college: e.target.value})} 
                      className="w-full bg-surface-dim border border-surface-bright rounded-lg py-2.5 px-4 font-code-sm text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider">Country</label>
                    <input 
                      value={formData.country} 
                      onChange={(e) => setFormData({...formData, country: e.target.value})} 
                      className="w-full bg-surface-dim border border-surface-bright rounded-lg py-2.5 px-4 font-code-sm text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button onClick={handleSave} className="flex-1 py-2 bg-primary text-on-primary rounded-lg font-label-caps text-xs tracking-widest uppercase hover:bg-primary-fixed transition-colors">Save</button>
                    <button onClick={() => setEditing(false)} className="flex-1 py-2 bg-surface-container-high border border-surface-variant rounded-lg font-label-caps text-xs tracking-widest uppercase hover:border-surface-bright transition-colors">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {user.bio ? (
                    <p className="text-on-surface font-code-sm italic">"{user.bio}"</p>
                  ) : (
                    <p className="text-on-surface-variant/50 font-code-sm italic text-sm">No bio provided</p>
                  )}
                  
                  <div className="flex flex-col gap-2 items-center pt-2">
                    {user.college && (
                      <div className="flex items-center gap-2 text-sm font-code-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px]">school</span> {user.college}
                      </div>
                    )}
                    {user.country && (
                      <div className="flex items-center gap-2 text-sm font-code-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px]">public</span> {user.country}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => setEditing(true)} 
                    className="w-full mt-4 py-2.5 bg-surface-container-high border border-surface-variant rounded-lg font-label-caps text-xs tracking-widest uppercase hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span> Edit Identity
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Security */}
        <div className="md:col-span-8 space-y-8">
          
          <div className="bg-surface-container border border-surface-variant rounded-xl p-6 md:p-8 shadow-lg">
            <h2 className="font-headline-lg text-xl font-semibold border-b border-surface-variant pb-2 mb-6">Combat Statistics</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-surface-container-low border border-surface-variant rounded-xl p-4 flex flex-col items-center justify-center text-center group hover:border-primary transition-colors">
                <span className="font-label-caps text-xs font-semibold tracking-widest uppercase text-on-surface-variant mb-1 group-hover:text-primary transition-colors">Rating</span>
                <span className="font-headline-lg text-3xl font-bold text-on-surface">{user.rating}</span>
              </div>
              <div className="bg-surface-container-low border border-surface-variant rounded-xl p-4 flex flex-col items-center justify-center text-center group hover:border-emerald-500 transition-colors">
                <span className="font-label-caps text-xs font-semibold tracking-widest uppercase text-on-surface-variant mb-1 group-hover:text-emerald-500 transition-colors">Wins</span>
                <span className="font-headline-lg text-3xl font-bold text-emerald-400">{user.statistics?.wins || 0}</span>
              </div>
              <div className="bg-surface-container-low border border-surface-variant rounded-xl p-4 flex flex-col items-center justify-center text-center group hover:border-error transition-colors">
                <span className="font-label-caps text-xs font-semibold tracking-widest uppercase text-on-surface-variant mb-1 group-hover:text-error transition-colors">Losses</span>
                <span className="font-headline-lg text-3xl font-bold text-error">{(user.statistics?.totalBattles || 0) - (user.statistics?.wins || 0)}</span>
              </div>
              <div className="bg-surface-container-low border border-surface-variant rounded-xl p-4 flex flex-col items-center justify-center text-center group hover:border-surface-bright transition-colors">
                <span className="font-label-caps text-xs font-semibold tracking-widest uppercase text-on-surface-variant mb-1">Draws</span>
                <span className="font-headline-lg text-3xl font-bold text-on-surface">{user.statistics?.draws || 0}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-surface-variant flex justify-between items-center">
              <p className="font-label-caps text-xs font-semibold tracking-widest uppercase text-on-surface-variant">Total Engagements</p>
              <p className="font-headline-lg text-2xl font-bold">{user.statistics?.totalBattles || 0}</p>
            </div>
          </div>

          <div className="bg-surface-container border border-surface-variant rounded-xl p-6 md:p-8 shadow-lg">
            <h2 className="font-headline-lg text-xl font-semibold border-b border-surface-variant pb-2 mb-6">Security Protocols</h2>
            
            {changingPassword ? (
              <div className="space-y-4 w-full sm:w-[400px] bg-surface-container-low border border-surface-variant p-6 rounded-xl">
                {user.hasPassword && (
                  <div className="space-y-2">
                    <label className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider">Current Key</label>
                    <input 
                      type="password" 
                      value={passwordData.currentPassword} 
                      onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} 
                      className="w-full bg-surface-dim border border-surface-bright rounded-lg py-2.5 px-4 font-code-sm text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider">New Key</label>
                  <input 
                    type="password" 
                    value={passwordData.newPassword} 
                    onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} 
                    className="w-full bg-surface-dim border border-surface-bright rounded-lg py-2.5 px-4 font-code-sm text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider">Confirm New Key</label>
                  <input 
                    type="password" 
                    value={passwordData.confirmPassword} 
                    onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                    className="w-full bg-surface-dim border border-surface-bright rounded-lg py-2.5 px-4 font-code-sm text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={handleChangePassword} className="flex-1 py-2 bg-primary text-on-primary rounded-lg font-label-caps text-xs tracking-widest uppercase hover:bg-primary-fixed transition-colors">Update Key</button>
                  <button onClick={() => setChangingPassword(false)} className="flex-1 py-2 bg-surface-container-high border border-surface-variant rounded-lg font-label-caps text-xs tracking-widest uppercase hover:border-surface-bright transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-code-sm text-sm text-on-surface mb-1">Authorization Key</p>
                  <p className="font-code-sm text-xs text-on-surface-variant">
                    Keep your account secure by rotating your authorization key regularly.
                  </p>
                </div>
                <button 
                  onClick={() => setChangingPassword(true)}
                  className="py-2.5 px-6 bg-surface-container-high border border-surface-variant rounded-lg font-label-caps text-xs tracking-widest uppercase hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
                >
                  {user.hasPassword ? 'Rotate Key' : 'Establish Key'}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
