"use client";

import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [googleCredential, setGoogleCredential] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = (credentialResponse: any) => {
    setGoogleCredential(credentialResponse.credential);
    toast.success('Google Identity Verified. Please set your new password.');
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password/reset', {
        credential: googleCredential,
        newPassword
      });
      if (res.data.success) {
        toast.success('Password reset successfully! You can now log in.');
        router.push('/login');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-blue-600 text-center">
        <CardHeader>
          <div className="mx-auto mb-4 bg-blue-100 p-4 rounded-full w-20 h-20 flex items-center justify-center">
            <ShieldCheck className="w-10 h-10 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Forgot Password</CardTitle>
          <CardDescription className="text-gray-500 mt-2">
            {!googleCredential 
              ? "Verify your identity with Google to reset your password."
              : "Set your new password below."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col pt-2 pb-6 space-y-6">
          {!googleCredential ? (
            <div className="flex flex-col items-center space-y-4">
              <GoogleLogin onSuccess={handleGoogleSuccess} theme="outline" size="large" />
              <p className="text-sm text-gray-500 px-4">
                You must sign in with the Google account that matches your email address.
              </p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4 text-left">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full flex items-center justify-center gap-2" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'} <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          )}

          <div className="mt-4">
            <Link href="/login" className="text-sm text-blue-600 hover:underline">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
