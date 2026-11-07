import { Phone, Mail, MessageCircle, Facebook, Instagram, MapPin } from 'lucide-react';
import { waLinkIntl, useSiteConfig } from '@/siteConfig';
import { trackEvent } from '@/lib/analytics';
import { Link } from 'react-router-dom';
import { useToast } from '@/lib/toast-context';
import { useI18n } from '@/i18n';

export default function Footer() {
  const { t } = useI18n();
  const cfg = useSiteConfig();
  const { copyToClipboard } = useToast();

  const quickLinks = [
    { to: '/#home', label: t('nav.home') },
    { to: '/#demo', label: t('nav.demo') },
    { to: '/#services', label: t('nav.services') },
    { to: '/#pricing', label: t('nav.pricing') },
    { to: '/showcase', label: t('nav.showcase') },
    { to: '/#process', label: t('nav.process') },
    { to: '/#faq', label: t('nav.faq') },
    { to: '/#contact', label: t('nav.contact') },
  ];

  return (
    <footer className="bg-navy-950 border-t border-navy-700/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl font-extrabold text-gradient-gold notranslate" translate="no">{cfg.logoText}</span>
              <span className="text-xl font-bold text-navy-50 notranslate" translate="no">{cfg.agencyName}</span>
            </div>
            <p className="text-navy-300 leading-relaxed max-w-md mb-6">
              {t('footer.bio')}
            </p>
            <div className="flex gap-3">
              <a
                href={cfg.facebook}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent({ category: 'social', action: 'click', label: 'footer_facebook' })}
                className="w-11 h-11 rounded-lg bg-navy-800/50 hover:bg-blue-600/20 flex items-center justify-center transition-colors"
                aria-label={t('footer.facebook')}
              >
                <Facebook size={18} className="text-blue-400" />
              </a>
              <a
                href={cfg.instagram}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent({ category: 'social', action: 'click', label: 'footer_instagram' })}
                className="w-11 h-11 rounded-lg bg-navy-800/50 hover:bg-pink-600/20 flex items-center justify-center transition-colors"
                aria-label={t('footer.instagram')}
              >
                <Instagram size={18} className="text-pink-400" />
              </a>
              <a
                href={waLinkIntl(cfg.phoneIntl, cfg.whatsappMessages.general)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackEvent({ category: 'whatsapp', action: 'click', label: 'footer_whatsapp' });
                }}
                className="w-11 h-11 rounded-lg bg-navy-800/50 hover:bg-green-600/20 flex items-center justify-center transition-colors"
                aria-label={t('footer.whatsapp')}
              >
                <MessageCircle size={18} className="text-green-400" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-navy-50 font-bold mb-4">{t('footer.quick_links')}</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-navy-300 hover:text-gold-400 transition-colors text-sm inline-block py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mansoura Landing Pages */}
          <div>
            <h3 className="text-navy-50 font-bold mb-4">خدماتنا في المنصورة</h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/restaurant-website-mansoura"
                  className="text-navy-300 hover:text-gold-400 transition-colors text-sm inline-block py-0.5"
                >
                  تصميم موقع مطعم
                </Link>
              </li>
              <li>
                <Link
                  to="/cafe-website-mansoura"
                  className="text-navy-300 hover:text-gold-400 transition-colors text-sm inline-block py-0.5"
                >
                  تصميم موقع كافيه
                </Link>
              </li>
              <li>
                <Link
                  to="/mall-website-mansoura"
                  className="text-navy-300 hover:text-gold-400 transition-colors text-sm inline-block py-0.5"
                >
                  موقع مول ومجمع تجاري
                </Link>
              </li>
              <li>
                <Link
                  to="/ecommerce-website-mansoura"
                  className="text-navy-300 hover:text-gold-400 transition-colors text-sm inline-block py-0.5"
                >
                  متجر إلكتروني في المنصورة
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-navy-50 font-bold mb-4">{t('footer.contact_us')}</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={`tel:${cfg.phone}`}
                  onClick={() => {
                    trackEvent({ category: 'call', action: 'click', label: 'footer_call' });
                    copyToClipboard(cfg.phone, 'رقم الهاتف');
                  }}
                  className="flex items-center gap-2 text-navy-300 hover:text-gold-400 transition-colors text-sm py-1"
                >
                  <Phone size={16} className="text-gold-400 shrink-0" />
                  <span className="notranslate" translate="no" dir="ltr">{cfg.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${cfg.email}`}
                  onClick={() => {
                    trackEvent({ category: 'email', action: 'click', label: 'footer_email' });
                    copyToClipboard(cfg.email, 'البريد الإلكتروني');
                  }}
                  className="flex items-center gap-2 text-navy-300 hover:text-gold-400 transition-colors text-sm break-all py-1"
                >
                  <Mail size={16} className="text-gold-400 shrink-0" />
                  <span className="notranslate" translate="no" dir="ltr">{cfg.email}</span>
                </a>
              </li>
              <li className="flex items-center gap-2 text-navy-300 text-sm py-1">
                <MapPin size={16} className="text-gold-400 shrink-0" />
                {cfg.location}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-navy-700/30 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-navy-300 text-sm">
            {t('footer.rights_reserved', { year: String(new Date().getFullYear()), name: cfg.agencyName })}
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-navy-300 hover:text-gold-400 text-xs transition-colors py-1">
              {t('footer.privacy_policy')}
            </Link>
            <p className="text-navy-300 text-xs">
              {t('footer.crafted_by')}{' '}
              <span className="text-gold-400 font-semibold notranslate" translate="no">{cfg.agencyName}</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
