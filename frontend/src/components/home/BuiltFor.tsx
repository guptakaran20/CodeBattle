import React from 'react';

export const BuiltFor = () => {
  const audiences = [
    { label: 'Competitive Programmers', icon: 'emoji_events' },
    { label: 'Interview Preparation', icon: 'work' },
    { label: 'Coding Clubs', icon: 'groups' },
    { label: 'College Competitions', icon: 'school' },
  ];

  return (
    <section className="py-8   bg-surface-container-lowest/50 w-full overflow-hidden flex flex-col items-center justify-center gap-6">
      <h3 className="font-label-caps text-xs sm:text-sm uppercase tracking-[0.2em] text-on-surface-variant font-bold text-center">
        Built For
      </h3>
      <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 px-4 max-w-5xl mx-auto">
        {audiences.map((audience, idx) => (
          <div key={idx} className="flex items-center gap-2 text-on-surface-variant/80 hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[20px] opacity-70">{audience.icon}</span>
            <span className="font-semibold text-sm sm:text-base whitespace-nowrap">{audience.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
