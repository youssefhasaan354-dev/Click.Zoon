import { useEffect, useState, useRef, useCallback } from 'react';
import { Menu, X, LogIn, UserPlus, ChevronDown, User, Inbox, LogOut } from 'lucide-react';
import { waLinkIntl, useSiteConfig } from '@/siteConfig';
import { trackEvent } from '@/lib/analytics';
import { useSiteData } from '@/lib/site-data-context';
import { useCustomer } from '@/lib/customer-context';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const allNavLinks = [
  { href: '/#home', id: 'home', label: 'الرئيسية', section: 'hero' },
  { href: '/#demo', id: 'demo', label: 'الديمو المجاني', section: 'demo' },
  { href: '/#services', id: 'services', label: 'الخدمات', section: 'services' },
  { href: '/#pricing', id: 'pricing', label: 'الباقات', section: 'pricing' },
  { href: '/#portfolio', id: 'portfolio', label: 'معرض الأعمال', section: 'portfolio' },
  { href: '/#process', id: 'process', label: 'خطوات العمل', section: 'process' },
  { href: '/#faq', id: 'faq', label: 'الأسئلة الشائعة', section: 'faq' },
  { href: '/#contact', id: 'contact', label: 'تواصل معنا', section: 'contact' },
];

export default function Header() {
  const cfg = useSiteConfig();
  const { data } = useSiteData();
  const { user, profile, signOut } = useCustomer();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const userMenuRef = useRef<HTMLDivElement>(null);
  const burgerBtnRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Scroll detection for sticky header styles
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll-spy: Highlight active link based on scroll position
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('');
      return;
    }

    const sectionIds = allNavLinks.map((l) => l.id);
    const handleScrollSpy = () => {
      const scrollPos = window.scrollY + 120;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(id);
          return;
        }
      }
      setActiveSection('home');
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    handleScrollSpy();
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, [location.pathname]);

  // Close menus on outside click
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (menuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node) && !burgerBtnRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [menuOpen]);

  // Body scroll locking and Escape key for mobile drawer
  useEffect(() => {
    if (!menuOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        burgerBtnRef.current?.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const sectionVisible = useCallback((id: string) => {
    if (id === 'hero') return true;
    const s = data.sectionVisibility.find((sv) => sv.id === id);
    return s ? s.visible : true;
  }, [data.sectionVisibility]);

  const navLinks = allNavLinks.filter((l) => sectionVisible(l.section));

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    setMenuOpen(false);
    navigate('/');
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'حسابي';

  return (
    <>
      {/* Skip to main content link for keyboard accessibility */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-4 focus:z-[100] focus:px-5 focus:py-2.5 focus:bg-gold-500 focus:text-navy-950 focus:font-bold focus:rounded-xl focus:shadow-2xl focus:outline-none"
      >
        تخطي إلى المحتوى الرئيسي
      </a>

      {/* Promo banner */}
      <div className="bg-gold-500 text-navy-900 text-center py-2 text-xs sm:text-sm font-semibold px-4 relative z-40 transition-colors">
        <span>{cfg.promoBarText} </span>
        <a
          href={waLinkIntl(cfg.phoneIntl, cfg.whatsappMessages.demo)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent({ category: 'whatsapp', action: 'click', label: 'promo_bar_demo' })}
          className="underline mr-1 text-navy-950 font-bold hover:text-navy-800 transition-colors whitespace-nowrap"
        >
          اطلب الآن
        </a>
      </div>

      {/* Header bar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-navy-900/95 backdrop-blur-md shadow-lg shadow-navy-950/60 border-b border-navy-700/40'
            : 'bg-navy-900/40 backdrop-blur-xs'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="التنقل الرئيسي">
          <div className="flex items-center justify-between h-16 lg:h-20 gap-3">
            {/* Logo */}
            <Link to="/#home" className="flex items-center gap-2.5 shrink-0 focus-visible:ring-2 focus-visible:ring-gold-400 rounded-lg p-1">
              <span className="text-2xl font-extrabold text-gradient-gold tracking-tight">{cfg.logoText}</span>
              <span className="text-lg font-bold text-navy-50 hidden sm:inline">{cfg.agencyName}</span>
            </Link>

            {/* Desktop Navigation (visible on xl and up: avoids 1024-1280px crowd) */}
            <ul className="hidden xl:flex items-center gap-5">
              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className={`text-sm font-semibold relative py-2 transition-colors duration-200 block ${
                        isActive ? 'text-gold-400 font-bold' : 'text-navy-100 hover:text-gold-300'
                      }`}
                    >
                      {link.label}
                      {isActive && (
                        <motion.div
                          layoutId="activeNavUnderline"
                          className="absolute bottom-0 right-0 left-0 h-0.5 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Desktop Action Buttons */}
            <div className="hidden xl:flex items-center gap-3 shrink-0">
              {user ? (
                /* User profile dropdown */
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 bg-navy-800/80 hover:bg-navy-700/80 border border-navy-600/50 rounded-xl px-3.5 py-2 text-sm font-semibold text-navy-50 transition-all"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <span className="truncate max-w-[120px]">{displayName}</span>
                    <ChevronDown size={16} className={`text-navy-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-navy-850 bg-navy-900 border border-navy-700 rounded-xl shadow-2xl py-2 z-50">
                      <Link
                        to="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-200 hover:bg-navy-800 hover:text-gold-300 transition-colors"
                      >
                        <User size={16} />
                        حسابي
                      </Link>
                      <Link
                        to="/my-requests"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-200 hover:bg-navy-800 hover:text-gold-300 transition-colors"
                      >
                        <Inbox size={16} />
                        طلباتي
                      </Link>
                      <div className="border-t border-navy-800 my-1" />
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={16} />
                        تسجيل الخروج
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    to="/auth?mode=login"
                    className="inline-flex items-center gap-1.5 border border-navy-600/60 hover:border-gold-500/50 text-navy-100 hover:text-gold-300 font-semibold px-3.5 py-2 rounded-xl transition-all text-sm"
                  >
                    <LogIn size={15} />
                    تسجيل الدخول
                  </Link>
                  <Link
                    to="/auth?mode=signup"
                    className="inline-flex items-center gap-1.5 bg-navy-800 hover:bg-navy-700 text-gold-300 border border-gold-500/30 font-bold px-3.5 py-2 rounded-xl transition-all text-sm"
                  >
                    <UserPlus size={15} />
                    إنشاء حساب
                  </Link>
                </>
              )}

              <a
                href={waLinkIntl(cfg.phoneIntl, cfg.whatsappMessages.demo)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent({ category: 'whatsapp', action: 'click', label: 'header_demo' })}
                className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-5 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 glow-gold-hover text-sm shadow-md shadow-gold-500/20"
              >
                اطلب ديمو مجاني
              </a>
            </div>

            {/* Mobile / Tablet burger button (visible below xl: handles 1024px cleanly) */}
            <div className="flex xl:hidden items-center gap-2">
              <a
                href={waLinkIntl(cfg.phoneIntl, cfg.whatsappMessages.demo)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent({ category: 'whatsapp', action: 'click', label: 'header_demo_mobile' })}
                className="inline-flex items-center gap-1.5 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-3 py-1.5 rounded-lg text-xs"
              >
                ديمو مجاني
              </a>

              <button
                ref={burgerBtnRef}
                className="text-navy-100 hover:text-gold-400 p-2 rounded-lg border border-navy-700/60 bg-navy-800/60 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav-drawer"
                aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة الرئيسية'}
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile menu drawer with smooth animation */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="mobile-nav-drawer"
              ref={mobileMenuRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="xl:hidden bg-navy-900/98 backdrop-blur-lg border-t border-navy-700/60 shadow-2xl max-h-[calc(100vh-4.5rem)] overflow-y-auto"
            >
            <div className="px-5 py-6 space-y-4">
              <ul className="space-y-1">
                {navLinks.map((link) => {
                  const isActive = activeSection === link.id;
                  return (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={`block py-3 px-4 rounded-xl font-semibold transition-colors ${
                          isActive
                            ? 'bg-gold-500/15 text-gold-300 font-bold'
                            : 'text-navy-100 hover:text-gold-400 hover:bg-navy-800/60'
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="border-t border-navy-700/50 pt-4 space-y-2">
                {user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-navy-300 font-medium">
                      أهلاً، <span className="text-gold-300 font-bold">{displayName}</span>
                    </div>
                    <Link
                      to="/account"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 py-3 px-4 rounded-xl text-navy-200 hover:bg-navy-800/70"
                    >
                      <User size={18} />
                      حسابي
                    </Link>
                    <Link
                      to="/my-requests"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 py-3 px-4 rounded-xl text-navy-200 hover:bg-navy-800/70"
                    >
                      <Inbox size={18} />
                      طلباتي
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-red-300 hover:bg-red-500/10 text-right"
                    >
                      <LogOut size={18} />
                      تسجيل الخروج
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Link
                      to="/auth?mode=login"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-navy-600/70 text-navy-100 font-semibold text-center text-sm"
                    >
                      <LogIn size={16} />
                      دخول
                    </Link>
                    <Link
                      to="/auth?mode=signup"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gold-500 text-navy-900 font-bold text-center text-sm"
                    >
                      <UserPlus size={16} />
                      حساب جديد
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </header>
    </>
  );
}
