# 🔐 نظام الرسائل الآمن مع Kyber768 الحقيقي

تطبيق عميل بلغة Rust يوفر تشفير الرسائل باستخدام خوارزمية **Kyber768 الحقيقية** لتبادل المفاتيح والتشفير المتقدم.

## ✨ الميزات

- **تبادل المفاتيح**: استخدام خوارزمية **Kyber768 الحقيقية** لما بعد الكم
- **تشفير الرسائل**: تشفير AES-256-GCM للرسائل
- **أمان عالي**: لا يتم تخزين المفاتيح الخاصة على السيرفر
- **واجهة تفاعلية**: أوامر سهلة الاستخدام باللغة العربية والإنجليزية
- **اتصال آمن**: HTTPS مع السيرفر كوسيط فقط

## 🏗️ البنية التقنية

### Kyber768 الحقيقي
- **خوارزمية معتمدة من NIST**: مقاومة للحوسبة الكمية
- **مفاتيح 256 بت**: أمان عالي
- **حجم المفتاح العام**: 1184 بايت
- **حجم المفتاح الخاص**: 2400 بايت
- **حجم النص المشفر**: 1088 بايت
- **حجم المفتاح المشترك**: 32 بايت

### التشفير
- **AES-256-GCM**: تشفير الرسائل
- **Nonce عشوائي**: لكل رسالة
- **مفاتيح مشتركة**: مشتقة من تبادل Kyber768

## 🚀 التثبيت والتشغيل

### المتطلبات
- Rust 1.70+
- Node.js (لتشغيل السيرفر)
- **liboqs** (مكتبة Kyber768)

### 1. تثبيت Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

### 2. تثبيت liboqs

#### على Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install build-essential cmake git
sudo apt-get install liboqs-dev
```

#### على macOS:
```bash
brew install cmake git
brew install liboqs
```

#### على Windows:
```bash
# تثبيت vcpkg
git clone https://github.com/Microsoft/vcpkg.git
cd vcpkg
./bootstrap-vcpkg.bat
./vcpkg integrate install
./vcpkg install liboqs:x64-windows
```

#### تثبيت من المصدر:
```bash
git clone https://github.com/open-quantum-safe/liboqs.git
cd liboqs
mkdir build && cd build
cmake -GNinja ..
ninja
sudo ninja install
```

### 3. بناء التطبيق
```bash
cd secure-messaging-client
cargo build --release
```

### 4. تشغيل السيرفر
```bash
# في مجلد آخر
node messaging-server.js
```

### 5. تشغيل العميل
```bash
./target/release/secure-messaging-client
```

## 📖 كيفية الاستخدام

### تسجيل الدخول
```
رسالة> login
أدخل معرف المستخدم: alice
```

### عرض المستخدمين
```
رسالة> users
```

### إرسال رسالة مشفرة
```
رسالة> send
إلى من: bob
المحتوى: مرحباً! هذه رسالة مشفرة
```

### عرض صندوق الوارد
```
رسالة> inbox
```

### المساعدة
```
رسالة> help
```

## 🔐 عملية التشفير

### 1. إنشاء المفاتيح
- كل مستخدم ينشئ زوج مفاتيح **Kyber768 الحقيقي**
- المفتاح العام يُرسل للسيرفر
- المفتاح الخاص يُحفظ محلياً فقط

### 2. تبادل المفاتيح
- عند إرسال رسالة، يتم تبادل المفاتيح مع المستلم
- استخدام خوارزمية **Kyber768 الحقيقية** لتوليد مفتاح مشترك
- المفتاح المشترك يُحفظ محلياً

### 3. تشفير الرسالة
- استخدام المفتاح المشترك كمفتاح AES
- تشفير الرسالة باستخدام AES-256-GCM
- إضافة nonce عشوائي لكل رسالة

### 4. إرسال الرسالة
- الرسالة المشفرة تُرسل للسيرفر
- السيرفر لا يمكنه فك تشفير المحتوى
- السيرفر يعمل كوسيط فقط

## 🛡️ الأمان

### حماية المفاتيح
- المفاتيح الخاصة لا تغادر الجهاز المحلي
- المفاتيح المشتركة تُحفظ في الذاكرة فقط
- لا يتم تخزين أي معلومات حساسة على السيرفر

### مقاومة الهجمات
- **هجمات الكم**: **Kyber768 الحقيقي** مقاوم للحوسبة الكمية
- **هجمات التشفير**: AES-256-GCM يوفر أمان عالي
- **هجمات الوسيط**: تبادل المفاتيح آمن

### معايير الأمان
- **NIST PQC**: Kyber768 معتمد من المعهد الوطني للمعايير والتكنولوجيا
- **مستوى الأمان**: 128 بت ضد الهجمات الكمية
- **مقاومة الكم**: آمن ضد خوارزميات Shor و Grover

## 🔧 التخصيص

### تغيير عنوان السيرفر
```rust
let server_url = "http://your-server:port".to_string();
```

### تغيير خوارزمية التشفير
```rust
// في EncryptionManager::encrypt_message
let cipher = Aes128Gcm::new(key); // بدلاً من Aes256Gcm
```

### إضافة خوارزميات تشفير إضافية
```rust
// إضافة ChaCha20-Poly1305
use chacha20poly1305::{ChaCha20Poly1305, Key, Nonce};
```

## 🐛 استكشاف الأخطاء

### مشاكل الاتصال
```bash
# تأكد من تشغيل السيرفر
curl http://localhost:8080/api/health
```

### مشاكل التشفير
```bash
# تأكد من تثبيت liboqs
pkg-config --exists liboqs && echo "liboqs installed" || echo "liboqs not found"

