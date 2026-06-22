"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg border-t-4 border-t-blue-600">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create Battle Room</CardTitle>
            <CardDescription>Configure the settings for your coding battle.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-2">
                <Label>Select Problem</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.problemId} 
                  onChange={e => setFormData({...formData, problemId: e.target.value})}
                  required
                >
                  <option value="" disabled>Select a problem...</option>
                  {problems.map(p => (
                    <option key={p._id} value={p._id}>{p.title} ({p.difficulty})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Battle Type</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                    <option value="ONE_VS_ONE">1 vs 1</option>
                    <option value="TWO_VS_TWO">2 vs 2</option>
                    <option value="FOUR_VS_FOUR">4 vs 4</option>
                    <option value="TOURNAMENT">Tournament</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Battle Mode</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.battleMode} 
                    onChange={e => setFormData({...formData, battleMode: e.target.value})}
                  >
                    <option value="COMPETITIVE">Competitive (Ranked)</option>
                    <option value="PRACTICE">Practice (Unranked)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Duration (Minutes)</Label>
                  <Input 
                    type="number" 
                    min="5" 
                    max="180" 
                    value={formData.durationMinutes} 
                    onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value)})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.visibility} 
                    onChange={e => setFormData({...formData, visibility: e.target.value})}
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="PRIVATE">Private</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Battle'}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
