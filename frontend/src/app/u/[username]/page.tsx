"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trophy, Medal, Swords, Target, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${username}`);
        if (res.data.success) {
          setProfile(res.data.data.user);
        }
      } catch (err: any) {
        setError('User not found.');
      } finally {
        setLoading(false);
      }
    };
    if (username) {
      fetchProfile();
    }
  }, [username]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Profile...</div>;
  if (error || !profile) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-5xl font-bold uppercase shadow-sm">
            {profile.avatar ? <img src={profile.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" /> : profile.username.charAt(0)}
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-3">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">{profile.name}</h1>
              <p className="text-lg text-gray-500 font-mono">@{profile.username}</p>
            </div>
            
            <p className="text-gray-600 max-w-xl">{profile.bio || 'No bio provided.'}</p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-500 pt-2">
              {profile.college && <span className="bg-gray-100 px-3 py-1 rounded-full">{profile.college}</span>}
              {profile.country && <span className="bg-gray-100 px-3 py-1 rounded-full">{profile.country}</span>}
              <span className="bg-gray-100 px-3 py-1 rounded-full text-indigo-600 font-medium">Rank: {profile.stats?.rank || 'Unranked'}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{profile.stats?.rating || 1200}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Rating</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <Medal className="w-8 h-8 text-green-500 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{profile.stats?.wins || 0}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Wins</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <Target className="w-8 h-8 text-red-500 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{profile.stats?.losses || 0}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Losses</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <Swords className="w-8 h-8 text-blue-500 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{profile.stats?.draws || 0}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Draws</div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
