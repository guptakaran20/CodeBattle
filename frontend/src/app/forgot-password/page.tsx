"use client";

import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [googleCredential, setGoogleCredential] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setGoogleCredential(tokenResponse.access_token);
      setSuccess('Identity Verified. Set new security key.');
      setError('');
    },
    onError: () => setError('Google Identity Verification Failed'),
  });

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Keys do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Key must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password/reset', {
        accessToken: googleCredential,
        newPassword
      });
      if (res.data.success) {
        setSuccess('Key reset successfully! Redirecting...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        /* Glassmorphism Border Gradient Override */
        .glass-border {
            position: relative;
        }
        .glass-border::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: inherit;
            padding: 1px;
            background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
        }

        /* Ambient Glow Animations */
        @keyframes drift1 {
            0% { transform: translate(0, 0) scale(1); opacity: 0.3; }
            33% { transform: translate(50px, -50px) scale(1.1); opacity: 0.5; }
            66% { transform: translate(-20px, 30px) scale(0.9); opacity: 0.2; }
            100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
        }
        @keyframes drift2 {
            0% { transform: translate(0, 0) scale(1); opacity: 0.2; }
            50% { transform: translate(-60px, 40px) scale(1.2); opacity: 0.4; }
            100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
        }
        .animate-drift-1 { animation: drift1 15s infinite ease-in-out; }
        .animate-drift-2 { animation: drift2 20s infinite ease-in-out reverse; }
        
        /* Input autofill override */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px #131315 inset !important;
            -webkit-text-fill-color: #e5e1e4 !important;
            transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
      
      <div className="bg-background text-on-surface min-h-screen flex items-center justify-center relative overflow-hidden font-body-md text-body-md selection:bg-primary/30 selection:text-primary-fixed pt-16 pb-16">
        {/* Top-Left Logo */}
        <div className="absolute top-8 left-8 md:top-10 md:left-10 z-20">
          <Link href="/" className="font-headline-lg text-2xl font-bold tracking-tighter text-on-surface hover:text-primary transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">terminal</span>
            CodeArena
          </Link>
        </div>

        {/* Ambient Mesh Gradient Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-drift-1"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[800px] h-[800px] bg-tertiary-container/5 rounded-full blur-[150px] animate-drift-2"></div>
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[1024px] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(19,19,21,0.8)_100%)]"></div>
        </div>

        {/* Main Content Canvas */}
        <main className="relative z-10 w-full max-w-[440px] px-margin-mobile md:px-0">
          <div className="glass-border bg-surface-container-low/40 backdrop-blur-xl rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
            {/* Card Header Glow Line */}
            <div className="h-[2px] w-full bg-primary shadow-[0_0_12px_#ffc174]"></div>
            <div className="p-8 md:p-10 flex flex-col gap-10">
              {/* Brand Header */}
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-surface-container border border-surface-bright flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                  <span className="material-symbols-outlined text-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock_reset</span>
                </div>
                <div>
                  <h1 className="font-headline-lg text-headline-lg md:text-[32px] text-[24px] text-on-surface tracking-tighter mb-1">Recover Key</h1>
                  <p className="font-code-sm text-code-sm text-on-surface-variant">
                    {!googleCredential 
                      ? "Verify your identity"
                      : "Establish new security key"}
                  </p>
                </div>
              </div>

              {/* Status Messages */}
              {error && <div className="p-3 bg-error-container/20 border border-error/50 rounded-lg text-error text-sm text-center">{error}</div>}
              {success && <div className="p-3 bg-tertiary-container/20 border border-tertiary/50 rounded-lg text-tertiary text-sm text-center">{success}</div>}

              {/* Auth Form / Actions */}
              {!googleCredential ? (
                <div className="flex flex-col gap-6">
                  <p className="text-center font-code-sm text-code-sm text-on-surface-variant/70">
                    To override security protocols and generate a new key, verify via your Google terminal.
                  </p>

                  {/* Secondary Action (Google Verify) */}
                  <button 
                    onClick={() => loginGoogle()}
                    className="w-full py-4 mt-2 rounded-lg bg-surface-container-high border border-primary/40 text-primary font-label-caps text-label-caps uppercase tracking-widest overflow-hidden transition-all hover:border-primary hover:shadow-[0_0_20px_rgba(255,193,116,0.15)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background active:scale-[0.98] group relative" 
                    type="button"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                    <span className="relative flex items-center justify-center gap-3">
                      <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"></path>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"></path>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"></path>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"></path>
                      </svg>
                      Verify Identity
                    </span>
                  </button>
                </div>
              ) : (
                <form className="flex flex-col gap-6" onSubmit={handleReset}>
                  <div className="flex flex-col gap-4">
                    {/* New Password Input */}
                    <div className="flex flex-col gap-2">
                      <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider" htmlFor="newPassword">New Security Key</label>
                      <div className="relative group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-[20px]">key</span>
                        <input 
                          autoComplete="new-password" 
                          className="w-full bg-surface-dim border border-surface-bright rounded-lg py-3.5 pl-12 pr-12 font-code-sm text-code-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/30" 
                          id="newPassword" 
                          placeholder="••••••••••••" 
                          required 
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button 
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface focus:outline-none" 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility' : 'visibility_off'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="flex flex-col gap-2">
                      <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider" htmlFor="confirmPassword">Confirm Key</label>
                      <div className="relative group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-[20px]">lock_reset</span>
                        <input 
                          autoComplete="new-password" 
                          className="w-full bg-surface-dim border border-surface-bright rounded-lg py-3.5 pl-12 pr-12 font-code-sm text-code-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/30" 
                          id="confirmPassword" 
                          placeholder="••••••••••••" 
                          required 
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Primary Action */}
                  <button 
                    disabled={loading}
                    className="relative group w-full py-4 mt-2 rounded-lg bg-surface-container-high border border-primary/40 text-primary font-label-caps text-label-caps uppercase tracking-widest overflow-hidden transition-all hover:border-primary hover:shadow-[0_0_20px_rgba(255,193,116,0.15)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none" 
                    type="submit"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                    <span className="relative flex items-center justify-center gap-2">
                      {loading ? 'Processing...' : 'Override Key'}
                      {!loading && <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>}
                    </span>
                  </button>
                </form>
              )}
            </div>
            
            <div className="p-4 bg-surface-container-high/50 border-t border-surface-bright text-center">
              <p className="font-code-sm text-code-sm text-on-surface-variant">
                Abort sequence? <Link href="/login" className="text-primary hover:text-primary-fixed transition-colors underline decoration-primary/30 underline-offset-4 font-bold">Return to Login</Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
