"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import Editor, { useMonaco } from '@monaco-editor/react';
import { Play, Send, Clock, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { useUI } from '@/context/UIContext';

interface ArenaViewProps {
  battle: any;
  socketHook: any; // The return value of useBattleSocket
  currentUser: any;
}

export default function ArenaView({ battle, socketHook, currentUser }: ArenaViewProps) {
  const router = useRouter();
  const { setSidebarVisible } = useUI();

  useEffect(() => {
    setSidebarVisible(false);
    return () => setSidebarVisible(true);
  }, [setSidebarVisible]);

  const problem = battle.problem;
  const [language, setLanguage] = useState<'CPP' | 'JAVA' | 'PYTHON'>('PYTHON');
  const [code, setCode] = useState<string>(problem.starterCode?.PYTHON || '');
  const [activeLeftTab, setActiveLeftTab] = useState<'desc' | 'hints' | 'subs'>('desc');
  const [activeRightTab, setActiveRightTab] = useState<'testcases' | 'result' | 'feed'>('feed');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState<any>(null);
  const [verdictData, setVerdictData] = useState<any>(null);
  
  const [pendingSubmissionId, setPendingSubmissionId] = useState<string | null>(null);
  const [pendingTimeoutId, setPendingTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const [timer, setTimer] = useState(0);

  const editorRef = useRef<any>(null);
  const [editorFontSize, setEditorFontSize] = useState(14);
  const [editorMinimap, setEditorMinimap] = useState(false);
  const [editorWordWrap, setEditorWordWrap] = useState<'on' | 'off'>('off');

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

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

  useEffect(() => {
    const calcTimer = () => {
      if (battle?.startTime) {
        const elapsed = Math.floor((Date.now() - new Date(battle.startTime).getTime()) / 1000);
        return Math.max(0, elapsed);
      }
      return 0;
    };
    
    setTimer(calcTimer());
    const interval = setInterval(() => setTimer(calcTimer()), 1000);
    return () => clearInterval(interval);
  }, [battle?.startTime]);

  const isExpired = battle?.durationMinutes && timer >= battle.durationMinutes * 60;
  
  useEffect(() => {
    if (isExpired || socketBattle?.status === 'COMPLETED') {
       toast.info("Battle has ended! Redirecting to results...");
       router.push(`/replay/${battle._id}`);
    }
  }, [isExpired, socketBattle?.status, battle._id, router]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleCodeChange = (val: string | undefined) => {
    const newCode = val || '';
    setCode(newCode);
    localStorage.setItem(`battle:${battle.battleCode}:${language}`, newCode);
  };

  useEffect(() => {
    if (!pendingSubmissionId) return;
    const event = submissionHistory.find((s: any) => s.submissionId === pendingSubmissionId && s.verdict);
    if (event) {
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
    setActiveRightTab('result');
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
    setActiveRightTab('result');
    setRunResult(null);
    setVerdictData({ verdict: 'PENDING' });
    try {
      const res = await api.post(`/submissions`, {
        battleId: battle._id,
        problemId: problem._id,
        language,
        code,
        attemptNumber: 1
      });
      
      const submissionId = res.data.data.submission._id;
      setPendingSubmissionId(submissionId);

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

  const handleLeaveBattle = async () => {
    if (!confirm("Are you sure you want to leave the battle? This will count as a forfeit.")) return;
    try {
      await api.post(`/battles/${battle.battleCode}/leave`);
      toast.success("You have left the battle.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to leave battle');
    }
  };

  const allMembers = battle.teams ? battle.teams.flatMap((t: any) => t.members) : [];
  const opponent = allMembers.find((m: any) => m._id !== currentUser.id && m._id !== currentUser._id) || { username: 'Opponent', rating: '--', avatar: '' };
  
  // Format description HTML to support dark theme (remove default white backgrounds if any, add custom styling classes)
  const formatDescription = (html: string) => {
     // A naive replacer to ensure pre and code blocks look dark. The global CSS might also handle it.
     return html;
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#0e0e11] text-on-surface overflow-hidden">
      
      {/* VS / Header Bar */}
      <header className="h-14 border-b border-surface-variant bg-[#0e0e11] flex items-center justify-between px-4 md:px-6 shrink-0 relative z-10">
        
        {/* Participants */}
        <div className="flex items-center gap-6">
          <div className="text-xl font-bold font-title-lg tracking-tight text-[#ffc174] mr-4 hidden md:block">
            Code<span className="text-on-surface">Arena</span>
          </div>
          <div className="flex items-center gap-3 bg-surface border border-surface-variant rounded-md px-3 py-1.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-surface-variant overflow-hidden border border-primary/50 flex items-center justify-center">
                 {currentUser.avatar ? <img src={currentUser.avatar} alt="You" /> : <span className="text-[10px] text-primary">{currentUser.username.charAt(0).toUpperCase()}</span>}
              </div>
              <span className="font-code-sm text-sm text-on-surface">You</span>
              <span className="font-code-sm text-sm text-emerald-400 ml-1">{currentUser.rating || 1000}</span>
            </div>
            <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-widest mx-1">VS</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-surface-variant overflow-hidden border border-error/50 flex items-center justify-center">
                 {opponent.avatar ? <img src={opponent.avatar} alt="Opponent" /> : <span className="text-[10px] text-error">{opponent.username.charAt(0).toUpperCase()}</span>}
              </div>
              <span className="font-code-sm text-sm text-on-surface">{opponent.username}</span>
              <span className="font-code-sm text-sm text-error ml-1">{opponent.rating || 1000}</span>
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
           <div className="flex items-center gap-2 border border-[#ffc174]/30 bg-[#ffc174]/10 text-[#ffc174] px-4 py-1.5 rounded-md font-code-md tracking-wider shadow-[0_0_15px_rgba(255,193,116,0.1)]">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timer)}</span>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button 
             onClick={handleLeaveBattle} 
             className="flex items-center gap-2 border border-error/50 hover:bg-error/10 text-error px-4 py-1.5 rounded-md font-label-caps text-xs tracking-widest uppercase transition-colors"
          >
            Leave
          </button>
          <button 
             onClick={handleRunCode} 
             disabled={running || submitting}
             className="flex items-center gap-2 border border-surface-variant hover:border-surface-bright bg-surface px-4 py-1.5 rounded-md font-label-caps text-xs tracking-widest uppercase transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            {running ? 'Running...' : 'Run Code'}
          </button>
          <button 
             onClick={handleSubmitCode} 
             disabled={running || submitting || socketBattle?.status === 'COMPLETED'}
             className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-6 py-1.5 rounded-md font-label-caps text-xs tracking-widest uppercase transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </header>

      {/* Main content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        
        {/* Left Panel: Problem */}
        <ResizablePanel defaultSize={40} minSize={20} className="bg-[#0e0e11] flex flex-col border-r border-surface-variant">
          <div className="flex items-center h-12 border-b border-surface-variant px-2 shrink-0 bg-[#0a0a0c]">
             <button 
                className={`h-full px-4 font-label-caps text-xs uppercase tracking-widest border-b-2 transition-colors ${activeLeftTab === 'desc' ? 'border-[#ffc174] text-[#ffc174]' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
                onClick={() => setActiveLeftTab('desc')}
             >
               Description
             </button>
             <button 
                className={`h-full px-4 font-label-caps text-xs uppercase tracking-widest border-b-2 transition-colors ${activeLeftTab === 'subs' ? 'border-[#ffc174] text-[#ffc174]' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
                onClick={() => setActiveLeftTab('subs')}
             >
               Submissions
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeLeftTab === 'desc' && (
               <div className="space-y-6">
                 <div className="flex items-center justify-between">
                   <h2 className="text-2xl font-bold font-headline-lg">{problem.title}</h2>
                   <span className="px-3 py-1 bg-[#ffc174]/10 border border-[#ffc174]/30 text-[#ffc174] rounded font-code-sm text-xs">{problem.difficulty}</span>
                 </div>
                 
                 {/* Fake Tags since backend doesn't provide them yet */}
                 <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-surface border border-surface-variant rounded text-on-surface-variant text-xs font-code-sm">Algorithm</span>
                    <span className="px-2 py-1 bg-surface border border-surface-variant rounded text-on-surface-variant text-xs font-code-sm">Data Structures</span>
                 </div>

                 <div 
                   className="font-body-md text-sm text-on-surface-variant leading-relaxed problem-description"
                   dangerouslySetInnerHTML={{ __html: formatDescription(problem.description) }} 
                 />
                 
                 {problem.examples && problem.examples.map((ex: any, idx: number) => (
                   <div key={idx} className="space-y-2">
                     <p className="font-semibold text-sm text-on-surface">Example {idx + 1}:</p>
                     <div className="bg-surface border border-surface-variant p-4 rounded-lg font-code-sm text-xs text-on-surface-variant space-y-2 shadow-inner">
                       <p><span className="text-[#ffc174]">Input:</span> {ex.input}</p>
                       <p><span className="text-[#ffc174]">Output:</span> {ex.output}</p>
                       {ex.explanation && <p><span className="text-on-surface">Explanation:</span> {ex.explanation}</p>}
                     </div>
                   </div>
                 ))}

                 {problem.constraints && problem.constraints.length > 0 && (
                   <div className="space-y-2">
                     <p className="font-semibold text-sm text-on-surface">Constraints:</p>
                     <div className="bg-surface border border-surface-variant p-4 rounded-lg font-code-sm text-xs text-on-surface-variant space-y-1 shadow-inner">
                       {problem.constraints.map((c: string, idx: number) => (
                         <div key={idx} className="flex items-center gap-2">
                           <div className="w-1 h-1 rounded-full bg-primary" />
                           {c}
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
            )}

            {activeLeftTab === 'subs' && (
               <div className="text-on-surface-variant text-sm italic">You haven't submitted any solutions yet.</div>
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle className="bg-surface-variant w-[2px]" />

        {/* Right Panel: Editor & Console */}
        <ResizablePanel defaultSize={60} className="bg-[#0e0e11] flex flex-col">
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70} className="flex flex-col">
              
              {/* Editor Header */}
              <div className="h-10 border-b border-surface-variant flex items-center justify-between px-4 shrink-0 bg-[#0a0a0c]">
                 <select 
                   value={language} 
                   onChange={(e) => setLanguage(e.target.value as any)}
                   className="bg-surface border border-surface-variant rounded px-3 py-1 font-code-sm text-xs text-on-surface outline-none focus:border-primary"
                 >
                   <option value="PYTHON">Python 3</option>
                   <option value="CPP">C++</option>
                   <option value="JAVA">Java</option>
                 </select>
                 
                 <div className="flex items-center gap-3 text-on-surface-variant">
                    <span 
                      className="material-symbols-outlined text-[18px] cursor-pointer hover:text-on-surface transition-colors"
                      title="Format Code"
                      onClick={formatCode}
                    >
                      format_align_left
                    </span>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger className="outline-none bg-transparent border-none p-0 flex items-center justify-center">
                        <span 
                          className="material-symbols-outlined text-[18px] cursor-pointer hover:text-on-surface transition-colors" 
                          title="Editor Settings"
                        >
                          settings
                        </span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end">
                        <div className="px-2 py-1.5 text-sm font-semibold text-on-surface-variant">Editor Settings</div>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem 
                          checked={editorMinimap} 
                          onCheckedChange={setEditorMinimap}
                          closeOnClick={false}
                        >
                          Show Minimap
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem 
                          checked={editorWordWrap === 'on'} 
                          onCheckedChange={(c) => setEditorWordWrap(c ? 'on' : 'off')}
                          closeOnClick={false}
                        >
                          Word Wrap
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem closeOnClick={false} onClick={(e) => e.preventDefault()} className="flex items-center justify-between">
                          <span>Font Size</span>
                          <div className="flex items-center gap-3">
                            <span 
                              className="material-symbols-outlined text-[18px] cursor-pointer hover:text-primary transition-colors"
                              onClick={(e) => { e.stopPropagation(); setEditorFontSize(f => Math.max(10, f - 2)); }}
                            >
                              remove
                            </span>
                            <span className="w-4 text-center text-xs font-mono">{editorFontSize}</span>
                            <span 
                              className="material-symbols-outlined text-[18px] cursor-pointer hover:text-primary transition-colors"
                              onClick={(e) => { e.stopPropagation(); setEditorFontSize(f => Math.min(24, f + 2)); }}
                            >
                              add
                            </span>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
              </div>

              <div className="flex-1 bg-[#1e1e1e]">
                <Editor
                  height="100%"
                  language={language.toLowerCase()}
                  value={code}
                  onChange={handleCodeChange}
                  theme="vs-dark"
                  onMount={handleEditorDidMount}
                  options={{
                    minimap: { enabled: editorMinimap },
                    fontSize: editorFontSize,
                    wordWrap: editorWordWrap,
                    lineHeight: 24,
                    padding: { top: 16 },
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                />
              </div>
            </ResizablePanel>
            
            <ResizableHandle className="bg-surface-variant h-[2px]" />
            
            <ResizablePanel defaultSize={30} minSize={10} className="bg-[#0e0e11] flex flex-col">
              
              {/* Console Header */}
              <div className="flex items-center h-10 border-b border-surface-variant px-2 shrink-0 bg-[#0a0a0c]">
                <button 
                  className={`flex items-center gap-2 h-full px-4 font-label-caps text-xs uppercase tracking-widest border-b-2 transition-colors ${activeRightTab === 'testcases' ? 'border-[#ffc174] text-[#ffc174]' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
                  onClick={() => setActiveRightTab('testcases')}
                >
                  <span className="material-symbols-outlined text-[16px]">code</span>
                  Test Cases
                </button>
                <button 
                  className={`flex items-center gap-2 h-full px-4 font-label-caps text-xs uppercase tracking-widest border-b-2 transition-colors ${activeRightTab === 'result' ? 'border-[#ffc174] text-[#ffc174]' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
                  onClick={() => setActiveRightTab('result')}
                >
                  <span className="material-symbols-outlined text-[16px]">fact_check</span>
                  Test Result
                </button>
                <button 
                  className={`flex items-center gap-2 h-full px-4 font-label-caps text-xs uppercase tracking-widest border-b-2 transition-colors ${activeRightTab === 'feed' ? 'border-[#ffc174] text-[#ffc174]' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
                  onClick={() => setActiveRightTab('feed')}
                >
                  <span className="material-symbols-outlined text-[16px]">radar</span>
                  Battle Feed
                </button>
              </div>

              {/* Console Body */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar font-code-sm text-sm">
                
                {activeRightTab === 'feed' ? (
                  <div className="space-y-2">
                    <div className="flex gap-4 items-start text-on-surface-variant">
                       <span className="text-surface-variant font-bold">
                         {battle?.startTime ? new Date(battle.startTime).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }) : '00:00'}
                       </span>
                       <span>Battle started. Problem constraints: {problem.difficulty}.</span>
                    </div>
                    {submissionHistory.map((item: any, idx: number) => {
                      const timeStr = item.timestamp 
                        ? new Date(item.timestamp).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }) 
                        : '--:--';
                        
                      if (item.verdict) {
                        const isWin = item.verdict === 'ACCEPTED';
                        return (
                          <div key={idx} className="flex gap-4 items-start text-on-surface">
                            <span className="text-surface-variant font-bold">{timeStr}</span>
                            <span>
                              <span className="font-bold text-[#ffc174]">{item.username}</span> got{' '}
                              <span className={isWin ? 'text-emerald-400' : 'text-error'}>{item.verdict}</span>.
                            </span>
                          </div>
                        );
                      } else if (item.status) {
                        return null; 
                      } else {
                        return (
                          <div key={idx} className="flex gap-4 items-start text-emerald-400">
                            <span className="text-surface-variant font-bold">{timeStr}</span>
                            <span>
                              <span className="font-bold">{item.username}</span> ran code (Judging).
                            </span>
                          </div>
                        );
                      }
                    })}
                    {submissionHistory.length === 0 && <div className="text-on-surface-variant/50 italic mt-4 px-12">No recent events.</div>}
                    
                    {/* Simulated opponent warning from screenshot */}
                    {submissionHistory.length > 0 && (
                      <div className="mt-6 border border-[#ffc174]/30 bg-[#ffc174]/5 rounded p-3 flex items-start gap-3">
                         <AlertTriangle className="w-4 h-4 text-[#ffc174] shrink-0 mt-0.5" />
                         <span className="text-on-surface-variant text-xs">Opponent is close to a solution. Stay focused.</span>
                      </div>
                    )}
                  </div>
                ) : activeRightTab === 'testcases' ? (
                  <div className="space-y-4">
                    {problem.testcases.map((tc: any, i: number) => (
                      <div key={i} className="bg-surface border border-surface-variant p-4 rounded-lg">
                        <div className="text-xs text-on-surface-variant font-label-caps uppercase tracking-widest border-b border-surface-variant pb-2 mb-2">Case {i + 1}</div>
                        <div className="text-on-surface break-all"><span className="text-on-surface-variant">Input:</span> {tc.input}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    {running && <div className="text-primary flex items-center gap-2"><Clock className="w-4 h-4 animate-spin"/> Running tests...</div>}
                    {submitting && <div className="text-primary flex items-center gap-2"><Clock className="w-4 h-4 animate-spin"/> Evaluating submission against hidden testcases...</div>}
                    
                    {!running && !submitting && runResult && (
                      <div className="space-y-4">
                        <h3 className={`text-xl font-bold font-headline-lg ${runResult.passed ? 'text-emerald-400' : 'text-error'}`}>
                          {runResult.passed ? 'Accepted' : 'Wrong Answer'}
                        </h3>
                        {runResult.results.map((r: any, idx: number) => (
                          <div key={idx} className="bg-surface border border-surface-variant p-4 rounded-lg">
                            <div className="font-bold mb-2 flex items-center justify-between border-b border-surface-variant pb-2">
                              <span className="font-label-caps uppercase tracking-widest text-xs text-on-surface-variant">Test Case {idx + 1}</span>
                              <span className={r.status.id === 3 ? 'text-emerald-400 text-xs' : 'text-error text-xs'}>{r.status.description}</span>
                            </div>
                            {r.compile_output && (
                              <div className="text-error mt-2 whitespace-pre-wrap">{Buffer.from(r.compile_output, 'base64').toString('utf-8')}</div>
                            )}
                            {r.stdout && (
                              <div className="mt-2">
                                <span className="font-label-caps text-[10px] uppercase text-on-surface-variant tracking-widest">Stdout</span>
                                <div className="bg-surface-container-high p-2 rounded mt-1 text-on-surface">{Buffer.from(r.stdout, 'base64').toString('utf-8')}</div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {!running && !submitting && verdictData && verdictData.verdict !== 'PENDING' && (
                      <div className="space-y-4">
                        <h3 className={`text-xl font-bold font-headline-lg ${verdictData.verdict === 'ACCEPTED' ? 'text-emerald-400' : 'text-error'}`}>
                          {verdictData.verdict}
                        </h3>
                        {verdictData.verdictReason && (
                          <p className="text-on-surface-variant">{verdictData.verdictReason}</p>
                        )}
                        <div className="flex gap-6 mt-4 border border-surface-variant bg-surface rounded-lg p-4">
                          <div className="flex flex-col"><span className="text-on-surface-variant font-label-caps text-[10px] uppercase tracking-widest">Time</span> <span className="text-on-surface">{verdictData.executionTime || 0}s</span></div>
                          <div className="flex flex-col"><span className="text-on-surface-variant font-label-caps text-[10px] uppercase tracking-widest">Memory</span> <span className="text-on-surface">{verdictData.memory || 0}KB</span></div>
                          <div className="flex flex-col"><span className="text-on-surface-variant font-label-caps text-[10px] uppercase tracking-widest">Tests Passed</span> <span className="text-emerald-400">{verdictData.passedTests} / {verdictData.totalTests}</span></div>
                        </div>
                        {verdictData.compileOutput && (
                          <div className="mt-4 p-4 bg-error/10 text-error rounded border border-error/30 whitespace-pre-wrap">
                            {verdictData.compileOutput}
                          </div>
                        )}
                      </div>
                    )}

                    {!running && !submitting && !runResult && !verdictData && (
                      <div className="text-on-surface-variant/50 italic h-full flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                           <span className="material-symbols-outlined text-[32px] opacity-50">terminal</span>
                           <span>Execute code to visualize output metrics.</span>
                        </div>
                      </div>
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
