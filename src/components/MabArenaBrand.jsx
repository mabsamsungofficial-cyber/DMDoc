import React from 'react';

export function MabArenaBrand({ dark, size = 'md', className = '' }) {
  const sizes = {
    sm: {
      label: 'text-[10px] tracking-[0.08em]',
      logo: 'h-[13px]',
      gap: 'gap-1',
    },
    md: {
      label: 'text-[11px] tracking-[0.08em]',
      logo: 'h-[16px]',
      gap: 'gap-1.5',
    },
    lg: {
      label: 'text-[12px] tracking-[0.1em]',
      logo: 'h-[19px]',
      gap: 'gap-1.5',
    },
  };

  const preset = sizes[size] || sizes.md;

  return (
    <div
      className={`inline-flex flex-col items-center justify-center select-none ${preset.gap} ${className}`}
    >
      <span
        className={`font-medium lowercase leading-none ${preset.label} ${
          dark ? 'text-white/50' : 'text-[#6E6E73]'
        }`}
      >
        from
      </span>
      <img
        src={dark ? '/mab-arena-dark.png' : '/mab-arena-light.png'}
        alt="MAB ARENA"
        draggable="false"
        className={`w-auto object-contain opacity-90 ${preset.logo}`}
      />
    </div>
  );
}
