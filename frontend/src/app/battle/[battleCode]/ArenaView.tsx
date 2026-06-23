"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import Editor, { useMonaco } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Play, Send, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ArenaViewProps {
  battle: any;
  socketHook: any; // The return value of useBattleSocket
  currentUser: any;
}

export default function ArenaView({ battle, socketHook, currentUser }: ArenaViewProps) {
  const problem = battle.problem;
  const [language, setLanguage] = useState<'CPP' | 'JAVA' | 'PYTHON'>('PYTHON');
  const [code, setCode] = useState<string>(problem.starterCode?.PYTHON || '');
  const [activeTab, setActiveTab] = useState<'testcases' | 'result' | 'feed'>('testcases');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState<any>(null);
  const [verdictData, setVerdictData] = useState<any>(null);
  
  const [pendingSubmissionId, setPendingSubmissionId] = useState<string | null>(null);
  const [pendingTimeoutId, setPendingTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const { isConnected, participants, battle: socketBattle, submissionHistory, winner } = socketHook;

  // Local storage persistence
  useEffect(() => {
    const key = `battle:${battle.battleCode}:${language}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setCode(saved);
    } else {
      setCode(problem.starterCode?.[language] || '');
    }
  }, [language, battle.battleCode, problem.starterCode]);

  const handleCodeChange = (val: string | undefined) => {
    const newCode = val || '';
    setCode(newCode);
    localStorage.setItem(`battle:${battle.battleCode}:${language}`, newCode);
  };

  // Listen to socket events for verdicts
  useEffect(() => {
    if (!pendingSubmissionId) return;

    // Find if the pending submission is in the history and has a verdict
    const event = submissionHistory.find((s: any) => s.submissionId === pendingSubmissionId && s.verdict);
    
    if (event) {
      // We got the verdict from the socket
      setVerdictData(event);
      setSubmitting(false);
      setPendingSubmissionId(null);
      if (pendingTimeoutId) clearTimeout(pendingTimeoutId);
    }
  }, [submissionHistory, pendingSubmissionId, pendingTimeoutId]);

  useEffect(() => {
    if (winner) {
      toast.success(`Battle Completed! ${winner.username} has won!`, {
        duration: 8000,
        position: 'top-center'
      });
    }
  }, [winner]);

  const handleRunCode = async () => {
    setRunning(true);
    setActiveTab('result');
    setRunResult(null);
    setVerdictData(null);
    try {
      const res = await api.post(`/submissions/run`, {
        problemId: problem._id,
        language,
        code
      });
      if (res.data.success) {
        setRunResult(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to run code');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    setSubmitting(true);
    setActiveTab('result');
    setRunResult(null);
    setVerdictData({ verdict: 'PENDING' });
    try {
      // 1. Post to submission endpoint
      const res = await api.post(`/submissions`, {
        battleId: battle._id,
        problemId: problem._id,
        language,
        code,
        attemptNumber: 1
      });
      
      const submissionId = res.data.data.submission._id;
      setPendingSubmissionId(submissionId);

      // 20 sec fallback timeout
      const timeout = setTimeout(async () => {
        try {
          const fallbackRes = await api.get(`/submissions/single/${submissionId}`);
          if (fallbackRes.data.success) {
            const sub = fallbackRes.data.data.submission;
            if (sub && sub.status !== 'PENDING') {
              setVerdictData({ ...sub, verdict: sub.status });
              setSubmitting(false);
              setPendingSubmissionId(null);
              toast.info("Result received via fallback polling.");
            } else {
              setSubmitting(false);
              toast.error("Evaluation timed out.");
            }
          }
        } catch (e) {
          setSubmitting(false);
        }
      }, 20000);
      setPendingTimeoutId(timeout);

    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit code');
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 text-slate-900 overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b bg-white flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-lg">{problem.title}</h1>
          <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold">{problem.difficulty}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Status */}
          {socketBattle?.status === 'COMPLETED' && (
            <span className="text-green-600 font-bold px-3 py-1 bg-green-50 rounded">Battle Completed!</span>
          )}
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value as any)}
            className="border rounded px-2 py-1 text-sm outline-none"
          >
            <option value="PYTHON">Python</option>
            <option value="CPP">C++</option>
            <option value="JAVA">Java</option>
          </select>
          <Button variant="secondary" size="sm" onClick={handleRunCode} disabled={running || submitting}>
            <Play className="w-4 h-4 mr-1" /> {running ? 'Running...' : 'Run'}
          </Button>
          <Button variant="default" size="sm" onClick={handleSubmitCode} disabled={running || submitting || socketBattle?.status === 'COMPLETED'}>
            <Send className="w-4 h-4 mr-1" /> {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </header>

      {/* Main content */}
      <ResizablePanelGroup direction={"horizontal" as any} className="flex-1">
        {/* Left Panel: Problem */}
        <ResizablePanel defaultSize={40} minSize={20} className="border-r bg-white p-6 overflow-y-auto">
          <div className="prose prose-sm max-w-none">
            <h2 className="text-xl font-bold mb-4">{problem.title}</h2>
            <div dangerouslySetInnerHTML={{ __html: problem.description }} className="mb-8" />
            
            {problem.examples && problem.examples.map((ex: any, idx: number) => (
              <div key={idx} className="mb-6">
                <p className="font-semibold mb-2">Example {idx + 1}:</p>
                <div className="bg-slate-50 p-4 rounded-lg border font-mono text-sm">
                  <p><strong>Input:</strong> {ex.input}</p>
                  <p><strong>Output:</strong> {ex.output}</p>
                  {ex.explanation && <p><strong>Explanation:</strong> {ex.explanation}</p>}
                </div>
              </div>
            ))}

            {problem.constraints && problem.constraints.length > 0 && (
              <div>
                <p className="font-semibold mb-2">Constraints:</p>
                <ul className="list-disc pl-5 space-y-1 bg-slate-50 p-4 rounded-lg border font-mono text-sm">
                  {problem.constraints.map((c: string, idx: number) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel: Editor & Console */}
        <ResizablePanel defaultSize={60}>
          <ResizablePanelGroup direction={"vertical" as any}>
            <ResizablePanel defaultSize={70}>
              <Editor
                height="100%"
                language={language.toLowerCase()}
                value={code}
                onChange={handleCodeChange}
                theme="light"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineHeight: 24,
                  padding: { top: 16 },
                }}
              />
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={30} minSize={10} className="bg-white flex flex-col">
              <div className="flex items-center gap-4 px-4 h-10 border-b border-t bg-slate-50">
                <button 
                  className={`text-sm font-medium h-full px-2 border-b-2 ${activeTab === 'testcases' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}
                  onClick={() => setActiveTab('testcases')}
                >
                  Testcases
                </button>
                <button 
                  className={`text-sm font-medium h-full px-2 border-b-2 ${activeTab === 'result' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}
                  onClick={() => setActiveTab('result')}
                >
                  Test Result
                </button>
                <button 
                  className={`text-sm font-medium h-full px-2 border-b-2 ${activeTab === 'feed' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}
                  onClick={() => setActiveTab('feed')}
                >
                  Battle Feed
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
                {activeTab === 'feed' ? (
                  <div className="space-y-3">
                    {submissionHistory.map((item: any, idx: number) => {
                      if (item.verdict) {
                        return (
                          <div key={idx} className="p-2 bg-slate-100 rounded flex justify-between items-center border">
                            <span><span className="font-bold">{item.username}</span> got <span className={`font-semibold ${item.verdict === 'ACCEPTED' ? 'text-green-600' : 'text-red-600'}`}>{item.verdict}</span></span>
                          </div>
                        );
                      } else if (item.status) {
                        return null; // Intermediate step, we can ignore or show if desired
                      } else {
                        return (
                          <div key={idx} className="p-2 bg-slate-100 rounded text-slate-600 flex items-center gap-2 border">
                            <Clock className="w-4 h-4 animate-spin"/>
                            <span><span className="font-bold">{item.username}</span> is judging...</span>
                          </div>
                        );
                      }
                    })}
                    {submissionHistory.length === 0 && <div className="text-slate-500 italic">No activity yet. Wait for someone to submit code.</div>}
                  </div>
                ) : activeTab === 'testcases' ? (
                  <div className="space-y-4">
                    {problem.testcases.map((tc: any, i: number) => (
                      <div key={i} className="border p-3 rounded">
                        <div className="text-xs text-slate-500 mb-1">Case {i + 1}</div>
                        <div><span className="font-bold text-slate-700">Input:</span> {tc.input}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    {running && <div className="text-slate-500 flex items-center gap-2"><Clock className="w-4 h-4 animate-spin"/> Running...</div>}
                    {submitting && <div className="text-slate-500 flex items-center gap-2"><Clock className="w-4 h-4 animate-spin"/> Evaluating...</div>}
                    
                    {!running && !submitting && runResult && (
                      <div className="space-y-4">
                        <h3 className={`text-lg font-bold ${runResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                          {runResult.passed ? 'Accepted' : 'Wrong Answer'}
                        </h3>
                        {runResult.results.map((r: any, idx: number) => (
                          <div key={idx} className="border p-3 rounded bg-slate-50">
                            <div className="font-bold mb-1 flex items-center justify-between">
                              <span>Test Case {idx + 1}</span>
                              <span className={r.status.id === 3 ? 'text-green-600' : 'text-red-600'}>{r.status.description}</span>
                            </div>
                            {r.compile_output && (
                              <div className="text-red-600 mt-2 whitespace-pre-wrap">{Buffer.from(r.compile_output, 'base64').toString('utf-8')}</div>
                            )}
                            {r.stdout && (
                              <div className="mt-2">
                                <span className="font-semibold">Stdout:</span>
                                <div className="bg-slate-200 p-2 rounded mt-1">{Buffer.from(r.stdout, 'base64').toString('utf-8')}</div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {!running && !submitting && verdictData && verdictData.verdict !== 'PENDING' && (
                      <div className="space-y-4">
                        <h3 className={`text-lg font-bold ${verdictData.verdict === 'ACCEPTED' ? 'text-green-600' : 'text-red-600'}`}>
                          {verdictData.verdict}
                        </h3>
                        {verdictData.verdictReason && (
                          <p className="text-slate-600">{verdictData.verdictReason}</p>
                        )}
                        <div className="flex gap-6 mt-4">
                          <div><span className="text-slate-500">Time:</span> {verdictData.executionTime || 0}s</div>
                          <div><span className="text-slate-500">Memory:</span> {verdictData.memory || 0}KB</div>
                          <div><span className="text-slate-500">Tests:</span> {verdictData.passedTests} / {verdictData.totalTests}</div>
                        </div>
                        {verdictData.compileOutput && (
                          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded border border-red-200 whitespace-pre-wrap">
                            {verdictData.compileOutput}
                          </div>
                        )}
                      </div>
                    )}

                    {!running && !submitting && !runResult && !verdictData && (
                      <div className="text-slate-400 italic">Run or submit code to see results.</div>
                    )}
                  </div>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