# تأكد من تثبيت المكتبات
cargo check
```

### مشاكل الذاكرة
```bash
# تنظيف البناء
cargo clean
cargo build --release
```

### مشاكل liboqs
```bash
# تأكد من وجود المكتبة
ldconfig -p | grep oqs

# إعادة تثبيت liboqs
sudo apt-get remove liboqs-dev
sudo apt-get install liboqs-dev
```

## 📚 المكتبات المستخدمة

- **liboqs-sys**: خوارزمية **Kyber768 الحقيقية**
- **aes-gcm**: تشفير AES-256-GCM
- **rand**: توليد أرقام عشوائية
- **reqwest**: عميل HTTP
- **tokio**: وقت تشغيل غير متزامن
- **serde**: تسلسل البيانات
- **rustyline**: واجهة سطر الأوامر التفاعلية

## 🔮 التطويرات المستقبلية

- [ ] دعم تشفير من طرف إلى طرف
- [ ] إضافة توقيعات رقمية
- [ ] دعم الملفات المشفرة
- [ ] واجهة رسومية
- [ ] دعم الأجهزة المحمولة
- [ ] تخزين آمن للمفاتيح
- [ ] دعم خوارزميات PQC إضافية

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT.

## 🤝 المساهمة

نرحب بالمساهمات! يرجى:
1. Fork المشروع
2. إنشاء فرع للميزة الجديدة
3. إرسال Pull Request

## 📞 الدعم

للأسئلة والمشاكل:
- افتح Issue في GitHub
- راجع قسم استكشاف الأخطاء
- تأكد من تحديث المكتبات
- تأكد من تثبيت liboqs بشكل صحيح

## 🔗 روابط مفيدة

- [liboqs GitHub](https://github.com/open-quantum-safe/liboqs)
- [NIST PQC Project](https://csrc.nist.gov/projects/post-quantum-cryptography)
- [Kyber Algorithm](https://pq-crystals.org/kyber/)
- [Rust Book](https://doc.rust-lang.org/book/)

---

**ملاحظة**: هذا التطبيق يستخدم **Kyber768 الحقيقي** من مكتبة liboqs. للاستخدام الإنتاجي، تأكد من مراجعة إعدادات الأمان وإجراء اختبارات شاملة.
