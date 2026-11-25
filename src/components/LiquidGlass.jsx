import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Sparkles, ArrowUpRight, Zap, Copy, Check, Code2 } from 'lucide-react';
import { Highlight, Prism, themes } from 'prism-react-renderer';
import { APPLE_SPRING, copyTextSafe, getGlassStyle } from '../lib/utils';

if (typeof Prism !== 'undefined' && Prism.languages && !Prism.languages.bash) {
  Prism.languages.bash = {
    comment: { pattern: /(^|[^"{\\$])#.*/, lookbehind: true },
    string: [
      { pattern: /"(?:\\[\s\S]|[^"\\])*"/, greedy: true },
      { pattern: /'(?:\\[\s\S]|[^'\\])*'/, greedy: true },
    ],
    variable: /\$(?:\w+|\{[^}]+\})/,
    keyword:
      /\b(?:if|then|else|elif|fi|for|while|do|done|case|esac|in|function|export|local|return|sudo|npm|npx|yarn|pnpm|pip3?|python3?|git|cd|ls|mkdir|rm|cp|mv|cat|echo|curl|wget|docker)\b/,
    operator: /&&|\|\||[|><;=]/,
    number: /\b\d+\b/,
    punctuation: /[(){}[\]]/,
  };
  Prism.languages.sh = Prism.languages.bash;
  Prism.languages.shell = Prism.languages.bash;
  Prism.languages.zsh = Prism.languages.bash;
}

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
      <div className="relative z-10 min-w-0">{children}</div>
    </div>
  );
}

