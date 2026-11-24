import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, ArrowUpRight, Zap } from 'lucide-react';
import { APPLE_SPRING, getGlassStyle } from '../lib/utils';

export function AmbientBackdrop({ dark }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="absolute -top-28 -left-24 h-[420px] w-[420px] rounded-full blur-[90px] transition-all duration-700"
        style={{
          background: dark
            ? 'radial-gradient(circle, rgba(56,189,248,0.38) 0%, rgba(56,189,248,0) 70%)'
            : 'radial-gradient(circle, rgba(96,165,250,0.45) 0%, rgba(96,165,250,0) 70%)',
        }}
      />
      <div
        className="absolute top-1/4 -right-24 h-[460px] w-[460px] rounded-full blur-[100px] transition-all duration-700"
        style={{
          background: dark
            ? 'radial-gradient(circle, rgba(168,85,247,0.34) 0%, rgba(168,85,247,0) 70%)'
            : 'radial-gradient(circle, rgba(196,181,253,0.52) 0%, rgba(196,181,253,0) 70%)',
        }}
      />
      <div
        className="absolute -bottom-28 left-1/3 h-[420px] w-[420px] rounded-full blur-[100px] transition-all duration-700"
        style={{
          background: dark
            ? 'radial-gradient(circle, rgba(45,212,191,0.24) 0%, rgba(45,212,191,0) 70%)'
            : 'radial-gradient(circle, rgba(125,211,252,0.45) 0%, rgba(125,211,252,0) 70%)',
        }}
      />
    </div>
  );
}

export function LiquidGlassCard({ dark, className = '', children }) {
  const [sheen, setSheen] = useState({ x: 50, y: 0, active: false });

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setSheen({ x, y, active: true });
  };

  return (
    <div
      onPointerMove={handleMove}
      onPointerLeave={() => setSheen((s) => ({ ...s, active: false }))}
      className={`relative overflow-hidden rounded-[26px] transition-transform duration-300 ${className}`}
      style={getGlassStyle(dark, 'card')}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: sheen.active ? 1 : 0,
          background: dark
            ? `radial-gradient(280px circle at ${sheen.x}% ${sheen.y}%, rgba(255,255,255,0.12), transparent 65%)`
            : `radial-gradient(280px circle at ${sheen.x}% ${sheen.y}%, rgba(255,255,255,0.65), transparent 65%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function LiquidGlassSheet({ isOpen, onClose, title, dark, children }) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const pointerState = useRef({
    active: false,
    startY: 0,
    lastY: 0,
    lastTime: 0,
    velocityY: 0,
  });

  useEffect(() => {
    if (!isOpen) {
      setDragY(0);
      setIsDragging(false);
      return undefined;
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const now = performance.now();
    pointerState.current = {
      active: true,
      startY: e.clientY - dragY,
      lastY: e.clientY,
      lastTime: now,
      velocityY: 0,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!pointerState.current.active) return;
    const now = performance.now();
    const dt = Math.max(1, now - pointerState.current.lastTime);
    const rawDelta = e.clientY - pointerState.current.startY;
    pointerState.current.velocityY = (e.clientY - pointerState.current.lastY) / dt;
    pointerState.current.lastY = e.clientY;
    pointerState.current.lastTime = now;

    const nextY = rawDelta < 0 ? rawDelta * 0.16 : rawDelta;
    setDragY(nextY);
  };

  const handlePointerUp = () => {
    if (!pointerState.current.active) return;
    pointerState.current.active = false;
    setIsDragging(false);

    const projectedY = dragY + pointerState.current.velocityY * 180;
    if (dragY > 110 || projectedY > 170) {
      setDragY(0);
      onClose();
    } else {
      setDragY(0);
    }
  };

  const backdropOpacity = Math.max(0.14, (dark ? 0.5 : 0.28) - Math.max(0, dragY) / 600);

  return (
    <div
      className="anim-backdrop fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{
        backgroundColor: `rgba(8, 12, 24, ${backdropOpacity})`,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        transition: isDragging ? 'none' : `background-color 240ms ${APPLE_SPRING}`,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="anim-sheet w-full sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-t-[32px] sm:rounded-[32px]"
        style={{
          ...getGlassStyle(dark, 'sheet'),
          transform: dragY !== 0 ? `translate3d(0, ${dragY}px, 0)` : undefined,
          transition: isDragging ? 'none' : `transform 360ms ${APPLE_SPRING}`,
        }}
      >
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`cursor-grab active:cursor-grabbing select-none touch-none border-b px-5 pt-2.5 pb-3.5 ${
            dark ? 'border-white/10' : 'border-black/[0.06]'
          }`}
        >
          <div
            className={`mx-auto mb-3 h-1 w-10 rounded-full ${
              dark ? 'bg-white/25' : 'bg-black/15'
            }`}
          />
          <div className="flex items-center justify-between gap-3">
            <h2
              className={`text-[17px] font-semibold tracking-[-0.02em] ${
                dark ? 'text-white' : 'text-[#1D1D1F]'
              }`}
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-150 active:scale-90 ${
                dark
                  ? 'bg-white/12 text-white/80 hover:bg-white/20'
                  : 'bg-black/[0.06] text-[#515154] hover:bg-black/[0.1]'
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export function AppleSpringSwitch({ checked, onChange, dark }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-[30px] w-[50px] shrink-0 cursor-pointer items-center rounded-full p-[2px] transition-colors duration-200 ${
        checked ? 'bg-[#34C759]' : dark ? 'bg-white/20' : 'bg-black/[0.16]'
      }`}
    >
      <span
        className="pointer-events-none inline-block h-[26px] w-[26px] rounded-full bg-white"
        style={{
          transform: checked
            ? 'translate3d(20px, 0, 0)'
            : 'translate3d(0px, 0, 0)',
          transition: `transform 260ms ${APPLE_SPRING}`,
          boxShadow:
            '0 2px 5px rgba(0,0,0,0.22), 0 0 0 0.5px rgba(0,0,0,0.04)',
        }}
      />
    </button>
  );
}

