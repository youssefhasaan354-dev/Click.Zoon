import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomBar from '@/components/MobileBottomBar';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy-900 text-navy-50 pb-[4.5rem] sm:pb-0">
      <Header />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <div className="text-8xl font-extrabold text-gradient-gold mb-4">٤٠٤</div>
        <h1 className="text-2xl lg:text-3xl font-bold text-navy-50 mb-3">
          الصفحة غير موجودة
        </h1>
        <p className="text-navy-300 text-lg mb-8">
          الصفحة اللي بتدور عليها مش موجودة أو تم نقلها.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-6 py-3.5 rounded-xl transition-all duration-300 hover:scale-105 glow-gold-hover"
        >
          <Home size={20} />
          العودة للرئيسية
        </a>
      </main>
      <Footer />
      <MobileBottomBar />
    </div>
  );
}
