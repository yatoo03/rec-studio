# نشر REC.STUDIO على الإنترنت (Vercel)

## قبل البدء
- يجب أن يعمل الموقع على جهازك أولًا وأن ينجح فحص AWS في `start.bat`.
- خطة Vercel المجانية (Hobby) مخصصة للاستخدام الشخصي غير التجاري. لاستخدامه في عمل الاستوديو راجع صفحة الأسعار والشروط في vercel.com واختر الخطة المناسبة.

## 1) GitHub
1. أنشئ حسابًا على github.com.
2. New repository، الاسم `rec-studio`، اختر **Private**، ثم Create.
3. اضغط "uploading an existing file"، واسحب **محتويات** مجلد `rec-studio` (وليس ملف zip).
   لا ترفع `.env.local` ولا `node_modules` أبدًا.
4. Commit changes.

## 2) Vercel
1. على vercel.com سجّل الدخول عبر GitHub.
2. Add New ثم Project، واختر مستودع `rec-studio` واضغط Import.
3. اسم المشروع (Project Name): `rec-studio`. هذا الاسم يصبح عنوان الموقع: `rec-studio.vercel.app`، وإن كان محجوزًا يضيف Vercel رقمًا.
4. افتح Environment Variables وأضف هذه المتغيرات (الاسم ثم القيمة). القيم نفسها الموجودة في `.env.local` على جهازك:
   - `REC_AWS_REGION`
   - `REC_AWS_ACCESS_KEY_ID`
   - `REC_AWS_SECRET_ACCESS_KEY`
   - `S3_BUCKET`
   - `ADMIN_USER`
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET`
   - `FACE_MATCH_THRESHOLD` بقيمة `90`
5. اضغط Deploy وانتظر دقيقة أو دقيقتين.

## 3) ربط S3 بعنوان الموقع
في AWS: S3 ثم الـ bucket ثم Permissions ثم CORS. أضف عنوان موقعك إلى `AllowedOrigins`، مثل:
`"https://rec-studio.vercel.app"`
(وأضف أي نطاق خاص تربطه لاحقًا). بدون هذه الخطوة يفشل رفع الصور من المتصفح.

## 4) التجربة
1. افتح `https://اسم-موقعك/login` وسجّل الدخول.
2. أنشئ فعالية، وارفع 10 صور فيها وجهك.
3. افتح رابط الفعالية من هاتفك وجرّب السيلفي.

## نطاق خاص باسم التطبيق (اختياري)
- شراء النطاق من أي مسجّل نطاقات (مثل recstudio.com). أو استخدم نطاقًا فرعيًا من نطاق الاستوديو الحالي (مثل photos.نطاقك.com).
- في Vercel: Project ثم Settings ثم Domains ثم Add، واكتب النطاق. سيعرض لك سجلات DNS (A أو CNAME) تضيفها في لوحة المسجّل. ينتظر التفعيل من دقائق إلى ساعات.
- أضف النطاق الجديد إلى CORS في S3 (الخطوة 3).

## بعد التحديثات
أي تعديل على الكود: ارفع الملف المعدّل إلى GitHub وسيُنشر تلقائيًا.
