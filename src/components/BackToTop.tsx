import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed right-4 sm:right-6 z-40 w-12 h-12 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 flex items-center justify-center shadow-lg shadow-gold-500/30 transition-all duration-300 hover:scale-110 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 5rem)' }}
      aria-label="رجوع للأعلى"
    >
      <ArrowUp size={22} />
    </button>
  );
}
