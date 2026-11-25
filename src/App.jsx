import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { THEME_KEY } from './lib/utils';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import PublicDocPage from './pages/PublicDocPage';
import LegalPage from './pages/LegalPage';
import { OfflineBanner } from './components/PwaControls';
import { AmbientBackdrop } from './components/LiquidGlass';
import { DMDocLogo } from './components/DMDocLogo';
import { MabArenaBrand } from './components/MabArenaBrand';

export default function App() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [splashDone, setSplashDone] = useState(() => {
    if (typeof window === 'undefined') return true;
    const path = window.location.pathname;
    // Skip artificial splash delay for shared /d/:slug and legal pages so visitors open instantly
    return path.startsWith('/d/') || path === '/privacy' || path === '/copyright';
  });
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    } catch {
      // Ignore storage errors
    }
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', dark ? '#090D18' : '#EEF3FA');
    }
    const iosStatusMeta = document.querySelector(
      'meta[name="apple-mobile-web-app-status-bar-style"]'
    );
    if (iosStatusMeta) {
      iosStatusMeta.setAttribute('content', dark ? 'black-translucent' : 'default');
    }
  }, [dark]);

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return undefined;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
      setAuthReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (splashDone) return undefined;
    const t = setTimeout(() => setSplashDone(true), 650);
    return () => clearTimeout(t);
  }, [splashDone]);

  const toggleDark = () => setDark((d) => !d);

  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF3FA] p-6 text-center text-[#1D1D1F]">
        <div className="max-w-sm rounded-[24px] bg-white/80 p-6 shadow-lg">
          <h1 className="text-[16px] font-semibold">Supabase Env Missing</h1>
          <p className="mt-2 font-mono text-[12px] text-[#515154]">
            VITE_SUPABASE_URL &amp; VITE_SUPABASE_ANON_KEY
          </p>
        </div>
      </div>
    );
  }

  if (!authReady || !splashDone) {
    return (
      <div
        className={`relative flex min-h-screen flex-col items-center justify-between px-6 py-10 transition-colors duration-300 ${
          dark ? 'bg-[#090D18] text-white' : 'bg-[#EEF3FA] text-[#1D1D1F]'
        }`}
      >
        <AmbientBackdrop dark={dark} />
        <div className="h-8" />
        <div className="relative z-10 flex flex-col items-center gap-3 anim-view">
          <DMDocLogo className="h-16 w-16 sm:h-[72px] sm:w-[72px]" />
          <span className="text-[18px] font-bold tracking-[-0.025em]">DM Docs</span>
        </div>
        <div className="relative z-10 pb-[env(safe-area-inset-bottom)]">
          <MabArenaBrand dark={dark} size="lg" />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/d/:slug"
          element={<PublicDocPage dark={dark} onToggleDark={toggleDark} />}
        />
        <Route
          path="/privacy"
          element={
            <LegalPage
              type="privacy"
              dark={dark}
              onToggleDark={toggleDark}
              fallbackPath={session ? '/admin' : '/login'}
            />
          }
        />
        <Route
          path="/copyright"
          element={
            <LegalPage
              type="copyright"
              dark={dark}
              onToggleDark={toggleDark}
              fallbackPath={session ? '/admin' : '/login'}
            />
          }
        />
        <Route
          path="/login"
          element={
            session ? <Navigate to="/admin" replace /> : <LoginPage dark={dark} />
          }
        />
        <Route
          path="/admin"
          element={
            session ? (
              <AdminPage user={session.user} dark={dark} onToggleDark={toggleDark} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="*"
          element={<Navigate to={session ? '/admin' : '/login'} replace />}
        />
      </Routes>
      <OfflineBanner dark={dark} />
    </BrowserRouter>
  );
}
