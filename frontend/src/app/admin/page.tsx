'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {api} from '@/lib/api';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [healthStatus, setHealthStatus] = useState<string>('Checking...');
  const [loading, setLoading] = useState(true);

  // Tournament Form State
  const [newTournament, setNewTournament] = useState({
    title: '',
    description: '',
    difficulty: 'EASY',
    battleDuration: 15,
    maxParticipants: 4,
    prizePool: 'Glory',
    startTime: ''
  });

  useEffect(() => {
    // Only allow ADMIN role
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    if (user && user.role === 'ADMIN') {
      fetchTournaments();
      checkHealth();
    }
  }, [user, router]);

  const checkHealth = async () => {
    try {
      // Direct fetch for base URL without /api prefix
      const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/health' || 'http://localhost:4000/health');
      if (res.ok) {
        setHealthStatus('ONLINE');
      } else {
        setHealthStatus('DEGRADED');
      }
    } catch (error) {
      setHealthStatus('OFFLINE');
    }
  };

  const fetchTournaments = async () => {
    try {
      const res = await api.get('/tournaments');
      if (res.data.success) {
        setTournaments(res.data.data.tournaments);
      }
    } catch (error) {
      console.error('Failed to fetch tournaments', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/tournaments', newTournament);
      if (res.data.success) {
        toast.success('Tournament created successfully!');
        fetchTournaments();
        setNewTournament({
          title: '',
          description: '',
          difficulty: 'EASY',
          battleDuration: 15,
          maxParticipants: 4,
          prizePool: 'Glory',
          startTime: ''
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create tournament');
    }
  };

  const handleAction = async (id: string, action: string) => {
    try {
      await api.post(`/tournaments/${id}/${action}`);
      toast.success(`Tournament ${action} successful!`);
      fetchTournaments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action}`);
    }
  };

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="container mx-auto p-6 md:p-8 max-w-7xl">
      <h1 className="text-4xl font-bold font-headline-lg mb-8">Admin Portal</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Health & Create Form */}
        <div className="space-y-8">
          
          {/* Health Widget */}
          <div className="bg-surface-container border border-surface-variant rounded-2xl p-6 shadow-md">
            <h2 className="text-xl font-bold font-headline-lg mb-4 flex items-center gap-2">
              <span className="text-xl">🖥️</span> System Health
            </h2>
            <div className="flex items-center gap-4">
              <div className={`w-4 h-4 rounded-full ${healthStatus === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-error'}`}></div>
              <span className="font-semibold text-lg">{healthStatus}</span>
            </div>
            <button onClick={checkHealth} className="mt-4 text-xs font-bold text-primary hover:underline">Refresh Status</button>
          </div>

          {/* Create Tournament Form */}
          <div className="bg-surface-container border border-surface-variant rounded-2xl p-6 shadow-md">
            <h2 className="text-xl font-bold font-headline-lg mb-4 flex items-center gap-2">
              <span className="text-xl">🏆</span> Create Tournament
            </h2>
            <form onSubmit={handleCreateTournament} className="space-y-4">
              <div>
                <label className="block text-xs font-label-caps uppercase tracking-wider text-on-surface-variant mb-1">Title</label>
                <input 
                  type="text" required
                  value={newTournament.title} 
                  onChange={e => setNewTournament({...newTournament, title: e.target.value})}
                  className="w-full bg-surface-container-high border border-surface-variant rounded-xl p-3 focus:outline-none focus:border-primary transition-colors text-sm" 
                  placeholder="e.g. Summer Code Clash" 
                />
              </div>

              <div>
                <label className="block text-xs font-label-caps uppercase tracking-wider text-on-surface-variant mb-1">Start Time</label>
                <input 
                  type="datetime-local" required
                  value={newTournament.startTime} 
                  onChange={e => setNewTournament({...newTournament, startTime: e.target.value})}
                  className="w-full bg-surface-container-high border border-surface-variant rounded-xl p-3 focus:outline-none focus:border-primary transition-colors text-sm" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-label-caps uppercase tracking-wider text-on-surface-variant mb-1">Max Players</label>
                  <select 
                    value={newTournament.maxParticipants} 
                    onChange={e => setNewTournament({...newTournament, maxParticipants: Number(e.target.value)})}
                    className="w-full bg-surface-container-high border border-surface-variant rounded-xl p-3 focus:outline-none focus:border-primary text-sm"
                  >
                    <option value={4}>4</option>
                    <option value={8}>8</option>
                    <option value={16}>16</option>
                    <option value={32}>32</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-label-caps uppercase tracking-wider text-on-surface-variant mb-1">Difficulty</label>
                  <select 
                    value={newTournament.difficulty} 
                    onChange={e => setNewTournament({...newTournament, difficulty: e.target.value})}
                    className="w-full bg-surface-container-high border border-surface-variant rounded-xl p-3 focus:outline-none focus:border-primary text-sm"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-label-caps uppercase tracking-wider text-on-surface-variant mb-1">Match Time (mins)</label>
                <input 
                  type="number" required min="5" max="60"
                  value={newTournament.battleDuration} 
                  onChange={e => setNewTournament({...newTournament, battleDuration: Number(e.target.value)})}
                  className="w-full bg-surface-container-high border border-surface-variant rounded-xl p-3 focus:outline-none focus:border-primary text-sm" 
                />
              </div>

              <button type="submit" className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">
                Create Tournament
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Management Table */}
        <div className="lg:col-span-2">
          <div className="bg-surface-container border border-surface-variant rounded-2xl p-6 shadow-md h-full">
            <h2 className="text-xl font-bold font-headline-lg mb-6 flex items-center gap-2">
              <span className="text-xl">⚙️</span> Tournament Management
            </h2>
            
            {loading ? (
              <p className="text-on-surface-variant text-center py-10">Loading tournaments...</p>
            ) : tournaments.length === 0 ? (
              <p className="text-on-surface-variant text-center py-10">No tournaments exist yet.</p>
            ) : (
              <div className="space-y-4">
                {tournaments.map(t => (
                  <div key={t._id} className="bg-surface-container-low border border-surface-variant rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="font-bold text-lg">{t.title}</h3>
                      <div className="flex gap-2 text-xs font-code-sm text-on-surface-variant mt-1">
                        <span>{t.status}</span>
                        <span>•</span>
                        <span>{t.difficulty}</span>
                        <span>•</span>
                        <span>{t.currentParticipantsCount || 0}/{t.maxParticipants}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {(t.status === 'DRAFT' || t.status === 'REGISTRATION') && (
                        <button onClick={() => handleAction(t._id, 'open-checkin')} className="px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded font-bold text-xs hover:bg-primary/30 transition-colors">
                          Open Check-in
                        </button>
                      )}
                      
                      {t.status === 'CHECK_IN' && (
                        <button onClick={() => handleAction(t._id, 'start')} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-bold text-xs hover:bg-emerald-500/30 transition-colors">
                          Start Tournament
                        </button>
                      )}
                      
                      {['DRAFT', 'REGISTRATION', 'CHECK_IN'].includes(t.status) && (
                        <button onClick={() => handleAction(t._id, 'cancel')} className="px-4 py-2 bg-error/20 text-error border border-error/30 rounded font-bold text-xs hover:bg-error/30 transition-colors">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
