# PiGigs 🚀

سوق رقمي ممتثل للخدمات المصغرة يعمل حصرياً داخل بيئة متصفح **Pi Browser** ويستخدم عملة Pi كوسيط نفعي حقيقي لتبادل المنافع والخدمات.

Developed by **@Fuad207**. An independent utility app.

---

## 📸 نظرة عامة

- ✅ تسجيل الدخول عبر متصفح Pi Network
- ✅ إضافة خدمات رقمية (تصميم، كتابة، برمجة، منتجات رقمية)
- ✅ شراء الخدمات باستخدام عملة Pi (Sandbox)
- ✅ لوحة تحكم بسيطة بالعربية والإنجليزية
- ✅ حماية كاملة ضد التلاعب بالأسعار وهجمات XSS

---

## 🛠️ التقنيات المستخدمة

| التقنية | الوصف |
|---------|-------|
| Next.js 14 | إطار العمل الرئيسي (App Router) |
| Firebase | قاعدة البيانات والمصادقة |
| Pi SDK | الدفع عبر شبكة Pi Network |
| Tailwind CSS | تنسيق الواجهات |
| DOMPurify | تنظيف المدخلات لمنع هجمات XSS |
| JWT | إدارة الجلسات الأمنة |

---

## 📁 هيكل المشروع

```text
pigigs/
├── app/
│   ├── api/
│   │   ├── auth/pi/route.js       # تسجيل الدخول
│   │   ├── pi/approve/route.js    # الموافقة على الدفع
│   │   ├── pi/complete/route.js   # إكمال الدفع
│   │   ├── services/route.js      # إدارة الخدمات
│   │   └── orders/route.js        # الطلبات
│   ├── layout.js
│   ├── page.js                    # الصفحة الرئيسية
│   └── globals.css
├── components/
│   └── AddServiceForm.js          # نموذج إضافة خدمة
├── lib/
│   ├── firebase.js                # Firebase Client
│   ├── firebaseAdmin.js           # Firebase Admin
│   ├── jwt.js                     # إدارة JWT
│   └── validatePiToken.js         # التحقق من Pi Token
├── middleware.js                   # جدار الحماية
└── firestore.rules                # قواعد أمان Firestore