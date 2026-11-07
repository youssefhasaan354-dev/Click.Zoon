const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outDir = path.join(__dirname, '..', 'public', 'before-after');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// -------------------------------------------------------------
// 1. BEFORE IMAGE (Outdated, slow, legacy website design)
// -------------------------------------------------------------
const beforeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
  <defs>
    <linearGradient id="bgGradOld" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#cbd5e1" />
      <stop offset="100%" stop-color="#94a3b8" />
    </linearGradient>
    <linearGradient id="headerOld" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#334155" />
    </linearGradient>
    <linearGradient id="warnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#b91c1c" />
      <stop offset="100%" stop-color="#dc2626" />
    </linearGradient>
  </defs>

  <!-- Old OS Desktop Background -->
  <rect width="1280" height="720" fill="url(#bgGradOld)" />

  <!-- Outdated Browser Window Frame -->
  <rect x="40" y="30" width="1200" height="660" rx="6" fill="#e2e8f0" stroke="#64748b" stroke-width="2" />
  
  <!-- Browser Header & Address Bar -->
  <rect x="40" y="30" width="1200" height="42" fill="#94a3b8" />
  <circle cx="65" cy="51" r="6" fill="#ef4444" />
  <circle cx="85" cy="51" r="6" fill="#eab308" />
  <circle cx="105" cy="51" r="6" fill="#22c55e" />
  
  <!-- Old insecure HTTP address bar -->
  <rect x="140" y="38" width="800" height="26" rx="3" fill="#ffffff" stroke="#94a3b8" stroke-width="1" />
  <text x="155" y="55" font-family="monospace" font-size="12" fill="#dc2626">⚠️ Not Secure | http://legacy-slow-example.net/index.php?ref=old</text>
  
  <!-- Website Container -->
  <g transform="translate(60, 85)">
    <!-- Old Banner Header -->
    <rect width="1160" height="90" fill="url(#headerOld)" />
    <text x="1130" y="55" font-family="Arial, Tahoma, sans-serif" font-size="28" font-weight="bold" fill="#f8fafc" text-anchor="end">موقع الشركة للتجارة والخدمات (تصميم 2011)</text>
    <text x="1130" y="75" font-family="Arial, Tahoma, sans-serif" font-size="13" fill="#cbd5e1" text-anchor="end">أهلاً بكم في صفحتنا الرئيسية — جاري التحديث تحت الإنشاء</text>

    <!-- Navigation Bar (outdated ugly tabs) -->
    <rect y="90" width="1160" height="38" fill="#475569" stroke="#334155" stroke-width="1" />
    <g font-family="Tahoma, sans-serif" font-size="13" font-weight="bold" fill="#f1f5f9" text-anchor="middle">
      <rect x="1040" y="90" width="120" height="38" fill="#1e293b" />
      <text x="1100" y="114">الرئيسية</text>
      <line x1="1040" y1="90" x2="1040" y2="128" stroke="#334155" />
      <text x="960" y="114">من نحن</text>
      <line x1="880" y1="90" x2="880" y2="128" stroke="#334155" />
      <text x="800" y="114">الخدمات</text>
      <line x1="720" y1="90" x2="720" y2="128" stroke="#334155" />
      <text x="640" y="114">الأسعار</text>
      <line x1="560" y1="90" x2="560" y2="128" stroke="#334155" />
      <text x="480" y="114">سجل الزوار</text>
      <line x1="400" y1="90" x2="400" y2="128" stroke="#334155" />
      <text x="320" y="114">اتصل بنا</text>
    </g>

    <!-- Warning / Error Banner -->
    <rect y="138" width="1160" height="42" fill="url(#warnGrad)" rx="4" />
    <text x="580" y="164" font-family="Tahoma, sans-serif" font-size="15" font-weight="bold" fill="#ffffff" text-anchor="middle">
      ⚠️ تحذير المتصفح: وقت تحميل الصفحة بطيء جداً (6.8 ثوانٍ) • غير متجاوب مع شاشات الموبايل • نسبة فقدان العملاء 65%
    </text>

    <!-- Main Content Grid -->
    <!-- Left Sidebar (outdated widget style) -->
    <rect x="0" y="190" width="280" height="390" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1" />
    <rect x="0" y="190" width="280" height="32" fill="#334155" />
    <text x="260" y="212" font-family="Tahoma, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="end">القائمة الجانبية</text>
    
    <g font-family="Tahoma, sans-serif" font-size="12" fill="#475569">
      <rect x="15" y="235" width="250" height="28" fill="#e2e8f0" stroke="#cbd5e1" />
      <text x="250" y="254" text-anchor="end">❌ غير متوافق مع شاشات الجوال</text>
      <rect x="15" y="275" width="250" height="28" fill="#e2e8f0" stroke="#cbd5e1" />
      <text x="250" y="294" text-anchor="end">❌ بدون حماية أو شهادة SSL</text>
      <rect x="15" y="315" width="250" height="28" fill="#e2e8f0" stroke="#cbd5e1" />
      <text x="250" y="334" text-anchor="end">❌ استمارة اتصال قديمة معطلة</text>
      <rect x="15" y="355" width="250" height="28" fill="#e2e8f0" stroke="#cbd5e1" />
      <text x="250" y="374" text-anchor="end">❌ مظهر تقليدي لا يبني الثقة</text>
      <rect x="15" y="395" width="250" height="28" fill="#e2e8f0" stroke="#cbd5e1" />
      <text x="250" y="414" text-anchor="end">❌ غياب لوحة التحكم والتحليلات</text>
    </g>

    <rect x="15" y="445" width="250" height="115" fill="#fee2e2" stroke="#f87171" rx="4" />
    <text x="140" y="475" font-family="Tahoma, sans-serif" font-size="13" font-weight="bold" fill="#b91c1c" text-anchor="middle">نتائج الأداء القديم</text>
    <text x="140" y="500" font-family="Tahoma, sans-serif" font-size="12" fill="#7f1d1d" text-anchor="middle">سرعة التحميل: 6.8 ثوانٍ</text>
    <text x="140" y="525" font-family="Tahoma, sans-serif" font-size="12" fill="#7f1d1d" text-anchor="middle">Google PageSpeed: 24/100</text>
    <text x="140" y="545" font-family="Tahoma, sans-serif" font-size="12" fill="#b91c1c" text-anchor="middle">معدل ارتداد الزوار: مرتفع جداً</text>

    <!-- Main Content Area -->
    <rect x="300" y="190" width="860" height="390" fill="#ffffff" stroke="#94a3b8" stroke-width="1" />
    <text x="1135" y="225" font-family="Tahoma, sans-serif" font-size="20" font-weight="bold" fill="#1e293b" text-anchor="end">الموقع التقليدي القديم — صعوبة التصفح وضعف التحويل</text>
    <line x1="320" y1="240" x2="1140" y2="240" stroke="#cbd5e1" stroke-width="1" />

    <text x="1135" y="270" font-family="Tahoma, sans-serif" font-size="14" fill="#475569" text-anchor="end">
      المواقع القديمة تفقد أكثر من 60% من زوارها بسبب بطء التحميل وعدم التوافق مع شاشات الهواتف المحمولة.
    </text>
    <text x="1135" y="295" font-family="Tahoma, sans-serif" font-size="14" fill="#475569" text-anchor="end">
      تصميم غير مريح للعين، نصوص متكدسة، وعدم وجود أزرار واضحة لطلب الخدمة أو حجز المواعيد.
    </text>

    <!-- Cluttered outdated table -->
    <rect x="320" y="325" width="820" height="150" fill="#f8fafc" stroke="#94a3b8" />
    <rect x="320" y="325" width="820" height="32" fill="#e2e8f0" stroke="#94a3b8" />
    <text x="1120" y="346" font-family="Tahoma, sans-serif" font-size="13" font-weight="bold" fill="#334155" text-anchor="end">المشكلة</text>
    <text x="820" y="346" font-family="Tahoma, sans-serif" font-size="13" font-weight="bold" fill="#334155" text-anchor="end">النتيجة على البيزنس</text>
    <text x="480" y="346" font-family="Tahoma, sans-serif" font-size="13" font-weight="bold" fill="#334155" text-anchor="end">التأثير على المبيعات</text>

    <g font-family="Tahoma, sans-serif" font-size="12" fill="#475569">
      <line x1="320" y1="385" x2="1140" y2="385" stroke="#e2e8f0" />
      <text x="1120" y="375" text-anchor="end">بطء شديد في السيرفر والتحميل</text>
      <text x="820" y="375" text-anchor="end">مغادرة العميل قبل ظهور المحتوى</text>
      <text x="480" y="375" fill="#dc2626" font-weight="bold" text-anchor="end">خسارة 65% من العملاء المحتملين</text>

      <line x1="320" y1="425" x2="1140" y2="425" stroke="#e2e8f0" />
      <text x="1120" y="412" text-anchor="end">عدم دعم الشاشات الصغيرة والموبايل</text>
      <text x="820" y="412" text-anchor="end">عناصر مقصوصة وتجربة متعبة</text>
      <text x="480" y="412" fill="#dc2626" font-weight="bold" text-anchor="end">فشل إتمام طلبات الشراء والحجز</text>

      <text x="1120" y="450" text-anchor="end">غياب الأمان والتحديثات الدورية</text>
      <text x="820" y="450" text-anchor="end">تحذيرات أمنية من المتصفح للزائر</text>
      <text x="480" y="450" fill="#dc2626" font-weight="bold" text-anchor="end">انعدام ثقة العميل في العلامة التجارية</text>
    </g>

    <!-- Outdated Button -->
    <rect x="780" y="500" width="360" height="42" fill="#e2e8f0" stroke="#94a3b8" rx="3" />
    <text x="960" y="527" font-family="Tahoma, sans-serif" font-size="13" font-weight="bold" fill="#64748b" text-anchor="middle">زر قديم غير تفاعلي (اضغط هنا)</text>
  </g>