export function LiquidGlassSheet({
  isOpen,
  onClose,
  title,
  dark,
  size = 'md',
  children,
}) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const pointerState = useRef({
    active: false,
    captured: false,
    pointerId: null,
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
    if (e.target.closest('button, a, input, select, textarea, [data-no-drag]')) {
      return;
    }
    const now = performance.now();
    pointerState.current = {
      active: true,
      captured: false,
      pointerId: e.pointerId,
      startY: e.clientY - dragY,
      lastY: e.clientY,
      lastTime: now,
      velocityY: 0,
    };
  };

  const handlePointerMove = (e) => {
    if (!pointerState.current.active) return;
    const rawDelta = e.clientY - pointerState.current.startY;
    if (!pointerState.current.captured) {
      if (Math.abs(rawDelta) <= 4) return;
      try {
        e.currentTarget.setPointerCapture(pointerState.current.pointerId);
      } catch {
        // Ignore pointer capture errors on synthetic events
      }
      pointerState.current.captured = true;
      setIsDragging(true);
    }

    const now = performance.now();
    const dt = Math.max(1, now - pointerState.current.lastTime);
    pointerState.current.velocityY = (e.clientY - pointerState.current.lastY) / dt;
    pointerState.current.lastY = e.clientY;
    pointerState.current.lastTime = now;

    const nextY = rawDelta < 0 ? rawDelta * 0.16 : rawDelta;
    setDragY(nextY);
  };

  const handlePointerUp = () => {
    if (!pointerState.current.active) return;
    const wasCaptured = pointerState.current.captured;
    pointerState.current.active = false;
    pointerState.current.captured = false;
    setIsDragging(false);

    if (!wasCaptured) {
      setDragY(0);
      return;
    }

    const projectedY = dragY + pointerState.current.velocityY * 180;
    if (dragY > 110 || projectedY > 170) {
      setDragY(0);
      onClose();
    } else {
      setDragY(0);
    }
  };

  const backdropOpacity = Math.max(0.14, (dark ? 0.5 : 0.28) - Math.max(0, dragY) / 600);
  const maxWidthClass = size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-lg';

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
        className={`anim-sheet w-full ${maxWidthClass} max-h-[90vh] flex flex-col overflow-hidden rounded-t-[32px] sm:rounded-[32px]`}
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
              onPointerDown={(e) => e.stopPropagation()}
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

export function LiquidGlassConfirmModal({
  isOpen,
  title,
  description,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  destructive = true,
  onCancel,
  onConfirm,
  dark,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="anim-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
      style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="anim-modal w-full max-w-[290px] overflow-hidden rounded-[26px] text-center"
        style={getGlassStyle(dark, 'sheet')}
      >
        <div className="px-5 pt-5 pb-4">
          <h3 className="break-words [overflow-wrap:anywhere] text-[16px] font-semibold tracking-[-0.015em]">
            {title}
          </h3>
          {description && (
            <p
              className={`mt-1.5 text-[12px] leading-relaxed ${
                dark ? 'text-white/65' : 'text-[#515154]'
              }`}
            >
              {description}
            </p>
          )}
        </div>
        <div
          className={`grid grid-cols-2 border-t ${
            dark ? 'border-white/12' : 'border-black/[0.08]'
          }`}
        >
          <button
            type="button"
            onClick={onCancel}
            className={`border-r py-3 text-[14px] font-medium transition-colors ${
              dark
                ? 'border-white/12 text-[#64D2FF] hover:bg-white/[0.06]'
                : 'border-black/[0.08] text-[#007AFF] hover:bg-black/[0.03]'
            }`}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`py-3 text-[14px] font-semibold transition-colors ${
              destructive
                ? dark
                  ? 'text-[#FF453A] hover:bg-[#FF453A]/10'
                  : 'text-[#FF3B30] hover:bg-[#FF3B30]/8'
                : dark
                  ? 'text-[#64D2FF] hover:bg-white/[0.06]'
                  : 'text-[#007AFF] hover:bg-black/[0.03]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const URL_CANDIDATE_REGEX =
  /(https?:\/\/[^\s<>()]+|www\.[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:[/?#][^\s<>()]*)?|(?:[a-zA-Z0-9-]+\.)+(?:co\.in|co\.uk|com\.au|org\.in|ac\.in|com|in|org|net|io|co|dev|app|ai|me|xyz|info|biz|edu|gov|uk|us|ca|de|fr|au|jp|sg|ae|pk|bd|np|ly|gg|to|tv|cc|sh|so|fm|link|live|online|site|store|tech|cloud|pro|club|blog|shop|page|news|wiki)(?:[/?#][^\s<>()]*)?)/gi;

function renderTextWithLinks(text, keyPrefix, dark) {
  const nodes = [];
  let lastIndex = 0;
  URL_CANDIDATE_REGEX.lastIndex = 0;
  let match;

  while ((match = URL_CANDIDATE_REGEX.exec(text)) !== null) {
    const rawMatch = match[0];
    const start = match.index;
    const prevChar = start > 0 ? text[start - 1] : '';

    if (prevChar && /[a-zA-Z0-9@._/-]/.test(prevChar)) {
      continue;
    }

    let cleanUrl = rawMatch;
    let trailing = '';
    while (cleanUrl.length > 0 && /[.,;:!?)]}$'"]/.test(cleanUrl[cleanUrl.length - 1])) {
      trailing = cleanUrl[cleanUrl.length - 1] + trailing;
      cleanUrl = cleanUrl.slice(0, -1);
    }

    if (!cleanUrl) continue;

    if (start > lastIndex) {
      nodes.push(
        <React.Fragment key={`${keyPrefix}-txt-${lastIndex}`}>
          {text.slice(lastIndex, start)}
        </React.Fragment>
      );
    }

    const href = /^https?:\/\//i.test(cleanUrl) ? cleanUrl : `https://${cleanUrl}`;
    nodes.push(
      <a
        key={`${keyPrefix}-url-${start}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`underline underline-offset-2 [overflow-wrap:anywhere] ${
          dark
            ? 'text-[#64D2FF] decoration-[#64D2FF]/40 hover:text-[#9BE4FF]'
            : 'text-[#007AFF] decoration-[#007AFF]/35 hover:text-[#0056CC]'
        }`}
      >
        {cleanUrl}
      </a>
    );

    if (trailing) {
      nodes.push(
        <React.Fragment key={`${keyPrefix}-trail-${start}`}>{trailing}</React.Fragment>
      );
    }

    lastIndex = start + rawMatch.length;
  }

  if (lastIndex < text.length) {
    nodes.push(
      <React.Fragment key={`${keyPrefix}-end-${lastIndex}`}>
        {text.slice(lastIndex)}
      </React.Fragment>
    );
  }

  return nodes.length > 0 ? nodes : text;
}

function renderTextWithBoldAndLinks(text, keyPrefix, dark) {
  const boldParts = text.split(/(\*\*[^*\n]+\*\*)/g);
  return boldParts.map((seg, bIdx) => {
    if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4) {
      return (
        <strong
          key={`${keyPrefix}-b-${bIdx}`}
          className={`font-semibold ${dark ? 'text-white' : 'text-[#0F172A]'}`}
        >
          {renderTextWithLinks(seg.slice(2, -2), `${keyPrefix}-b-${bIdx}`, dark)}
        </strong>
      );
    }
    return (
      <React.Fragment key={`${keyPrefix}-t-${bIdx}`}>
        {renderTextWithLinks(seg, `${keyPrefix}-t-${bIdx}`, dark)}
      </React.Fragment>
    );
  });
}

function renderFormattedLine(line, lineIndex, dark) {
  const inlineCodeParts = line.split(/(`[^`\n]+`)/g);
  return inlineCodeParts.map((part, idx) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={`${lineIndex}-code-${idx}`}
          className={`mx-0.5 rounded-[7px] px-1.5 py-0.5 font-mono text-[13px] [overflow-wrap:anywhere] ${
            dark
              ? 'bg-white/12 text-[#7DD3FC] border border-white/12'
              : 'bg-[#0F172A]/[0.07] text-[#0F172A] border border-black/[0.06]'
          }`}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return (
      <React.Fragment key={`${lineIndex}-seg-${idx}`}>
        {renderTextWithBoldAndLinks(part, `${lineIndex}-${idx}`, dark)}
      </React.Fragment>
    );
  });
}

const LANGUAGE_MAP = {
  py: { prism: 'python', label: 'Python' },
  python: { prism: 'python', label: 'Python' },
  html: { prism: 'markup', label: 'HTML' },
  htm: { prism: 'markup', label: 'HTML' },
  xml: { prism: 'markup', label: 'XML' },
  svg: { prism: 'markup', label: 'SVG' },
  markup: { prism: 'markup', label: 'HTML' },
  js: { prism: 'javascript', label: 'JavaScript' },
  javascript: { prism: 'javascript', label: 'JavaScript' },
  ts: { prism: 'typescript', label: 'TypeScript' },
  typescript: { prism: 'typescript', label: 'TypeScript' },
  jsx: { prism: 'jsx', label: 'JSX' },
  tsx: { prism: 'tsx', label: 'TSX' },
  css: { prism: 'css', label: 'CSS' },
  json: { prism: 'json', label: 'JSON' },
  sql: { prism: 'sql', label: 'SQL' },
  bash: { prism: 'bash', label: 'Bash' },
  sh: { prism: 'bash', label: 'Shell' },
  shell: { prism: 'bash', label: 'Shell' },
  zsh: { prism: 'bash', label: 'Zsh' },
  yml: { prism: 'yaml', label: 'YAML' },
  yaml: { prism: 'yaml', label: 'YAML' },
  md: { prism: 'markdown', label: 'Markdown' },
  markdown: { prism: 'markdown', label: 'Markdown' },
  cpp: { prism: 'cpp', label: 'C++' },
  'c++': { prism: 'cpp', label: 'C++' },
  c: { prism: 'c', label: 'C' },
  go: { prism: 'go', label: 'Go' },
  rust: { prism: 'rust', label: 'Rust' },
  swift: { prism: 'swift', label: 'Swift' },
  kotlin: { prism: 'kotlin', label: 'Kotlin' },
  plain: { prism: 'plain', label: 'Code' },
  text: { prism: 'plain', label: 'Code' },
};

function resolveCodeLanguage(lang) {
  const key = (lang || '').trim().toLowerCase();
  if (!key) return { prism: 'plain', label: 'Code' };
  if (LANGUAGE_MAP[key]) return LANGUAGE_MAP[key];
  if (Prism?.languages?.[key]) {
    return { prism: key, label: lang.trim().toUpperCase() };
  }
  return { prism: 'plain', label: lang.trim() || 'Code' };
}

function CodeBlock({ code, lang, dark }) {
  const [copied, setCopied] = useState(false);
  const { prism, label } = resolveCodeLanguage(lang);
  const lineCount = code ? code.split('\n').length : 1;

  const handleCopy = () => {
    copyTextSafe(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div
      className={`my-2.5 w-full max-w-full overflow-hidden rounded-[18px] border shadow-[0_12px_30px_rgba(2,6,23,0.28)] ${
        dark
          ? 'bg-[#121622] border-white/14 text-[#D4D4D4]'
          : 'bg-[#161B26] border-[#0F172A]/25 text-[#D4D4D4]'
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] bg-[#1C2230] px-3.5 py-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]/85" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]/85" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27C93F]/85" />
          </div>
          <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.07] px-2 py-0.5 font-mono text-[11px] font-medium text-[#9CDCFE]">
            <Code2 className="h-3 w-3 opacity-80" />
            <span>{label}</span>
          </span>
          <span className="text-[11px] tabular-nums text-white/40">
            {lineCount} {lineCount === 1 ? 'line' : 'lines'}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all active:scale-95 ${
            copied
              ? 'bg-[#34C759]/20 text-[#5EE881] border border-[#34C759]/35'
              : 'bg-white/10 text-white/85 hover:bg-white/18 border border-white/10'
          }`}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 stroke-[2.4]" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      <Highlight theme={themes.vsDark} code={code} language={prism}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${className} m-0 overflow-x-auto overscroll-x-contain py-3 font-mono text-[12.5px] sm:text-[13px] leading-[1.6]`}
            style={{ ...style, backgroundColor: 'transparent' }}
          >
            <code className="block min-w-full w-max">
              {tokens.map((line, i) => {
                const lineProps = getLineProps({ line });
                const isEmptyLine =
                  line.length === 0 || (line.length === 1 && line[0].empty);
                return (
                  <div
                    key={i}
                    {...lineProps}
                    className={`${lineProps.className || ''} flex min-w-full hover:bg-white/[0.035]`}
                  >
                    <span
                      aria-hidden="true"
                      className="select-none shrink-0 w-10 pr-3 text-right text-[11.5px] tabular-nums text-white/30 border-r border-white/[0.07]"
                    >
                      {i + 1}
                    </span>
                    <span className="whitespace-pre pl-3.5 pr-4">
                      {isEmptyLine
                        ? ' '
                        : line.map((token, key) => (
                            <span key={key} {...getTokenProps({ token })} />
                          ))}
                    </span>
                  </div>
                );
              })}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  );
}

function parseDocBlocks(content) {
  const lines = (content || '').split('\n');
  const blocks = [];
  let inCode = false;
  let codeLang = '';
  let codeLines = [];

  lines.forEach((line, idx) => {
    const fenceMatch = line.match(/^\s*```([a-zA-Z0-9_+-]*)\s*$/);
    if (fenceMatch && !inCode) {
      inCode = true;
      codeLang = fenceMatch[1] || '';
      codeLines = [];
      return;
    }
    if (inCode && /^\s*```\s*$/.test(line)) {
      blocks.push({ type: 'code', lang: codeLang, code: codeLines.join('\n'), key: `code-${idx}` });
      inCode = false;
      codeLang = '';
      codeLines = [];
      return;
    }
    if (inCode) {
      codeLines.push(line);
      return;
    }
    blocks.push({ type: 'line', text: line, key: `line-${idx}` });
  });

  if (inCode) {
    blocks.push({
      type: 'code',
      lang: codeLang,
      code: codeLines.join('\n'),
      key: `code-eof`,
    });
  }

  return blocks;
}

export function DocContentRenderer({ content, dark }) {
  const blocks = parseDocBlocks(content);
  return (
    <div
      className={`min-w-0 space-y-2.5 text-[15px] leading-[1.58] tracking-[-0.01em] break-words [overflow-wrap:anywhere] ${
        dark ? 'text-white/90' : 'text-[#1D1D1F]'
      }`}
    >
      {blocks.map((block, index) => {
        if (block.type === 'code') {
          return <CodeBlock key={block.key} code={block.code} lang={block.lang} dark={dark} />;
        }
        const trimmed = block.text.trim();
        if (!trimmed) return <div key={block.key} className="h-1.5" />;

        if (/^(?:---|\*\*\*)$/.test(trimmed)) {
          return (
            <hr
              key={block.key}
              className={`my-2 border-t ${
                dark ? 'border-white/12' : 'border-black/[0.08]'
              }`}
            />
          );
        }

        const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
        if (headingMatch) {
          const level = headingMatch[1].length;
          const headingText = headingMatch[2];
          const headingClass =
            level === 1
              ? 'pt-1.5 text-[19px] font-bold tracking-[-0.025em]'
              : level === 2
                ? 'pt-1.5 text-[17px] font-bold tracking-[-0.02em]'
                : 'pt-1 text-[15.5px] font-semibold tracking-[-0.015em]';
          return (
            <h3
              key={block.key}
              className={`${headingClass} leading-snug break-words [overflow-wrap:anywhere] ${
                dark ? 'text-white' : 'text-[#0F172A]'
              }`}
            >
              {renderFormattedLine(headingText, index, dark)}
            </h3>
          );
        }

        if (trimmed.startsWith('> ')) {
          return (
            <div
              key={block.key}
              className={`rounded-r-[12px] border-l-2 px-3 py-2 text-[14px] ${
                dark
                  ? 'border-[#64D2FF]/70 bg-white/[0.05] text-white/85'
                  : 'border-[#007AFF]/70 bg-white/70 text-[#3A3A3C]'
              }`}
            >
              {renderFormattedLine(trimmed.slice(2), index, dark)}
            </div>
          );
        }

        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
        if (numberedMatch) {
          return (
            <div key={block.key} className="flex min-w-0 items-start gap-2.5 pl-0.5">
              <span
                className={`mt-0.5 min-w-[1.25rem] shrink-0 font-mono text-[13px] font-semibold tabular-nums ${
                  dark ? 'text-[#64D2FF]' : 'text-[#007AFF]'
                }`}
              >
                {numberedMatch[1]}.
              </span>
              <p className="min-w-0 flex-1 break-words [overflow-wrap:anywhere]">
                {renderFormattedLine(numberedMatch[2], index, dark)}
              </p>
            </div>
          );
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
          return (
            <div key={block.key} className="flex min-w-0 items-start gap-2.5 pl-0.5">
              <span
                className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                  dark ? 'bg-[#64D2FF]/80' : 'bg-[#007AFF]/70'
                }`}
              />
              <p className="min-w-0 flex-1 break-words [overflow-wrap:anywhere]">
                {renderFormattedLine(trimmed.slice(2), index, dark)}
              </p>
            </div>
          );
        }
        return (
          <p key={block.key} className="min-w-0 break-words [overflow-wrap:anywhere]">
            {renderFormattedLine(block.text, index, dark)}
          </p>
        );
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

export function LegalLinks({ dark, className = '' }) {
  const linkClass = `transition-colors ${
    dark ? 'hover:text-white/80' : 'hover:text-[#1D1D1F]'
  }`;
  return (
    <div
      className={`flex items-center justify-center gap-2 text-[11px] font-medium ${
        dark ? 'text-white/45' : 'text-[#6E6E73]'
      } ${className}`}
    >
      <Link to="/privacy" className={linkClass}>
        Privacy Policy
      </Link>
      <span aria-hidden="true">&middot;</span>
      <Link to="/copyright" className={linkClass}>
        Copyright
      </Link>
    </div>
  );
}
