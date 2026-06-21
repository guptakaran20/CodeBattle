"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.success) {
        router.push('/profile');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-green-600">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold text-green-600 tracking-tight">CodeArena</CardTitle>
          <CardDescription className="text-gray-500 mt-2">Create a new gladiator account</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col pt-2 pb-6 space-y-4">
          <form onSubmit={handleRegister} className="space-y-4 text-left">
            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Register</Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account? <Link href="/login" className="text-green-600 hover:underline">Sign in here</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
