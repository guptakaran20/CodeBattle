"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Medal, Swords, Target, Activity, Flame, Shield, Zap } from 'lucide-react';

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
    if (username) fetchProfile();
  }, [username]);

  if (error) return <div className="min-h-screen flex items-center justify-center text-destructive">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Profile Header */}
      <Card className="bg-surface-bright border-border overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/20 to-surface-bright"></div>
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16">
            <div className="w-32 h-32 bg-surface rounded-full flex items-center justify-center border-4 border-background shadow-lg overflow-hidden">
              {loading ? (
                <Skeleton className="w-full h-full rounded-full" />
              ) : profile?.avatar ? (
                <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl font-black text-primary uppercase">{profile?.username.charAt(0)}</span>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-2 pb-2">
              {loading ? (
                <>
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-headline font-black text-foreground">{profile?.name}</h1>
                  <p className="text-muted-foreground font-mono">@{profile?.username}</p>
                </>
              )}
            </div>
            
            <div className="pb-2">
              {loading ? (
                <Skeleton className="h-10 w-32" />
              ) : (
                <div className="bg-primary/10 border border-primary/30 px-6 py-2 rounded-lg text-primary font-bold font-mono">
                  {profile?.stats?.rating || 1500} ELO
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Col: Info & Achievements */}
        <div className="space-y-8">
          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <>
                  <p className="text-muted-foreground text-sm">{profile?.bio || 'No bio provided.'}</p>
                  <div className="pt-4 space-y-2 text-sm">
                    {profile?.college && <div className="flex justify-between"><span className="text-muted-foreground">College</span><span className="font-medium text-foreground">{profile.college}</span></div>}
                    {profile?.country && <div className="flex justify-between"><span className="text-muted-foreground">Country</span><span className="font-medium text-foreground">{profile.country}</span></div>}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Trophy size={18} className="text-amber-500"/> Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-24 w-full" />
              ) : (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 border border-amber-500/20"><Flame size={20}/></div>
                    <div className="text-xs font-bold text-muted-foreground">Hot Streak</div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-500/20"><Shield size={20}/></div>
                    <div className="text-xs font-bold text-muted-foreground">Defender</div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 border border-blue-500/20"><Zap size={20}/></div>
                    <div className="text-xs font-bold text-muted-foreground">Fast Solver</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Stats & Graph */}
        <div className="md:col-span-2 space-y-8">
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Matches', value: profile?.stats?.totalBattles || 0, icon: Swords, color: 'text-blue-500' },
              { label: 'Wins', value: profile?.stats?.wins || 0, icon: Target, color: 'text-emerald-500' },
              { label: 'Losses', value: profile?.stats?.losses || 0, icon: Activity, color: 'text-red-500' },
              { label: 'Win Rate', value: profile?.stats?.totalBattles ? `${Math.round((profile?.stats?.wins / profile?.stats?.totalBattles) * 100)}%` : '0%', icon: Medal, color: 'text-purple-500' }
            ].map((stat, i) => (
              <Card key={i} className="bg-surface-bright border-border">
                <CardContent className="p-6 text-center space-y-2">
                  <stat.icon className={`w-6 h-6 mx-auto ${stat.color}`} />
                  {loading ? (
                    <Skeleton className="h-8 w-16 mx-auto" />
                  ) : (
                    <div className="text-2xl font-mono font-bold text-foreground">{stat.value}</div>
                  )}
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mock Rating Graph */}
          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle>Rating History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="h-64 border border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground flex-col gap-2">
                  <Activity className="w-8 h-8 text-primary/50" />
                  <span className="font-mono text-sm">Rating graph rendering...</span>
                  <span className="text-xs">(Requires Recharts / D3 in production)</span>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
