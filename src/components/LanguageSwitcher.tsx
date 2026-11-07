import { useState, useRef, useEffect, useCallback } from 'react';
import { Globe, Check, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import { useI18n, Language } from '@/i18n';

interface LanguageSwitcherProps {
  variant?: 'desktop' | 'mobile';
  className?: string;
  onSelect?: () => void;
}

export default function LanguageSwitcher({
  variant = 'desktop',
  className = '',
  onSelect,
}: LanguageSwitcherProps) {
  const {
    language,
    setLanguage,
    t,
    loadGoogleTranslate,
    googleTranslateStatus,
    googleTranslateError,
  } = useI18n();

  const [isOpen, setIsOpen] = useState(false);
  const [showGooglePicker, setShowGooglePicker] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle keyboard events (Escape to close and return focus)
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  }, []);

  const handleSelectLang = async (lang: Language) => {
    await setLanguage(lang);
    setIsOpen(false);
    triggerRef.current?.focus();
    onSelect?.();
  };

  const handleOpenMoreLanguages = async () => {
    setShowGooglePicker(true);
    await loadGoogleTranslate();
  };

  return (
    <div className={`relative inline-block ${className}`} onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={t('lang.switcher_label')}
        className={`flex items-center gap-1.5 rounded-xl border font-semibold transition-all text-xs sm:text-sm focus-visible:ring-2 focus-visible:ring-gold-400 ${
          variant === 'mobile'
            ? 'w-full justify-between py-2.5 px-3.5 bg-navy-800/80 hover:bg-navy-700/80 border-navy-700/70 text-navy-100'
            : 'px-2.5 py-1.5 sm:px-3 sm:py-2 bg-navy-800/70 hover:bg-navy-700/80 border-navy-600/50 hover:border-gold-500/40 text-navy-100 hover:text-gold-300'
        }`}
      >
        <span className="flex items-center gap-1.5">
          <Globe size={variant === 'mobile' ? 16 : 15} className="text-gold-400 shrink-0" />
          <span className="uppercase font-bold tracking-wider">{language === 'ar' ? 'العربية' : 'EN'}</span>
        </span>
        <ChevronDown
          size={14}
          className={`text-navy-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-gold-400' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          role="menu"
          aria-orientation="vertical"
          aria-label={t('lang.switcher_label')}
          className={`absolute z-50 mt-2 min-w-[210px] bg-navy-900 border border-navy-700/80 rounded-2xl shadow-2xl p-2 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
            variant === 'mobile' ? 'start-0 end-0' : 'start-0 xl:start-auto xl:end-0'
          }`}
        >
          {/* Curated Languages */}
          <div className="space-y-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => handleSelectLang('ar')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                language === 'ar'
                  ? 'bg-gold-500/15 text-gold-300 font-bold'
                  : 'text-navy-100 hover:bg-navy-800/70 hover:text-gold-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>العربية</span>
                <span className="text-[11px] text-navy-400 font-normal">(Arabic)</span>
              </span>
              {language === 'ar' && <Check size={14} className="text-gold-400 shrink-0" />}
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => handleSelectLang('en')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                language === 'en'
                  ? 'bg-gold-500/15 text-gold-300 font-bold'
                  : 'text-navy-100 hover:bg-navy-800/70 hover:text-gold-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>English</span>
                <span className="text-[11px] text-navy-400 font-normal">(الإنجليزية)</span>
              </span>
              {language === 'en' && <Check size={14} className="text-gold-400 shrink-0" />}
            </button>
          </div>

          <div className="border-t border-navy-800 my-1.5" />

          {/* More Languages (Google Website Translator trigger) */}
          <div className="pt-0.5">
            {!showGooglePicker ? (
              <button
                type="button"
                role="menuitem"
                onClick={handleOpenMoreLanguages}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-navy-300 hover:text-gold-300 hover:bg-navy-800/70 transition-colors group text-start"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={13} className="text-gold-400 group-hover:rotate-12 transition-transform shrink-0" />
                  <div className="text-start">
                    <div className="font-semibold">{t('lang.more')}</div>
                    <div className="text-[10px] text-navy-400">{t('lang.more_desc')}</div>
                  </div>
                </div>
              </button>
            ) : (
              <div className="p-2 bg-navy-950/60 rounded-xl border border-navy-800">
                <div className="flex items-center justify-between mb-1.5 text-[11px] text-gold-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Sparkles size={11} />
                    <span>{t('lang.more')}</span>
                  </span>
                  {googleTranslateStatus === 'loading' && (
                    <Loader2 size={12} className="animate-spin text-gold-400" />
                  )}
                </div>

                {/* Google Translate element target container */}
                <div id="google_translate_element" className="min-h-[28px] overflow-hidden rounded-lg" />

                {/* Machine translation note */}
                <p className="text-[10px] text-navy-400 mt-1.5 pt-1.5 border-t border-navy-800/80 flex items-center gap-1.5 notranslate" translate="no">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold-400 shrink-0" />
                  <span>{t('lang.google_disclaimer')}</span>
                </p>

                {googleTranslateError && (
                  <p className="text-[11px] text-red-400 mt-1">
                    {googleTranslateError}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
