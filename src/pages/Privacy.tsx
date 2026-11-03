import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomBar from '@/components/MobileBottomBar';
import Seo from '@/components/Seo';
import { Link } from 'react-router-dom';

export default function Privacy() {
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
          سياسة <span className="text-gradient-gold">الخصوصية</span>
        </h1>
        <div className="space-y-6 text-navy-200 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-navy-50 mb-2">جمع البيانات</h2>
            <p>
              نجمع فقط البيانات التي تقدمها طوعاً عبر نماذج التواصل (الاسم، رقم الهاتف، نوع النشاط) بغرض التواصل معك بشأن طلبات الديمو والخدمات. لا نبيع أو نشارك بياناتك مع أي طرف ثالث بأي شكل من الأشكال.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-navy-50 mb-2">ملفات تعريف الارتباط</h2>
            <p>
              قد نستخدم ملفات تعريف ارتباط أساسية لقياس أداء الموقع وتحسين تجربة التصفح باستخدام تحليلات الخصوصية المعتمدة. يمكنك إدارة خياراتك في أي وقت.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-navy-50 mb-2">أمان وسرية البيانات</h2>
            <p>
              نعتمد تقنيات مشفرة وحماية على مستوى الصفوف (Row Level Security) عبر Supabase. بياناتك مشفرة ولا يمكن الوصول إليها إلا من قبل الفريق التقني المختص لتنفيذ مشروعك.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-navy-50 mb-2">حقوقك واسترجاع البيانات</h2>
            <p>
              لك الحق الكامل في طلب تعديل أو حذف بياناتك وسجلات تواصلك في أي وقت بمجرد مراسلتنا عبر الواتساب أو البريد الإلكتروني.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-navy-50 mb-2">التحديثات المستمرة</h2>
            <p>
              قد نحدّث هذه السياسة لتواكب أي معايير أمان جديدة. سيتم إعلان أي تعديلات فورية في هذه الصفحة.
            </p>
          </section>
        </div>
        <div className="mt-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 shadow-md shadow-gold-500/20"
          >
            العودة للرئيسية
          </Link>
        </div>
      </main>
      <Footer />
      <MobileBottomBar />
    </div>
  );
}
