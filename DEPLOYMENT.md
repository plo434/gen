# دليل نشر المشروع على الخوادم المجانية

## 🚀 النشر على Render (الأسهل)

### 1. إنشاء حساب Render
- اذهب إلى https://render.com
- سجل حساب جديد
- اربط حساب GitHub

### 2. رفع المشروع
- اضغط "New +" ثم اختر "Web Service"
- اربط مستودع GitHub
- اختر المستودع الخاص بك
- اترك الإعدادات الافتراضية

### 3. إعدادات النشر
- **Name**: secure-messaging-system
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Port**: 10000

### 4. متغيرات البيئة
```
NODE_ENV=production
PORT=10000
```

## 🌐 النشر على Railway

### 1. إنشاء حساب Railway
- اذهب إلى https://railway.app
- سجل حساب جديد

### 2. رفع المشروع
- اضغط "Start a New Project"
- اختر "Deploy from GitHub repo"
- اختر المستودع

### 3. إعدادات النشر
- **Build Command**: `npm install`
- **Start Command**: `npm start`

## ☁️ النشر على Heroku

### 1. إنشاء حساب Heroku
- اذهب إلى https://heroku.com
- سجل حساب جديد

### 2. تثبيت Heroku CLI
```bash
npm install -g heroku
```

### 3. تسجيل الدخول
```bash
heroku login
```

### 4. إنشاء التطبيق
```bash
heroku create your-app-name
```

### 5. رفع الكود
```bash
git add .
git commit -m "Initial deployment"
git push heroku main
```

## 🔧 استكشاف الأخطاء

### مشاكل شائعة:
1. **Port binding error**: تأكد من استخدام `process.env.PORT`
2. **Build failed**: تأكد من وجود `package.json` صحيح
3. **Runtime error**: تحقق من سجلات الخطأ في لوحة التحكم

### اختبار التطبيق:
```bash
# اختبار محلي
npm start

# اختبار API
curl http://localhost:8080/api/health
```

## 📱 الوصول للتطبيق

بعد النشر، ستحصل على رابط مثل:
- Render: `https://your-app.onrender.com`
- Railway: `https://your-app.railway.app`
- Heroku: `https://your-app.herokuapp.com`

## 🔒 الأمان

- تأكد من عدم رفع ملفات `.env` أو مفاتيح خاصة
- استخدم HTTPS في الإنتاج
- قم بتحديث التبعيات بانتظام
