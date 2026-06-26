export const formatTournamentDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return 'TBA';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'TBA';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCountdown = (targetDateString: string | Date | null | undefined): string => {
  if (!targetDateString) return '';
  const target = new Date(targetDateString).getTime();
  if (isNaN(target)) return '';
  const now = new Date().getTime();
  const diff = target - now;

  if (diff <= 0) return 'Started';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `Starts in ${days}d ${hours}h`;
  if (hours > 0) return `Starts in ${hours}h ${minutes}m`;
  return `Starts in ${minutes}m`;
};
