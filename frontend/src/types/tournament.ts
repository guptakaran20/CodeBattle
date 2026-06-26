export enum TournamentStatus {
  DRAFT = 'DRAFT',
  REGISTRATION = 'REGISTRATION',
  CHECK_IN = 'CHECK_IN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TournamentDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  MIXED = 'MIXED'
}

export interface Tournament {
  _id: string;
  title: string;
  description: string;
  slug: string;
  shortId: string;
  status: TournamentStatus;
  startTime: string | null;
  maxParticipants: number;
  currentParticipantsCount: number;
  difficulty: TournamentDifficulty;
  prizePool?: string;
  isRegistered?: boolean;
}
