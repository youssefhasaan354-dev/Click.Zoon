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

interface WizardState {
  activityType: string;
  activityLabel: string;
  features: string[];
  timeline: string;
  name: string;
  phone: string;
  businessName: string;
}

const activityOptions = [
  { id: 'restaurant', label: 'مطعم أو كافيه', icon: Utensils, basePackage: 'احترافية', basePrice: 4500 },
  { id: 'store', label: 'متجر إلكتروني للمنتجات', icon: ShoppingBag, basePackage: 'متجر إلكتروني', basePrice: 6500 },
  { id: 'clinic', label: 'عيادة أو مركز طبي', icon: Stethoscope, basePackage: 'احترافية', basePrice: 4000 },
  { id: 'corporate', label: 'شركة أو مؤسسة خدمات', icon: Building2, basePackage: 'احترافية', basePrice: 3500 },
  { id: 'law', label: 'مكتب محاماة أو استشارات', icon: Scale, basePackage: 'أساسية', basePrice: 3000 },
  { id: 'custom', label: 'نشاط تجاري آخر', icon: Sparkles, basePackage: 'مخصص', basePrice: 3500 },
];

const featureOptions = [
  { id: 'menu_orders', label: 'منيو إلكتروني / طلبات أونلاين', cost: 800 },
  { id: 'payment', label: 'بوابة دفع إلكتروني (فيزا / فودافون كاش)', cost: 1200 },
  { id: 'booking', label: 'نظام حجز مواعيد وكشوفات ذكي', cost: 700 },
  { id: 'multilang', label: 'لغتين (عربي + إنجليزي)', cost: 1000 },
  { id: 'seo', label: 'تهيئة SEO متقدمة للصفحة الأولى', cost: 900 },
  { id: 'shipping', label: 'ربط شركات الشحن والتوصيل', cost: 600 },
];

const timelineOptions = [
  { id: 'urgent', label: 'عاجل جداً (خلال 3 إلى 5 أيام)', multiplier: 1.15 },
  { id: 'standard', label: 'طبيعي ومدروس (خلال أسبوع إلى 10 أيام)', multiplier: 1.0 },
  { id: 'planning', label: 'في مرحلة التخطيط والاستكشاف', multiplier: 1.0 },
];

