import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

function getSystemDark() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getInitialAdminDark() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
  } catch {
    // Ignore storage errors
  }
  return getSystemDark();
}

function syncDocumentThemeMeta(isDark) {
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.setAttribute('content', isDark ? '#090D18' : '#EEF3FA');
  }
  const iosStatusMeta = document.querySelector(
    'meta[name="apple-mobile-web-app-status-bar-style"]'
  );
  if (iosStatusMeta) {
    iosStatusMeta.setAttribute('content', isDark ? 'black-translucent' : 'default');
  }
}

function AppRoutes({ session, systemDark, adminDark, onToggleAdminDark }) {
  const location = useLocation();
  const isPublicDocRoute = location.pathname.startsWith('/d/');
  const isLegalRoute =
    location.pathname === '/privacy' || location.pathname === '/copyright';

  const effectiveDark = isPublicDocRoute
    ? systemDark
    : isLegalRoute && !session
      ? systemDark
      : adminDark;

  useEffect(() => {
    syncDocumentThemeMeta(effectiveDark);
  }, [effectiveDark]);

  return (
    <>
      <Routes>
        <Route path="/d/:slug" element={<PublicDocPage dark={systemDark} />} />
        <Route
          path="/privacy"
          element={
            <LegalPage
              type="privacy"
              dark={effectiveDark}
              onToggleDark={session ? onToggleAdminDark : undefined}
              fallbackPath={session ? '/admin' : '/login'}
            />
          }
        />
        <Route
          path="/copyright"
          element={
            <LegalPage
              type="copyright"
              dark={effectiveDark}
              onToggleDark={session ? onToggleAdminDark : undefined}
              fallbackPath={session ? '/admin' : '/login'}
            />
          }
        />
        <Route
          path="/login"
          element={
            session ? <Navigate to="/admin" replace /> : <LoginPage dark={adminDark} />
          }
        />
        <Route
          path="/admin"
          element={
            session ? (
              <AdminPage
                user={session.user}
                dark={adminDark}
                onToggleDark={onToggleAdminDark}
              />
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
      <OfflineBanner dark={effectiveDark} />
    </>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [splashDone, setSplashDone] = useState(() => {
    if (typeof window === 'undefined') return true;
    const path = window.location.pathname;
    // Skip artificial splash delay for shared /d/:slug and legal pages so visitors open instantly
    return path.startsWith('/d/') || path === '/privacy' || path === '/copyright';
  });
  const [systemDark, setSystemDark] = useState(getSystemDark);
  const [adminDark, setAdminDark] = useState(getInitialAdminDark);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setSystemDark(e.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

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

  const toggleAdminDark = () => {
    setAdminDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

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
          adminDark ? 'bg-[#090D18] text-white' : 'bg-[#EEF3FA] text-[#1D1D1F]'
        }`}
      >
        <AmbientBackdrop dark={adminDark} />
        <div className="h-8" />
        <div className="relative z-10 flex flex-col items-center gap-3 anim-view">
          <DMDocLogo className="h-16 w-16 sm:h-[72px] sm:w-[72px]" />
          <span className="text-[18px] font-bold tracking-[-0.025em]">DM Docs</span>
        </div>
        <div className="relative z-10 pb-[env(safe-area-inset-bottom)]">
          <MabArenaBrand dark={adminDark} size="lg" />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes
        session={session}
        systemDark={systemDark}
        adminDark={adminDark}
        onToggleAdminDark={toggleAdminDark}
      />
    </BrowserRouter>
  );
}
