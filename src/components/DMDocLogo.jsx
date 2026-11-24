import React, { useId } from 'react';

export function DMDocLogo({ className = 'h-8 w-8', rounded = 'squircle' }) {
  const uid = useId().replace(/:/g, '');
  const bgId = `dmdoc-bg-${uid}`;
  const sheenId = `dmdoc-sheen-${uid}`;
  const rimId = `dmdoc-rim-${uid}`;
  const docId = `dmdoc-doc-${uid}`;
  const foldId = `dmdoc-fold-${uid}`;
  const barId = `dmdoc-bar-${uid}`;
  const rx = rounded === 'circle' ? 248 : 116;

  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      aria-hidden="true"
      className={className}
      style={{
        filter: 'drop-shadow(0 6px 14px rgba(0, 122, 255, 0.28))',
      }}
    >
      <defs>
        <linearGradient id={bgId} x1="32" y1="24" x2="480" y2="492" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="48%" stopColor="#007AFF" />
          <stop offset="100%" stopColor="#5856D6" />
        </linearGradient>
        <radialGradient
          id={sheenId}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(132 96) rotate(48) scale(340)"
        >
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.46" />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={rimId} x1="40" y1="20" x2="472" y2="492" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.72" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id={docId} x1="142" y1="116" x2="382" y2="396" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
          <stop offset="100%" stopColor="#EEF5FF" stopOpacity="0.92" />
        </linearGradient>
        <linearGradient id={foldId} x1="298" y1="116" x2="382" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.65" />
        </linearGradient>
        <linearGradient id={barId} x1="184" y1="194" x2="292" y2="194" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="55%" stopColor="#007AFF" />
          <stop offset="100%" stopColor="#5856D6" />
        </linearGradient>
      </defs>

      <rect x="8" y="8" width="496" height="496" rx={rx} fill={`url(#${bgId})`} />
      <rect x="8" y="8" width="496" height="496" rx={rx} fill={`url(#${sheenId})`} />
      <rect
        x="11"
        y="11"
        width="490"
        height="490"
        rx={Math.max(0, rx - 3)}
        stroke={`url(#${rimId})`}
        strokeWidth="6"
      />

      <path
        d="M 182 116 L 296 116 C 306 116 314 120 321 127 L 371 177 C 378 184 382 192 382 202 L 382 320 C 382 342.091 364.091 360 342 360 L 212 360 C 192 360 164 386 141 394 C 133 397 128 391 131 383 C 138 365 142 348 142 328 L 142 156 C 142 133.909 159.909 116 182 116 Z"
        fill={`url(#${docId})`}
      />
      <path
        d="M 298 116 C 306 117 314 120 321 127 L 371 177 C 378 184 381 192 382 200 L 324 200 C 309.641 200 298 188.359 298 174 L 298 116 Z"
        fill={`url(#${foldId})`}
      />

      <rect x="184" y="182" width="102" height="24" rx="12" fill={`url(#${barId})`} />
      <rect x="184" y="230" width="156" height="20" rx="10" fill="#007AFF" fillOpacity="0.22" />
      <rect x="184" y="272" width="116" height="20" rx="10" fill="#5856D6" fillOpacity="0.18" />
      <circle cx="328" cy="282" r="10" fill="#38BDF8" />
    </svg>
  );
}
