import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { THEME_KEY } from './lib/utils';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import PublicDocPage from './pages/PublicDocPage';
import { OfflineBanner } from './components/PwaControls';

export default function App() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
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

  if (!authReady) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/d/:slug"
          element={<PublicDocPage dark={dark} onToggleDark={toggleDark} />}
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
