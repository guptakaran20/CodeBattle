export default function TermsPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-background text-foreground py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
        <h1 className="font-headline-xl text-headline-xl font-bold text-primary tracking-tighter">
          Terms of Service
        </h1>
        <div className="bg-surface-container-low border border-surface-variant p-8 rounded-lg space-y-6">
          <section className="space-y-4">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">1. Acceptance of Terms</h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              By accessing and using CodeArena, you accept and agree to be bound by the terms and provision of this agreement. 
              CodeArena is a competitive programming platform designed to test algorithmic skills in real-time.
            </p>
          </section>
          
          <section className="space-y-4">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">2. Fair Play Policy</h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Users are expected to compete fairly. The use of multiple accounts (smurfing), automated tools (bots), 
              or third-party assistance during rated matchups will result in immediate and permanent suspension of the account.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">3. Code Ownership</h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              You retain all rights to the code you submit. However, by submitting code during a public or ranked match, 
              you grant CodeArena a non-exclusive license to display, analyze, and use your code for educational and platform-improvement purposes.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
