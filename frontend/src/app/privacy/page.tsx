export default function PrivacyPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-background text-foreground py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
        <h1 className="font-headline-xl text-headline-xl font-bold text-primary tracking-tighter">
          Privacy Policy
        </h1>
        <div className="bg-surface-container-low border border-surface-variant p-8 rounded-lg space-y-6">
          <section className="space-y-4">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Data Collection</h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              We collect information you provide directly to us when you create an account, update your profile, 
              participate in coding battles, or communicate with us. This includes your username, email address, 
              code submissions, and battle history.
            </p>
          </section>
          
          <section className="space-y-4">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Use of Information</h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              The information we collect is used to match you with opponents of similar skill (Elo rating), 
              calculate leaderboard rankings, provide AI-driven code reviews, and improve our matchmaking algorithms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Data Security</h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              CodeArena implements enterprise-grade security measures to protect your personal information. 
              Code executions happen in isolated, sandboxed environments to guarantee platform safety.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
