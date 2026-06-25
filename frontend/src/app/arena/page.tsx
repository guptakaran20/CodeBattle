"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useMatchmakingSocket } from '@/hooks/useMatchmakingSocket';
import { useAuth } from '@/context/AuthContext';
import { Search, Swords, Target, Crosshair, Activity, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ArenaDashboard() {
  const router = useRouter();
  const [battleCodeInput, setBattleCodeInput] = useState('');
  const [liveFeed, setLiveFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiTopic, setAiTopic] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);
  
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { isConnected, queueState, queueStatus, matchFound } = useMatchmakingSocket();

  useEffect(() => {
    // Initial fetch of live feed
    api.get('/matchmaking/feed')
      .then(res => {
        if (res.data.success && res.data.data) {
          setLiveFeed(res.data.data);
        }
      })
      .catch(err => console.error('Failed to load feed history', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // We need the raw socket to listen to the global namespace.
    // useMatchmakingSocket doesn't expose the socket instance directly,
    // so we can quickly connect a new one or modify the hook to export it.
    // For simplicity, we just establish a quick connection to the root namespace
    // to listen for GLOBAL_FEED_UPDATE.
    
    import('socket.io-client').then(({ io }) => {
      const socketUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const feedSocket = io(socketUrl, { transports: ['websocket', 'polling'] });
      
      feedSocket.on('global_feed_update', (payload: any) => {
        setLiveFeed(prev => {
          // Remove duplicate if it's the same battle
          let newFeed = prev;
          if (payload.battleCode) {
            newFeed = prev.filter(item => item.battleCode !== payload.battleCode);
          }
          newFeed = [payload, ...newFeed];
          return newFeed.slice(0, 5); // Keep max 5
        });
      });

      return () => {
        feedSocket.disconnect();
      };
    });
  }, []);

  useEffect(() => {
    if (matchFound) {
      toast.success(`Match Found! Opponent ID: ${matchFound.opponentId}`);
      const timeout = setTimeout(() => {
        router.push(`/battle/${matchFound.battleCode}`);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [matchFound, router]);

  const handleJoinQueue = async (difficulty: string) => {
    try {
      await api.post('/matchmaking/join', { difficulty });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to join queue');
    }
  };

  const handleLeaveQueue = async () => {
    try {
      await api.post('/matchmaking/leave');
    } catch (err: any) {
      toast.error('Failed to leave queue');
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!battleCodeInput.trim()) return;
    router.push(`/battle/${battleCodeInput.trim().toUpperCase()}`);
  };

  const handleGenerateAiProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;
    
    try {
      setGeneratingAi(true);
      
      // 1. Generate Problem
      const res = await api.post('/ai/generate-problem', { topicOrBaseProblem: aiTopic });
      if (!res.data.success) throw new Error('Failed to generate problem');
      
      const newProblemId = res.data.data.problem._id;

      // 2. Create Practice Battle
      const battleRes = await api.post('/battles', {
        battleType: 'ONE_VS_ONE',
        battleMode: 'PRACTICE',
        maxParticipants: 2,
        problemId: newProblemId,
        durationMinutes: 30
      });

      if (!battleRes.data.success) throw new Error('Failed to create practice room');

      const battleCode = battleRes.data.data.battle.battleCode;
      toast.success('AI Problem Generated successfully!');
      
      // 3. Redirect to battle
      router.push(`/battle/${battleCode}`);
    } catch (err: any) {
      if (err.response?.status === 429) {
        toast.error('AI Request limit exceeded. Please try again tomorrow.');
      } else {
        toast.error(err.response?.data?.message || err.message || 'Failed to generate AI problem');
      }
    } finally {
      setGeneratingAi(false);
    }
  };

  return (
    <>
      {/* Auth Overlay */}
      {!authLoading && !isAuthenticated && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface-container border border-surface-variant p-10 rounded-xl flex flex-col items-center justify-center shadow-2xl text-center w-full max-w-[420px] h-auto m-auto">
            <div className="w-16 h-16 shrink-0 rounded-full bg-surface-variant flex items-center justify-center mb-4">
               <span className="material-symbols-outlined text-[32px] text-primary">lock</span>
            </div>
            <h2 className="text-2xl font-bold font-headline-lg mb-2">Sign In to Continue</h2>
            <p className="text-on-surface-variant text-sm mb-8 w-full" style={{ wordBreak: 'normal', whiteSpace: 'normal' }}>
              You must log in to join matchmaking queues, challenge players, and enter the Arena.
            </p>
            <Link href="/login" className="w-full py-3 bg-primary text-on-primary rounded font-label-caps text-xs uppercase tracking-widest hover:opacity-90 transition-opacity pointer-events-auto font-bold">
               Log In To Battle
            </Link>
          </div>
        </div>
      )}

    <div className="min-h-screen p-4 md:p-8 relative font-body-md text-on-surface">

      {queueState.isQueued && !matchFound && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <Card className="w-[400px] border-border shadow-2xl bg-surface">
            <CardHeader className="text-center pb-2">
              <Search className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
              <CardTitle className="text-2xl font-headline font-black">Searching</CardTitle>
              <CardDescription className="text-lg mt-2">
                Ranked 1v1 {queueState.difficulty}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="bg-surface-bright p-4 rounded-lg border border-border">
                <div className="text-4xl font-mono font-bold text-foreground">
                  {queueStatus ? `${queueStatus.queueTime}s` : '0s'}
                </div>
                <div className="text-sm text-muted-foreground mt-2 font-mono font-bold">
                  RATING RANGE: ±{queueStatus?.eloRange || 100}
                </div>
              </div>
              <Button variant="destructive" className="w-full font-bold uppercase tracking-wider" onClick={handleLeaveQueue}>
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {matchFound && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center">
          <div className="text-center space-y-8 scale-110 animate-in fade-in zoom-in duration-300">
            <h1 className="text-6xl font-headline font-black text-foreground drop-shadow-lg tracking-tight">MATCH FOUND</h1>
            <div className="bg-surface-bright p-8 rounded-2xl border-2 border-primary shadow-[0_0_50px_-12px_var(--primary)] backdrop-blur-sm">
              <div className="flex items-center justify-center gap-12">
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-500 rounded-full mx-auto mb-4 shadow-lg border-4 border-background"></div>
                  <div className="text-foreground font-bold text-2xl font-headline">You</div>
                </div>
                <div className="text-4xl font-black text-muted-foreground italic px-4">VS</div>
                <div className="text-center">
                  <div className="w-24 h-24 bg-red-500 rounded-full mx-auto mb-4 shadow-lg border-4 border-background"></div>
                  <div className="text-foreground font-bold text-2xl font-headline">Opponent</div>
                </div>
              </div>
            </div>
            <p className="text-primary font-mono text-xl font-bold animate-pulse">Entering Arena...</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-4xl font-headline font-black text-foreground tracking-tight flex items-center gap-3">
            <Swords className="text-primary" /> The Arena
          </h1>
          <p className="text-lg text-muted-foreground mt-2">Compete in ranked 1v1s, practice, or challenge friends.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Matchmaking Col */}
          <div className="xl:col-span-2 space-y-8">
            <h2 className="text-2xl font-headline font-bold text-foreground flex items-center gap-2"><Target className="text-primary"/> Ranked Queues</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="hover:border-emerald-500 transition-colors cursor-pointer group bg-surface border-border" onClick={() => handleJoinQueue('EASY')}>
                <CardHeader>
                  <CardTitle className="text-emerald-500 font-headline font-bold">Easy</CardTitle>
                  <CardDescription>Warm up matches</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full group-hover:bg-emerald-500/10 group-hover:text-emerald-500 group-hover:border-emerald-500 transition-colors font-bold tracking-wider">QUEUE</Button>
                </CardContent>
              </Card>
              <Card className="hover:border-amber-500 transition-colors cursor-pointer group bg-surface border-border" onClick={() => handleJoinQueue('MEDIUM')}>
                <CardHeader>
                  <CardTitle className="text-amber-500 font-headline font-bold">Medium</CardTitle>
                  <CardDescription>Standard competitive</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full group-hover:bg-amber-500/10 group-hover:text-amber-500 group-hover:border-amber-500 transition-colors font-bold tracking-wider">QUEUE</Button>
                </CardContent>
              </Card>
              <Card className="hover:border-red-500 transition-colors cursor-pointer group bg-surface border-border" onClick={() => handleJoinQueue('HARD')}>
                <CardHeader>
                  <CardTitle className="text-red-500 font-headline font-bold">Hard</CardTitle>
                  <CardDescription>For the elite</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full group-hover:bg-red-500/10 group-hover:text-red-500 group-hover:border-red-500 transition-colors font-bold tracking-wider">QUEUE</Button>
                </CardContent>
              </Card>
            </div>

            <h2 className="text-2xl font-headline font-bold text-foreground flex items-center gap-2 mt-12"><Crosshair className="text-primary"/> Custom Lobbies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-surface border-border">
                <CardHeader>
                  <CardTitle>Create Room</CardTitle>
                  <CardDescription>Host a private custom battle</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => router.push('/arena/create')} className="w-full font-bold tracking-wider" variant="secondary">CREATE</Button>
                </CardContent>
              </Card>
              <Card className="bg-surface border-border">
                <CardHeader>
                  <CardTitle>Join via Code</CardTitle>
                  <CardDescription>Enter a room code to join</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleJoinRoom} className="flex gap-2">
                    <Input placeholder="CODE" value={battleCodeInput} onChange={e => setBattleCodeInput(e.target.value)} className="uppercase font-mono font-bold bg-surface-bright" />
                    <Button type="submit" variant="secondary" className="font-bold tracking-wider">JOIN</Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <h2 className="text-2xl font-headline font-bold text-foreground flex items-center gap-2 mt-12"><Sparkles className="text-primary"/> AI Practice Room</h2>
            <Card className="bg-surface border-border overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
              <CardHeader>
                <CardTitle>Generate Similar Problem</CardTitle>
                <CardDescription>Type a topic or problem name (e.g. "Dynamic Programming" or "Two Sum") and let the AI instantly generate a unique coding challenge and test cases just for you.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerateAiProblem} className="flex gap-2 relative z-10">
                  <Input 
                    placeholder="e.g. Graph Traversal, Binary Search..." 
                    value={aiTopic} 
                    onChange={e => setAiTopic(e.target.value)} 
                    className="bg-surface-bright border-primary/20 focus-visible:ring-primary/50" 
                    disabled={generatingAi}
                  />
                  <Button type="submit" variant="default" className="font-bold tracking-wider relative overflow-hidden group" disabled={generatingAi || !aiTopic.trim()}>
                    {generatingAi ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
                        GENERATING...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> GENERATE
                      </span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">

            <Card className="bg-surface border-border flex-1 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity size={18} className="text-primary"/> Live Feed</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : (
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                    {liveFeed.map((item, idx) => (
                      <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-primary bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                        <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-md border border-border bg-surface-bright shadow-sm text-sm">
                          {item.event === 'MATCH_STARTED' && <div><span className="font-bold text-primary">{item.users[0]}</span> vs <span className="font-bold text-red-500">{item.users[1]}</span></div>}
                          {item.event === 'SUBMISSION' && <div><span className="font-bold text-primary">{item.user}</span> got <span className="text-emerald-500 font-bold">Accepted</span></div>}
                          {item.event === 'BATTLE_ENDED' && <div><span className="font-bold text-primary">{item.winner}</span> won the battle!</div>}
                          <div className="text-[10px] text-muted-foreground mt-1 font-mono">{item.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
