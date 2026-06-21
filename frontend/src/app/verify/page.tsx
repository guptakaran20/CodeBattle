"use client";

import { useEffect, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

export default function VerifyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if already verified
    api.get('/auth/me').then((res) => {
      if (res.data.success && res.data.data.user.isGoogleVerified) {
        router.push('/profile');
      } else {
        setLoading(false);
      }
    }).catch(() => {
      router.push('/login');
    });
  }, [router]);

  const handleLinkSuccess = async (credentialResponse: any) => {
    try {
      const res = await api.post('/auth/google/link', { credential: credentialResponse.credential });
      if (res.data.success) {
        router.push('/profile');
      }
    } catch (error) {
      console.error('Verification failed:', error);
      alert('Verification failed. Please try again.');
    }
  };

  if (loading) return null;

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg text-center">
        <CardHeader>
          <div className="mx-auto mb-4 bg-blue-100 p-4 rounded-full w-20 h-20 flex items-center justify-center">
            <ShieldCheck className="w-10 h-10 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Identity</CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            To ensure a fair and secure battle arena, all gladiators must link a verified Google account before participating.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center pb-8 pt-4">
          <GoogleLogin onSuccess={handleLinkSuccess} theme="filled_blue" size="large" />
        </CardContent>
      </Card>
    </div>
  );
}
