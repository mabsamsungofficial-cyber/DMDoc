import React, { useState } from 'react';
import { Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { REMEMBER_ME_KEY, SAVED_EMAIL_KEY } from '../lib/utils';
import { AmbientBackdrop, LegalLinks, LiquidGlassCard } from '../components/LiquidGlass';
import { DMDocLogo } from '../components/DMDocLogo';
import { MabArenaBrand } from '../components/MabArenaBrand';

function getInitialRememberState() {
  try {
    return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  } catch {
    return false;
  }
}

function getInitialSavedEmail() {
  try {
    if (localStorage.getItem(REMEMBER_ME_KEY) === 'true') {
      return localStorage.getItem(SAVED_EMAIL_KEY) || '';
    }
  } catch {
    // Ignore storage errors
  }
  return '';
}

export default function LoginPage({ dark }) {
  const [remember, setRemember] = useState(getInitialRememberState);
  const [email, setEmail] = useState(getInitialSavedEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRememberChange = (checked) => {
    setRemember(checked);
    try {
      if (checked) {
        localStorage.setItem(REMEMBER_ME_KEY, 'true');
        if (email.trim()) {
          localStorage.setItem(SAVED_EMAIL_KEY, email.trim());
        }
      } else {
        localStorage.removeItem(REMEMBER_ME_KEY);
        localStorage.removeItem(SAVED_EMAIL_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    const trimmedEmail = email.trim();
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    try {
      if (remember) {
        localStorage.setItem(REMEMBER_ME_KEY, 'true');
        localStorage.setItem(SAVED_EMAIL_KEY, trimmedEmail);
        if (
          typeof window !== 'undefined' &&
          'PasswordCredential' in window &&
          navigator.credentials?.store
        ) {
          const cred = new window.PasswordCredential({
            id: trimmedEmail,
            password,
            name: trimmedEmail,
          });
          await navigator.credentials.store(cred).catch(() => {});
        }
      } else {
        localStorage.removeItem(REMEMBER_ME_KEY);
        localStorage.removeItem(SAVED_EMAIL_KEY);
      }
    } catch {
      // Ignore storage / credential manager errors
    }

    setLoading(false);
  };

  const inputClass = dark
    ? 'w-full rounded-[14px] bg-white/[0.08] px-3.5 py-2.5 text-[14px] text-white placeholder:text-white/40 border border-white/10 focus:bg-white/[0.12] focus:border-[#64D2FF]/60 focus:outline-none'
    : 'w-full rounded-[14px] bg-white/65 px-3.5 py-2.5 text-[14px] text-[#1D1D1F] placeholder:text-[#6E6E73] border border-white/85 focus:bg-white/90 focus:border-[#007AFF]/50 focus:outline-none';

  return (
    <div
      className={`relative flex min-h-screen flex-col items-center justify-between px-4 py-8 ${
        dark ? 'bg-[#090D18] text-white' : 'bg-[#EEF3FA] text-[#1D1D1F]'
      }`}
    >
      <AmbientBackdrop dark={dark} />
      <div className="h-4" />
      <LiquidGlassCard dark={dark} className="anim-view w-full max-w-sm p-6">
        <div className="mb-6 flex items-center gap-2.5">
          <DMDocLogo className="h-9 w-9 shrink-0" />
          <h1 className="text-[19px] font-bold tracking-[-0.02em]">DM Docs</h1>
        </div>

        <form onSubmit={handleLogin} autoComplete="on" className="space-y-3.5">
          {error && (
            <div className="break-words [overflow-wrap:anywhere] rounded-[12px] bg-[#FF3B30]/15 border border-[#FF3B30]/30 px-3 py-2 text-[12px] font-medium text-[#FF453A]">
              {error}
            </div>
          )}
          <input
            id="dmdoc-email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className={inputClass}
          />
          <div className="relative">
            <input
              id="dmdoc-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className={`absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full transition-colors ${
                dark
                  ? 'text-white/55 hover:bg-white/10 hover:text-white'
                  : 'text-[#6E6E73] hover:bg-black/[0.06] hover:text-[#1D1D1F]'
              }`}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <label className="flex cursor-pointer select-none items-center gap-2.5 py-0.5">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => handleRememberChange(e.target.checked)}
              className="sr-only"
            />
            <span
              className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[6px] border transition-colors ${
                remember
                  ? 'border-[#007AFF] bg-[#007AFF] text-white'
                  : dark
                    ? 'border-white/25 bg-white/[0.06]'
                    : 'border-black/20 bg-white/80'
              }`}
            >
              {remember && <Check className="h-3 w-3 stroke-[3]" />}
            </span>
            <span
              className={`text-[13px] font-medium ${
                dark ? 'text-white/75' : 'text-[#515154]'
              }`}
            >
              Remember ID &amp; password
            </span>
          </label>

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
      <div className="relative z-10 flex flex-col items-center gap-2.5 pt-6 pb-[env(safe-area-inset-bottom)]">
        <MabArenaBrand dark={dark} size="md" />
        <LegalLinks dark={dark} />
      </div>
    </div>
  );
}
