"use client";

import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const loginGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await api.post('/auth/google', { accessToken: tokenResponse.access_token });
        if (res.data.success) {
          await refreshUser();
          router.push('/dashboard');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Google Login Failed');
      }
    },
    onError: () => setError('Google Login Failed'),
  });

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        await refreshUser();
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
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

        {/* Main Content Canvas (Login Card) */}
        <main className="relative z-10 w-full max-w-[440px] px-margin-mobile md:px-0">
          <div className="glass-border bg-surface-container-low/40 backdrop-blur-xl rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
            {/* Card Header Glow Line */}
            <div className="h-[2px] w-full bg-primary shadow-[0_0_12px_#ffc174]"></div>
            <div className="p-8 md:p-10 flex flex-col gap-10">
              {/* Brand Header */}
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-surface-container border border-surface-bright flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                  <span className="material-symbols-outlined text-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
                </div>
                <div>
                  <h1 className="font-headline-lg text-headline-lg md:text-[32px] text-[24px] text-on-surface tracking-tighter mb-1">CodeArena</h1>
                  <p className="font-code-sm text-code-sm text-on-surface-variant">Initialize developer session</p>
                </div>
              </div>

              {/* Auth Form */}
              <form className="flex flex-col gap-6" onSubmit={handleEmailLogin}>
                {error && <div className="p-3 bg-error-container/20 border border-error/50 rounded-lg text-error text-sm text-center">{error}</div>}
                <div className="flex flex-col gap-4">
                  {/* Email Input */}
                  <div className="flex flex-col gap-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider" htmlFor="email">Access ID</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-[20px]">person</span>
                      <input 
                        autoComplete="email" 
                        className="w-full bg-surface-dim border border-surface-bright rounded-lg py-3.5 pl-12 pr-4 font-code-sm text-code-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/30" 
                        id="email" 
                        placeholder="sysadmin@domain.dev" 
                        required 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider" htmlFor="password">Security Key</label>
                      <Link className="font-label-caps text-label-caps text-primary/70 hover:text-primary transition-colors focus:outline-none focus:underline" href="/forgot-password">Recover Key</Link>
                    </div>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-[20px]">key</span>
                      <input 
                        autoComplete="current-password" 
                        className="w-full bg-surface-dim border border-surface-bright rounded-lg py-3.5 pl-12 pr-12 font-code-sm text-code-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/30" 
                        id="password" 
                        placeholder="••••••••••••" 
                        required 
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                </div>

                {/* Primary Action */}
                <button className="relative group w-full py-4 mt-2 rounded-lg bg-surface-container-high border border-primary/40 text-primary font-label-caps text-label-caps uppercase tracking-widest overflow-hidden transition-all hover:border-primary hover:shadow-[0_0_20px_rgba(255,193,116,0.15)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background active:scale-[0.98]" type="submit">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    Initialize Session
                    <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </span>
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-surface-bright"></div>
                <span className="font-code-sm text-code-sm text-on-surface-variant/50">OR</span>
                <div className="flex-1 h-px bg-surface-bright"></div>
              </div>

              {/* Secondary Action */}
              <button 
                onClick={() => loginGoogle()}
                className="w-full py-3.5 rounded-lg bg-transparent border border-surface-bright text-on-surface font-label-caps text-label-caps uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-surface-container hover:border-outline-variant transition-all focus:outline-none focus:ring-2 focus:ring-outline focus:ring-offset-2 focus:ring-offset-background active:scale-[0.98]" 
                type="button"
              >
                <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"></path>
                </svg>
                Authenticate with Google
              </button>
            </div>
            
            <div className="p-4 bg-surface-container-high/50 border-t border-surface-bright text-center">
              <p className="font-code-sm text-code-sm text-on-surface-variant">
                No account? <Link href="/register" className="text-primary hover:text-primary-fixed transition-colors underline decoration-primary/30 underline-offset-4 font-bold">Register here</Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
