import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Copyright, Sun, Moon } from 'lucide-react';
import { APP_VERSION, getGlassStyle } from '../lib/utils';
import { AmbientBackdrop, LiquidGlassCard } from '../components/LiquidGlass';
import { DMDocLogo } from '../components/DMDocLogo';
import { MabArenaBrand } from '../components/MabArenaBrand';

const PRIVACY_SECTIONS = [
  {
    heading: '1. Information We Store',
    body: 'DM Docs stores only the account email used for admin sign-in (via Supabase Auth) and the document titles, slugs, content, and optional CTA links you explicitly create and save.',
  },
  {
    heading: '2. Public Links & Analytics',
    body: 'Documents marked as Public are accessible via their /d/:slug URL. Aggregate view counts on public docs and click counts on enabled sponsor slots are tracked without building personal visitor profiles.',
  },
  {
    heading: '3. Local Browser Storage',
    body: 'We use localStorage on your device strictly for your Dark/Light theme preference and, only if you choose "Remember ID & password", your saved sign-in email.',
  },
  {
    heading: '4. Third-Party Scripts & Links',
    body: 'If an admin enables an optional external CTA link or native ad script on a document, opening those links or scripts is governed by the respective third-party provider’s privacy policy.',
  },
  {
    heading: '5. Data Control & Removal',
    body: 'Admins can toggle any document to Draft (private) or permanently delete it at any time from the dashboard. Deleted documents are removed from active public access immediately.',
  },
];

const COPYRIGHT_SECTIONS = [
  {
    heading: '1. Ownership & Brand Rights',
    body: '© 2026 MAB ARENA. All rights reserved. The DM Docs name, logo, Liquid Glass user interface, and original application code are the intellectual property of MAB ARENA.',
  },
  {
    heading: '2. User-Published Content',
    body: 'Creators retain ownership of the notes, snippets, and code blocks they publish through DM Docs. By making a document Public, you confirm you have the right to share that content.',
  },
  {
    heading: '3. Acceptable Use',
    body: 'DM Docs may not be used to host or distribute pirated software, malware, phishing pages, illegal material, or content that infringes third-party copyrights or trademarks.',
  },
  {
    heading: '4. Code Snippets & Open-Source Notice',
    body: 'Code snippets shared by authors in public docs remain subject to the license specified by their respective authors. Viewer syntax highlighting is powered by prism-react-renderer.',
  },
  {
    heading: '5. Copyright & Takedown Requests',
    body: 'If you believe any public document hosted on DM Docs infringes your copyright, please contact the site administrator / MAB ARENA with the exact /d/:slug URL for prompt review and removal.',
  },
];

export default function LegalPage({
  type = 'privacy',
  dark,
  onToggleDark,
  fallbackPath = '/login',
}) {
  const navigate = useNavigate();
  const isPrivacy = type === 'privacy';
  const sections = isPrivacy ? PRIVACY_SECTIONS : COPYRIGHT_SECTIONS;

  useEffect(() => {
    document.title = isPrivacy ? 'Privacy Policy — DM Docs' : 'Copyright — DM Docs';
  }, [isPrivacy]);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  return (
    <div
      className={`relative min-h-screen px-4 py-6 sm:py-10 transition-colors duration-500 ${
        dark ? 'bg-[#090D18] text-white' : 'bg-[#EEF3FA] text-[#1D1D1F]'
      }`}
    >
      <AmbientBackdrop dark={dark} />

      <div className="relative z-10 mx-auto w-full max-w-2xl">
        <div className="mb-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-transform duration-150 active:scale-95"
            style={getGlassStyle(dark, 'pill')}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </button>

          {onToggleDark && (
            <button
              type="button"
              onClick={onToggleDark}
              aria-label="Toggle theme"
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-150 active:scale-90 ${
                dark ? 'text-amber-300' : 'text-[#1D1D1F]'
              }`}
              style={getGlassStyle(dark, 'pill')}
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}
        </div>

        <LiquidGlassCard dark={dark} className="anim-view p-5 sm:p-7">
          <div
            className={`flex flex-wrap items-center justify-between gap-3 border-b pb-4 ${
              dark ? 'border-white/10' : 'border-black/[0.06]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <DMDocLogo className="h-9 w-9 shrink-0" />
              <div>
                <h1 className="text-[20px] font-bold tracking-[-0.025em] leading-tight">
                  {isPrivacy ? 'Privacy Policy' : 'Copyright & Terms'}
                </h1>
                <p
                  className={`text-[11.5px] ${
                    dark ? 'text-white/55' : 'text-[#6E6E73]'
                  }`}
                >
                  DM Docs by MAB ARENA &middot; Updated Nov 2026
                </p>
              </div>
            </div>

            <div
              className={`inline-flex rounded-full p-1 ${
                dark ? 'bg-black/30' : 'bg-black/[0.06]'
              }`}
            >
              <Link
                to="/privacy"
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11.5px] font-semibold transition-all ${
                  isPrivacy
                    ? dark
                      ? 'bg-white/20 text-white'
                      : 'bg-white text-[#1D1D1F] shadow-sm'
                    : dark
                      ? 'text-white/60 hover:text-white'
                      : 'text-[#515154] hover:text-[#1D1D1F]'
                }`}
              >
                <ShieldCheck className="h-3 w-3" />
                <span>Privacy</span>
              </Link>
              <Link
                to="/copyright"
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11.5px] font-semibold transition-all ${
                  !isPrivacy
                    ? dark
                      ? 'bg-white/20 text-white'
                      : 'bg-white text-[#1D1D1F] shadow-sm'
                    : dark
                      ? 'text-white/60 hover:text-white'
                      : 'text-[#515154] hover:text-[#1D1D1F]'
                }`}
              >
                <Copyright className="h-3 w-3" />
                <span>Copyright</span>
              </Link>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {sections.map((section) => (
              <section
                key={section.heading}
                className={`rounded-[18px] border p-4 ${
                  dark
                    ? 'bg-white/[0.04] border-white/10'
                    : 'bg-white/55 border-white/85'
                }`}
              >
                <h2 className="text-[14px] font-semibold tracking-[-0.01em]">
                  {section.heading}
                </h2>
                <p
                  className={`mt-1.5 text-[13px] leading-relaxed ${
                    dark ? 'text-white/75' : 'text-[#3A3A3C]'
                  }`}
                >
                  {section.body}
                </p>
              </section>
            ))}
          </div>

          <div
            className={`mt-5 flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-[11.5px] ${
              dark ? 'border-white/10 text-white/50' : 'border-black/[0.06] text-[#6E6E73]'
            }`}
          >
            <span>&copy; 2026 MAB ARENA. All rights reserved.</span>
            <span className="font-mono tabular-nums">v{APP_VERSION}</span>
          </div>
        </LiquidGlassCard>

        <div className="mt-8 flex justify-center pb-[env(safe-area-inset-bottom)]">
          <MabArenaBrand dark={dark} size="sm" />
        </div>
      </div>
    </div>
  );
}
