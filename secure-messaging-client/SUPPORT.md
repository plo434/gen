# 🆘 دليل الدعم

## 📞 طرق الحصول على المساعدة

### 🚨 المشاكل العاجلة
إذا كنت تواجه مشكلة أمنية أو مشكلة حرجة:
- **البريد الإلكتروني**: security@your-domain.com
- **Signal**: [رقم الهاتف]
- **رد فوري**: خلال 24 ساعة

### 💬 المساعدة العامة
للمشاكل العامة والأسئلة:
- **GitHub Issues**: [رابط المشروع]
- **GitHub Discussions**: [رابط المناقشات]
- **Discord**: [رابط السيرفر]
- **رد عادي**: خلال 48 ساعة

### 📚 المساعدة الذاتية
قبل طلب المساعدة، راجع:
- [README.md](README.md) - الدليل الرئيسي
- [FAQ.md](FAQ.md) - الأسئلة الشائعة
- [build-instructions.md](build-instructions.md) - تعليمات البناء
- [examples/](examples/) - أمثلة الاستخدام

## 🐛 الإبلاغ عن المشاكل

### كيفية الإبلاغ
1. **ابحث أولاً**: تأكد من عدم وجود Issue مشابه
2. **أنشئ Issue جديد**: استخدم القالب المطلوب
3. **صف المشكلة**: وضح المشكلة بوضوح
4. **أضف المعلومات**: معلومات النظام والأخطاء

### معلومات مطلوبة
```markdown
## وصف المشكلة
وصف واضح للمشكلة

## خطوات إعادة الإنتاج
1. اذهب إلى...
2. اضغط على...
3. شاهد الخطأ...

## السلوك المتوقع
ما كان يجب أن يحدث

## معلومات النظام
- نظام التشغيل: [مثل Ubuntu 22.04]
- إصدار Rust: [مثل 1.70.0]
- إصدار liboqs: [مثل 0.7.2]

## رسائل الخطأ
```
[نسخ رسالة الخطأ هنا]
```

## لقطات الشاشة
[إذا كان مناسباً]

## معلومات إضافية
أي معلومات أخرى مفيدة
```

### قوالب Issues
#### 🐛 تقرير خطأ
```markdown
## نوع المشكلة
- [ ] خطأ في البناء
- [ ] خطأ في التشغيل
- [ ] خطأ في الشبكة
- [ ] خطأ في الأمان
- [ ] خطأ آخر

## أولوية المشكلة
- [ ] عالية (التطبيق لا يعمل)
- [ ] متوسطة (ميزة لا تعمل)
- [ ] منخفضة (تحسين طفيف)
```

#### 💡 اقتراح ميزة
```markdown
## وصف الميزة
وصف واضح للميزة المطلوبة

## المشكلة التي تحلها
كيف ستساعد هذه الميزة المستخدمين؟

## الحلول البديلة
هل توجد حلول بديلة حالياً؟

## أمثلة
أمثلة على كيفية عمل الميزة
```

## 🔧 حل المشاكل الشائعة

### مشاكل البناء

#### خطأ: "cannot find -loqs"
```bash
# Ubuntu/Debian
sudo apt-get install liboqs-dev

# macOS
brew install liboqs

# Windows
vcpkg install liboqs:x64-windows
```

#### خطأ: "undefined reference to OQS_KEM_new"
```bash
# تحديث مكتبات النظام
sudo ldconfig

# إعادة البناء
make clean
make build
```

#### خطأ: "pkg-config not found"
```bash
# Ubuntu/Debian
sudo apt-get install pkg-config

# macOS
brew install pkg-config
```

### مشاكل التشغيل

#### خطأ: "connection refused"
```bash
# تأكد من تشغيل السيرفر
node messaging-server.js

# تحقق من المنفذ
netstat -tlnp | grep 8080

# تحقق من إعدادات الشبكة
curl http://localhost:8080/api/health
```

