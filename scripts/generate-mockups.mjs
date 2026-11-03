import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const mockupsDir = path.resolve('public/mockups');
if (!fs.existsSync(mockupsDir)) {
  fs.mkdirSync(mockupsDir, { recursive: true });
}

const mockups = [
  {
    filename: 'mockup-1-restaurant',
    brand: 'مطعم قصر الريم',
    domain: 'qasrelreem.clickzoon.com',
    category: 'مطعم ومشويات',
    primaryColor: '#e9b73a',
    accentColor: '#ef4444',
    bg: '#0f172a',
    cardBg: '#1e293b',
    headline: 'أشهى المشويات المصرية على أصولها',
    subline: 'توصيل سريع ساخن لجميع مناطق المنصورة',
    badge: 'خصم 20% على طلبات الأونلاين',
    cta: 'اطلب من المنيو',
    items: [
      { name: 'كباب وكفتة ضاني مشوي', price: '٢٨٠ ج.م' },
      { name: 'طاجن ريش بتلو بالبصل', price: '٣٢٠ ج.م' },
      { name: 'وجبة ميكس جريل قصر الريم', price: '٣٥٠ ج.م' },
    ],
  },
  {
    filename: 'mockup-2-cafe',
    brand: 'روست كافيه &amp; كوفي بار',
    domain: 'roastcafe.clickzoon.com',
    category: 'كافيه وسبيشالتي كوفي',
    primaryColor: '#d4af37',
    accentColor: '#0d9488',
    bg: '#141416',
    cardBg: '#232326',
    headline: 'قهوة مختصة محضّرة بشغف وإتقان',
    subline: 'أجود حبوب البن المحمصة طازجة يومياً',
    badge: 'جلسات رايقة + إنترنت سريع',
    cta: 'استكشف قائمة المشروبات',
    items: [
      { name: 'إسبيرسو كولومبي سنجل أوريجن', price: '٦٥ ج.م' },
      { name: 'فلات وايت بحليب اللوز', price: '٨٥ ج.م' },
      { name: 'سبيشال دريب V60 إثيوبي', price: '٩٥ ج.م' },
    ],
  },
  {
    filename: 'mockup-3-store',
    brand: 'متجر مودانيستا للأزياء',
    domain: 'modanista.clickzoon.com',
    category: 'متجر إلكتروني متكامل',
    primaryColor: '#f43f5e',
    accentColor: '#fbbf24',
    bg: '#090d16',
    cardBg: '#151c2c',
    headline: 'أحدث صيحات الموضة والأزياء العصرية',
    subline: 'شحن لجميع المحافظات والدفع عند الاستلام',
    badge: 'تخفيضات الموسم الجديد حتى 40%',
    cta: 'تسوق الكولكشن الآن',
    items: [
      { name: 'سويت شيرت كاجوال بريميوم', price: '٤٩٠ ج.م' },
      { name: 'جاكيت وتربروف مبطن شتوي', price: '٨٥٠ ج.م' },
      { name: 'حذاء كلاسيك جلد طبيعي', price: '٧٥٠ ج.م' },
    ],
  },
  {
    filename: 'mockup-4-medical',
    brand: 'مركز النور الطبي التخصصي',
    domain: 'alnoormedical.clickzoon.com',
    category: 'عيادات ومراكز طبية',
    primaryColor: '#0ea5e9',
    accentColor: '#10b981',
    bg: '#0a192f',
    cardBg: '#172a45',
    headline: 'رعاية صحية متكاملة بأحدث التقنيات',
    subline: 'نخبة من الاستشاريين في كافة التخصصات الطبية',
    badge: 'حجز مواعيد أونلاين على مدار الساعة',
    cta: 'احجز استشارتك الآن',
    items: [
      { name: 'عيادة طب وجراحة العيون', price: 'كشف متاح' },
      { name: 'مركز الأسنان وزراعة وتجميل', price: 'حجز فوري' },
      { name: 'قسم الباطنة والتحاليل الدقيقة', price: 'طوارئ 24/7' },
    ],
  },
];

