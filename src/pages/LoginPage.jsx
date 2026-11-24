import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AmbientBackdrop, LiquidGlassCard } from '../components/LiquidGlass';
import { DMDocLogo } from '../components/DMDocLogo';

export default function LoginPage({ dark }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (authError) setError(authError.message);
    setLoading(false);
  };

  const inputClass = dark
    ? 'w-full rounded-[14px] bg-white/[0.08] px-3.5 py-2.5 text-[14px] text-white placeholder:text-white/40 border border-white/10 focus:bg-white/[0.12] focus:border-[#64D2FF]/60 focus:outline-none'
    : 'w-full rounded-[14px] bg-white/65 px-3.5 py-2.5 text-[14px] text-[#1D1D1F] placeholder:text-[#6E6E73] border border-white/85 focus:bg-white/90 focus:border-[#007AFF]/50 focus:outline-none';

  return (
    <div
      className={`relative flex min-h-screen items-center justify-center px-4 ${
        dark ? 'bg-[#090D18] text-white' : 'bg-[#EEF3FA] text-[#1D1D1F]'
      }`}
    >
      <AmbientBackdrop dark={dark} />
      <LiquidGlassCard dark={dark} className="anim-view w-full max-w-sm p-6">
        <div className="mb-6 flex items-center gap-2.5">
          <DMDocLogo className="h-9 w-9 shrink-0" />
          <h1 className="text-[19px] font-bold tracking-[-0.02em]">DMDoc</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-3.5">
          {error && (
            <div className="rounded-[12px] bg-[#FF3B30]/15 border border-[#FF3B30]/30 px-3 py-2 text-[12px] font-medium text-[#FF453A]">
              {error}
            </div>
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className={inputClass}
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={inputClass}
          />
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-[14px] font-semibold text-white transition-transform duration-150 active:scale-[0.97] disabled:opacity-60"
            style={{
              background: 'linear-gradient(145deg, #38BDF8 0%, #007AFF 100%)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.45), 0 8px 20px rgba(0,122,255,0.34)',
            }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>Sign In</span>
          </button>
        </form>
      </LiquidGlassCard>
    </div>
  );
}
