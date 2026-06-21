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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await api.post('/auth/google', { credential: credentialResponse.credential });
      if (res.data.success) {
        router.push('/profile');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Google Login Failed');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        router.push('/profile');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-blue-600">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold text-blue-600 tracking-tight">CodeArena</CardTitle>
          <CardDescription className="text-gray-500 mt-2">Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col pt-2 pb-6 space-y-6">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
            <div className="space-y-2 text-left">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <Label>Password</Label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot Password?</Link>
              </div>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full">Sign In</Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin onSuccess={handleGoogleSuccess} theme="outline" size="large" />
          </div>

          <p className="text-center text-sm text-gray-600 mt-4">
            Don't have an account? <Link href="/register" className="text-blue-600 hover:underline">Register here</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
