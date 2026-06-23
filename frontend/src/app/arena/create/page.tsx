"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function CreateBattlePage() {
  const router = useRouter();
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    problemId: '',
    battleType: 'ONE_VS_ONE',
    battleMode: 'COMPETITIVE',
    durationMinutes: 30,
    maxParticipants: 2,
    visibility: 'PUBLIC'
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await api.get('/problems');
        if (res.data.success) {
          setProblems(res.data.data.problems);
          if (res.data.data.problems.length > 0) {
            setFormData(prev => ({ ...prev, problemId: res.data.data.problems[0]._id }));
          }
        }
      } catch (error) {
        toast.error('Failed to load problems');
      }
    };
    fetchProblems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.problemId) {
      toast.error('Please select a problem');
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        ...formData,
        settings: {
          visibility: formData.visibility,
          allowSpectators: true,
          aiReviewEnabled: true
        }
      };
      
      const res = await api.post('/battles', payload);
      if (res.data.success) {
        toast.success('Battle created!');
        router.push(`/battle/${res.data.data.battle.battleCode}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create battle');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-surface-dim border border-surface-bright rounded-lg py-2.5 px-4 font-code-sm text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all";
  const labelClass = "font-label-caps text-xs text-on-surface-variant uppercase tracking-wider block mb-2";

  return (
    <div className="max-w-[1280px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 font-body-md text-on-surface">
      
      {/* Header */}
      <div>
        <h1 className="font-headline-lg text-[28px] md:text-[32px] font-bold tracking-tight text-on-surface mb-2">
          Initialize Combat Matrix
        </h1>
        <p className="font-code-sm text-sm text-on-surface-variant">
          Configure the parameters of your upcoming coding battle.
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-surface-container border border-surface-variant rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-primary/5 to-transparent pointer-events-none"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            
            <div className="space-y-2">
              <label className={labelClass}>Target Objective</label>
              <select 
                className={inputClass}
                value={formData.problemId} 
                onChange={e => setFormData({...formData, problemId: e.target.value})}
                required
              >
                <option value="" disabled className="bg-surface text-on-surface-variant">Select an algorithm to conquer...</option>
                {problems.map(p => (
                  <option key={p._id} value={p._id} className="bg-surface text-on-surface">
                    {p.title} ({p.difficulty})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClass}>Combat Scale</label>
                <select 
                  className={inputClass}
                  value={formData.battleType} 
                  onChange={e => {
                    const type = e.target.value;
                    let max = 2;
                    if (type === 'TWO_VS_TWO') max = 4;
                    if (type === 'FOUR_VS_FOUR') max = 8;
                    if (type === 'TOURNAMENT') max = 16;
                    setFormData({...formData, battleType: type, maxParticipants: max});
                  }}
                >
                  <option value="ONE_VS_ONE" className="bg-surface text-on-surface">1 vs 1</option>
                  <option value="TWO_VS_TWO" className="bg-surface text-on-surface">2 vs 2</option>
                  <option value="FOUR_VS_FOUR" className="bg-surface text-on-surface">4 vs 4</option>
                  <option value="TOURNAMENT" className="bg-surface text-on-surface">Tournament</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Engagement Mode</label>
                <select 
                  className={inputClass}
                  value={formData.battleMode} 
                  onChange={e => setFormData({...formData, battleMode: e.target.value})}
                >
                  <option value="COMPETITIVE" className="bg-surface text-on-surface">Competitive (Ranked)</option>
                  <option value="PRACTICE" className="bg-surface text-on-surface">Practice (Unranked)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClass}>Time Limit (Minutes)</label>
                <input 
                  type="number" 
                  min="5" 
                  max="180" 
                  className={inputClass}
                  value={formData.durationMinutes} 
                  onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value)})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className={labelClass}>Visibility Protocol</label>
                <select 
                  className={inputClass}
                  value={formData.visibility} 
                  onChange={e => setFormData({...formData, visibility: e.target.value})}
                >
                  <option value="PUBLIC" className="bg-surface text-on-surface">Public Arena</option>
                  <option value="PRIVATE" className="bg-surface text-on-surface">Private Instance</option>
                </select>
              </div>
            </div>

            <div className="pt-8 flex gap-4">
              <button 
                type="button" 
                onClick={() => router.back()}
                className="px-6 py-3 bg-surface-container-high border border-surface-variant rounded-lg font-label-caps text-xs tracking-widest uppercase hover:border-surface-bright hover:bg-surface-variant transition-colors"
              >
                Abort
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="flex-1 py-3 bg-primary text-on-primary rounded-lg font-label-caps text-xs tracking-widest uppercase hover:bg-primary-fixed hover:shadow-[0_0_20px_rgba(255,193,116,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Initializing...' : 'Deploy Arena'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