</svg>
`;

// -------------------------------------------------------------
// 2. AFTER IMAGE (Ultra-modern Click Zoon Dark Navy + Gold design)
// -------------------------------------------------------------
const afterSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
  <defs>
    <!-- Background & Glowing mesh gradients -->
    <linearGradient id="bgAfter" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070b14" />
      <stop offset="50%" stop-color="#0a1020" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <radialGradient id="goldGlow" cx="50%" cy="10%" r="60%">
      <stop offset="0%" stop-color="rgba(212, 175, 55, 0.22)" />
      <stop offset="60%" stop-color="rgba(212, 175, 55, 0.04)" />
      <stop offset="100%" stop-color="transparent" />
    </radialGradient>
    <radialGradient id="blueGlow" cx="90%" cy="80%" r="50%">
      <stop offset="0%" stop-color="rgba(30, 58, 138, 0.35)" />
      <stop offset="100%" stop-color="transparent" />
    </radialGradient>
    <linearGradient id="goldText" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#eab308" />
      <stop offset="100%" stop-color="#ca8a04" />
    </linearGradient>
    <linearGradient id="goldButton" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#facc15" />
      <stop offset="50%" stop-color="#eab308" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(15, 23, 42, 0.85)" />
      <stop offset="100%" stop-color="rgba(10, 16, 32, 0.95)" />
    </linearGradient>
    <filter id="shadowGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="rgba(0,0,0,0.6)" />
    </filter>
  </defs>

  <!-- Canvas Background -->
  <rect width="1280" height="720" fill="url(#bgAfter)" />
  <rect width="1280" height="720" fill="url(#goldGlow)" />
  <rect width="1280" height="720" fill="url(#blueGlow)" />

  <!-- Modern Browser Frame (Mac / Modern Chrome style) -->
  <rect x="40" y="30" width="1200" height="660" rx="16" fill="rgba(10, 16, 32, 0.95)" stroke="rgba(212, 175, 55, 0.35)" stroke-width="1.5" filter="url(#shadowGlow)" />
  
  <!-- Sleek Dark Browser Top Bar -->
  <rect x="40" y="30" width="1200" height="46" rx="16" fill="#030712" />
  <circle cx="68" cy="53" r="6" fill="#ef4444" />
  <circle cx="88" cy="53" r="6" fill="#eab308" />
  <circle cx="108" cy="53" r="6" fill="#22c55e" />

  <!-- Modern Secure URL Pill with Green Lock -->
  <rect x="145" y="40" width="460" height="26" rx="13" fill="#0f172a" stroke="rgba(51, 65, 85, 0.8)" stroke-width="1" />
  <circle cx="163" cy="53" r="4" fill="#22c55e" />
  <text x="176" y="57" font-family="'Cairo', sans-serif, system-ui" font-size="12" font-weight="600" fill="#94a3b8">https://clickzoon.com/agency-preview</text>
  <rect x="540" y="44" width="55" height="18" rx="9" fill="rgba(34, 197, 94, 0.15)" />
  <text x="567" y="57" font-family="'Cairo', sans-serif" font-size="10" font-weight="bold" fill="#4ade80" text-anchor="middle">SSL آمن</text>

  <!-- Website Interior -->
  <g transform="translate(60, 95)">
    <!-- Modern Header / Navbar -->
    <rect width="1160" height="65" rx="12" fill="rgba(15, 23, 42, 0.7)" stroke="rgba(212, 175, 55, 0.2)" stroke-width="1" />
    
    <!-- Brand Logo (Right side in RTL) -->
    <g transform="translate(1135, 18)">
      <rect x="-42" y="0" width="38" height="38" rx="10" fill="url(#goldButton)" />
      <text x="-23" y="24" font-family="'Cairo', sans-serif" font-size="18" font-weight="900" fill="#0a0f1d" text-anchor="middle">Z</text>
      <text x="-52" y="22" font-family="'Cairo', sans-serif" font-size="20" font-weight="900" fill="#ffffff" text-anchor="end">Click<tspan fill="#eab308">.Zoon</tspan></text>
      <text x="-52" y="34" font-family="'Cairo', sans-serif" font-size="9" fill="#94a3b8" text-anchor="end">وكالة تصميم وبرمجة المواقع الاحترافية</text>
    </g>

    <!-- Navigation Links -->
    <g font-family="'Cairo', sans-serif" font-size="14" font-weight="700" fill="#cbd5e1" text-anchor="middle">
      <text x="750" y="38">الرئيسية</text>
      <text x="660" y="38">خدماتنا</text>
      <text x="570" y="38">أعمالنا</text>
      <text x="480" y="38">الأسعار</text>
      <text x="390" y="38">آراء العملاء</text>
      <text x="300" y="38">تواصل معنا</text>
    </g>

    <!-- Header CTA Button (Left side in RTL) -->
    <rect x="25" y="14" width="140" height="38" rx="10" fill="url(#goldButton)" />
    <text x="95" y="38" font-family="'Cairo', sans-serif" font-size="13" font-weight="900" fill="#0a0f1d" text-anchor="middle">احجز ديمو مجاني ←</text>

    <!-- Hero Section Banner -->
    <g transform="translate(0, 95)">
      <!-- Top Badge -->
      <rect x="910" y="0" width="250" height="32" rx="16" fill="rgba(234, 179, 8, 0.12)" stroke="rgba(234, 179, 8, 0.35)" stroke-width="1" />
      <text x="1035" y="21" font-family="'Cairo', sans-serif" font-size="13" font-weight="800" fill="#fde047" text-anchor="middle">✨ منصات سريعة مصممة لمضاعفة الأرباح</text>

      <!-- Main Headline (Wrapped, Bold, RTL) -->
      <text x="1160" y="75" font-family="'Cairo', sans-serif" font-size="34" font-weight="900" fill="#f8fafc" text-anchor="end">
        موقعك الإلكتروني بهوية استثنائية وسرعة خارقة
      </text>
      <text x="1160" y="120" font-family="'Cairo', sans-serif" font-size="34" font-weight="900" fill="url(#goldText)" text-anchor="end">
        تضمن تحويل الزوار إلى عملاء حقيقيين
      </text>

      <!-- Subheadline -->
      <text x="1160" y="160" font-family="'Cairo', sans-serif" font-size="16" fill="#cbd5e1" text-anchor="end">
        تصميم متجاوب 100% مع جميع الأجهزة • تحميل فوري في أجزاء من الثانية • لوحة تحكم سهلة وتجربة مستخدم فاخرة.
      </text>

      <!-- Main Action Buttons -->
      <g transform="translate(1160, 185)">
        <rect x="-220" y="0" width="220" height="50" rx="14" fill="url(#goldButton)" filter="url(#shadowGlow)" />
        <text x="-110" y="32" font-family="'Cairo', sans-serif" font-size="16" font-weight="900" fill="#0a0f1d" text-anchor="middle">ابدأ مشروعك الآن ←</text>

        <rect x="-420" y="0" width="180" height="50" rx="14" fill="rgba(15, 23, 42, 0.8)" stroke="rgba(212, 175, 55, 0.4)" stroke-width="1.5" />
        <text x="-330" y="32" font-family="'Cairo', sans-serif" font-size="15" font-weight="800" fill="#fef08a" text-anchor="middle">شاهد معرض الأعمال</text>
      </g>
    </g>

    <!-- 3 Modern Feature Cards (Replacing old static metrics) -->
    <g transform="translate(0, 365)">
      <!-- Card 1 -->
      <rect x="780" y="0" width="380" height="175" rx="16" fill="url(#cardGrad)" stroke="rgba(212, 175, 55, 0.25)" stroke-width="1" />
      <circle cx="1120" cy="40" r="18" fill="rgba(234, 179, 8, 0.15)" />
      <text x="1120" y="46" font-family="'Cairo', sans-serif" font-size="18" font-weight="900" fill="#facc15" text-anchor="middle">⚡</text>
      <text x="1085" y="45" font-family="'Cairo', sans-serif" font-size="18" font-weight="900" fill="#f8fafc" text-anchor="end">سرعة فائقة وتجاوب كامل</text>
      <text x="1125" y="85" font-family="'Cairo', sans-serif" font-size="13" fill="#cbd5e1" text-anchor="end">أكواد محسنة تمنحك استجابة فورية</text>
      <text x="1125" y="108" font-family="'Cairo', sans-serif" font-size="13" fill="#cbd5e1" text-anchor="end">دون انتظار، وتعمل بسلاسة على كافة الهواتف.</text>
      <rect x="815" y="130" width="310" height="26" rx="8" fill="rgba(34, 197, 94, 0.12)" stroke="rgba(34, 197, 94, 0.3)" />
      <text x="970" y="148" font-family="'Cairo', sans-serif" font-size="12" font-weight="800" fill="#4ade80" text-anchor="middle">✓ أداء معتمد 99/100 على PageSpeed</text>

      <!-- Card 2 -->
      <rect x="390" y="0" width="370" height="175" rx="16" fill="url(#cardGrad)" stroke="rgba(212, 175, 55, 0.25)" stroke-width="1" />
      <circle cx="720" cy="40" r="18" fill="rgba(234, 179, 8, 0.15)" />
      <text x="720" y="46" font-family="'Cairo', sans-serif" font-size="18" font-weight="900" fill="#facc15" text-anchor="middle">🎯</text>
      <text x="685" y="45" font-family="'Cairo', sans-serif" font-size="18" font-weight="900" fill="#f8fafc" text-anchor="end">تجربة مستخدم ترفع المبيعات</text>
      <text x="725" y="85" font-family="'Cairo', sans-serif" font-size="13" fill="#cbd5e1" text-anchor="end">مسارات طلب واضحة ومباشرة تقلل</text>
      <text x="725" y="108" font-family="'Cairo', sans-serif" font-size="13" fill="#cbd5e1" text-anchor="end">تردد الزائر وتوجهه مباشرة للتواصل والشراء.</text>
      <rect x="420" y="130" width="310" height="26" rx="8" fill="rgba(234, 179, 8, 0.12)" stroke="rgba(234, 179, 8, 0.3)" />
      <text x="575" y="148" font-family="'Cairo', sans-serif" font-size="12" font-weight="800" fill="#fde047" text-anchor="middle">✓ معدل تحويل مضاعف واحتفاظ بالعملاء</text>

      <!-- Card 3 -->
      <rect x="0" y="0" width="370" height="175" rx="16" fill="url(#cardGrad)" stroke="rgba(212, 175, 55, 0.25)" stroke-width="1" />
      <circle cx="330" cy="40" r="18" fill="rgba(234, 179, 8, 0.15)" />
      <text x="330" y="46" font-family="'Cairo', sans-serif" font-size="18" font-weight="900" fill="#facc15" text-anchor="middle">🛡️</text>
      <text x="295" y="45" font-family="'Cairo', sans-serif" font-size="18" font-weight="900" fill="#f8fafc" text-anchor="end">حماية موثوقة وهوية ذهبية</text>
      <text x="335" y="85" font-family="'Cairo', sans-serif" font-size="13" fill="#cbd5e1" text-anchor="end">تشفير SSL متكامل، ولوحة تحكم حصرية</text>
      <text x="335" y="108" font-family="'Cairo', sans-serif" font-size="13" fill="#cbd5e1" text-anchor="end">لإدارة المحتوى والطلبات بكل سهولة وأمان.</text>
      <rect x="30" y="130" width="310" height="26" rx="8" fill="rgba(56, 189, 248, 0.12)" stroke="rgba(56, 189, 248, 0.3)" />
      <text x="185" y="148" font-family="'Cairo', sans-serif" font-size="12" font-weight="800" fill="#38bdf8" text-anchor="middle">✓ هوية تجارية تبني الثقة من اللحظة الأولى</text>
    </g>
  </g>
</svg>
`;

async function generate() {
  console.log('Rendering before.webp...');
  await sharp(Buffer.from(beforeSvg))
    .webp({ quality: 90 })
    .toFile(path.join(outDir, 'before.webp'));

  console.log('Rendering after.webp...');
  await sharp(Buffer.from(afterSvg))
    .webp({ quality: 90 })
    .toFile(path.join(outDir, 'after.webp'));

  console.log('Done! Generated public/before-after/before.webp and after.webp');
}

generate().catch(err => {
  console.error('Error generating before-after images:', err);
  process.exit(1);
});

