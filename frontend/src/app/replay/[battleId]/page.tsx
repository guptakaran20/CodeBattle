"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useUI } from '@/context/UIContext';
import { Trophy, Clock, Users, ArrowLeft, Activity, FastForward, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';

export default function ReplayPage() {
  const params = useParams();
  const router = useRouter();
  const battleId = params.battleId as string;
  const { setSidebarVisible } = useUI();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [reviewingSubmissionId, setReviewingSubmissionId] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    // Show sidebar in replay page
    setSidebarVisible(true);
  }, [setSidebarVisible]);

  useEffect(() => {
    const fetchReplayData = async () => {
      try {
        const [summaryRes, timelineRes] = await Promise.all([
          api.get(`/replays/${battleId}/summary`),
          api.get(`/replays/${battleId}/timeline`)
        ]);

        if (summaryRes.data.success) {
          setSummary(summaryRes.data.data.summary);
        }
        if (timelineRes.data.success) {
          setTimeline(timelineRes.data.data.timeline);
        }
      } catch (err: any) {
        toast.error('Failed to load replay data');
        router.push('/history');
      } finally {
        setLoading(false);
      }
    };

    fetchReplayData();
  }, [battleId, router]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const handleRequestReview = async (submissionId: string) => {
    try {
      setReviewingSubmissionId(submissionId);
      setShowReviewModal(true);
      setReviewData(null); // Clear previous
      
      const res = await api.post(`/ai/review/${submissionId}`);
      if (res.data.success) {
        setReviewData(res.data.data);
      }
    } catch (err: any) {
      if (err.response?.status === 429) {
        toast.error('AI Request limit exceeded. Please try again tomorrow.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to generate AI Review');
      }
      setShowReviewModal(false);
    } finally {
      setReviewingSubmissionId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-8">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-on-surface">
        <h2 className="text-2xl font-bold mb-4">Replay Not Found</h2>
        <button onClick={() => router.push('/history')} className="text-primary hover:underline">
          Return to History
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 font-body-md text-on-surface">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors font-label-caps tracking-widest text-xs uppercase">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Battle Summary Card */}
      <div className="bg-surface border border-surface-variant rounded-xl p-6 relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between border-b border-surface-variant pb-4 mb-6">
            <h1 className="text-3xl font-headline font-black flex items-center gap-3">
              <FastForward className="text-primary w-8 h-8" />
              Match Replay
            </h1>
            <span className={`px-3 py-1 rounded text-xs font-bold font-mono tracking-wider ${summary.finalStatus === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-error/10 text-error border border-error/20'}`}>
              {summary.finalStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-lg border border-surface-variant">
              <Trophy className="w-8 h-8 text-[#ffc174]" />
              <div>
                <div className="text-xs text-on-surface-variant uppercase tracking-widest font-label-caps">Winner</div>
                <div className="text-lg font-bold font-code-md text-[#ffc174]">{summary.winner ? summary.winner.username : 'Draw / None'}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-lg border border-surface-variant">
              <Clock className="w-8 h-8 text-primary" />
              <div>
                <div className="text-xs text-on-surface-variant uppercase tracking-widest font-label-caps">Duration</div>
                <div className="text-lg font-bold font-code-md">{formatDuration(summary.duration)}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-lg border border-surface-variant">
              <Users className="w-8 h-8 text-secondary" />
              <div>
                <div className="text-xs text-on-surface-variant uppercase tracking-widest font-label-caps">Participants</div>
                <div className="text-lg font-bold font-code-md">{summary.participants.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Card */}
      <div className="bg-surface border border-surface-variant rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-headline font-bold mb-6 flex items-center gap-2 border-b border-surface-variant pb-4">
          <Activity className="w-5 h-5 text-primary" /> Event Timeline
        </h2>
        
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-surface-variant before:to-transparent">
          {timeline.map((item, idx) => {
            const isImportant = ['SubmissionAccepted', 'PlayerWon', 'BattleCompleted', 'BattleStarted'].includes(item.eventType);
            const isError = ['WrongAnswer', 'CompilationError', 'TimeLimitExceeded', 'RUNTIME_ERROR'].includes(item.eventType);
            
            return (
              <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={`flex items-center justify-center w-4 h-4 rounded-full border-2 bg-[#0e0e11] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${isImportant ? 'border-primary' : isError ? 'border-error' : 'border-surface-variant'}`}></div>
                <div className={`w-[calc(100%-2rem)] md:w-[calc(50%-2rem)] p-4 rounded-lg border ${isImportant ? 'bg-primary/5 border-primary/20' : isError ? 'bg-error/5 border-error/20' : 'bg-surface-container border-surface-variant'} shadow-sm text-sm transition-all hover:-translate-y-0.5 hover:shadow-md`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-on-surface">{item.summaryText}</span>
                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{item.time}</span>
                  </div>
                  
                  {item.metadata && Object.keys(item.metadata).length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono bg-[#0a0a0c] p-2 rounded border border-surface-variant/50">
                      {item.metadata.executionTime !== undefined && (
                        <div><span className="text-on-surface-variant">Time:</span> <span className="text-emerald-400">{item.metadata.executionTime}s</span></div>
                      )}
                      {item.metadata.memory !== undefined && (
                        <div><span className="text-on-surface-variant">Memory:</span> <span className="text-secondary">{item.metadata.memory}KB</span></div>
                      )}
                      {item.metadata.passedTests !== undefined && (
                        <div><span className="text-on-surface-variant">Tests:</span> <span className={item.metadata.passedTests === item.metadata.totalTests ? 'text-emerald-400' : 'text-error'}>{item.metadata.passedTests}/{item.metadata.totalTests}</span></div>
                      )}
                      {item.metadata.reason && (
                        <div className="col-span-2 text-on-surface-variant truncate"><span className="text-on-surface-variant">Note:</span> {item.metadata.reason}</div>
                      )}
                    </div>
                  )}

                  {/* AI Code Review Button for Submissions */}
                  {item.metadata?.submissionId && (
                    <div className="mt-3">
                      <button 
                        onClick={() => handleRequestReview(item.metadata.submissionId)}
                        disabled={reviewingSubmissionId === item.metadata.submissionId}
                        className="flex items-center justify-center gap-2 w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded text-xs font-bold font-label-caps uppercase tracking-wider transition-colors disabled:opacity-50"
                      >
                        {reviewingSubmissionId === item.metadata.submissionId ? (
                          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        AI Code Review
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {timeline.length === 0 && (
          <div className="text-center text-on-surface-variant py-12 italic">
            No events found for this replay.
          </div>
        )}
      </div>

      {/* AI Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container border border-primary/30 rounded-xl shadow-[0_0_40px_rgba(255,193,116,0.1)] w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-surface-variant flex items-center justify-between bg-surface">
              <h2 className="text-xl font-headline font-bold flex items-center gap-2">
                <Sparkles className="text-primary w-5 h-5" /> AI Code Review
              </h2>
              <button onClick={() => setShowReviewModal(false)} className="text-on-surface-variant hover:text-on-surface">
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto font-body-md text-on-surface">
              {!reviewData ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-on-surface-variant">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="animate-pulse">Analyzing code logic and complexity...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-surface-container-low p-3 rounded border border-surface-variant">
                      <div className="text-[10px] uppercase font-label-caps text-on-surface-variant mb-1">Time Complexity</div>
                      <div className="font-mono text-primary font-bold">{reviewData.timeComplexity}</div>
                    </div>
                    <div className="bg-surface-container-low p-3 rounded border border-surface-variant">
                      <div className="text-[10px] uppercase font-label-caps text-on-surface-variant mb-1">Space Complexity</div>
                      <div className="font-mono text-secondary font-bold">{reviewData.spaceComplexity}</div>
                    </div>
                    <div className="bg-surface-container-low p-3 rounded border border-surface-variant">
                      <div className="text-[10px] uppercase font-label-caps text-on-surface-variant mb-1">Best Practices</div>
                      <div className={`font-mono font-bold ${reviewData.bestPracticesScore >= 80 ? 'text-emerald-400' : 'text-[#ffc174]'}`}>
                        {reviewData.bestPracticesScore}/100
                      </div>
                    </div>
                  </div>

                  {reviewData.missedEdgeCases && reviewData.missedEdgeCases.length > 0 && (
                    <div className="bg-error/10 border border-error/20 rounded p-4">
                      <h3 className="text-error font-bold text-sm mb-2 font-label-caps uppercase tracking-wider">Missed Edge Cases</h3>
                      <ul className="list-disc list-inside text-sm text-error/90 space-y-1">
                        {reviewData.missedEdgeCases.map((ec: string, i: number) => (
                          <li key={i}>{ec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="prose prose-invert prose-primary max-w-none border-t border-surface-variant pt-6 mt-6">
                    <ReactMarkdown>{reviewData.markdownCritique}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
