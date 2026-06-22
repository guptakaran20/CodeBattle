"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Users, Clock, ShieldAlert, CheckCircle2, Copy } from 'lucide-react';

export default function BattleLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const battleCode = params.battleCode as string;

  const [battle, setBattle] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchBattle = async () => {
    try {
      const res = await api.get(`/battles/${battleCode}`);
      if (res.data.success) {
        setBattle(res.data.data.battle);
      }
    } catch (error) {
      toast.error('Battle not found');
      router.push('/arena');
    }
  };

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setCurrentUser(res.data.data.user);
      }
    } catch (error) {
      // Not logged in
    }
  };

  useEffect(() => {
    Promise.all([fetchBattle(), fetchUser()]).finally(() => setLoading(false));
  }, [battleCode]);

  const handleJoin = async () => {
    try {
      const res = await api.post(`/battles/${battleCode}/join`);
      if (res.data.success) {
        toast.success('Successfully joined the battle!');
        fetchBattle(); // Refresh
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to join');
    }
  };

  const handleStart = async () => {
    try {
      const res = await api.post(`/battles/${battleCode}/start`);
      if (res.data.success) {
        toast.success('Battle Started!');
        fetchBattle(); // Refresh
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start');
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(battleCode);
    toast.success('Battle code copied to clipboard!');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Lobby...</div>;
  if (!battle) return <div className="min-h-screen flex items-center justify-center">Battle not found.</div>;

  const allMembers = battle.teams.flatMap((t: any) => t.members);
  const isParticipant = currentUser && allMembers.some((m: any) => m._id === currentUser._id);
  const isCreator = currentUser && battle.creator._id === currentUser._id;
  const isFull = allMembers.length >= battle.maxParticipants;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Battle Lobby</h1>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                battle.status === 'WAITING' ? 'bg-blue-100 text-blue-800' :
                battle.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {battle.status}
              </span>
            </div>
            <p className="text-gray-500 mt-1">Host: {battle.creator.username}</p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Invite Code</div>
            <div className="text-xl font-mono font-bold tracking-wider text-blue-600">{battle.battleCode}</div>
            <button onClick={copyCode} className="text-gray-400 hover:text-blue-600 transition-colors">
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>

        {battle.status === 'IN_PROGRESS' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg shadow-sm">
            <h3 className="text-lg font-bold text-yellow-800 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Battle is currently in progress!
            </h3>
            <p className="text-yellow-700 mt-2">
              The coding arena UI will be unlocked in Phase 4. For now, the battle lifecycle is active in the backend.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  Participants ({allMembers.length} / {battle.maxParticipants})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {battle.teams.map((team: any, idx: number) => (
                    <div key={team.teamId} className="p-6">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Team {idx + 1}</h4>
                      <div className="flex flex-col gap-3">
                        {team.members.map((member: any) => (
                          <div key={member._id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold uppercase">
                              {member.username.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{member.username}</p>
                              {member._id === battle.creator._id && <span className="text-xs text-blue-500 font-medium">Host</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Battle Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Mode</span>
                  <span className="font-medium">{battle.battleMode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Type</span>
                  <span className="font-medium">{battle.battleType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Duration</span>
                  <span className="font-medium flex items-center gap-1"><Clock className="w-4 h-4"/> {battle.durationMinutes} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Visibility</span>
                  <span className="font-medium">{battle.settings.visibility}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            {battle.status === 'WAITING' && (
              <Card className="shadow-sm border-blue-200">
                <CardContent className="p-6">
                  {!isParticipant ? (
                    <div className="text-center space-y-4">
                      <p className="text-sm text-gray-600">You have been invited to join this battle.</p>
                      <Button onClick={handleJoin} disabled={isFull} className="w-full" size="lg">
                        {isFull ? 'Battle is Full' : 'Join Battle'}
                      </Button>
                    </div>
                  ) : isCreator ? (
                    <div className="text-center space-y-4">
                      <p className="text-sm text-gray-600">You are the host. Start when ready.</p>
                      <Button 
                        onClick={handleStart} 
                        disabled={allMembers.length < 2} 
                        className="w-full bg-green-600 hover:bg-green-700" 
                        size="lg"
                      >
                        Start Battle
                      </Button>
                      {allMembers.length < 2 && (
                        <p className="text-xs text-red-500">Waiting for more players to join...</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center space-y-4 flex flex-col items-center">
                      <CheckCircle2 className="w-12 h-12 text-green-500" />
                      <p className="text-sm font-medium text-gray-900">You're in!</p>
                      <p className="text-xs text-gray-500">Waiting for host to start...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
}
