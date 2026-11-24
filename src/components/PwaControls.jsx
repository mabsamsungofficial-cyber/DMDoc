import React, { useState, useEffect, useCallback } from 'react';
import { Download, Share, WifiOff, X } from 'lucide-react';
import { getGlassStyle } from '../lib/utils';
import { DMDocLogo } from './DMDocLogo';

function isStandaloneMode() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator?.standalone === true
  );
}

function isIosSafari() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isIos = /iphone|ipad|ipod/i.test(ua);
  const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios|opios/i.test(ua);
  return isIos && isSafari;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(() => isStandaloneMode());
  const [iosHintOpen, setIosHintOpen] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const canInstall = !installed && (Boolean(deferredPrompt) || isIosSafari());

  const promptInstall = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
      }
      setDeferredPrompt(null);
      return outcome;
    }
    if (isIosSafari()) {
      setIosHintOpen(true);
      return 'ios-hint';
    }
    return 'unavailable';
  }, [deferredPrompt]);

  return {
    canInstall,
    installed,
    promptInstall,
    iosHintOpen,
    closeIosHint: () => setIosHintOpen(false),
  };
}

export function PwaInstallButton({ dark, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Install DMDoc app"
      title="Install App"
      className={`flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-semibold transition-transform duration-150 active:scale-95 ${
        dark
          ? 'bg-[#0A84FF]/25 text-[#64D2FF] hover:bg-[#0A84FF]/35'
          : 'bg-[#007AFF]/12 text-[#007AFF] hover:bg-[#007AFF]/18'
      }`}
    >
      <Download className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Install</span>
    </button>
  );
}

export function IosInstallModal({ isOpen, onClose, dark }) {
  if (!isOpen) return null;

  return (
    <div
      className="anim-backdrop fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/35 p-4"
      style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="anim-modal w-full max-w-xs overflow-hidden rounded-[28px] p-5"
        style={getGlassStyle(dark, 'sheet')}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <DMDocLogo className="h-9 w-9 shrink-0" />
            <div>
              <h3
                className={`text-[16px] font-semibold tracking-[-0.02em] ${
                  dark ? 'text-white' : 'text-[#1D1D1F]'
                }`}
              >
                Install DMDoc
              </h3>
              <p className={`text-[12px] ${dark ? 'text-white/60' : 'text-[#6E6E73]'}`}>
                Add to your Home Screen
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`flex h-7 w-7 items-center justify-center rounded-full ${
              dark ? 'bg-white/12 text-white/75' : 'bg-black/[0.06] text-[#515154]'
            }`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <ol
          className={`mt-4 space-y-2.5 text-[13px] leading-snug ${
            dark ? 'text-white/85' : 'text-[#1D1D1F]'
          }`}
        >
          <li className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#007AFF]/15 text-[11px] font-bold text-[#007AFF]">
              1
            </span>
            <span className="flex items-center gap-1">
              Tap <Share className="inline h-3.5 w-3.5 text-[#007AFF]" /> Share in Safari
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#007AFF]/15 text-[11px] font-bold text-[#007AFF]">
              2
            </span>
            <span>Choose &ldquo;Add to Home Screen&rdquo;</span>
          </li>
        </ol>
      </div>
    </div>
  );
}

export function OfflineBanner({ dark }) {
  const [offline, setOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  useEffect(() => {
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      className={`anim-toast fixed bottom-4 left-1/2 z-50 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium ${
        dark ? 'text-amber-300' : 'text-amber-700'
      }`}
      style={getGlassStyle(dark, 'pill')}
    >
      <WifiOff className="h-3.5 w-3.5" />
      <span>Offline mode</span>
    </div>
  );
}
