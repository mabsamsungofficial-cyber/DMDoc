export const APPLE_SPRING = 'cubic-bezier(0.22, 1, 0.36, 1)';
export const THEME_KEY = 'dmdoc_theme_v1';

export function generateRandomSlug() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 6; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function slugify(text) {
  return (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 36);
}

export function formatRelativeDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function getShareUrl(slug) {
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://dmdoc.app';
  return `${origin}/d/${slug}`;
}

export function copyTextSafe(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  }
  return Promise.resolve(fallbackCopy(text));
}

function fallbackCopy(text) {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  } catch {
    // Ignore clipboard fallback errors
  }
}

export function getGlassStyle(dark, variant = 'card') {
  if (dark) {
    if (variant === 'pill') {
      return {
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 100%)',
        backdropFilter: 'blur(28px) saturate(210%)',
        WebkitBackdropFilter: 'blur(28px) saturate(210%)',
        boxShadow:
          'inset 0 1px 0.5px rgba(255,255,255,0.34), inset 0 -1px 0.5px rgba(255,255,255,0.08), 0 10px 30px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(255,255,255,0.16)',
      };
    }
    if (variant === 'sheet') {
      return {
        background:
          'linear-gradient(160deg, rgba(36,40,56,0.84) 0%, rgba(20,22,34,0.9) 100%)',
        backdropFilter: 'blur(40px) saturate(220%)',
        WebkitBackdropFilter: 'blur(40px) saturate(220%)',
        boxShadow:
          'inset 0 1px 1px rgba(255,255,255,0.32), 0 28px 70px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(255,255,255,0.16)',
      };
    }
    return {
      background:
        'linear-gradient(145deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.05) 100%)',
      backdropFilter: 'blur(26px) saturate(200%)',
      WebkitBackdropFilter: 'blur(26px) saturate(200%)',
      boxShadow:
        'inset 0 1px 1px rgba(255,255,255,0.28), inset 1px 0 0.5px rgba(255,255,255,0.12), 0 12px 34px rgba(0,0,0,0.28), 0 0 0 0.5px rgba(255,255,255,0.14)',
    };
  }

  if (variant === 'pill') {
    return {
      background:
        'linear-gradient(135deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.46) 100%)',
      backdropFilter: 'blur(28px) saturate(220%)',
      WebkitBackdropFilter: 'blur(28px) saturate(220%)',
      boxShadow:
        'inset 0 1.5px 1px rgba(255,255,255,0.95), inset 0 -1px 1px rgba(255,255,255,0.35), 0 10px 30px rgba(30,58,138,0.08), 0 0 0 0.5px rgba(255,255,255,0.72)',
    };
  }
  if (variant === 'sheet') {
    return {
      background:
        'linear-gradient(160deg, rgba(255,255,255,0.88) 0%, rgba(246,249,255,0.8) 100%)',
      backdropFilter: 'blur(40px) saturate(220%)',
      WebkitBackdropFilter: 'blur(40px) saturate(220%)',
      boxShadow:
        'inset 0 1.5px 1px rgba(255,255,255,0.98), 0 28px 70px rgba(15,23,42,0.18), 0 0 0 0.5px rgba(255,255,255,0.8)',
    };
  }
  return {
    background:
      'linear-gradient(145deg, rgba(255,255,255,0.74) 0%, rgba(255,255,255,0.4) 100%)',
    backdropFilter: 'blur(26px) saturate(210%)',
    WebkitBackdropFilter: 'blur(26px) saturate(210%)',
    boxShadow:
      'inset 0 1.5px 1px rgba(255,255,255,0.95), inset 1px 0 1px rgba(255,255,255,0.5), 0 12px 32px rgba(30,58,138,0.07), 0 0 0 0.5px rgba(255,255,255,0.7)',
  };
}
