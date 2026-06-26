"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useBattleSocket } from '@/hooks/useBattleSocket';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import ArenaView from './ArenaView';

export default function BattleLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const battleCode = params.battleCode as string;

  const socketHook = useBattleSocket(battleCode);
  const { isConnected, battle, participants: onlineParticipants } = socketHook;
  const { user: currentUser } = useAuth();
  const { setSidebarVisible } = useUI();

  useEffect(() => {
    // Show sidebar in the lobby
    setSidebarVisible(true);
  }, [setSidebarVisible]);

  const handleStart = async () => {
    try {
      await api.post(`/battles/${battleCode}/start`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start');
    }
  };

  const handleCancel = async () => {
    try {
      if (confirm('Are you sure you want to completely cancel and delete this battle?')) {
        await api.delete(`/battles/${battleCode}`);
        toast.success('Battle completely deleted.');
        router.push('/arena');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel');
    }
  };

  const copyCode = () => {
    const url = `${window.location.origin}/battle/${battleCode}`;
    navigator.clipboard.writeText(url);
    toast.success('Battle link copied to clipboard!');
  };

  const now = new Date().getTime();
  const endTime = battle?.startTime ? new Date(battle.startTime).getTime() + battle.durationMinutes * 60000 : 0;
  const isExpired = battle?.status === 'IN_PROGRESS' && now > endTime;
  const displayStatus = isExpired ? 'COMPLETED' : battle?.status;

  useEffect(() => {
    if (displayStatus === 'COMPLETED' && battle?._id) {
      toast.info("Battle has ended! Redirecting to results...");
      router.push(`/replay/${battle._id}`);
    }
  }, [displayStatus, battle?._id, router]);

  if (!battle) {
    return (
      <div className="flex-1 flex items-center justify-center font-code-md text-on-surface">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined animate-spin text-primary">sync</span>
          Connecting to Sector 7G...
        </div>
      </div>
    );
  }

  const allMembers = battle.teams.flatMap((t: any) => t.members);
  const isParticipant = currentUser && allMembers.some((m: any) => m._id === currentUser._id || m === currentUser._id);
  const isCreator = currentUser && battle.creator._id === currentUser._id;
  const canStart = isCreator || (battle.battleType === 'TOURNAMENT' && isParticipant);
  const isFull = allMembers.length >= battle.maxParticipants;

  if (displayStatus === 'IN_PROGRESS' || displayStatus === 'COMPLETED') {
    if (isParticipant || displayStatus === 'COMPLETED') {
      return <ArenaView battle={battle} socketHook={socketHook} currentUser={currentUser} />;
    } else {
      return (
        <div className="flex-1 flex items-center justify-center bg-surface text-on-surface">
          <div className="text-center space-y-md bg-surface-container p-xl rounded border border-surface-variant max-w-md">
            <span className="material-symbols-outlined text-[48px] text-error">shield_lock</span>
            <h2 className="font-title-md text-title-md">Battle in Progress</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">This battle has already started. You cannot join or spectate at this time.</p>
            <button onClick={() => router.push('/')} className="px-lg py-sm border border-surface-variant hover:border-primary text-on-surface font-label-caps text-label-caps uppercase tracking-widest rounded transition-colors w-full mt-lg">
              Return Home
            </button>
          </div>
        </div>
      );
    }
  }

  // Pre-calculate roster items
  const maxPlayers = battle.maxParticipants;
  const rosterItems = Array.from({ length: maxPlayers }).map((_, idx) => {
    const member = allMembers[idx];
    if (!member) return null; // empty slot handled later
    
    // Resolve user data if populated
    const memberId = member._id || member;
    const isOnline = onlineParticipants.includes(memberId);
    // Find member details if populated from teams array
    const memberDetails = typeof member === 'object' ? member : null;
    
    // We should ideally fetch the full details from the backend if it's just an ID,
    // but the backend `getBattleByCode` currently populates `teams.members`.
    const username = memberDetails?.username || `User_${memberId.substring(0, 4)}`;
    const rating = memberDetails?.rating || 1500;
    
    return {
      id: memberId,
      username,
      rating,
      isOnline,
      isCreator: memberId === battle.creator._id,
      isCurrentUser: currentUser?._id === memberId
    };
  });

  return (
    <>
      <div className="flex justify-between items-end mb-xl p-margin-page pb-0">
        <div>
          <div className="font-code-sm text-code-sm text-primary mb-xs uppercase tracking-widest flex items-center gap-xxs">
            <span className="material-symbols-outlined text-[16px]">swords</span>
            Pre-Match Staging
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface">Lobby: {battle.difficulty} Arena</h1>
        </div>
        <div className="bg-surface-container px-sm py-xxs border border-secondary text-secondary font-code-sm text-code-sm rounded flex items-center gap-xs">
          <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-secondary' : 'bg-error'}`}></div>
          {isConnected ? (isFull ? 'ALL OPERATIVES READY' : 'WAITING FOR OPPONENT') : 'OFFLINE'}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-lg px-margin-page">
        {/* Battle Info Card */}
        <div className="col-span-12 lg:col-span-4 bg-surface border border-surface-variant rounded flex flex-col">
          <div className="px-md py-sm border-b border-surface-variant bg-surface-container-low flex items-center gap-xs">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">info</span>
            <h2 className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest">Parameters</h2>
          </div>
          <div className="p-md flex-1 flex flex-col gap-md">
            <div className="flex justify-between items-center border-b border-surface-variant pb-xs">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Match Code</span>
              <span className="font-code-md text-code-md text-on-surface">{battle.battleCode}</span>
            </div>
            <div className="flex justify-between items-center border-b border-surface-variant pb-xs">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Type</span>
              <span className="font-code-md text-code-md text-on-surface">{battle.battleType === '1V1' ? '1v1 Algorithm' : 'FFA Algorithm'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-surface-variant pb-xs">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Duration</span>
              <span className="font-code-md text-code-md text-on-surface">{battle.durationMinutes}:00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Difficulty</span>
              <span className={`font-code-md text-code-md text-on-surface ${battle.difficulty === 'EASY' ? 'text-secondary' : battle.difficulty === 'MEDIUM' ? 'text-primary' : 'text-error'}`}>{battle.difficulty}</span>
            </div>
          </div>
        </div>

        {/* Share Card */}
        <div className="col-span-12 lg:col-span-8 bg-surface border border-surface-variant rounded flex flex-col justify-center p-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          <h3 className="font-title-md text-title-md text-on-surface mb-sm relative z-10">Invite Challenger</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-md relative z-10 max-w-[448px]">Share this secure link with your opponent to grant them access to this specific battle arena.</p>
          <div className="flex gap-sm relative z-10">
            <div className="flex-1 flex items-center bg-surface-container border border-surface-variant rounded px-md py-xs">
              <span className="material-symbols-outlined text-on-surface-variant mr-sm text-[18px]">link</span>
              <input className="bg-transparent border-none text-on-surface font-code-md text-code-md w-full focus:ring-0 outline-none p-0" readOnly type="text" value={`${typeof window !== 'undefined' ? window.location.origin : ''}/battle/${battle.battleCode}`} />
            </div>
            <button onClick={copyCode} className="bg-surface-variant border border-surface-variant hover:border-primary text-on-surface font-label-caps text-label-caps px-lg py-xs rounded uppercase tracking-widest transition-colors flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">content_copy</span>
              Copy
            </button>
          </div>
        </div>

        {/* Players List Card */}
        <div className="col-span-12 bg-surface border border-surface-variant rounded">
          <div className="px-md py-sm border-b border-surface-variant bg-surface-container-low flex justify-between items-center">
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">group</span>
              <h2 className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest">Roster ({allMembers.length}/{battle.maxParticipants})</h2>
            </div>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="border-b border-surface-variant bg-surface-container-lowest font-label-caps text-label-caps text-on-surface-variant">
                  <th className="px-md py-sm font-normal uppercase tracking-widest">Operative</th>
                  <th className="px-md py-sm font-normal uppercase tracking-widest">Rating</th>
                  <th className="px-md py-sm font-normal uppercase tracking-widest">Latency</th>
                  <th className="px-md py-sm font-normal text-right uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="font-body-sm text-body-sm">
                {rosterItems.map((member, idx) => {
                  if (member) {
                    return (
                      <tr key={member.id} className="border-b border-surface-variant hover:bg-surface-container-low transition-colors">
                        <td className="px-md py-md flex items-center gap-md">
                          <div className={`w-8 h-8 rounded border flex items-center justify-center font-bold font-code-sm ${member.isCurrentUser ? 'border-primary text-primary' : 'border-surface-variant text-on-surface-variant bg-surface-container'}`}>
                            {member.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-on-surface font-code-md">
                              {member.username} {member.isCurrentUser && '(You)'} {member.isCreator && <span className="ml-2 text-xs text-secondary">[Host]</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-md py-md text-on-surface font-code-md">{member.rating} ELO</td>
                        <td className={`px-md py-md font-code-md ${member.isOnline ? 'text-secondary' : 'text-on-surface-variant'}`}>{member.isOnline ? '24ms' : '--'}</td>
                        <td className="px-md py-md text-right">
                          {member.isOnline ? (
                            <span className="inline-flex items-center gap-xs bg-secondary-container/20 text-secondary border border-secondary/30 px-xs py-xxs rounded font-label-caps text-[10px] uppercase tracking-widest">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                              Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-xs bg-surface-variant text-on-surface-variant border border-surface-variant px-xs py-xxs rounded font-label-caps text-[10px] uppercase tracking-widest">
                              Offline
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  } else {
                    return (
                      <tr key={`empty-${idx}`} className="hover:bg-surface-container-low transition-colors opacity-50 border-b border-surface-variant">
                        <td className="px-md py-md flex items-center gap-md">
                          <div className="w-8 h-8 rounded border border-dashed border-surface-variant flex items-center justify-center bg-surface-container">
                            <span className="material-symbols-outlined text-on-surface-variant text-[16px]">person_add</span>
                          </div>
                          <div className="text-on-surface-variant font-code-md italic">Awaiting Connection...</div>
                        </td>
                        <td className="px-md py-md text-on-surface-variant">--</td>
                        <td className="px-md py-md text-on-surface-variant">--</td>
                        <td className="px-md py-md text-right">
                          <span className="inline-flex items-center gap-xs bg-surface-variant text-on-surface-variant border border-surface-variant px-xs py-xxs rounded font-label-caps text-[10px] uppercase tracking-widest">
                            Pending
                          </span>
                        </td>
                      </tr>
                    );
                  }
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Controls */}
        <div className="col-span-12 mt-md mb-xl flex justify-end gap-md">
          {canStart ? (
            <div className="flex gap-md">
              {isCreator && (
                <button onClick={handleCancel} className="px-xl py-sm bg-error/10 text-error border border-error/30 hover:bg-error/20 font-label-caps text-label-caps uppercase tracking-widest rounded transition-colors flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  Cancel
                </button>
              )}
              <button onClick={handleStart} disabled={!isFull} className={`px-xl py-sm font-label-caps text-label-caps uppercase tracking-widest rounded flex items-center gap-xs ${isFull ? 'bg-primary text-on-primary hover:opacity-90' : 'bg-surface-variant text-on-surface-variant border border-surface-variant cursor-not-allowed'}`}>
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                Start Match
              </button>
            </div>
          ) : !isParticipant ? (
            <button onClick={() => socketHook.joinRoom()} disabled={isFull} className={`px-xl py-sm font-label-caps text-label-caps uppercase tracking-widest rounded flex items-center gap-xs ${isFull ? 'bg-surface-variant text-on-surface-variant border border-surface-variant cursor-not-allowed' : 'bg-primary text-on-primary hover:opacity-90'}`}>
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              {isFull ? 'Match Full' : 'Join Match'}
            </button>
          ) : (
            <div className="px-xl py-sm bg-surface-variant text-on-surface-variant border border-surface-variant font-label-caps text-label-caps uppercase tracking-widest rounded cursor-not-allowed flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
              Waiting for Host
            </div>
          )}
        </div>
      </div>
    </>
  );
}
