import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomBar from '@/components/MobileBottomBar';
import Seo from '@/components/Seo';
import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';

export default function Privacy() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-navy-900 text-navy-50 pb-[4.5rem] sm:pb-0">
      <Seo
        title="سياسة الخصوصية"
        canonical="/privacy"
        description="سياسة خصوصية Click Zoon: نلتزم بحماية بياناتك الشخصية وبيانات نشاطك التجاري بأعلى معايير الأمان."
      />
      <Header />
      <main id="main" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-navy-50 mb-6">
          {t('privacy.title')} <span className="text-gradient-gold">{t('privacy.highlight')}</span>
        </h1>
        <div className="space-y-6 text-navy-200 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-navy-50 mb-2">{t('privacy.data_collection_title')}</h2>
            <p>{t('privacy.data_collection_text')}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-navy-50 mb-2">{t('privacy.cookies_title')}</h2>
            <p>{t('privacy.cookies_text')}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-navy-50 mb-2">{t('privacy.third_party_title')}</h2>
            <p>{t('privacy.third_party_text')}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-navy-50 mb-2">{t('privacy.security_title')}</h2>
            <p>{t('privacy.security_text')}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-navy-50 mb-2">{t('privacy.rights_title')}</h2>
            <p>{t('privacy.rights_text')}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-navy-50 mb-2">{t('privacy.updates_title')}</h2>
            <p>{t('privacy.updates_text')}</p>
          </section>
        </div>
        <div className="mt-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 shadow-md shadow-gold-500/20"
          >
            {t('privacy.back_btn')}
          </Link>
        </div>
      </main>
      <Footer />
      <MobileBottomBar />
    </div>
  );
}