function renderFormattedLine(line, lineIndex, dark) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = line.split(urlRegex);
  return parts.map((part, idx) => {
    if (part.match(/^https?:\/\//)) {
      return (
        <a
          key={`${lineIndex}-${idx}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline underline-offset-2 break-all ${
            dark
              ? 'text-[#64D2FF] decoration-[#64D2FF]/40 hover:text-[#9BE4FF]'
              : 'text-[#007AFF] decoration-[#007AFF]/35 hover:text-[#0056CC]'
          }`}
        >
          {part}
        </a>
      );
    }
    return <React.Fragment key={`${lineIndex}-${idx}`}>{part}</React.Fragment>;
  });
}

export function DocContentRenderer({ content, dark }) {
  const lines = (content || '').split('\n');
  return (
    <div
      className={`space-y-2.5 text-[15px] leading-[1.58] tracking-[-0.01em] ${
        dark ? 'text-white/90' : 'text-[#1D1D1F]'
      }`}
    >
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={index} className="h-1.5" />;
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          return (
            <div key={index} className="flex items-start gap-2.5 pl-0.5">
              <span
                className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                  dark ? 'bg-[#64D2FF]/80' : 'bg-[#007AFF]/70'
                }`}
              />
              <p className="flex-1">{renderFormattedLine(trimmed.slice(2), index, dark)}</p>
            </div>
          );
        }
        return <p key={index}>{renderFormattedLine(line, index, dark)}</p>;
      })}
    </div>
  );
}

function NativeAdEmbed({ scriptCode }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !scriptCode) return undefined;
    el.innerHTML = '';
    const temp = document.createElement('div');
    temp.innerHTML = scriptCode;
    const nodes = Array.from(temp.childNodes);
    nodes.forEach((node) => {
      if (node.tagName === 'SCRIPT') {
        const script = document.createElement('script');
        Array.from(node.attributes).forEach((attr) =>
          script.setAttribute(attr.name, attr.value)
        );
        script.textContent = node.textContent;
        el.appendChild(script);
      } else {
        el.appendChild(node.cloneNode(true));
      }
    });
    return () => {
      el.innerHTML = '';
    };
  }, [scriptCode]);

  return <div ref={containerRef} className="w-full overflow-hidden" />;
}

export function LiquidGlassAdSlot({ settings, dark, onAdClick, isPreview = false }) {
  if (!settings || !settings.ad_enabled) return null;

  if (settings.ad_mode === 'native-ad') {
    const hasScript = Boolean(settings.ad_script_code?.trim()) && !isPreview;
    return (
      <div
        onClick={onAdClick}
        className="w-full rounded-[22px] p-3.5 transition-transform duration-150 active:scale-[0.99]"
        style={{
          background: dark
            ? 'linear-gradient(135deg, rgba(255,255,255,0.11) 0%, rgba(56,189,248,0.08) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.78) 0%, rgba(224,242,254,0.52) 100%)',
          boxShadow: dark
            ? 'inset 0 1px 0.5px rgba(255,255,255,0.24), 0 0 0 0.5px rgba(255,255,255,0.14)'
            : 'inset 0 1px 1px rgba(255,255,255,0.95), 0 4px 16px rgba(15,23,42,0.05), 0 0 0 0.5px rgba(255,255,255,0.8)',
        }}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              dark ? 'bg-white/12 text-white/65' : 'bg-black/[0.06] text-[#6E6E73]'
            }`}
          >
            Ad &middot; {settings.ad_network_name || 'Native'}
          </span>
        </div>
        {hasScript ? (
          <NativeAdEmbed scriptCode={settings.ad_script_code} />
        ) : (
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] text-white"
              style={{
                background: 'linear-gradient(145deg, #38BDF8 0%, #6366F1 100%)',
              }}
            >
              <Zap className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`truncate text-[13px] font-semibold ${
                  dark ? 'text-white' : 'text-[#1D1D1F]'
                }`}
              >
                {settings.ad_network_name || 'Native Ad Slot'}
              </p>
            </div>
            <ArrowUpRight
              className={`h-4 w-4 shrink-0 ${
                dark ? 'text-white/60' : 'text-[#6E6E73]'
              }`}
            />
          </div>
        )}
      </div>
    );
  }

  if (!settings.ad_title && !settings.ad_cta_url) return null;

  return (
    <a
      href={settings.ad_cta_url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        if (!settings.ad_cta_url) e.preventDefault();
        if (onAdClick) onAdClick();
      }}
      className="group block rounded-[22px] p-3.5 transition-transform duration-150 active:scale-[0.98]"
      style={{
        background: dark
          ? 'linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(56,189,248,0.14) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.82) 0%, rgba(237,233,254,0.62) 100%)',
        boxShadow: dark
          ? 'inset 0 1px 0.5px rgba(255,255,255,0.28), 0 8px 24px rgba(0,0,0,0.25), 0 0 0 0.5px rgba(255,255,255,0.18)'
          : 'inset 0 1.5px 1px rgba(255,255,255,0.96), 0 8px 22px rgba(99,102,241,0.08), 0 0 0 0.5px rgba(255,255,255,0.85)',
      }}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
            dark
              ? 'bg-white/15 text-[#D8B4FE]'
              : 'bg-[#5856D6]/12 text-[#5856D6]'
          }`}
        >
          <Sparkles className="h-2.5 w-2.5" />
          {settings.ad_badge || 'Sponsored'}
        </span>
        <span
          className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
            dark ? 'text-[#64D2FF]' : 'text-[#007AFF]'
          }`}
        >
          {settings.ad_cta_label || 'Open'}
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
      <p
        className={`text-[14px] font-semibold tracking-[-0.015em] ${
          dark ? 'text-white' : 'text-[#1D1D1F]'
        }`}
      >
        {settings.ad_title}
      </p>
      {settings.ad_description && (
        <p
          className={`mt-0.5 text-[12px] leading-snug ${
            dark ? 'text-white/70' : 'text-[#515154]'
          }`}
        >
          {settings.ad_description}
        </p>
      )}
    </a>
  );
}
