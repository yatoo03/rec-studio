# إعداد AWS لـ REC.STUDIO

## 1) إنشاء الحساب
أنشئ حسابًا على aws.amazon.com (يتطلب بطاقة دفع). بعد الدخول اختر المنطقة **eu-central-1 (Frankfurt)** من أعلى الصفحة، وتأكد أن كل الخطوات التالية تتم في المنطقة نفسها.

## 2) إنشاء الـ Bucket (S3)
- S3 ← Create bucket، اسم فريد مثل `rec-studio-photos-2026`.
- أبقِ **Block all public access** مفعّلًا. الصور تُعرض عبر روابط مؤقتة، لا بشكل عام.
- من تبويب Permissions ← **CORS** الصق:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": ["http://localhost:3000", "https://localhost:3000", "https://YOUR-DOMAIN"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```

## 3) إنشاء مستخدم بصلاحيات محدودة (IAM)
- IAM ← Policies ← Create policy ← JSON (استبدل BUCKET باسم الـ bucket):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Action": ["s3:PutObject", "s3:GetObject"], "Resource": "arn:aws:s3:::BUCKET/*" },
    { "Effect": "Allow", "Action": "s3:ListBucket", "Resource": "arn:aws:s3:::BUCKET" },
    { "Effect": "Allow", "Action": ["rekognition:CreateCollection", "rekognition:IndexFaces", "rekognition:SearchFacesByImage"], "Resource": "*" }
  ]
}
```
- IAM ← Users ← Create user (مثل `rec-studio-app`) وألصق عليه هذه الـ policy.
- من المستخدم: Security credentials ← **Create access key** ← Application running outside AWS. انسخ المفتاحين.

## 4) الإعدادات والتشغيل
- انقر مرتين على **start.bat**. أول مرة سيثبّت الحزم ثم يسألك عن: المنطقة، وAccess key ID، وSecret access key، واسم الـ bucket، واسم مستخدم وكلمة مرور للوحة التحكم. يكتب لك ملف `.env.local` تلقائيًا، ثم يفحص الاتصال بـ AWS ويخبرك بالخطأ إن وُجد.
- لإعادة إدخال القيم لاحقًا (مثل تغيير المفتاح) انقر مرتين على **setup.bat**.
- بعدها افتح العنوان الظاهر بعد `Local:` وأضف إليه `/login`.
- لا ترسل المفتاح السري لأي أحد، ولا ترفع `.env.local` إلى أي مكان.
