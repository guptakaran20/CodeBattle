"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ArenaDashboard() {
  const router = useRouter();
  const [battleCodeInput, setBattleCodeInput] = useState('');
  const [recentBattles, setRecentBattles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/battles');
        if (res.data.success) {
          setRecentBattles(res.data.data.battles);
        }
      } catch (error) {
        console.error('Failed to fetch battle history', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!battleCodeInput.trim()) return;
    router.push(`/battle/${battleCodeInput.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Arena Dashboard</h1>
          <p className="text-lg text-gray-600 mt-2">Create, join, or view your battle history.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Create a Battle</CardTitle>
              <CardDescription>Start a new room and invite others</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/arena/create')} className="w-full" size="lg">
                Create New Battle
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Join a Battle</CardTitle>
              <CardDescription>Have an invite code? Enter it here</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinSubmit} className="flex gap-4">
                <div className="flex-1">
                  <Input 
                    placeholder="e.g. CA-A1B2C3D4" 
                    value={battleCodeInput} 
                    onChange={e => setBattleCodeInput(e.target.value)} 
                    className="uppercase"
                  />
                </div>
                <Button type="submit" variant="secondary">Join Room</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Battles</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : recentBattles.length === 0 ? (
              <p className="text-gray-500">You haven't participated in any battles yet.</p>
            ) : (
              <div className="space-y-4">
                {recentBattles.map(battle => (
                  <div key={battle.battleCode} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                    <div>
                      <h3 className="font-bold text-lg text-blue-600">{battle.battleCode}</h3>
                      <p className="text-sm text-gray-500">
                        {battle.battleType} • {battle.battleMode} • {battle.durationMinutes} mins
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                        battle.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        battle.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                        battle.status === 'WAITING' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {battle.status}
                      </span>
                      <div className="mt-2">
                        <Link href={`/battle/${battle.battleCode}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
