import React from 'react';

export const HowItWorks = () => {
  const steps = [
    {
      number: '1',
      title: 'Create Battle',
      description: 'Choose a problem and battle settings',
      icon: 'add_box',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
    },
    {
      number: '2',
      title: 'Invite or Match',
      description: 'Invite a friend or get matched instantly',
      icon: 'group_add',
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      number: '3',
      title: 'Solve & Code',
      description: 'Write your code and submit solutions',
      icon: 'code',
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      featured: true,
    },
    {
      number: '4',
      title: 'Judge0 Execution',
      description: 'Real-time compilation and test execution',
      icon: 'check_circle',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      number: '5',
      title: 'Winner Decided',
      description: 'First to solve or best score wins',
      icon: 'emoji_events',
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
    {
      number: '6',
      title: 'AI Review',
      description: 'Get AI-powered analysis and suggestions.',
      icon: 'insights',
      color: 'text-pink-400',
      bg: 'bg-pink-400/10',
    }
  ];

  return (
    <section id="how-it-works" className="flex flex-col gap-12 py-12">
      <div className="text-center">
        <h2 className="font-headline-lg text-3xl md:text-4xl font-bold text-on-surface">
          How <span className="text-primary">CodeArena</span> Works
        </h2>
      </div>

      {/* Responsive Horizontal Pipeline */}
      <div className="flex flex-col md:flex-row items-start justify-between relative max-w-6xl mx-auto w-full px-4 gap-8 md:gap-2">
        {/* Abstract connector line for desktop */}
        <div className="hidden md:block absolute top-12 left-12 right-12 h-[2px] bg-gradient-to-r from-transparent via-surface-variant to-transparent z-0"></div>

        {steps.map((step, index) => (
          <div key={index} className="flex flex-row md:flex-col items-center md:items-center gap-4 md:gap-4 relative z-10 w-full md:w-40 text-left md:text-center group">
            {/* Step Number Badge */}
            <div className="absolute -top-3 -left-3 md:top-auto md:left-auto md:relative md:-mb-8 z-20 w-6 h-6 rounded-full bg-surface-container-high border border-surface-variant flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
              {step.number}
            </div>

            {/* Icon Box */}
            <div className={`shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center border border-surface-variant transition-transform duration-300 group-hover:scale-110 ${step.featured ? 'bg-primary/10 border-primary/30 shadow-[0_0_20px_rgba(255,193,116,0.15)]' : 'bg-[#131418] hover:border-surface-variant-hover'}`}>
              <span className={`material-symbols-outlined text-[28px] md:text-[32px] ${step.featured ? 'text-primary' : step.color}`}>
                {step.icon}
              </span>
            </div>

            {/* Text Content */}
            <div className="flex flex-col gap-1 md:mt-2">
              <h3 className="font-title-md text-base font-bold text-on-surface">{step.title}</h3>
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Mobile Connector Line */}
            {index < steps.length - 1 && (
              <div className="md:hidden absolute left-8 top-16 bottom-[-2rem] w-[2px] bg-surface-variant -z-10"></div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
