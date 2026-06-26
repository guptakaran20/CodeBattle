import React from 'react';
import { TournamentStatus, TournamentDifficulty } from '@/types/tournament';

export const TournamentStatusBadge = ({ status }: { status: TournamentStatus }) => {
  switch (status) {
    case TournamentStatus.REGISTRATION:
      return <span className="bg-primary/10 border border-primary/30 text-primary px-3 py-1 rounded text-xs font-label-caps uppercase tracking-widest font-bold">Open</span>;
    case TournamentStatus.CHECK_IN:
      return <span className="bg-amber-500/10 border border-amber-500/30 text-amber-500 px-3 py-1 rounded text-xs font-label-caps uppercase tracking-widest font-bold">Check-In</span>;
    case TournamentStatus.IN_PROGRESS:
      return <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded text-xs font-label-caps uppercase tracking-widest font-bold">Live</span>;
    case TournamentStatus.COMPLETED:
      return <span className="bg-surface-variant/50 border border-surface-variant text-on-surface-variant px-3 py-1 rounded text-xs font-label-caps uppercase tracking-widest font-bold">Completed</span>;
    default:
      return <span className="bg-error/10 border border-error/30 text-error px-3 py-1 rounded text-xs font-label-caps uppercase tracking-widest font-bold">{status}</span>;
  }
};

export const TournamentDifficultyBadge = ({ difficulty }: { difficulty: TournamentDifficulty }) => {
  const getColor = () => {
    if (difficulty === TournamentDifficulty.EASY) return 'text-emerald-400';
    if (difficulty === TournamentDifficulty.MEDIUM) return 'text-primary';
    if (difficulty === TournamentDifficulty.HARD) return 'text-error';
    return 'text-on-surface-variant';
  };

  return (
    <span className={`font-label-caps text-xs tracking-widest uppercase font-bold ${getColor()}`}>
      {difficulty || 'MIXED'}
    </span>
  );
};
