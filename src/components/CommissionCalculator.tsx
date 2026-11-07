import { useState, useMemo } from 'react';
import { Calculator, MessageCircle, TrendingDown, AlertCircle } from 'lucide-react';
import { waLinkIntl, useSiteConfig } from '@/siteConfig';
import { useReveal } from '@/hooks/useReveal';
import { trackEvent } from '@/lib/analytics';
import { useI18n } from '@/i18n';

export default function CommissionCalculator() {
  const { t, language } = useI18n();
  const { ref, revealed } = useReveal();
  const cfg = useSiteConfig();
  const [orders, setOrders] = useState('');
  const [avgOrder, setAvgOrder] = useState('');
  const [commission, setCommission] = useState('20');

  const result = useMemo(() => {
    const o = parseFloat(orders) || 0;
    const a = parseFloat(avgOrder) || 0;
    const c = parseFloat(commission) || 0;
    const monthly = o * a * (c / 100);
    const yearly = monthly * 12;
    return { monthly, yearly };
  }, [orders, avgOrder, commission]);

  const hasInput = orders && avgOrder;

  const formatEGP = (n: number) => {
    const locale = language === 'en' ? 'en-US' : 'ar-EG';
    return `${n.toLocaleString(locale, { maximumFractionDigits: 0 })} ${t('commission_calculator.currency')}`;
  };

  const inputClass =
    'w-full bg-navy-800/60 border border-navy-600/40 rounded-xl px-4 py-3 text-navy-50 placeholder-navy-400 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-all text-lg font-semibold';

  return (
    <section id="calculator" className="py-20 lg:py-28 bg-navy-950/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-gold-400 text-sm font-bold mb-3">
            <Calculator size={16} />
            <span>{t('commission_calculator.badge')}</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-navy-50 mb-4">
            {t('commission_calculator.title')} <span className="text-gradient-gold">{t('commission_calculator.highlight')}</span>
          </h2>
          <p className="text-navy-300 text-lg max-w-2xl mx-auto">
            {t('commission_calculator.subtitle')}
          </p>
        </div>

        <div ref={ref} className={`reveal ${revealed ? 'revealed' : ''}`}>
          <div className="glass-card rounded-2xl p-6 lg:p-8 border-gold-500/20">
            {/* Inputs */}
            <div className="grid sm:grid-cols-3 gap-5 mb-6">
              <div>
                <label htmlFor="calc-orders" className="text-navy-200 text-sm font-semibold mb-2 block">
                  {t('commission_calculator.orders_label')}
                </label>
                <input
                  id="calc-orders"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={orders}
                  onChange={(e) => setOrders(e.target.value)}
                  placeholder="300"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="calc-avg-order" className="text-navy-200 text-sm font-semibold mb-2 block">
                  {t('commission_calculator.avg_order_label')}
                </label>
                <input
                  id="calc-avg-order"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={avgOrder}
                  onChange={(e) => setAvgOrder(e.target.value)}
                  placeholder="80"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="calc-commission" className="text-navy-200 text-sm font-semibold mb-2 block">
                  {t('commission_calculator.commission_label')}
                </label>
                <input
                  id="calc-commission"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="100"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  placeholder="20"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Results */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
                <div className="flex items-center gap-2 text-red-300 text-sm font-semibold mb-2">
                  <TrendingDown size={18} />
                  {t('commission_calculator.monthly_loss')}
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-red-300 break-words">
                  {hasInput ? formatEGP(result.monthly) : '—'}
                </div>
              </div>
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
                <div className="flex items-center gap-2 text-red-300 text-sm font-semibold mb-2">
                  <TrendingDown size={18} />
                  {t('commission_calculator.yearly_loss')}
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-red-300 break-words">
                  {hasInput ? formatEGP(result.yearly) : '—'}
                </div>
              </div>
            </div>

            {/* Hint */}
            {hasInput && result.monthly > 0 && (
              <div className="flex items-start gap-2 text-navy-300 text-sm mb-5 bg-navy-800/40 rounded-xl p-4">
                <AlertCircle size={18} className="text-gold-400 shrink-0 mt-0.5" />
                <span>
                  {t('commission_calculator.hint')}
                </span>
              </div>
            )}

            {/* CTA */}
            <a
              href={waLinkIntl(cfg.phoneIntl, t('commission_calculator.whatsapp_msg'))}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent({ category: 'whatsapp', action: 'click', label: 'calculator_cta' })}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 glow-gold-hover text-lg"
            >
              <MessageCircle size={20} />
              {t('commission_calculator.cta')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
