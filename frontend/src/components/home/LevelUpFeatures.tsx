import React from 'react';

export const LevelUpFeatures = () => {
  const items = [
    {
      title: '1v1 Battles',
      description: 'Challenge anyone to real-time coding battles.',
      icon: 'swords',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    },
    {
      title: 'Ranked Matchmaking',
      description: 'Compete with players of similar skill and climb ranks.',
      icon: 'my_location',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
    {
      title: 'AI Code Review',
      description: 'Get intelligent feedback and improve your solutions.',
      icon: 'smart_toy',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20'
    },
    {
      title: 'Global Leaderboards',
      description: 'See where you stand among the best developers.',
      icon: 'emoji_events',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    {
      title: 'Tournaments',
      description: 'Join tournaments and win exciting rewards and glory.',
      icon: 'trophy', // Using a different icon if available, or just fallback to emoji_events
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20'
    },
    {
      title: 'Battle Replay',
      description: 'Watch replays, learn strategies, and analyze your performance.',
      icon: 'replay',
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20'
    }
  ];

  return (
    <section id="features" className="flex flex-col gap-12 py-12">
      <div className="flex flex-col items-center text-center gap-4">
        <h2 className="font-headline-lg text-3xl md:text-4xl font-bold text-on-surface">
          Everything you need to <span className="text-emerald-400">level up</span>
        </h2>
        <p className="font-body-md text-on-surface-variant text-base md:text-lg">
          Powerful features built for competitive developers
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {items.map((item, index) => (
          <div 
            key={index} 
            className="bg-surface-container-low border border-surface-variant rounded-2xl p-6 flex flex-col items-center text-center gap-4 hover:-translate-y-1 hover:shadow-lg transition-transform duration-300"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.bg} ${item.border} border`}>
              {/* Note: some icons like 'swords' might not exist in standard material symbols, falling back to similar ones if needed. In material symbols 'swords' is available as 'swords' in some versions, but 'sports_martial_arts' or 'sports_kabaddi' could work. We'll stick to text icons that usually work or fallback gracefully. */}
              <span className={`material-symbols-outlined text-[28px] ${item.color}`}>
                {item.icon === 'swords' ? 'sports_esports' : item.icon === 'trophy' ? 'workspace_premium' : item.icon}
              </span>
            </div>
            <h3 className="font-title-md text-lg font-bold text-on-surface">{item.title}</h3>
            <p className="font-body-sm text-sm text-on-surface-variant leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