for (const m of mockups) {
  // 1. Desktop 800x450
  const desktopSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${m.bg}" />
        <stop offset="100%" stop-color="#020617" />
      </linearGradient>
      <linearGradient id="primaryGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${m.primaryColor}" />
        <stop offset="100%" stop-color="${m.accentColor}" />
      </linearGradient>
    </defs>

    <rect width="800" height="450" fill="url(#bgGrad)" />

    <!-- Website Header Bar -->
    <rect y="28" width="800" height="52" fill="${m.cardBg}" opacity="0.95" />
    <circle cx="750" cy="54" r="14" fill="${m.primaryColor}" opacity="0.2" />
    <circle cx="750" cy="54" r="8" fill="${m.primaryColor}" />
    <text x="730" y="59" fill="#f8fafc" font-size="15" font-family="'Cairo', sans-serif" font-weight="bold" text-anchor="end">${m.brand}</text>

    <!-- Nav links -->
    <text x="460" y="58" fill="#94a3b8" font-size="12" font-family="'Cairo', sans-serif">الرئيسية</text>
    <text x="390" y="58" fill="#94a3b8" font-size="12" font-family="'Cairo', sans-serif">الخدمات</text>
    <text x="320" y="58" fill="#94a3b8" font-size="12" font-family="'Cairo', sans-serif">المنيو</text>
    <text x="250" y="58" fill="#94a3b8" font-size="12" font-family="'Cairo', sans-serif">تواصل معنا</text>

    <!-- Header CTA -->
    <rect x="50" y="40" width="110" height="30" rx="6" fill="${m.primaryColor}" />
    <text x="105" y="60" fill="#0f172a" font-size="11" font-family="'Cairo', sans-serif" font-weight="bold" text-anchor="middle">طلب أونلاين</text>

    <!-- Hero section in mockup -->
    <rect x="520" y="105" width="230" height="24" rx="12" fill="${m.primaryColor}" opacity="0.15" />
    <text x="635" y="121" fill="${m.primaryColor}" font-size="11" font-family="'Cairo', sans-serif" font-weight="bold" text-anchor="middle">${m.badge}</text>

    <text x="750" y="170" fill="#ffffff" font-size="24" font-family="'Cairo', sans-serif" font-weight="900" text-anchor="end">${m.headline}</text>
    <text x="750" y="200" fill="#cbd5e1" font-size="13" font-family="'Cairo', sans-serif" text-anchor="end">${m.subline}</text>

    <!-- CTA button -->
    <rect x="610" y="225" width="140" height="38" rx="8" fill="url(#primaryGrad)" />
    <text x="680" y="249" fill="#0f172a" font-size="13" font-family="'Cairo', sans-serif" font-weight="bold" text-anchor="middle">${m.cta}</text>

    <!-- Cards grid inside mockup -->
    ${m.items.map((item, idx) => `
      <g transform="translate(${50 + idx * 235}, 290)">
        <rect width="215" height="130" rx="10" fill="${m.cardBg}" stroke="#334155" stroke-width="1" />
        <rect x="15" y="15" width="185" height="55" rx="6" fill="#0f172a" opacity="0.6" />
        <circle cx="107" cy="42" r="16" fill="${m.primaryColor}" opacity="0.25" />
        <text x="107" y="47" fill="${m.primaryColor}" font-size="13" font-family="'Cairo', sans-serif" font-weight="bold" text-anchor="middle">★</text>
        <text x="195" y="92" fill="#f8fafc" font-size="12" font-family="'Cairo', sans-serif" font-weight="bold" text-anchor="end">${item.name}</text>
        <text x="195" y="112" fill="${m.primaryColor}" font-size="12" font-family="'Cairo', sans-serif" font-weight="bold" text-anchor="end">${item.price}</text>
        <rect x="20" y="93" width="60" height="22" rx="4" fill="${m.primaryColor}" opacity="0.2" />
        <text x="50" y="108" fill="${m.primaryColor}" font-size="10" font-family="'Cairo', sans-serif" font-weight="bold" text-anchor="middle">طلب</text>
      </g>
    `).join('')}
  </svg>`;

  await sharp(Buffer.from(desktopSvg))
    .webp({ quality: 90 })
    .toFile(path.join(mockupsDir, `${m.filename}.webp`));

  console.log(`Generated ${m.filename}.webp`);
}

// Also generate og-image.webp in public/
const ogSvg = fs.readFileSync('public/og-image.svg');
await sharp(ogSvg).webp({ quality: 90 }).toFile('public/og-image.webp');
console.log('Generated public/og-image.webp');
