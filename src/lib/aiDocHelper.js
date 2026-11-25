import { slugify } from './utils.js';

export const DM_DOCS_AI_PROMPT = `Format your complete answer as a single DM Docs Markdown (.md) document so I can import it directly into my app.

STRICT OUTPUT RULES:
1. Return ONLY the raw Markdown document (either as a downloadable .md file or inside a single \`\`\`markdown code block). Do NOT include any intro or outro commentary.
2. Start at line 1 with this exact YAML frontmatter block:
---
title: Short Clear Document Title
slug: url-friendly-lowercase-slug
cta_label: Optional Button Text (leave blank if not needed)
cta_url: https://example.com (leave blank if not needed)
public: true
---
3. After the frontmatter, write clean, well-structured content using ONLY these supported elements:
   - Headings: ## Section Heading, ### Subheading
   - Bold text: **important text**
   - Inline code: \`command_or_variable\`
   - Bullet lists: - Item
   - Numbered steps: 1. Step one
   - Notes/callouts: > Important note
   - Code blocks: triple backticks with language tag (\`\`\`python, \`\`\`html, \`\`\`css, \`\`\`javascript, \`\`\`json, \`\`\`bash, \`\`\`sql)
   - Plain clickable URLs (https://...)
4. Do NOT use local image embeds (![](...)) or complex HTML tables.`;

const PLACEHOLDER_CTA_URLS = new Set([
  'https://example.com',
  'http://example.com',
  'https://example.com/',
  'none',
  'null',
  'n/a',
  '-',
]);

function stripSurroundingQuotes(val) {
  const trimmed = (val || '').trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function cleanOuterWrapper(raw) {
  let text = (raw || '').replace(/\r\n?/g, '\n').trim();
  if (!text) return '';

  // Remove brief conversational lead-in before an explicit ```markdown fence or --- frontmatter
  const fenceStartMatch = text.match(/^[^\n]{0,120}:\s*\n+(```(?:markdown|md)?\s*\n[\s\S]*)$/i);
  if (fenceStartMatch) {
    text = fenceStartMatch[1].trim();
  } else {
    const frontmatterLeadMatch = text.match(/^[^\n]{0,120}:\s*\n+(---\s*\n[\s\S]*\n---[\s\S]*)$/);
    if (frontmatterLeadMatch) {
      text = frontmatterLeadMatch[1].trim();
    }
  }

  // Unwrap outer ```markdown / ```md fence (or generic ``` wrapping a frontmatter document)
  const mdFenceMatch = text.match(/^```(?:markdown|md)\s*\n([\s\S]*?)\n```\s*$/i);
  if (mdFenceMatch) {
    text = mdFenceMatch[1].trim();
  } else {
    const genericFrontmatterFence = text.match(/^```\s*\n(---\s*\n[\s\S]*?)\n```\s*$/);
    if (genericFrontmatterFence) {
      text = genericFrontmatterFence[1].trim();
    }
  }

  return text;
}

function parseBooleanFlag(val, fallback = true) {
  const norm = stripSurroundingQuotes(val).toLowerCase();
  if (!norm) return fallback;
  if (['false', '0', 'no', 'draft', 'private'].includes(norm)) return false;
  if (['true', '1', 'yes', 'public'].includes(norm)) return true;
  return fallback;
}

export function parseAiDocInput(rawText) {
  const cleaned = cleanOuterWrapper(rawText);
  if (!cleaned) {
    return {
      title: '',
      slug: '',
      content: '',
      ctaLabel: '',
      ctaUrl: '',
      isPublic: true,
      hasFrontmatter: false,
    };
  }

  let title = '';
  let slug = '';
  let ctaLabel = '';
  let ctaUrl = '';
  let isPublic = true;
  let hasFrontmatter = false;
  let body = cleaned;

  const fmMatch = cleaned.match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n([\s\S]*))?$/);
  if (fmMatch) {
    hasFrontmatter = true;
    const fmLines = fmMatch[1].split('\n');
    body = (fmMatch[2] || '').trim();

    fmLines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const sepIndex = trimmed.indexOf(':');
      if (sepIndex === -1) return;

      const key = trimmed.slice(0, sepIndex).trim().toLowerCase();
      const rawVal = stripSurroundingQuotes(trimmed.slice(sepIndex + 1));

      if (key === 'title') {
        title = rawVal;
      } else if (key === 'slug') {
        slug = slugify(rawVal);
      } else if (key === 'cta_label' || key === 'ctalabel' || key === 'button_label') {
        if (!/^(none|null|n\/a|optional.*|-)$/i.test(rawVal)) {
          ctaLabel = rawVal;
        }
      } else if (key === 'cta_url' || key === 'ctaurl' || key === 'button_url' || key === 'url') {
        const lower = rawVal.toLowerCase();
        if (rawVal && !PLACEHOLDER_CTA_URLS.has(lower) && !lower.includes('leave blank')) {
          ctaUrl = rawVal;
        }
      } else if (key === 'public' || key === 'is_public' || key === 'ispublic') {
        isPublic = parseBooleanFlag(rawVal, true);
      }
    });
  }

  // Fallback: extract first top-level `# Title` if frontmatter didn't supply title
  if (!title) {
    const lines = body.split('\n');
    let inCode = false;
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (/^\s*```/.test(line)) {
        inCode = !inCode;
        continue;
      }
      if (inCode) continue;
      const h1Match = line.match(/^\s*#\s+(.+?)\s*$/);
      if (h1Match) {
        title = h1Match[1].replace(/\*\*/g, '').trim();
        lines.splice(i, 1);
        body = lines.join('\n').trim();
        break;
      }
      if (line.trim()) break;
    }
  }

  if (!slug && title) {
    slug = slugify(title);
  }

  return {
    title,
    slug,
    content: body.trim(),
    ctaLabel,
    ctaUrl,
    isPublic,
    hasFrontmatter,
  };
}
