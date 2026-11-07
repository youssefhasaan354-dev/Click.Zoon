import { useState } from 'react';
import {
  Utensils,
  ShoppingBag,
  Stethoscope,
  Building2,
  Scale,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  Send,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';
import { submitDemoRequest } from '@/lib/demo-requests';
import { trackEvent } from '@/lib/analytics';
import { cleanPhoneNumber, isValidEgyptianPhone } from '@/lib/phone';
import { waLinkIntl, useSiteConfig } from '@/siteConfig';
import { useI18n } from '@/i18n';

interface WizardState {
  activityType: string;
  activityLabel: string;
  features: string[];
  timeline: string;
  name: string;
  phone: string;
  businessName: string;
}

const activityDefinitions = [
  { id: 'restaurant', labelKey: 'act_restaurant', icon: Utensils, basePackage: 'احترافية', basePrice: 4500 },
  { id: 'store', labelKey: 'act_store', icon: ShoppingBag, basePackage: 'متجر إلكتروني', basePrice: 6500 },
  { id: 'clinic', labelKey: 'act_clinic', icon: Stethoscope, basePackage: 'احترافية', basePrice: 4000 },
  { id: 'corporate', labelKey: 'act_corporate', icon: Building2, basePackage: 'احترافية', basePrice: 3500 },
  { id: 'law', labelKey: 'act_law', icon: Scale, basePackage: 'أساسية', basePrice: 3000 },
  { id: 'custom', labelKey: 'act_custom', icon: Sparkles, basePackage: 'مخصص', basePrice: 3500 },
] as const;

const featureDefinitions = [
  { id: 'menu_orders', labelKey: 'feat_menu', cost: 800 },
  { id: 'payment', labelKey: 'feat_payment', cost: 1200 },
  { id: 'booking', labelKey: 'feat_booking', cost: 700 },
  { id: 'multilang', labelKey: 'feat_multilang', cost: 1000 },
  { id: 'seo', labelKey: 'feat_seo', cost: 900 },
  { id: 'shipping', labelKey: 'feat_shipping', cost: 600 },
] as const;

const timelineDefinitions = [
  { id: 'urgent', labelKey: 'time_urgent', multiplier: 1.15 },
  { id: 'standard', labelKey: 'time_standard', multiplier: 1.0 },
  { id: 'planning', labelKey: 'time_planning', multiplier: 1.0 },
] as const;

export default function QuoteWizard() {
  const { t, dir, language } = useI18n();
  const cfg = useSiteConfig();
  const [step, setStep] = useState<number>(1);
  const [state, setState] = useState<WizardState>({
    activityType: 'restaurant',
    activityLabel: t('quote_wizard.act_restaurant'),
    features: ['menu_orders', 'seo'],
    timeline: 'standard',
    name: '',
    phone: '',
    businessName: '',
  });

  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Calculate live estimate
  const selectedActivity = activityDefinitions.find((a) => a.id === state.activityType) ?? activityDefinitions[0];
  const selectedTimeline = timelineDefinitions.find((tDef) => tDef.id === state.timeline) ?? timelineDefinitions[1];

  const featuresTotal = state.features.reduce((acc, featId) => {
    const f = featureDefinitions.find((item) => item.id === featId);
    return acc + (f ? f.cost : 0);
  }, 0);

  const estimatedPrice = Math.round((selectedActivity.basePrice + featuresTotal) * selectedTimeline.multiplier);

  const toggleFeature = (featId: string) => {
    setState((prev) => ({
      ...prev,
      features: prev.features.includes(featId)
        ? prev.features.filter((id) => id !== featId)
        : [...prev.features, featId],
    }));
  };

  const handleNextStep = () => {
    if (step < 4) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const buildWhatsappMessage = () => {
    const featureLabels = state.features
      .map((fId) => {
        const item = featureDefinitions.find((f) => f.id === fId);
        return item ? t(`quote_wizard.${item.labelKey}`) : '';
      })
      .filter(Boolean)
      .join('، ');

    const timelineLabel = t(`quote_wizard.${selectedTimeline.labelKey}`);
    const actLabel = t(`quote_wizard.${selectedActivity.labelKey}`);

    return `مرحباً كليك زون 👋
عايز استفسر عن عرض موقع لنشاطي بناءً على حاسبة الموقع:
- نوع النشاط: ${actLabel}
- اسم النشاط: ${state.businessName || 'قيد الإنشاء'}
- المميزات المطلوبة: ${featureLabels || 'الأساسية'}
- التوقيت: ${timelineLabel}
- التقدير المقترح: حوالي ${estimatedPrice.toLocaleString(language === 'en' ? 'en-US' : 'ar-EG')} ${t('quote_wizard.currency')}
- الاسم: ${state.name}
- الهاتف: ${state.phone}`;
  };

  const handleSubmitLead = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleaned = cleanPhoneNumber(state.phone);

    if (!isValidEgyptianPhone(cleaned)) {
      setPhoneError(t('quote_wizard.phone_error'));
      return;
    }
    setPhoneError(null);
    setSubmitting(true);

    const featureLabels = state.features
      .map((fId) => {
        const item = featureDefinitions.find((f) => f.id === fId);
        return item ? t(`quote_wizard.${item.labelKey}`) : '';
      })
      .filter(Boolean)
      .join('، ');

    const actLabel = t(`quote_wizard.${selectedActivity.labelKey}`);
    const timelineLabel = t(`quote_wizard.${selectedTimeline.labelKey}`);

    try {
      const res = await submitDemoRequest({
        name: state.name.trim() || 'عميل حاسبة الأسعار',
        phone: cleaned,
        business_type: `${actLabel} (${state.businessName || 'بدون اسم'})`,
        source: 'wizard',
        message_text: `المميزات: ${featureLabels} | التوقيت: ${timelineLabel} | التقدير: ${estimatedPrice} ${t('quote_wizard.currency')}`,
        page_url: window.location.href,
      });
      if (res.success) {
        trackEvent('generate_lead', {
          event_category: 'wizard',
          event_label: state.activityType,
        });
      }
      setSubmitted(true);
    } catch (err) {
      console.error('Wizard submission failed:', err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenWhatsApp = () => {
    trackEvent({ category: 'whatsapp', action: 'click', label: 'wizard_whatsapp' });
    const waUrl = waLinkIntl(cfg.phoneIntl, buildWhatsappMessage());
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const nextIcon = dir === 'rtl' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />;
  const prevIcon = dir === 'rtl' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />;

  return (
    <section id="wizard" className="py-20 lg:py-28 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={t('quote_wizard.badge')}
          title={t('quote_wizard.title')}
          subtitle={t('quote_wizard.subtitle')}
        />

        {/* Step Progress Bar */}
        <div className="mb-10 max-w-2xl mx-auto">
          <div className="flex items-center justify-between relative z-10">
            {[1, 2, 3, 4].map((stepNum) => {
              const isPast = step > stepNum;
              const isCurrent = step === stepNum;
              return (
                <div key={stepNum} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      isPast
                        ? 'bg-gold-500 text-navy-950 shadow-md shadow-gold-500/30'
                        : isCurrent
                        ? 'bg-gold-500 text-navy-950 ring-4 ring-gold-500/30 font-extrabold shadow-lg'
                        : 'bg-navy-800 text-navy-400 border border-navy-700'
                    }`}
                  >
                    {isPast ? <Check size={18} strokeWidth={3} /> : stepNum}
                  </div>
                  <span
                    className={`text-xs mt-2 font-semibold ${
                      isCurrent ? 'text-gold-300' : isPast ? 'text-navy-200' : 'text-navy-400'
                    }`}
                  >
                    {stepNum === 1 && t('quote_wizard.step1_title')}
                    {stepNum === 2 && t('quote_wizard.step2_title')}
                    {stepNum === 3 && t('quote_wizard.step3_title')}
                    {stepNum === 4 && t('quote_wizard.step4_title')}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="relative -mt-8 top-3 h-0.5 bg-navy-800 w-[85%] mx-auto -z-0">
            <div
              className="h-full bg-gradient-to-r from-gold-500 to-gold-400 transition-all duration-500"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-gold-500/25 relative overflow-hidden shadow-2xl">
          {/* Step 1: Activity Type */}
          {step === 1 && (
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-navy-50 mb-2">{t('quote_wizard.step1_title')}</h3>
              <p className="text-navy-300 text-sm mb-6">اختر الأقرب لطبيعة عملك لنحدد الهيكل الأمثل للموقع.</p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {activityDefinitions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = state.activityType === opt.id;
                  const label = t(`quote_wizard.${opt.labelKey}`);
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setState((p) => ({ ...p, activityType: opt.id, activityLabel: label }))}
                      className={`p-5 rounded-2xl border text-start transition-all flex items-start gap-4 ${
                        isSelected
                          ? 'bg-gold-500/15 border-gold-500 text-gold-300 shadow-lg shadow-gold-500/10'
                          : 'bg-navy-900/60 border-navy-700/60 text-navy-200 hover:border-gold-500/40'
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-gold-500 text-navy-900 font-bold' : 'bg-navy-800 text-gold-400'
                        }`}
                      >
                        <Icon size={22} />
                      </div>
                      <div>
                        <div className="font-bold text-base text-navy-50 mb-1">{label}</div>
                        <div className="text-xs text-navy-400">{opt.basePackage}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn-gold px-8 py-3 rounded-xl font-bold text-sm inline-flex items-center gap-2"
                >
                  <span>{t('quote_wizard.next')}: {t('quote_wizard.step2_title')}</span>
                  {nextIcon}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Features Needed */}
          {step === 2 && (
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-navy-50 mb-2">{t('quote_wizard.step2_title')}</h3>
              <p className="text-navy-300 text-sm mb-6">يمكنك اختيار أكثر من ميزة، وسنضيفها لهيكل موقعك.</p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {featureDefinitions.map((feat) => {
                  const isChecked = state.features.includes(feat.id);
                  const label = t(`quote_wizard.${feat.labelKey}`);
                  return (
                    <div
                      key={feat.id}
                      onClick={() => toggleFeature(feat.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isChecked
                          ? 'bg-gold-500/15 border-gold-500 text-gold-300'
                          : 'bg-navy-900/60 border-navy-700/60 text-navy-300 hover:border-gold-500/30'
                      }`}
                    >
                      <span className="font-semibold text-sm sm:text-base text-navy-100">{label}</span>
                      <div
                        className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
                          isChecked ? 'bg-gold-500 border-gold-500 text-navy-950' : 'border-navy-600 bg-navy-800'
                        }`}
                      >
                        {isChecked && <Check size={16} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-navy-300 hover:text-navy-100 border border-navy-700 hover:border-navy-500 transition-colors inline-flex items-center gap-2"
                >
                  {prevIcon}
                  <span>{t('quote_wizard.back')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn-gold px-8 py-3 rounded-xl font-bold text-sm inline-flex items-center gap-2"
                >
                  <span>{t('quote_wizard.next')}: {t('quote_wizard.step3_title')}</span>
                  {nextIcon}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Timeline */}
          {step === 3 && (
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-navy-50 mb-2">{t('quote_wizard.step3_title')}</h3>
              <p className="text-navy-300 text-sm mb-6">الديمو المجاني دائماً يجهز لك خلال 24 إلى 72 ساعة كحد أقصى.</p>

              <div className="space-y-4 mb-8">
                {timelineDefinitions.map((item) => {
                  const isSelected = state.timeline === item.id;
                  const label = t(`quote_wizard.${item.labelKey}`);
                  return (
                    <div
                      key={item.id}
                      onClick={() => setState((p) => ({ ...p, timeline: item.id }))}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-gold-500/15 border-gold-500 text-gold-300'
                          : 'bg-navy-900/60 border-navy-700/60 text-navy-300 hover:border-gold-500/30'
                      }`}
                    >
                      <span className="font-bold text-base text-navy-100">{label}</span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-gold-400' : 'border-navy-600'
                        }`}
                      >
                        {isSelected && <div className="w-2.5 h-2.5 bg-gold-400 rounded-full" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-navy-300 hover:text-navy-100 border border-navy-700 hover:border-navy-500 transition-colors inline-flex items-center gap-2"
                >
                  {prevIcon}
                  <span>{t('quote_wizard.back')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn-gold px-8 py-3 rounded-xl font-bold text-sm inline-flex items-center gap-2"
                >
                  <span>{t('quote_wizard.next')}</span>
                  {nextIcon}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Summary & Contact */}
          {step === 4 && (
            <div>
              {submitted ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 flex items-center justify-center mx-auto mb-4">
                    <Check size={36} strokeWidth={3} />
                  </div>
                  <h3 className="text-2xl font-bold text-navy-50 mb-2">{t('quote_wizard.submitted_title')}</h3>
                  <p className="text-navy-300 max-w-lg mx-auto mb-6 text-sm sm:text-base leading-relaxed">
                    {t('quote_wizard.submitted_desc')}
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    className="btn-gold px-8 py-3 rounded-xl font-bold text-sm inline-flex items-center gap-2"
                  >
                    <MessageCircle size={18} />
                    <span>متابعة تفاصيل الطلب على واتساب فوراً</span>
                  </button>
                </div>
              ) : (
                <div>
                  {/* Summary Box */}
                  <div className="bg-navy-900/80 border border-gold-500/30 rounded-2xl p-6 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-700/60">
                      <div>
                        <div className="text-xs text-gold-400 font-bold mb-1">
                          {t('quote_wizard.estimated_price')}
                        </div>
                        <div className="text-2xl font-extrabold text-navy-50">
                          {selectedActivity.basePackage} — {t(`quote_wizard.${selectedActivity.labelKey}`)}
                        </div>
                      </div>
                      <div className="text-start sm:text-end">
                        <div className="text-2xl sm:text-3xl font-extrabold text-gradient-gold">
                          {estimatedPrice.toLocaleString(language === 'en' ? 'en-US' : 'ar-EG')} {t('quote_wizard.currency')}
                        </div>
                        <div className="text-[11px] text-navy-400">* شامل الدومين، الاستضافة، والدعم الفني</div>
                      </div>
                    </div>

                    <div className="pt-4 text-xs sm:text-sm text-navy-300 flex flex-wrap gap-2">
                      <span className="font-semibold text-navy-200">{t('quote_wizard.step2_title')}:</span>
                      {state.features.map((fId) => {
                        const feat = featureDefinitions.find((f) => f.id === fId);
                        return (
                          <span key={fId} className="bg-navy-800 text-gold-300 px-2.5 py-0.5 rounded-full border border-navy-700">
                            {feat ? t(`quote_wizard.${feat.labelKey}`) : ''}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Contact Form */}
                  <form onSubmit={handleSubmitLead} className="space-y-4">
                    <h4 className="text-lg font-bold text-navy-50 mb-3">{t('quote_wizard.step4_title')}:</h4>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="wizard-name" className="block text-xs font-semibold text-navy-300 mb-1">
                          {t('contact.name_label')} *
                        </label>
                        <input
                          id="wizard-name"
                          type="text"
                          required
                          value={state.name}
                          onChange={(e) => setState((p) => ({ ...p, name: e.target.value }))}
                          placeholder={t('contact.name_placeholder')}
                          className="w-full bg-navy-900/80 border border-navy-700 rounded-xl px-4 py-3 text-sm text-navy-50 placeholder-navy-500 focus:border-gold-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label htmlFor="wizard-phone" className="block text-xs font-semibold text-navy-300 mb-1">
                          {t('contact.phone_label')} *
                        </label>
                        <input
                          id="wizard-phone"
                          type="tel"
                          required
                          inputMode="tel"
                          value={state.phone}
                          onChange={(e) => setState((p) => ({ ...p, phone: e.target.value }))}
                          placeholder={t('contact.phone_placeholder')}
                          className={`w-full bg-navy-900/80 border rounded-xl px-4 py-3 text-sm text-navy-50 placeholder-navy-500 focus:outline-none ${
                            phoneError ? 'border-red-500 focus:border-red-400' : 'border-navy-700 focus:border-gold-500'
                          }`}
                        />
                        {phoneError && <p className="text-red-400 text-xs mt-1">{phoneError}</p>}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="wizard-business" className="block text-xs font-semibold text-navy-300 mb-1">
                        {t('contact.business_label')}
                      </label>
                      <input
                        id="wizard-business"
                        type="text"
                        value={state.businessName}
                        onChange={(e) => setState((p) => ({ ...p, businessName: e.target.value }))}
                        placeholder={t('contact.business_placeholder')}
                        className="w-full bg-navy-900/80 border border-navy-700 rounded-xl px-4 py-3 text-sm text-navy-50 placeholder-navy-500 focus:border-gold-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-navy-300 hover:text-navy-100 border border-navy-700 transition-colors inline-flex items-center justify-center gap-2"
                      >
                        {prevIcon}
                        <span>{t('quote_wizard.back')}</span>
                      </button>

                      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={handleOpenWhatsApp}
                          className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gold-500/40 text-gold-300 hover:bg-gold-500/10 font-bold text-sm inline-flex items-center justify-center gap-2 transition-all"
                        >
                          <MessageCircle size={18} />
                          <span>{t('common.whatsapp')}</span>
                        </button>

                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full sm:w-auto btn-gold px-8 py-3 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20"
                        >
                          {submitting ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              <span>{t('quote_wizard.submitting')}</span>
                            </>
                          ) : (
                            <>
                              <Send size={18} />
                              <span>{t('quote_wizard.submit')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
