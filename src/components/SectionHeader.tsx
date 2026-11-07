import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface SectionHeaderProps {
  badge?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  icon?: LucideIcon;
  centered?: boolean;
}

export default function SectionHeader({
  badge,
  title,
  highlight,
  subtitle,
  icon: Icon,
  centered = true,
}: SectionHeaderProps) {
  return (
    <div className={`mb-12 sm:mb-16 ${centered ? 'text-center' : 'text-start'}`}>
      {badge && (
        <div className={`inline-flex items-center gap-2 text-gold-400 text-sm font-bold mb-2 tracking-wider relative`}>
          {Icon && <Icon size={16} className="text-gold-400 shrink-0" />}
          <span>{badge}</span>
        </div>
      )}

      {/* Thin animated gold line drawing in under the badge */}
      {badge && (
        <div className={`flex ${centered ? 'justify-center' : 'justify-start'} mb-3`}>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="h-0.5 w-12 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full rtl:origin-right ltr:origin-left"
          />
        </div>
      )}

      <h2 className="text-3xl lg:text-4xl font-extrabold text-navy-50 mb-4 leading-[1.35]">
        {title}{' '}
        {highlight && <span className="text-gradient-gold block sm:inline">{highlight}</span>}
      </h2>

      {subtitle && (
        <p className="text-navy-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
