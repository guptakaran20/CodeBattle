"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Medal, Swords, Target, Activity, Flame, Shield, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const [profile, setProfile] = useState<any>(null);
  const [ratingHistory, setRatingHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, historyRes] = await Promise.all([
          api.get(`/users/${username}`),
          api.get(`/users/${username}/rating-history`).catch(() => ({ data: { success: false } }))
        ]);
        
        if (profileRes.data.success) {
          setProfile(profileRes.data.data.user);
        }
        if (historyRes.data?.success) {
          setRatingHistory(historyRes.data.data.history);
        }
      } catch (err: any) {
        if (!profile) setError('User not found.');
      } finally {
        setLoading(false);
      }
    };
    
    if (username) {
      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
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
                  {profile?.rating || 1500} ELO
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
              <CardTitle className="flex items-center gap-2"><Activity size={18} className="text-primary"/> Recent Matches</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && !ratingHistory.length ? (
                <Skeleton className="h-48 w-full" />
              ) : ratingHistory.length > 0 ? (
                <div className="space-y-3">
                  {[...ratingHistory].reverse().slice(0, 5).map((match: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface-bright border border-border">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${match.outcome === 'WIN' ? 'bg-emerald-500' : match.outcome === 'LOSS' ? 'bg-red-500' : 'bg-slate-500'}`} />
                        <div>
                          <div className="font-bold text-sm text-foreground">{match.outcome}</div>
                          <div className="text-xs text-muted-foreground">{new Date(match.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-mono font-bold text-sm ${match.delta > 0 ? 'text-emerald-500' : match.delta < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                          {match.delta > 0 ? '+' : ''}{match.delta}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">{match.newRating} ELO</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg bg-surface-bright">
                  No recent matches.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Stats & Graph */}
        <div className="md:col-span-2 space-y-8">
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Matches', value: profile?.battlesPlayed || 0, icon: Swords, color: 'text-blue-500' },
              { label: 'Wins', value: profile?.wins || 0, icon: Target, color: 'text-emerald-500' },
              { label: 'Losses', value: profile?.losses || 0, icon: Activity, color: 'text-red-500' },
              { label: 'Win Rate', value: profile?.battlesPlayed ? `${Math.round((profile?.wins / profile?.battlesPlayed) * 100)}%` : '0%', icon: Medal, color: 'text-purple-500' }
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

          {/* Rating Graph */}
          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle>Rating History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && !ratingHistory.length ? (
                <Skeleton className="h-64 w-full" />
              ) : ratingHistory.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ratingHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis 
                        dataKey="createdAt" 
                        tickFormatter={(val) => new Date(val).toLocaleDateString()}
                        stroke="#888" 
                        fontSize={12}
                        tickMargin={10}
                      />
                      <YAxis 
                        domain={['auto', 'auto']} 
                        stroke="#888" 
                        fontSize={12}
                        tickMargin={10}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e1e2d', borderColor: '#333', borderRadius: '8px' }}
                        itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                        labelFormatter={(label) => new Date(label).toLocaleString()}
                        formatter={(value: number) => [`${value} ELO`, 'Rating']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="newRating" 
                        stroke="#f59e0b" 
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#1e1e2d', stroke: '#f59e0b', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                        animationDuration={500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 border border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground flex-col gap-2">
                  <Activity className="w-8 h-8 text-primary/50" />
                  <span className="font-mono text-sm">No rating history available</span>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
