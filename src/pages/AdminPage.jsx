import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Copy,
  Check,
  Eye,
  Pencil,
  Trash2,
  Search,
  ExternalLink,
  Link2,
  Lock,
  Globe,
  Sparkles,
  Smartphone,
  LayoutDashboard,
  RefreshCw,
  X,
  ChevronRight,
  Sun,
  Moon,
  Megaphone,
  LogOut,
  Loader2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  APPLE_SPRING,
  copyTextSafe,
  formatRelativeDate,
  generateRandomSlug,
  getGlassStyle,
  getShareUrl,
  slugify,
} from '../lib/utils';
import {
  AmbientBackdrop,
  AppleSpringSwitch,
  DocContentRenderer,
  LiquidGlassAdSlot,
  LiquidGlassCard,
  LiquidGlassConfirmModal,
  LiquidGlassSheet,
} from '../components/LiquidGlass';
import { DMDocLogo } from '../components/DMDocLogo';
import { MabArenaBrand } from '../components/MabArenaBrand';
import {
  IosInstallModal,
  PwaInstallButton,
  usePwaInstall,
} from '../components/PwaControls';

const DEFAULT_SETTINGS = {
  id: 'global',
  ad_enabled: true,
  ad_mode: 'sponsor',
  ad_badge: 'Recommended',
  ad_title: '',
  ad_description: '',
  ad_cta_label: 'Open',
  ad_cta_url: '',
  ad_network_name: 'Adsterra Native',
  ad_script_code: '',
  ad_clicks: 0,
};

