import React, { useState } from 'react';
import Link from 'next/link';
import { Tournament, TournamentStatus } from '@/types/tournament';
import { TournamentStatusBadge, TournamentDifficultyBadge } from './TournamentBadge';
import { formatTournamentDate } from '@/lib/utils/date';
import { api } from '@/lib/api';

interface TournamentCardProps {
  tournament: Tournament;
  onRegistrationSuccess?: () => void;
}

export const TournamentCard = ({ tournament: t, onRegistrationSuccess }: TournamentCardProps) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [localRegistered, setLocalRegistered] = useState(t.isRegistered);

  const canRegister = t.status === TournamentStatus.REGISTRATION && t.currentParticipantsCount < t.maxParticipants && !localRegistered;
  const isFull = t.currentParticipantsCount >= t.maxParticipants;
  const identifier = t.slug || t._id;

  const handleRegister = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to details page
    e.stopPropagation();

    if (isRegistering) return;
    
    const confirm = window.confirm(`Register for ${t.title}?`);
    if (!confirm) return;

    setIsRegistering(true);
    // Optimistic UI
    setLocalRegistered(true);

    try {
      const res = await api.post(`/tournaments/${identifier}/join`);
      if (res.data.success) {
        // Show success toast (using standard alert for MVP if toast isn't available)
        // alert('Registration successful!');
        if (onRegistrationSuccess) onRegistrationSuccess();
      }
    } catch (error: any) {
      // Revert optimistic UI on failure
      setLocalRegistered(false);
      alert(error.response?.data?.message || 'Failed to register');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Link 
      href={`/tournaments/${identifier}`}
      className="bg-surface-container border border-surface-variant rounded-xl p-6 flex flex-col hover:border-surface-bright hover:shadow-[0_4px_20px_rgba(255,193,116,0.05)] transition-all group relative overflow-hidden block"
    >
      {/* Glow background for Live tournaments */}
      {t.status === TournamentStatus.IN_PROGRESS && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] pointer-events-none rounded-full"></div>
      )}

      <div className="flex justify-between items-start mb-4 relative z-10">
        <TournamentStatusBadge status={t.status} />
        <TournamentDifficultyBadge difficulty={t.difficulty} />
      </div>
      
      <h2 className="font-headline-lg text-2xl font-bold text-on-surface mb-2 relative z-10 group-hover:text-primary transition-colors">
        {t.title}
      </h2>
      <p className="text-on-surface-variant text-sm mb-6 flex-1 relative z-10">
        {t.description}
      </p>
      
      <div className="space-y-3 mb-6 relative z-10">
        <div className="flex justify-between items-center bg-surface-container-low p-3 rounded border border-surface-variant">
          <span className="font-code-sm text-xs text-on-surface-variant uppercase">Starts</span>
          <span className="font-code-sm text-sm text-on-surface font-semibold">
            {formatTournamentDate(t.startTime)}
          </span>
        </div>
        <div className="flex justify-between items-center bg-surface-container-low p-3 rounded border border-surface-variant">
          <span className="font-code-sm text-xs text-on-surface-variant uppercase">Players</span>
          <span className="font-code-sm text-sm text-on-surface font-semibold">
            {t.currentParticipantsCount + (localRegistered && !t.isRegistered ? 1 : 0)} / {t.maxParticipants}
          </span>
        </div>
      </div>

      <div className="mt-auto relative z-10">
        {canRegister ? (
          <button 
            onClick={handleRegister}
            disabled={isRegistering}
            className={`w-full py-3 font-label-caps text-xs uppercase tracking-widest font-bold rounded shadow-[0_0_15px_rgba(255,193,116,0.2)] transition-opacity ${
              isRegistering ? 'bg-primary/50 text-on-primary/50 cursor-wait' : 'bg-primary text-on-primary hover:opacity-90'
            }`}
          >
            {isRegistering ? 'Registering...' : 'Register Now'}
          </button>
        ) : localRegistered ? (
           <button className="w-full py-3 bg-surface-container-low border border-primary text-primary font-label-caps text-xs uppercase tracking-widest font-bold rounded">
             Registered
           </button>
        ) : t.status === TournamentStatus.IN_PROGRESS ? (
          <button className="w-full py-3 bg-surface-variant text-on-surface font-label-caps text-xs uppercase tracking-widest font-bold rounded hover:bg-surface-bright transition-colors flex justify-center items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">visibility</span> Spectate
          </button>
        ) : isFull && t.status === TournamentStatus.REGISTRATION ? (
          <button className="w-full py-3 bg-surface-container-low border border-surface-variant text-on-surface-variant font-label-caps text-xs uppercase tracking-widest font-bold rounded cursor-not-allowed">
            Tournament Full
          </button>
        ) : t.status === TournamentStatus.COMPLETED ? (
          <button className="w-full py-3 bg-surface-variant text-on-surface font-label-caps text-xs uppercase tracking-widest font-bold rounded hover:bg-surface-bright transition-colors flex justify-center items-center gap-2">
            View Results
          </button>
        ) : (
          <button className="w-full py-3 bg-surface-container-low border border-surface-variant text-on-surface-variant font-label-caps text-xs uppercase tracking-widest font-bold rounded cursor-not-allowed">
            Registration Closed
          </button>
        )}
      </div>
    </Link>
  );
};