#### خطأ: "permission denied"
```bash
# إعطاء صلاحيات التنفيذ
chmod +x target/release/secure-messaging-client

# تشغيل كمسؤول (إذا لزم الأمر)
sudo ./target/release/secure-messaging-client
```

#### خطأ: "library not found"
```bash
# تحديث مسار المكتبات
export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH

# إعادة تشغيل shell
source ~/.bashrc
```

### مشاكل الشبكة

#### مشاكل الاتصال
```bash
# اختبار الاتصال
ping your-server.com

# اختبار المنفذ
telnet your-server.com 8080

# اختبار HTTP
curl -v http://your-server.com:8080/api/health
```

#### مشاكل HTTPS
```bash
# اختبار شهادة SSL
openssl s_client -connect your-server.com:443

# تجاهل شهادة SSL (للاختبار فقط)
curl -k https://your-server.com:8080/api/health
```

## 📋 قائمة فحص استكشاف الأخطاء

### قبل طلب المساعدة
- [ ] راجعت الوثائق
- [ ] راجعت FAQ
- [ ] بحثت في Issues
- [ ] جربت الحلول المقترحة
- [ ] جمعت معلومات النظام
- [ ] جمعت رسائل الخطأ

### معلومات مفيدة
- [ ] إصدار نظام التشغيل
- [ ] إصدار Rust
- [ ] إصدار liboqs
- [ ] رسائل الخطأ الكاملة
- [ ] خطوات إعادة الإنتاج
- [ ] لقطات الشاشة (إذا كان مناسباً)

## 🎯 مستويات الدعم

### المستوى 1 - المساعدة الذاتية
- الوثائق والأمثلة
- FAQ والأسئلة الشائعة
- حل المشاكل البسيطة
- **الوقت**: فوري

### المستوى 2 - دعم المجتمع
- GitHub Issues
- GitHub Discussions
- Discord
- **الوقت**: 24-48 ساعة

### المستوى 3 - دعم فني
- البريد الإلكتروني
- Signal
- مكالمات فيديو
- **الوقت**: 48-72 ساعة

### المستوى 4 - دعم متقدم
- تطوير حلول مخصصة
- تدريب المستخدمين
- استشارات تقنية
- **الوقت**: حسب التعقيد

## 📚 موارد إضافية

### وثائق خارجية
- [Rust Book](https://doc.rust-lang.org/book/)
- [liboqs Documentation](https://liboqs.readthedocs.io/)
- [NIST PQC](https://csrc.nist.gov/projects/post-quantum-cryptography)
- [Kyber Algorithm](https://pq-crystals.org/kyber/)

### مجتمعات مفيدة
- [Rust Community](https://www.rust-lang.org/community)
- [Cryptography Stack Exchange](https://crypto.stackexchange.com/)
- [Security Stack Exchange](https://security.stackexchange.com/)
- [Open Source Security](https://opensourcesecurity.io/)

### أدوات مفيدة
- [Rust Playground](https://play.rust-lang.org/)
- [Rust Analyzer](https://rust-analyzer.github.io/)
- [Cargo Check](https://doc.rust-lang.org/cargo/commands/cargo-check.html)
- [Clippy](https://github.com/rust-lang/rust-clippy)

## 🤝 المساهمة في الدعم

### كيف أساعد الآخرين؟
1. **أجب على الأسئلة**: في Issues و Discussions
2. **حسن الوثائق**: أضف أمثلة وتوضيحات
3. **اكتب اختبارات**: لضمان جودة الكود
4. **شارك الخبرات**: اكتب مقالات تعليمية

### أفضل الممارسات
- **كن صبوراً**: تذكر أنك كنت مبتدئاً
- **اشرح بوضوح**: استخدم لغة بسيطة
- **قدم أمثلة**: الأمثلة العملية مفيدة
- **شجع التعلم**: ساعد الناس على التعلم

---

**نحن هنا لمساعدتك! لا تتردد في طلب المساعدة. 🚀**

*هدفنا هو جعل التشفير متاحاً للجميع وسهلاً للفهم.*
