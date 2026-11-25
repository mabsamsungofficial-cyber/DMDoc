import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Copy, Check, ExternalLink, ChevronRight, Eye, Lock, Sun, Moon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { copyTextSafe, formatRelativeDate, getGlassStyle } from '../lib/utils';
import {
  AmbientBackdrop,
  DocContentRenderer,
  LegalLinks,
  LiquidGlassAdSlot,
} from '../components/LiquidGlass';
import { MabArenaBrand } from '../components/MabArenaBrand';

export default function PublicDocPage({ dark, onToggleDark }) {
  const { slug } = useParams();
  const [doc, setDoc] = useState(null);
  const [adSettings, setAdSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase || !slug) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const [{ data: docData }, { data: settingsData }] = await Promise.all([
        supabase
          .from('docs')
          .select('id, slug, title, content, cta_label, cta_url, is_public, show_ad, views, updated_at')
          .eq('slug', slug)
          .eq('is_public', true)
          .maybeSingle(),
        supabase
          .from('app_settings')
          .select('ad_enabled, ad_mode, ad_badge, ad_title, ad_description, ad_cta_label, ad_cta_url, ad_network_name, ad_script_code')
          .eq('id', 'global')
          .maybeSingle(),
      ]);

      if (!active) return;
      setDoc(docData || null);
      setAdSettings(settingsData || null);
      setLoading(false);

      if (docData) {
        document.title = docData.title;
        supabase.rpc('increment_doc_views', { target_slug: slug }).then(() => {});
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [slug]);

  const handleCopy = () => {
    if (!doc) return;
    copyTextSafe(doc.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleAdClick = () => {
    if (supabase) {
      supabase.rpc('increment_ad_clicks').then(() => {});
    }
  };

  return (
    <div
      className={`relative min-h-screen px-4 py-6 sm:py-10 transition-colors duration-500 ${
        dark ? 'bg-[#090D18] text-white' : 'bg-[#EEF3FA] text-[#1D1D1F]'
      }`}
    >
      <AmbientBackdrop dark={dark} />

      <div className="relative z-10 mx-auto w-full max-w-md sm:max-w-xl md:max-w-2xl">
        <div className="mb-3 flex justify-end">
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
        </div>

        <div
          className="anim-view overflow-hidden rounded-[34px]"
          style={getGlassStyle(dark, 'card')}
        >
          {loading ? (
            <div className="space-y-4 p-6 animate-pulse">
              <div className={`h-6 w-2/3 rounded-full ${dark ? 'bg-white/10' : 'bg-black/10'}`} />
              <div className={`h-28 w-full rounded-[20px] ${dark ? 'bg-white/10' : 'bg-black/5'}`} />
              <div className={`h-11 w-full rounded-full ${dark ? 'bg-white/10' : 'bg-black/10'}`} />
            </div>
          ) : !doc ? (
            <div className="p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#FF9500]/18 text-[#FF9500]">
                <Lock className="h-5 w-5" />
              </div>
              <h1 className="mt-3.5 text-[17px] font-semibold tracking-[-0.02em]">
                Unavailable
              </h1>
            </div>
          ) : (
            <div className="space-y-4 p-5 sm:p-6">
              <div>
                <div
                  className={`mb-2 flex items-center justify-between gap-2 text-[11px] tabular-nums ${
                    dark ? 'text-white/55' : 'text-[#6E6E73]'
                  }`}
                >
                  <span>{formatRelativeDate(doc.updated_at)}</span>
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {doc.views + 1}
                  </span>
                </div>
                <h1 className="break-words [overflow-wrap:anywhere] text-[22px] font-bold tracking-[-0.025em] leading-snug">
                  {doc.title}
                </h1>
              </div>

              <div
                className={`min-w-0 overflow-hidden rounded-[22px] p-4 ${
                  dark
                    ? 'bg-black/25 border border-white/10'
                    : 'bg-white/55 border border-white/80'
                }`}
              >
                <DocContentRenderer content={doc.content} dark={dark} />
              </div>

              {doc.show_ad !== false && adSettings?.ad_enabled && (
                <LiquidGlassAdSlot
                  settings={adSettings}
                  dark={dark}
                  onAdClick={handleAdClick}
                />
              )}

              <div className="space-y-2.5 pt-0.5">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-[14px] font-semibold text-white transition-all duration-200 active:scale-[0.97]"
                  style={{
                    background: copied
                      ? 'linear-gradient(145deg, #34C759 0%, #248A3D 100%)'
                      : dark
                        ? 'linear-gradient(145deg, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.12) 100%)'
                        : 'linear-gradient(145deg, #2C2C2E 0%, #1C1C1E 100%)',
                    boxShadow:
                      'inset 0 1px 0.5px rgba(255,255,255,0.35), 0 8px 20px rgba(0,0,0,0.18)',
                  }}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 stroke-[2.4]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                {doc.cta_label && doc.cta_url && (
                  <a
                    href={doc.cta_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex w-full items-center justify-between rounded-full px-4 py-3 text-[14px] font-medium transition-transform duration-150 active:scale-[0.97] ${
                      dark
                        ? 'bg-[#0A84FF]/22 text-[#64D2FF] border border-[#64D2FF]/30 hover:bg-[#0A84FF]/30'
                        : 'bg-[#007AFF]/12 text-[#007AFF] border border-[#007AFF]/20 hover:bg-[#007AFF]/18'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <ExternalLink className="h-4 w-4 shrink-0" />
                      <span className="truncate">{doc.cta_label}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 opacity-75" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col items-center gap-2.5 pb-[env(safe-area-inset-bottom)]">
          <MabArenaBrand dark={dark} size="sm" />
          <LegalLinks dark={dark} />
        </div>
      </div>
    </div>
  );
}
