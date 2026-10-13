import { useEffect, useState, useRef } from 'react';
import { Menu, X, LogIn, UserPlus, ChevronDown, User, Inbox, LogOut } from 'lucide-react';
import { waLinkIntl, useSiteConfig } from '@/siteConfig';
import { trackEvent } from '@/lib/analytics';
import { useSiteData } from '@/lib/site-data-context';
import { useCustomer } from '@/lib/customer-context';
import { Link, useNavigate } from 'react-router-dom';

const allNavLinks = [
  { href: '#home', label: 'الرئيسية', section: 'hero' },
  { href: '#demo', label: 'الديمو المجاني', section: 'demo' },
  { href: '#services', label: 'الخدمات', section: 'services' },
  { href: '#pricing', label: 'الباقات', section: 'pricing' },
  { href: '#portfolio', label: 'معرض الأعمال', section: 'portfolio' },
  { href: '#process', label: 'خطوات العمل', section: 'process' },
  { href: '#faq', label: 'الأسئلة الشائعة', section: 'faq' },
  { href: '#contact', label: 'تواصل معنا', section: 'contact' },
];

export default function Header() {
  const cfg = useSiteConfig();
  const { data } = useSiteData();
  const { user, profile, signOut } = useCustomer();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const sectionVisible = (id: string) => {
    if (id === 'hero') return true;
    const s = data.sectionVisibility.find((sv) => sv.id === id);
    return s ? s.visible : true;
  };
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
      {/* Promo bar */}
      <div className="bg-gold-500 text-navy-900 text-center py-2 text-xs sm:text-sm font-semibold px-4">
        <span>{cfg.promoBarText} </span>
        <a
          href={waLinkIntl(cfg.phoneIntl, cfg.whatsappMessages.demo)}
          target="_blank"
          rel="noopener noreferrer"
          className="underline mr-1 text-gray-900 font-bold hover:text-black transition-colors whitespace-nowrap"
        >
          اطلب الآن
        </a>
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-navy-900/95 backdrop-blur-md shadow-lg shadow-navy-950/50'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20 gap-2">
            {/* Logo */}
            <a href="#home" className="flex items-center gap-2 shrink-0">
              <span className="text-2xl font-extrabold text-gradient-gold">{cfg.logoText}</span>
              <span className="text-lg font-bold text-navy-50 hidden sm:inline">{cfg.agencyName}</span>
            </a>

            {/* Desktop nav */}
            <ul className="hidden lg:flex items-center gap-5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-navy-100 hover:text-gold-400 transition-colors text-sm font-semibold relative group py-2"
                  >
                    {link.label}
                    <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-gold-400 transition-all duration-300 group-hover:w-full" />
                  </a>
                </li>
              ))}
            </ul>

            {/* Right side — CTA + auth */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              {user ? (
                /* User dropdown */
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 bg-navy-800/60 hover:bg-navy-700/60 border border-navy-600/40 rounded-lg px-3 py-2 text-sm font-semibold text-navy-50 transition-all"
                  >
                    <span className="truncate max-w-[100px]">{displayName}</span>
                    <ChevronDown size={16} className={`text-navy-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-navy-800 border border-navy-600/40 rounded-xl shadow-xl py-2 z-50">
                      <Link
                        to="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-200 hover:bg-navy-700/50 hover:text-gold-300 transition-colors"
                      >
                        <User size={16} />
                        حسابي
                      </Link>
                      <Link
                        to="/my-requests"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-200 hover:bg-navy-700/50 hover:text-gold-300 transition-colors"
                      >
                        <Inbox size={16} />
                        طلباتي
                      </Link>
                      <div className="border-t border-navy-700/30 my-1" />
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
                    className="inline-flex items-center gap-1.5 border border-navy-600/50 hover:border-gold-500/40 text-navy-100 hover:text-gold-300 font-semibold px-4 py-2 rounded-lg transition-all text-sm"
                  >
                    <LogIn size={16} />
                    تسجيل الدخول
                  </Link>
                  <Link
                    to="/auth?mode=signup"
                    className="inline-flex items-center gap-1.5 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-4 py-2 rounded-lg transition-all text-sm glow-gold-hover"
                  >
                    <UserPlus size={16} />
                    إنشاء حساب
                  </Link>
                </>
              )}

              <a
                href={waLinkIntl(cfg.phoneIntl, cfg.whatsappMessages.demo)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent({ category: 'whatsapp', action: 'click', label: 'header_demo' })}
                className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-5 py-2.5 rounded-lg transition-all duration-300 hover:scale-105 glow-gold-hover text-sm"
              >
                اطلب ديمو مجاني
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden text-navy-50 p-2 shrink-0"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="القائمة"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden bg-navy-900/98 backdrop-blur-md border-t border-navy-700/50 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <ul className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 px-4 text-navy-100 hover:text-gold-400 hover:bg-navy-800/50 rounded-lg transition-colors font-semibold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}

              {/* Auth section on mobile */}
              <li className="pt-3 mt-3 border-t border-navy-700/30 space-y-2">
                {user ? (
                  <>
                    <div className="px-4 py-2 text-navy-300 text-sm">
                      مرحباً، <span className="font-bold text-navy-50">{displayName}</span>
                    </div>
                    <Link
                      to="/account"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 py-3 px-4 text-navy-100 hover:text-gold-400 hover:bg-navy-800/50 rounded-lg transition-colors font-semibold"
                    >
                      <User size={18} />
                      حسابي
                    </Link>
                    <Link
                      to="/my-requests"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 py-3 px-4 text-navy-100 hover:text-gold-400 hover:bg-navy-800/50 rounded-lg transition-colors font-semibold"
                    >
                      <Inbox size={18} />
                      طلباتي
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 py-3 px-4 text-red-300 hover:bg-red-500/10 rounded-lg transition-colors font-semibold"
                    >
                      <LogOut size={18} />
                      تسجيل الخروج
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 px-1">
                    <Link
                      to="/auth?mode=login"
                      onClick={() => setMenuOpen(false)}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-navy-600/50 text-navy-100 font-semibold py-3 rounded-lg transition-all text-sm"
                    >
                      <LogIn size={16} />
                      دخول
                    </Link>
                    <Link
                      to="/auth?mode=signup"
                      onClick={() => setMenuOpen(false)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-gold-500 text-navy-900 font-bold py-3 rounded-lg transition-all text-sm"
                    >
                      <UserPlus size={16} />
                      حساب جديد
                    </Link>
                  </div>
                )}
              </li>

              <li>
                <a
                  href={waLinkIntl(cfg.phoneIntl, cfg.whatsappMessages.demo)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => { setMenuOpen(false); trackEvent({ category: 'whatsapp', action: 'click', label: 'mobile_menu_demo' }); }}
                  className="block py-3 px-4 bg-gold-500 text-navy-900 font-bold rounded-lg text-center mt-2"
                >
                  اطلب ديمو مجاني
                </a>
              </li>
            </ul>
          </div>
        )}
      </header>
    </>
  );
}