export default function AdminPage({ user, dark, onToggleDark }) {
  const [docs, setDocs] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState('admin');
  const [editingDocId, setEditingDocId] = useState(null);
  const [adSheetOpen, setAdSheetOpen] = useState(false);
  const [previewDocId, setPreviewDocId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [copiedBody, setCopiedBody] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const { canInstall, promptInstall, iosHintOpen, closeIosHint } = usePwaInstall();

  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCtaLabel, setFormCtaLabel] = useState('');
  const [formCtaUrl, setFormCtaUrl] = useState('');
  const [formIsPublic, setFormIsPublic] = useState(true);
  const [formShowAd, setFormShowAd] = useState(true);
  const [formError, setFormError] = useState('');

  const showToast = (msg) => setToast(msg);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchAll = async () => {
    if (!supabase || !user) return;
    setLoading(true);
    const [{ data: docsData }, { data: settingsData }] = await Promise.all([
      supabase
        .from('docs')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false }),
      supabase.from('app_settings').select('*').eq('id', 'global').maybeSingle(),
    ]);
    const list = docsData || [];
    setDocs(list);
    if (list.length > 0 && !previewDocId) setPreviewDocId(list[0].id);
    if (settingsData) setSettings({ ...DEFAULT_SETTINGS, ...settingsData });
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, [user?.id]);

  const filteredDocs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.slug.toLowerCase().includes(q) ||
        d.content.toLowerCase().includes(q)
    );
  }, [docs, searchQuery]);

  const previewDoc = useMemo(
    () => docs.find((d) => d.id === previewDocId) || docs[0] || null,
    [docs, previewDocId]
  );

  const totalViews = useMemo(
    () => docs.reduce((sum, d) => sum + (Number(d.views) || 0), 0),
    [docs]
  );

  const openNewEditor = () => {
    setEditingDocId('new');
    setFormTitle('');
    setFormSlug(generateRandomSlug());
    setFormContent('');
    setFormCtaLabel('');
    setFormCtaUrl('');
    setFormIsPublic(true);
    setFormShowAd(true);
    setFormError('');
  };

  const openEditEditor = (doc) => {
    setEditingDocId(doc.id);
    setFormTitle(doc.title);
    setFormSlug(doc.slug);
    setFormContent(doc.content);
    setFormCtaLabel(doc.cta_label || '');
    setFormCtaUrl(doc.cta_url || '');
    setFormIsPublic(doc.is_public);
    setFormShowAd(doc.show_ad !== false);
    setFormError('');
  };

  const handleTitleChange = (val) => {
    setFormTitle(val);
    if (editingDocId === 'new') {
      const next = slugify(val);
      if (next) setFormSlug(next);
    }
  };

  const handleSaveDoc = async (copyAfterSave = false) => {
    const cleanTitle = formTitle.trim();
    const cleanSlug = slugify(formSlug) || generateRandomSlug();
    const cleanContent = formContent.trim();

    if (!cleanTitle || !cleanContent) {
      setFormError('Title and content required');
      return;
    }

    setSaving(true);
    setFormError('');

    const payload = {
      user_id: user.id,
      slug: cleanSlug,
      title: cleanTitle,
      content: cleanContent,
      cta_label: formCtaLabel.trim(),
      cta_url: formCtaUrl.trim(),
      is_public: formIsPublic,
      show_ad: formShowAd,
    };

    let result;
    if (editingDocId === 'new') {
      result = await supabase.from('docs').insert(payload).select().single();
    } else {
      result = await supabase
        .from('docs')
        .update(payload)
        .eq('id', editingDocId)
        .eq('user_id', user.id)
        .select()
        .single();
    }

    setSaving(false);

    if (result.error) {
      setFormError(
        result.error.code === '23505' ? 'Slug already in use' : result.error.message
      );
      return;
    }

    const saved = result.data;
    setDocs((prev) =>
      editingDocId === 'new'
        ? [saved, ...prev]
        : prev.map((d) => (d.id === saved.id ? saved : d))
    );
    setPreviewDocId(saved.id);
    setEditingDocId(null);

    if (copyAfterSave) {
      copyTextSafe(getShareUrl(saved.slug));
      setCopiedId(saved.id);
      setTimeout(() => setCopiedId(null), 1800);
      showToast('Saved & Copied');
    } else {
      showToast('Saved');
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    const payload = {
      id: 'global',
      user_id: user.id,
      ad_enabled: settings.ad_enabled,
      ad_mode: settings.ad_mode,
      ad_badge: settings.ad_badge || '',
      ad_title: settings.ad_title || '',
      ad_description: settings.ad_description || '',
      ad_cta_label: settings.ad_cta_label || '',
      ad_cta_url: settings.ad_cta_url || '',
      ad_network_name: settings.ad_network_name || '',
      ad_script_code: settings.ad_script_code || '',
    };
    const { data, error } = await supabase
      .from('app_settings')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();
    setSaving(false);
    if (error) {
      showToast(error.message);
      return;
    }
    if (data) setSettings(data);
    setAdSheetOpen(false);
    showToast('Ad settings saved');
  };

  const handleTogglePublic = async (doc) => {
    const next = !doc.is_public;
    setDocs((prev) => prev.map((d) => (d.id === doc.id ? { ...d, is_public: next } : d)));
    const { error } = await supabase
      .from('docs')
      .update({ is_public: next })
      .eq('id', doc.id)
      .eq('user_id', user.id);
    if (error) fetchAll();
  };

  const handleToggleDocAd = async (doc) => {
    const next = !(doc.show_ad !== false);
    setDocs((prev) => prev.map((d) => (d.id === doc.id ? { ...d, show_ad: next } : d)));
    const { error } = await supabase
      .from('docs')
      .update({ show_ad: next })
      .eq('id', doc.id)
      .eq('user_id', user.id);
    if (error) fetchAll();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    setDeleteTarget(null);
    setDocs((prev) => prev.filter((d) => d.id !== targetId));
    await supabase.from('docs').delete().eq('id', targetId).eq('user_id', user.id);
    showToast('Deleted');
  };

  const handleCopyLink = (doc) => {
    copyTextSafe(getShareUrl(doc.slug));
    setCopiedId(doc.id);
    showToast('Link copied');
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleCopyBody = (doc) => {
    copyTextSafe(doc.content);
    setCopiedBody(true);
    showToast('Copied');
    setTimeout(() => setCopiedBody(false), 1800);
  };

  const inputClass = dark
    ? 'w-full rounded-[14px] bg-white/[0.08] px-3.5 py-2.5 text-[14px] text-white placeholder:text-white/40 border border-white/10 focus:bg-white/[0.12] focus:border-[#64D2FF]/60 focus:outline-none'
    : 'w-full rounded-[14px] bg-white/60 px-3.5 py-2.5 text-[14px] text-[#1D1D1F] placeholder:text-[#6E6E73] border border-white/80 focus:bg-white/85 focus:border-[#007AFF]/50 focus:outline-none';

  return (
    <div
      className={`relative min-h-screen overflow-x-hidden transition-colors duration-500 ${
        dark ? 'bg-[#090D18] text-white' : 'bg-[#EEF3FA] text-[#1D1D1F]'
      }`}
    >
      <AmbientBackdrop dark={dark} />

      {/* Floating Liquid Glass Nav */}
      <header className="sticky top-0 z-30 px-4 pt-3.5 pb-1">
        <div
          className="mx-auto flex max-w-3xl items-center justify-between gap-2 rounded-full px-3 py-2"
          style={getGlassStyle(dark, 'pill')}
        >
          <div className="flex items-center gap-2 pl-1">
            <DMDocLogo className="h-8 w-8 shrink-0" />
            <span className="hidden text-[15px] font-semibold tracking-[-0.02em] sm:inline">
              DM Docs
            </span>
          </div>

          <div
            className={`relative grid w-[192px] grid-cols-2 rounded-full p-[3px] ${
              dark ? 'bg-black/30' : 'bg-black/[0.06]'
            }`}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-[3px] bottom-[3px] left-[3px] w-[calc(50%-3px)] rounded-full"
              style={{
                transform:
                  activeTab === 'preview'
                    ? 'translate3d(100%, 0, 0)'
                    : 'translate3d(0%, 0, 0)',
                transition: `transform 320ms ${APPLE_SPRING}`,
                background: dark
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.12) 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.72) 100%)',
                boxShadow: dark
                  ? 'inset 0 1px 0.5px rgba(255,255,255,0.45), 0 2px 8px rgba(0,0,0,0.35)'
                  : 'inset 0 1px 0.5px rgba(255,255,255,1), 0 2px 8px rgba(15,23,42,0.1)',
              }}
            />
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`relative z-10 flex items-center justify-center gap-1.5 rounded-full py-1.5 text-[12px] font-medium transition-colors ${
                activeTab === 'admin'
                  ? dark
                    ? 'text-white'
                    : 'text-[#1D1D1F]'
                  : dark
                    ? 'text-white/60'
                    : 'text-[#515154]'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Docs</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`relative z-10 flex items-center justify-center gap-1.5 rounded-full py-1.5 text-[12px] font-medium transition-colors ${
                activeTab === 'preview'
                  ? dark
                    ? 'text-white'
                    : 'text-[#1D1D1F]'
                  : dark
                    ? 'text-white/60'
                    : 'text-[#515154]'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Preview</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {canInstall && (
              <PwaInstallButton dark={dark} onClick={promptInstall} />
            )}
            <button
              type="button"
              onClick={onToggleDark}
              aria-label="Toggle theme"
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-150 active:scale-90 ${
                dark
                  ? 'bg-white/12 text-amber-300 hover:bg-white/20'
                  : 'bg-white/70 text-[#1D1D1F] hover:bg-white'
              }`}
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setLogoutConfirmOpen(true)}
              aria-label="Sign out"
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-150 active:scale-90 ${
                dark
                  ? 'bg-white/12 text-white/75 hover:bg-white/20'
                  : 'bg-white/70 text-[#515154] hover:bg-white'
              }`}
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-4 py-6 pb-24">
        {activeTab === 'admin' && (
          <div key="admin" className="anim-view space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-[28px] font-bold tracking-[-0.03em] leading-tight">
                  Docs
                </h1>
                <p
                  className={`mt-0.5 text-[13px] tabular-nums ${
                    dark ? 'text-white/60' : 'text-[#515154]'
                  }`}
                >
                  {docs.length} &middot; {totalViews} opens &middot; {settings.ad_clicks || 0} clicks
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAdSheetOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-[12px] font-semibold transition-transform duration-150 active:scale-[0.95]"
                  style={getGlassStyle(dark, 'pill')}
                >
                  <Megaphone className="h-3.5 w-3.5 text-[#5856D6]" />
                  <span>Ad Slot</span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      settings.ad_enabled ? 'bg-[#34C759]' : 'bg-neutral-400'
                    }`}
                  />
                </button>
                <button
                  type="button"
                  onClick={openNewEditor}
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold text-white transition-transform duration-150 active:scale-[0.95]"
                  style={{
                    background:
                      'linear-gradient(145deg, rgba(56,189,248,0.95) 0%, rgba(0,122,255,0.95) 100%)',
                    boxShadow:
                      'inset 0 1.5px 1px rgba(255,255,255,0.55), 0 8px 22px rgba(0,122,255,0.34)',
                  }}
                >
                  <Plus className="h-4 w-4 stroke-[2.3]" />
                  <span>New</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <Search
                className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${
                  dark ? 'text-white/45' : 'text-[#6E6E73]'
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className={`w-full rounded-full py-2.5 pl-11 pr-4 text-[14px] focus:outline-none ${
                  dark
                    ? 'text-white placeholder:text-white/45'
                    : 'text-[#1D1D1F] placeholder:text-[#6E6E73]'
                }`}
                style={getGlassStyle(dark, 'pill')}
              />
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((n) => (
                  <div
                    key={n}
                    className="h-36 rounded-[26px] animate-pulse"
                    style={getGlassStyle(dark, 'card')}
                  />
                ))}
              </div>
            ) : filteredDocs.length === 0 ? (
              <LiquidGlassCard dark={dark} className="p-10 text-center">
                <button
                  type="button"
                  onClick={openNewEditor}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#007AFF] px-4 py-2 text-[13px] font-semibold text-white transition-transform active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Doc</span>
                </button>
              </LiquidGlassCard>
            ) : (
              <div className="space-y-3.5">
                {filteredDocs.map((doc) => {
                  const isCopied = copiedId === doc.id;
                  const adActive = settings.ad_enabled && doc.show_ad !== false;
                  return (
                    <LiquidGlassCard key={doc.id} dark={dark} className="p-4 sm:p-5">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h2 className="min-w-0 max-w-full truncate text-[16px] font-semibold tracking-[-0.015em]">
                          {doc.title}
                        </h2>
                        <button
                          type="button"
                          onClick={() => handleTogglePublic(doc)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-transform duration-150 active:scale-95 ${
                            doc.is_public
                              ? dark
                                ? 'bg-[#30D158]/20 text-[#5EE881] border border-[#30D158]/30'
                                : 'bg-[#34C759]/15 text-[#177E35] border border-[#34C759]/25'
                              : dark
                                ? 'bg-[#FF9F0A]/20 text-[#FFD60A] border border-[#FF9F0A]/30'
                                : 'bg-[#FF9500]/15 text-[#B86200] border border-[#FF9500]/25'
                          }`}
                        >
                          {doc.is_public ? (
                            <Globe className="h-3 w-3" />
                          ) : (
                            <Lock className="h-3 w-3" />
                          )}
                          {doc.is_public ? 'Public' : 'Draft'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleDocAd(doc)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-transform duration-150 active:scale-95 ${
                            adActive
                              ? dark
                                ? 'bg-[#A855F7]/20 text-[#D8B4FE] border border-[#A855F7]/30'
                                : 'bg-[#5856D6]/12 text-[#5856D6] border border-[#5856D6]/20'
                              : dark
                                ? 'bg-white/8 text-white/45 border border-white/10'
                                : 'bg-black/[0.05] text-[#86868B] border border-black/[0.06]'
                          }`}
                        >
                          <Megaphone className="h-2.5 w-2.5" />
                          {adActive ? 'Ad On' : 'Ad Off'}
                        </button>
                      </div>

                      <div
                        className={`mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] tabular-nums ${
                          dark ? 'text-white/60' : 'text-[#6E6E73]'
                        }`}
                      >
                        <span
                          className={`inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[11px] ${
                            dark
                              ? 'bg-white/10 text-white/85 border border-white/12'
                              : 'bg-white/65 text-[#3A3A3C] border border-white/80'
                          }`}
                        >
                          <Link2 className="h-3 w-3 shrink-0 opacity-60" />
                          <span className="truncate">/d/{doc.slug}</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5 opacity-60" />
                          {doc.views}
                        </span>
                        <span>{formatRelativeDate(doc.updated_at)}</span>
                      </div>

                      <p
                        className={`mt-3 line-clamp-2 break-words [overflow-wrap:anywhere] text-[13px] leading-relaxed ${
                          dark ? 'text-white/75' : 'text-[#3A3A3C]'
                        }`}
                      >
                        {doc.content}
                      </p>

                      <div
                        className={`mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3.5 ${
                          dark ? 'border-white/10' : 'border-black/[0.06]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleCopyLink(doc)}
                          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold text-white transition-all duration-200 active:scale-[0.95]"
                          style={{
                            background: isCopied
                              ? 'linear-gradient(145deg, #34C759 0%, #248A3D 100%)'
                              : dark
                                ? 'linear-gradient(145deg, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.12) 100%)'
                                : 'linear-gradient(145deg, #2C2C2E 0%, #1C1C1E 100%)',
                            boxShadow:
                              'inset 0 1px 0.5px rgba(255,255,255,0.32), 0 6px 16px rgba(0,0,0,0.16)',
                          }}
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3.5 w-3.5 stroke-[2.4]" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewDocId(doc.id);
                              setActiveTab('preview');
                            }}
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium transition-transform duration-150 active:scale-95 ${
                              dark
                                ? 'bg-white/10 text-white hover:bg-white/18 border border-white/15'
                                : 'bg-white/65 text-[#1D1D1F] hover:bg-white/90 border border-white/85'
                            }`}
                          >
                            <Eye className="h-3.5 w-3.5 opacity-75" />
                            <span>Preview</span>
                          </button>
                          <a
                            href={`/d/${doc.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Open live link"
                            className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-150 active:scale-90 ${
                              dark
                                ? 'bg-white/10 text-white/85 hover:bg-white/18 border border-white/15'
                                : 'bg-white/65 text-[#3A3A3C] hover:bg-white/90 border border-white/85'
                            }`}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => openEditEditor(doc)}
                            aria-label="Edit"
                            className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-150 active:scale-90 ${
                              dark
                                ? 'bg-white/10 text-white/85 hover:bg-white/18 border border-white/15'
                                : 'bg-white/65 text-[#3A3A3C] hover:bg-white/90 border border-white/85'
                            }`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(doc)}
                            aria-label="Delete"
                            className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-150 active:scale-90 ${
                              dark
                                ? 'bg-white/10 text-white/70 hover:bg-[#FF453A]/20 hover:text-[#FF6961] border border-white/15'
                                : 'bg-white/65 text-[#6E6E73] hover:bg-[#FF3B30]/12 hover:text-[#FF3B30] border border-white/85'
                            }`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </LiquidGlassCard>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'preview' && (
          <div key="preview" className="anim-view space-y-5">
            <div
              className="flex flex-wrap items-center justify-between gap-2 rounded-full px-4 py-2.5"
              style={getGlassStyle(dark, 'pill')}
            >
              <button
                type="button"
                onClick={() => setAdSheetOpen(true)}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-transform active:scale-95 ${
                  dark ? 'bg-white/12 text-white' : 'bg-white/75 text-[#1D1D1F]'
                }`}
              >
                <Megaphone className="h-3 w-3 text-[#5856D6]" />
                <span>{settings.ad_enabled ? 'Ad On' : 'Ad Off'}</span>
              </button>
              <select
                value={previewDoc?.id || ''}
                onChange={(e) => setPreviewDocId(e.target.value)}
                className={`min-w-0 flex-1 sm:flex-initial sm:max-w-[260px] truncate rounded-full px-3 py-1 text-[12px] font-medium focus:outline-none ${
                  dark
                    ? 'bg-white/12 text-white border border-white/15'
                    : 'bg-white/75 text-[#1D1D1F] border border-white'
                }`}
              >
                {docs.map((d) => (
                  <option
                    key={d.id}
                    value={d.id}
                    className={dark ? 'bg-[#121829] text-white' : 'bg-white text-[#1D1D1F]'}
                  >
                    {d.title}
                  </option>
                ))}
              </select>
            </div>

            {previewDoc && (
              <div className="mx-auto w-full max-w-md sm:max-w-xl md:max-w-2xl">
                <div
                  className="overflow-hidden rounded-[34px]"
                  style={getGlassStyle(dark, 'card')}
                >
                  <div
                    className={`flex items-center justify-between gap-2 border-b px-4 py-3 ${
                      dark ? 'border-white/10' : 'border-white/60'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveTab('admin')}
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform active:scale-90 ${
                        dark ? 'bg-white/12 text-white/80' : 'bg-white/75 text-[#3A3A3C]'
                      }`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <div
                      className={`flex min-w-0 max-w-full items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] ${
                        dark
                          ? 'bg-white/10 text-white/85 border border-white/15'
                          : 'bg-white/75 text-[#3A3A3C] border border-white/90'
                      }`}
                    >
                      <Lock className="h-2.5 w-2.5 shrink-0 text-[#34C759]" />
                      <span className="truncate">/d/{previewDoc.slug}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(previewDoc)}
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform active:scale-90 ${
                        dark ? 'bg-white/12 text-white/80' : 'bg-white/75 text-[#3A3A3C]'
                      }`}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {!previewDoc.is_public ? (
                    <div className="p-9 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#FF9500]/18 text-[#FF9500]">
                        <Lock className="h-5 w-5" />
                      </div>
                      <h2 className="mt-3.5 text-[17px] font-semibold">Draft</h2>
                      <button
                        type="button"
                        onClick={() => handleTogglePublic(previewDoc)}
                        className="mt-4 rounded-full bg-[#007AFF] px-5 py-2 text-[13px] font-semibold text-white transition-transform active:scale-95"
                      >
                        Publish
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 p-5 sm:p-6">
                      <div>
                        <div
                          className={`mb-2 flex items-center justify-between gap-2 text-[11px] tabular-nums ${
                            dark ? 'text-white/55' : 'text-[#6E6E73]'
                          }`}
                        >
                          <span>{formatRelativeDate(previewDoc.updated_at)}</span>
                          <span className="inline-flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {previewDoc.views}
                          </span>
                        </div>
                        <h2 className="break-words [overflow-wrap:anywhere] text-[21px] sm:text-[22px] font-bold tracking-[-0.025em] leading-snug">
                          {previewDoc.title}
                        </h2>
                      </div>

                      <div
                        className={`min-w-0 overflow-hidden rounded-[22px] p-4 ${
                          dark
                            ? 'bg-black/25 border border-white/10'
                            : 'bg-white/55 border border-white/80'
                        }`}
                      >
                        <DocContentRenderer content={previewDoc.content} dark={dark} />
                      </div>

                      {previewDoc.show_ad !== false && settings.ad_enabled && (
                        <LiquidGlassAdSlot settings={settings} dark={dark} isPreview />
                      )}

                      <div className="space-y-2.5 pt-0.5">
                        <button
                          type="button"
                          onClick={() => handleCopyBody(previewDoc)}
                          className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-[14px] font-semibold text-white transition-all duration-200 active:scale-[0.97]"
                          style={{
                            background: copiedBody
                              ? 'linear-gradient(145deg, #34C759 0%, #248A3D 100%)'
                              : dark
                                ? 'linear-gradient(145deg, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.12) 100%)'
                                : 'linear-gradient(145deg, #2C2C2E 0%, #1C1C1E 100%)',
                          }}
                        >
                          {copiedBody ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          <span>{copiedBody ? 'Copied' : 'Copy'}</span>
                        </button>

                        {previewDoc.cta_label && previewDoc.cta_url && (
                          <a
                            href={previewDoc.cta_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex w-full items-center justify-between rounded-full px-4 py-3 text-[14px] font-medium transition-transform duration-150 active:scale-[0.97] ${
                              dark
                                ? 'bg-[#0A84FF]/22 text-[#64D2FF] border border-[#64D2FF]/30'
                                : 'bg-[#007AFF]/12 text-[#007AFF] border border-[#007AFF]/20'
                            }`}
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <ExternalLink className="h-4 w-4 shrink-0" />
                              <span className="truncate">{previewDoc.cta_label}</span>
                            </span>
                            <ChevronRight className="h-4 w-4 shrink-0 opacity-75" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <footer className="mt-10 flex justify-center">
          <MabArenaBrand dark={dark} size="sm" />
        </footer>
      </main>

      {/* Ad / Sponsor Settings Sheet */}
      <LiquidGlassSheet
        isOpen={adSheetOpen}
        onClose={() => setAdSheetOpen(false)}
        title="Ad Slot"
        dark={dark}
      >
        <div className="space-y-4">
          <div
            className={`flex items-center justify-between rounded-[16px] px-4 py-3 border ${
              dark ? 'bg-white/[0.06] border-white/10' : 'bg-white/55 border-white/80'
            }`}
          >
            <span className="text-[13px] font-medium">Enabled</span>
            <AppleSpringSwitch
              checked={settings.ad_enabled}
              onChange={() =>
                setSettings((p) => ({ ...p, ad_enabled: !p.ad_enabled }))
              }
              dark={dark}
            />
          </div>

          <div
            className={`grid grid-cols-2 gap-1.5 rounded-[14px] p-1 ${
              dark ? 'bg-black/30' : 'bg-black/[0.06]'
            }`}
          >
            <button
              type="button"
              onClick={() => setSettings((p) => ({ ...p, ad_mode: 'sponsor' }))}
              className={`rounded-[11px] py-2 text-[12px] font-semibold transition-all ${
                settings.ad_mode === 'sponsor'
                  ? dark
                    ? 'bg-white/20 text-white'
                    : 'bg-white text-[#1D1D1F] shadow-sm'
                  : dark
                    ? 'text-white/60'
                    : 'text-[#515154]'
              }`}
            >
              Sponsor
            </button>
            <button
              type="button"
              onClick={() => setSettings((p) => ({ ...p, ad_mode: 'native-ad' }))}
              className={`rounded-[11px] py-2 text-[12px] font-semibold transition-all ${
                settings.ad_mode === 'native-ad'
                  ? dark
                    ? 'bg-white/20 text-white'
                    : 'bg-white text-[#1D1D1F] shadow-sm'
                  : dark
                    ? 'text-white/60'
                    : 'text-[#515154]'
              }`}
            >
              Native Ad
            </button>
          </div>

          {settings.ad_mode === 'sponsor' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={settings.ad_badge || ''}
                  onChange={(e) => setSettings((p) => ({ ...p, ad_badge: e.target.value }))}
                  placeholder="Badge"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={settings.ad_cta_label || ''}
                  onChange={(e) =>
                    setSettings((p) => ({ ...p, ad_cta_label: e.target.value }))
                  }
                  placeholder="CTA"
                  className={inputClass}
                />
              </div>
              <input
                type="text"
                value={settings.ad_title || ''}
                onChange={(e) => setSettings((p) => ({ ...p, ad_title: e.target.value }))}
                placeholder="Title"
                className={inputClass}
              />
              <input
                type="text"
                value={settings.ad_description || ''}
                onChange={(e) =>
                  setSettings((p) => ({ ...p, ad_description: e.target.value }))
                }
                placeholder="Description"
                className={inputClass}
              />
              <input
                type="url"
                value={settings.ad_cta_url || ''}
                onChange={(e) => setSettings((p) => ({ ...p, ad_cta_url: e.target.value }))}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={settings.ad_network_name || ''}
                onChange={(e) =>
                  setSettings((p) => ({ ...p, ad_network_name: e.target.value }))
                }
                placeholder="Network (e.g. Adsterra Native)"
                className={inputClass}
              />
              <textarea
                rows={4}
                value={settings.ad_script_code || ''}
                onChange={(e) =>
                  setSettings((p) => ({ ...p, ad_script_code: e.target.value }))
                }
                placeholder="<script>...</script>"
                className={`${inputClass} font-mono text-[12px]`}
              />
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveSettings}
              className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] font-semibold text-white transition-transform active:scale-95 disabled:opacity-60"
              style={{
                background: 'linear-gradient(145deg, #38BDF8 0%, #007AFF 100%)',
                boxShadow:
                  'inset 0 1px 1px rgba(255,255,255,0.45), 0 8px 20px rgba(0,122,255,0.34)',
              }}
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save</span>
            </button>
          </div>
        </div>
      </LiquidGlassSheet>

      {/* Doc Editor Sheet */}
      <LiquidGlassSheet
        isOpen={editingDocId !== null}
        onClose={() => setEditingDocId(null)}
        title={editingDocId === 'new' ? 'New Doc' : 'Edit Doc'}
        dark={dark}
      >
        <div className="space-y-3.5">
          {formError && (
            <div className="rounded-[14px] bg-[#FF3B30]/15 border border-[#FF3B30]/30 px-3.5 py-2 text-[12px] font-medium text-[#FF453A]">
              {formError}
            </div>
          )}

          <input
            type="text"
            value={formTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Title"
            className={inputClass}
          />

          <div className="flex items-center gap-2">
            <div
              className={`flex flex-1 items-center rounded-[14px] px-3 border ${
                dark
                  ? 'bg-white/[0.08] border-white/10 focus-within:border-[#64D2FF]/60'
                  : 'bg-white/60 border-white/80 focus-within:border-[#007AFF]/50'
              }`}
            >
              <span
                className={`select-none font-mono text-[12px] ${
                  dark ? 'text-white/45' : 'text-[#6E6E73]'
                }`}
              >
                /d/
              </span>
              <input
                type="text"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                placeholder="slug"
                className={`w-full bg-transparent py-2.5 pl-0.5 font-mono text-[12px] focus:outline-none ${
                  dark ? 'text-white' : 'text-[#1D1D1F]'
                }`}
              />
            </div>
            <button
              type="button"
              onClick={() => setFormSlug(generateRandomSlug())}
              aria-label="Random slug"
              className={`flex h-10 w-10 items-center justify-center rounded-[14px] transition-transform active:scale-95 ${
                dark
                  ? 'bg-white/12 text-white border border-white/15'
                  : 'bg-white/70 text-[#1D1D1F] border border-white/90'
              }`}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          <textarea
            rows={6}
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            placeholder="Content"
            className={`${inputClass} leading-relaxed`}
          />

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <input
              type="text"
              value={formCtaLabel}
              onChange={(e) => setFormCtaLabel(e.target.value)}
              placeholder="CTA Label"
              className={inputClass}
            />
            <input
              type="url"
              value={formCtaUrl}
              onChange={(e) => setFormCtaUrl(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div
              className={`flex items-center justify-between rounded-[14px] px-3.5 py-2.5 border ${
                dark ? 'bg-white/[0.06] border-white/10' : 'bg-white/55 border-white/80'
              }`}
            >
              <span className="text-[12px] font-medium">Public</span>
              <AppleSpringSwitch
                checked={formIsPublic}
                onChange={() => setFormIsPublic((v) => !v)}
                dark={dark}
              />
            </div>
            <div
              className={`flex items-center justify-between rounded-[14px] px-3.5 py-2.5 border ${
                dark ? 'bg-white/[0.06] border-white/10' : 'bg-white/55 border-white/80'
              }`}
            >
              <span className="text-[12px] font-medium">Ad Slot</span>
              <AppleSpringSwitch
                checked={formShowAd}
                onChange={() => setFormShowAd((v) => !v)}
                dark={dark}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveDoc(false)}
              className={`rounded-full px-4 py-2.5 text-[13px] font-medium transition-transform active:scale-95 ${
                dark
                  ? 'bg-white/12 text-white border border-white/15'
                  : 'bg-white/75 text-[#1D1D1F] border border-white'
              }`}
            >
              Save
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveDoc(true)}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold text-white transition-transform active:scale-95 disabled:opacity-60"
              style={{
                background: 'linear-gradient(145deg, #38BDF8 0%, #007AFF 100%)',
                boxShadow:
                  'inset 0 1px 1px rgba(255,255,255,0.45), 0 8px 20px rgba(0,122,255,0.34)',
              }}
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              <span>Save &amp; Copy</span>
            </button>
          </div>
        </div>
      </LiquidGlassSheet>

      <LiquidGlassConfirmModal
        isOpen={Boolean(deleteTarget)}
        title={deleteTarget ? `Delete "${deleteTarget.title}"?` : ''}
        confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        dark={dark}
      />

      <LiquidGlassConfirmModal
        isOpen={logoutConfirmOpen}
        title="Sign out of DM Docs?"
        description="You'll need to sign in again to manage your docs."
        confirmLabel="Sign Out"
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={() => {
          setLogoutConfirmOpen(false);
          supabase?.auth.signOut();
        }}
        dark={dark}
      />

      {toast && (
        <div
          className="anim-toast fixed bottom-6 left-1/2 z-50 rounded-full px-4 py-2 text-[12px] font-medium"
          style={getGlassStyle(dark, 'pill')}
        >
          {toast}
        </div>
      )}

      <IosInstallModal
        isOpen={iosHintOpen}
        onClose={closeIosHint}
        dark={dark}
      />
    </div>
  );
}