export default function QuoteWizard() {
  const cfg = useSiteConfig();
  const [step, setStep] = useState<number>(1);
  const [state, setState] = useState<WizardState>({
    activityType: 'restaurant',
    activityLabel: 'مطعم أو كافيه',
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
  const selectedActivity = activityOptions.find((a) => a.id === state.activityType) ?? activityOptions[0];
  const selectedTimeline = timelineOptions.find((t) => t.id === state.timeline) ?? timelineOptions[1];

  const featuresTotal = state.features.reduce((acc, featId) => {
    const f = featureOptions.find((item) => item.id === featId);
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
      .map((fId) => featureOptions.find((f) => f.id === fId)?.label)
      .filter(Boolean)
      .join('، ');

    return `مرحباً كليك زون 👋
عايز استفسر عن عرض موقع لنشاطي بناءً على حاسبة الموقع:
- نوع النشاط: ${state.activityLabel}
- اسم النشاط: ${state.businessName || 'قيد الإنشاء'}
- المميزات المطلوبة: ${featureLabels || 'الأساسية'}
- التوقيت: ${selectedTimeline.label}
- التقدير المقترح: حوالي ${estimatedPrice.toLocaleString('ar-EG')} ج.م
- الاسم: ${state.name}
- الهاتف: ${state.phone}`;
  };

  const handleSubmitLead = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleaned = cleanPhoneNumber(state.phone);

    if (!isValidEgyptianPhone(cleaned)) {
      setPhoneError('يرجى إدخال رقم موبايل مصري صحيح (مثال: 01012345678)');
      return;
    }
    setPhoneError(null);
    setSubmitting(true);

    const featureLabels = state.features
      .map((fId) => featureOptions.find((f) => f.id === fId)?.label)
      .filter(Boolean)
      .join('، ');

    try {
      const res = await submitDemoRequest({
        name: state.name.trim() || 'عميل حاسبة الأسعار',
        phone: cleaned,
        business_type: `${state.activityLabel} (${state.businessName || 'بدون اسم'})`,
        source: 'wizard',
        message_text: `المميزات: ${featureLabels} | التوقيت: ${selectedTimeline.label} | التقدير: ${estimatedPrice} ج.م`,
        page_url: window.location.href,
      });
      if (res.success) {
        trackEvent('generate_lead', {
          event_category: 'wizard',
          event_label: state.activityType,
          value: estimatedPrice,
        });
      }
      setSubmitted(true);
    } catch {
      // Fallback: still treat as submitted
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenWhatsApp = () => {
    const msg = buildWhatsappMessage();
    const url = waLinkIntl(cfg.phoneIntl, msg);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="wizard" className="py-20 lg:py-28 bg-navy-950/60 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="صمّم باقتك بنفسك"
          title="حاسبة تكلفة الموقع"
          highlight="وديمو تجريبي مخصص"
          subtitle="جاوب على 3 أسئلة بسيطة، اعرف الباقة والتقدير المناسب لنشاطك، واطلب ديمو مجاني فوراً."
        />

        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-gold-500/30 shadow-2xl relative">
          {/* Progress bar */}
          <div className="mb-8" aria-label={`الخطوة ${step} من 4`}>
            <div className="flex justify-between text-xs sm:text-sm font-bold text-navy-300 mb-2">
              <span className={step >= 1 ? 'text-gold-400' : ''}>1. نوع النشاط</span>
              <span className={step >= 2 ? 'text-gold-400' : ''}>2. المميزات</span>
              <span className={step >= 3 ? 'text-gold-400' : ''}>3. التوقيت</span>
              <span className={step >= 4 ? 'text-gold-400' : ''}>4. ملخص وعرض السعر</span>
            </div>
            <div className="w-full bg-navy-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-gold-600 via-gold-400 to-gold-300 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Activity Type */}
          {step === 1 && (
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-navy-50 mb-2">ما هو مجال نشاطك التجاري؟</h3>
              <p className="text-navy-300 text-sm mb-6">اختر الأقرب لطبيعة عملك لنحدد الهيكل الأمثل للموقع.</p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {activityOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = state.activityType === opt.id;
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setState((p) => ({ ...p, activityType: opt.id, activityLabel: opt.label }))}
                      className={`p-5 rounded-2xl border text-right transition-all flex items-start gap-4 ${
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
                        <div className="font-bold text-base text-navy-50 mb-1">{opt.label}</div>
                        <div className="text-xs text-navy-400">باقة مقترحة: {opt.basePackage}</div>
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
                  <span>التالي: المميزات المطلوبة</span>
                  <ChevronLeft size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Features Needed */}
          {step === 2 && (
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-navy-50 mb-2">ما هي الوظائف والمميزات التي تحتاجها؟</h3>
              <p className="text-navy-300 text-sm mb-6">يمكنك اختيار أكثر من ميزة، وسنضيفها لهيكل موقعك.</p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {featureOptions.map((feat) => {
                  const isChecked = state.features.includes(feat.id);
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
                      <span className="font-semibold text-sm sm:text-base text-navy-100">{feat.label}</span>
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
                  <ChevronRight size={18} />
                  <span>السابق</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn-gold px-8 py-3 rounded-xl font-bold text-sm inline-flex items-center gap-2"
                >
                  <span>التالي: الجدول الزمني</span>
                  <ChevronLeft size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Timeline */}
          {step === 3 && (
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-navy-50 mb-2">متى ترغب في إطلاق الموقع رسمياً؟</h3>
              <p className="text-navy-300 text-sm mb-6">الديمو المجاني دائماً يجهز لك خلال 24 إلى 72 ساعة كحد أقصى.</p>

              <div className="space-y-4 mb-8">
                {timelineOptions.map((item) => {
                  const isSelected = state.timeline === item.id;
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
                      <span className="font-bold text-base text-navy-100">{item.label}</span>
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
                  <ChevronRight size={18} />
                  <span>السابق</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn-gold px-8 py-3 rounded-xl font-bold text-sm inline-flex items-center gap-2"
                >
                  <span>عرض التقدير والملخص</span>
                  <ChevronLeft size={18} />
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
                  <h3 className="text-2xl font-bold text-navy-50 mb-2">تم استلام طلبك وعرض سعرك بنجاح!</h3>
                  <p className="text-navy-300 max-w-lg mx-auto mb-6 text-sm sm:text-base leading-relaxed">
                    فريق كليك زون بدأ في دراسة تفاصيل نشاطك، وسنتواصل معك خلال ساعات عبر واتساب لتسليم نموذج الديمو المجاني.
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
                        <div className="text-xs text-gold-400 font-bold mb-1">الباقة والتقدير الموصى به:</div>
                        <div className="text-2xl font-extrabold text-navy-50">
                          باقة {selectedActivity.basePackage} — {state.activityLabel}
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-xs text-navy-400 font-medium">التقدير التقريبي يبدأ من:</div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-gradient-gold">
                          {estimatedPrice.toLocaleString('ar-EG')} ج.م
                        </div>
                        <div className="text-[11px] text-navy-400">* شامل الدومين، الاستضافة، والدعم الفني</div>
                      </div>
                    </div>

                    <div className="pt-4 text-xs sm:text-sm text-navy-300 flex flex-wrap gap-2">
                      <span className="font-semibold text-navy-200">المميزات المحددة:</span>
                      {state.features.map((fId) => {
                        const feat = featureOptions.find((f) => f.id === fId);
                        return (
                          <span key={fId} className="bg-navy-800 text-gold-300 px-2.5 py-0.5 rounded-full border border-navy-700">
                            {feat?.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Contact Form */}
                  <form onSubmit={handleSubmitLead} className="space-y-4">
                    <h4 className="text-lg font-bold text-navy-50 mb-3">أدخل بياناتك لاستلام الديمو المجاني:</h4>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="wizard-name" className="block text-xs font-semibold text-navy-300 mb-1">
                          الاسم الكريم *
                        </label>
                        <input
                          id="wizard-name"
                          type="text"
                          required
                          value={state.name}
                          onChange={(e) => setState((p) => ({ ...p, name: e.target.value }))}
                          placeholder="مثال: محمد علي"
                          className="w-full bg-navy-900/80 border border-navy-700 rounded-xl px-4 py-3 text-sm text-navy-50 placeholder-navy-500 focus:border-gold-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label htmlFor="wizard-phone" className="block text-xs font-semibold text-navy-300 mb-1">
                          رقم الموبايل / واتساب *
                        </label>
                        <input
                          id="wizard-phone"
                          type="tel"
                          required
                          inputMode="tel"
                          value={state.phone}
                          onChange={(e) => setState((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="010XXXXXXXX"
                          className={`w-full bg-navy-900/80 border rounded-xl px-4 py-3 text-sm text-navy-50 placeholder-navy-500 focus:outline-none ${
                            phoneError ? 'border-red-500 focus:border-red-400' : 'border-navy-700 focus:border-gold-500'
                          }`}
                        />
                        {phoneError && <p className="text-red-400 text-xs mt-1">{phoneError}</p>}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="wizard-business" className="block text-xs font-semibold text-navy-300 mb-1">
                        اسم النشاط التجاري (أو الفكرة إن لم يُسمَّ بعد)
                      </label>
                      <input
                        id="wizard-business"
                        type="text"
                        value={state.businessName}
                        onChange={(e) => setState((p) => ({ ...p, businessName: e.target.value }))}
                        placeholder="مثال: مطعم شاورما الريف / عيادة د. محمد"
                        className="w-full bg-navy-900/80 border border-navy-700 rounded-xl px-4 py-3 text-sm text-navy-50 placeholder-navy-500 focus:border-gold-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-navy-300 hover:text-navy-100 border border-navy-700 transition-colors inline-flex items-center justify-center gap-2"
                      >
                        <ChevronRight size={18} />
                        <span>تعديل الخيارات</span>
                      </button>

                      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={handleOpenWhatsApp}
                          className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gold-500/40 text-gold-300 hover:bg-gold-500/10 font-bold text-sm inline-flex items-center justify-center gap-2 transition-all"
                        >
                          <MessageCircle size={18} />
                          <span>تحدث على واتساب</span>
                        </button>

                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full sm:w-auto btn-gold px-8 py-3 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20"
                        >
                          {submitting ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              <span>جارٍ الإرسال...</span>
                            </>
                          ) : (
                            <>
                              <Send size={18} />
                              <span>اطلب الديمو بهذا العرض</span>
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
