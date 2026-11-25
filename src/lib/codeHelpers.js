export const CODE_LANGUAGES = [
  { value: 'auto', label: 'Auto' },
  { value: 'python', label: 'Python' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'json', label: 'JSON' },
  { value: 'bash', label: 'Bash' },
  { value: 'sql', label: 'SQL' },
  { value: 'plain', label: 'Plain' },
];

export function detectCodeLanguage(snippet) {
  const code = (snippet || '').trim();
  if (!code) return '';

  if (
    (code.startsWith('{') || code.startsWith('[')) &&
    /"[^"]+"\s*:/.test(code)
  ) {
    try {
      JSON.parse(code);
      return 'json';
    } catch {
      // Fall through if not valid JSON
    }
  }

  if (
    /<!doctype\s+html/i.test(code) ||
    /<\/?(html|head|body|div|span|section|main|header|footer|script|style|form|input|button|p|a|h[1-6]|ul|li|table)\b[^>]*>/i.test(
      code
    )
  ) {
    return 'html';
  }

  if (
    /^\s*def\s+[a-zA-Z_]\w*\s*\(/m.test(code) ||
    /^\s*(from\s+[\w.]+\s+import\s+|import\s+[\w.]+)/m.test(code) ||
    /\bprint\s*\(/.test(code) ||
    /\belif\b/.test(code) ||
    /if\s+__name__\s*==\s*['"]__main__['"]/.test(code)
  ) {
    return 'python';
  }

  if (
    /^\s*(SELECT|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE)\b/im.test(
      code
    )
  ) {
    return 'sql';
  }

  if (
    /^#!\/(?:usr\/)?bin\/(?:ba|z)?sh/m.test(code) ||
    /^\s*(sudo|npm|npx|yarn|pnpm|pip3?|git|cd|ls|mkdir|rm|cp|mv|cat|echo|curl|wget|docker|python3?)\s+/m.test(
      code
    )
  ) {
    return 'bash';
  }

  if (
    /\b(interface|type)\s+[A-Z]\w*/.test(code) ||
    /:\s*(string|number|boolean|unknown|never|void)\b/.test(code)
  ) {
    return 'typescript';
  }

  if (/[.#@]?[a-zA-Z0-9_-]+\s*\{[^}]*:\s*[^;{}]+;/m.test(code)) {
    return 'css';
  }

  if (
    /\b(const|let|var|function|async|await|export|import|return)\b/.test(code) ||
    /console\.(log|warn|error)\s*\(/.test(code) ||
    /=>/.test(code)
  ) {
    return 'javascript';
  }

  return '';
}

export function wrapSelectionAsCodeBlock(content, selStart, selEnd, selectedLang = 'auto') {
  const text = content || '';
  const start = Math.max(0, Math.min(selStart ?? text.length, text.length));
  const end = Math.max(start, Math.min(selEnd ?? start, text.length));

  if (start === end) {
    const langTag = selectedLang === 'auto' || selectedLang === 'plain' ? '' : selectedLang;
    const before = text.slice(0, start);
    const after = text.slice(end);
    const prefix = before.length === 0 ? '' : before.endsWith('\n') ? '' : '\n';
    const suffix = after.length === 0 ? '' : after.startsWith('\n') ? '' : '\n';
    const openFence = `${prefix}\`\`\`${langTag}\n`;
    const closeFence = `\n\`\`\`${suffix}`;
    const nextContent = `${before}${openFence}${closeFence}${after}`;
    const cursorPos = before.length + openFence.length;
    return {
      nextContent,
      nextSelectionStart: cursorPos,
      nextSelectionEnd: cursorPos,
    };
  }

  const before = text.slice(0, start);
  let selected = text.slice(start, end);
  let after = text.slice(end);

  if (selected.endsWith('\n') && !after.startsWith('\n')) {
    selected = selected.slice(0, -1);
    after = `\n${after}`;
  }

  const detected = selectedLang === 'auto' ? detectCodeLanguage(selected) : selectedLang;
  const langTag = detected === 'plain' ? '' : detected;

  const prefix = before.length === 0 ? '' : before.endsWith('\n') ? '' : '\n';
  const suffix = after.length === 0 ? '' : after.startsWith('\n') ? '' : '\n';

  const openFence = `${prefix}\`\`\`${langTag}\n`;
  const closeFence = `\n\`\`\`${suffix}`;
  const nextContent = `${before}${openFence}${selected}${closeFence}${after}`;
  const codeStart = before.length + openFence.length;
  const codeEnd = codeStart + selected.length;

  return {
    nextContent,
    nextSelectionStart: codeStart,
    nextSelectionEnd: codeEnd,
  };
}

export function wrapSelectionAsInlineCode(content, selStart, selEnd) {
  const text = content || '';
  const start = Math.max(0, Math.min(selStart ?? text.length, text.length));
  const end = Math.max(start, Math.min(selEnd ?? start, text.length));

  if (start === end) {
    const nextContent = `${text.slice(0, start)}\`\`${text.slice(end)}`;
    return {
      nextContent,
      nextSelectionStart: start + 1,
      nextSelectionEnd: start + 1,
    };
  }

  const selected = text.slice(start, end).replace(/\n+/g, ' ');
  const nextContent = `${text.slice(0, start)}\`${selected}\`${text.slice(end)}`;
  return {
    nextContent,
    nextSelectionStart: start + 1,
    nextSelectionEnd: start + 1 + selected.length,
  };
}

export function toggleBulletList(content, selStart, selEnd) {
  const text = content || '';
  const start = Math.max(0, Math.min(selStart ?? text.length, text.length));
  const end = Math.max(start, Math.min(selEnd ?? start, text.length));

  const lineStart = text.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
  const nextNewline = text.indexOf('\n', end);
  const lineEnd = nextNewline === -1 ? text.length : nextNewline;

  const block = text.slice(lineStart, lineEnd);
  const lines = block.split('\n');
  const nonEmptyLines = lines.filter((l) => l.trim().length > 0);
  const allBulleted =
    nonEmptyLines.length > 0 && nonEmptyLines.every((l) => /^\s*[-•]\s+/.test(l));

  const updatedBlock = lines
    .map((line) => {
      if (!line.trim()) return line;
      if (allBulleted) return line.replace(/^(\s*)[-•]\s+/, '$1');
      if (/^\s*[-•]\s+/.test(line)) return line;
      return `- ${line}`;
    })
    .join('\n');

  const nextContent = `${text.slice(0, lineStart)}${updatedBlock}${text.slice(lineEnd)}`;
  return {
    nextContent,
    nextSelectionStart: lineStart,
    nextSelectionEnd: lineStart + updatedBlock.length,
  };
}

export function hasCodeBlock(content) {
  return /^\s*```[a-zA-Z0-9_+-]*\s*$/m.test(content || '');
}

export function getDocSnippet(content) {
  return (content || '')
    .replace(/^\s*```[a-zA-Z0-9_+-]*\s*$/gm, '')
    .replace(/\n{2,}/g, '\n')
    .trim();
}
