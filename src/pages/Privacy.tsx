import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomBar from '@/components/MobileBottomBar';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-navy-900 text-navy-50 pb-[4.5rem] sm:pb-0">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-navy-50 mb-6">
          سياسة <span className="text-gradient-gold">الخصوصية</span>
        </h1>
        <div className="space-y-6 text-navy-200 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-navy-50 mb-2">جمع البيانات</h2>
            <p>نجمع فقط البيانات التي تقدمها طوعاً عبر نماذج التواصل (الاسم، رقم الهاتف، نوع النشاط) بغرض التواصل معك بشأن طلبات الديمو والخدمات. لا نبيع أو نشارك بياناتك مع أي طرف ثالث.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-navy-50 mb-2">ملفات تعريف الارتباط</h2>
            <p>قد نستخدم ملفات تعريف ارتباط أساسية لتحليل أداء الموقع باستخدام Google Analytics. يمكنك تعطيل ملفات تعريف الارتباط من إعدادات متصفحك.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-navy-50 mb-2">أمان البيانات</h2>
            <p>نستخدم Supabase كقاعدة بيانات مزودة بحماية على مستوى الصفوف (RLS). بياناتك محمية ولا يمكن الوصول إليها إلا من قبل فريق الإدارة.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-navy-50 mb-2">حقوقك</h2>
            <p>لك الحق في طلب حذف أو تعديل بياناتك في أي وقت. تواصل معنا عبر البريد الإلكتروني أو واتساب.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-navy-50 mb-2">التحديثات</h2>
            <p>قد نحدّث سياسة الخصوصية من وقت لآخر. أي تغييرات ستنشر على هذه الصفحة.</p>
          </section>
        </div>
        <div className="mt-10">
          <a href="/" className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-6 py-3 rounded-xl transition-all">
            العودة للرئيسية
          </a>
        </div>
      </main>
      <Footer />
      <MobileBottomBar />
    </div>
  );
}
