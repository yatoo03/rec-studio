export type Lang = "ar" | "en";

const ar = {
  headline: "ابحث عن صورك",
  sub: "التقط سيلفي، ونعرض لك كل صورك من الفعالية.",
  selfie: "التقط صورة للبحث",
  gallery: "أو ارفع صورة من الاستوديو",
  privacy: "تُستخدم صورتك للبحث فقط ولا يتم حفظها.",
  hint: "ضع وجهك داخل الإطار",
  capture: "التقاط",
  back: "رجوع",
  cameraDenied: "تعذّر الوصول إلى الكاميرا. اسمح بالوصول من إعدادات المتصفح، أو ارفع صورة من الاستوديو.",
  analyzing: "جاري تحليل الوجه...",
  analyzingSub: "نبحث في كل صور الفعالية",
  resultsTitle: (n: number) =>
    n === 1 ? "وجدنا صورة واحدة لك" : n === 2 ? "وجدنا صورتين لك" : n <= 10 ? `وجدنا ${n} صور لك` : `وجدنا ${n} صورة لك`,
  resultsSub: "اضغط تحميل لحفظ الصورة الأصلية.",
  download: "تحميل بجودة عالية",
  again: "ابحث بصورة أخرى",
  emptyTitle: "لم نجد صورك",
  emptyBody: "جرّب صورة بإضاءة أوضح ووجهك ظاهر بالكامل. وقد لا تكون صورك رُفعت بعد، فعاود المحاولة لاحقًا.",
  errorTitle: "تعذّر إكمال البحث",
  errorBody: "تحقق من الاتصال بالإنترنت وحاول مرة أخرى.",
  switchTo: "EN",
};

const en: typeof ar = {
  headline: "Find your photos",
  sub: "Take a selfie and we'll show you every photo of you from the event.",
  selfie: "Take a selfie to search",
  gallery: "Or upload from your gallery",
  privacy: "Your photo is only used to search and is not stored.",
  hint: "Place your face inside the frame",
  capture: "Capture",
  back: "Back",
  cameraDenied: "Camera access is blocked. Allow it in your browser settings, or upload a photo from your gallery.",
  analyzing: "Analyzing face...",
  analyzingSub: "Searching every photo from the event",
  resultsTitle: (n: number) => (n === 1 ? "We found 1 photo of you" : `We found ${n} photos of you`),
  resultsSub: "Tap download to save the original.",
  download: "Download high-res",
  again: "Search with another photo",
  emptyTitle: "No photos found",
  emptyBody: "Try a brighter photo with your whole face visible. Your photos may not be uploaded yet, so check back later.",
  errorTitle: "Search failed",
  errorBody: "Check your connection and try again.",
  switchTo: "عربي",
};

export const strings = { ar, en };
export type Strings = typeof ar;
