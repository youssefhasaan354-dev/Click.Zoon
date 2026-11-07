import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomBar from '@/components/MobileBottomBar';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import Seo from '@/components/Seo';
import { useI18n } from '@/i18n';

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-navy-900 text-navy-50 pb-[4.5rem] sm:pb-0">
      <Seo title={t('not_found.meta_title')} noindex={true} />
      <Header />
      <main id="main" className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <div className="text-8xl font-extrabold text-gradient-gold mb-4">{t('not_found.code')}</div>
        <h1 className="text-2xl lg:text-3xl font-bold text-navy-50 mb-3">
          {t('not_found.title')}
        </h1>
        <p className="text-navy-300 text-lg mb-8">
          {t('not_found.desc')}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-6 py-3.5 rounded-xl transition-all duration-300 hover:scale-105 glow-gold-hover"
        >
          <Home size={20} />
          {t('common.back_to_home')}
        </Link>
      </main>
      <Footer />
      <MobileBottomBar />
    </div>
  );
}
