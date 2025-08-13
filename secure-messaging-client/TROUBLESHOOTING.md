# 🔧 دليل استكشاف الأخطاء

## 📋 نظرة عامة

هذا الدليل يساعدك في حل المشاكل الشائعة التي قد تواجهها عند استخدام نظام الرسائل الآمن مع Kyber768.

## 🚨 المشاكل الحرجة

### ❌ التطبيق لا يعمل
```bash
# 1. فحص التبعيات
make check-deps

# 2. إعادة البناء
make clean
make build

# 3. فحص الأخطاء
cargo check
cargo clippy
```

### ❌ خطأ في التشفير
```bash
# 1. فحص مكتبة liboqs
pkg-config --exists liboqs

# 2. إعادة تثبيت liboqs
sudo apt-get remove liboqs-dev
sudo apt-get install liboqs-dev

# 3. تحديث مكتبات النظام
sudo ldconfig
```

### ❌ خطأ في الشبكة
```bash
# 1. فحص السيرفر
curl http://localhost:8080/api/health

# 2. فحص المنافذ
netstat -tlnp | grep 8080

# 3. فحص جدار الحماية
sudo ufw status
```

## 🔍 تشخيص المشاكل

### فحص النظام
```bash
# معلومات النظام
uname -a
cat /etc/os-release

# إصدار Rust
rustc --version
cargo --version

# إصدار المكتبات
pkg-config --modversion liboqs
```

### فحص التبعيات
```bash
# فحص المكتبات المثبتة
ldconfig -p | grep oqs

# فحص مسارات المكتبات
echo $LD_LIBRARY_PATH
echo $PKG_CONFIG_PATH

# فحص أدوات البناء
which cmake
which pkg-config
which gcc
```

### فحص الشبكة
```bash
# فحص الاتصال
ping localhost

# فحص المنافذ
telnet localhost 8080

# فحص DNS
nslookup your-domain.com

# فحص SSL
openssl s_client -connect your-domain.com:443
```

## 🐛 المشاكل الشائعة

### مشاكل البناء

#### خطأ: "cannot find -loqs"
```bash
# السبب: مكتبة liboqs غير مثبتة
# الحل:

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install liboqs-dev

# macOS
brew install liboqs

# Windows
vcpkg install liboqs:x64-windows

# إعادة البناء
make clean
make build
```

#### خطأ: "undefined reference to OQS_KEM_new"
```bash
# السبب: مشكلة في ربط المكتبة
# الحل:

# تحديث مكتبات النظام
sudo ldconfig

# إعادة تشغيل shell
source ~/.bashrc

# إعادة البناء
make clean
make build
```

#### خطأ: "pkg-config not found"
```bash
# السبب: أداة pkg-config غير مثبتة
# الحل:

# Ubuntu/Debian
sudo apt-get install pkg-config

# macOS
brew install pkg-config

# إعادة البناء
make build
```

#### خطأ: "cmake not found"
```bash
# السبب: أداة cmake غير مثبتة
# الحل:

# Ubuntu/Debian
sudo apt-get install cmake

# macOS
brew install cmake

# Windows
# تثبيت Visual Studio Build Tools

# إعادة البناء
make build
```

### مشاكل التشغيل

#### خطأ: "connection refused"
```bash
# السبب: السيرفر غير مشغل
# الحل:

# 1. تشغيل السيرفر
node messaging-server.js

# 2. فحص المنفذ
netstat -tlnp | grep 8080

# 3. فحص إعدادات الشبكة
curl -v http://localhost:8080/api/health
```

#### خطأ: "permission denied"
```bash
# السبب: عدم وجود صلاحيات التنفيذ
# الحل:

# إعطاء صلاحيات التنفيذ
chmod +x target/release/secure-messaging-client

# تشغيل كمسؤول (إذا لزم الأمر)
sudo ./target/release/secure-messaging-client
```

#### خطأ: "library not found"
```bash
# السبب: مشكلة في مسار المكتبات
# الحل:

# تحديث مسار المكتبات
export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH

# إضافة للملف الدائم
echo 'export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH' >> ~/.bashrc

# إعادة تشغيل shell
source ~/.bashrc
```

### مشاكل الشبكة

#### مشاكل الاتصال
```bash
# السبب: مشاكل في الشبكة
# الحل:

# 1. فحص الاتصال
ping your-server.com

# 2. فحص المنفذ
telnet your-server.com 8080

# 3. فحص إعدادات الشبكة
curl -v http://your-server.com:8080/api/health

# 4. فحص جدار الحماية
sudo ufw status
sudo ufw allow 8080
```

#### مشاكل HTTPS
```bash
# السبب: مشاكل في شهادة SSL
# الحل:

# 1. فحص الشهادة
openssl s_client -connect your-server.com:443

# 2. تجاهل الشهادة (للاختبار فقط)
curl -k https://your-server.com:8080/api/health

# 3. تجديد الشهادة
sudo certbot renew

# 4. إعادة تشغيل الخدمات
sudo systemctl restart nginx
sudo systemctl restart secure-messaging
```

### مشاكل الذاكرة

#### خطأ: "out of memory"
```bash
# السبب: نقص في الذاكرة
# الحل:

# 1. فحص استخدام الذاكرة
free -h
top

# 2. إغلاق التطبيقات غير الضرورية
# 3. زيادة الذاكرة الافتراضية
# 4. إعادة تشغيل النظام
```

#### خطأ: "segmentation fault"
```bash
# السبب: مشكلة في الذاكرة
# الحل:

# 1. فحص الكود
cargo check
cargo clippy

# 2. تشغيل مع Valgrind
cargo install cargo-valgrind
cargo valgrind run

# 3. إعادة البناء
make clean
make build
```

## 🔧 حلول متقدمة

### إصلاح مكتبة liboqs
```bash
# إزالة النسخة الحالية
sudo apt-get remove liboqs-dev

# تنظيف الملفات
sudo rm -rf /usr/local/lib/liboqs*
sudo rm -rf /usr/local/include/oqs

# إعادة التثبيت
sudo apt-get update
sudo apt-get install liboqs-dev

# تحديث مكتبات النظام
sudo ldconfig
```

### إصلاح مشاكل Rust
```bash
# تحديث Rust
rustup update

# تنظيف Cargo
cargo clean

# إعادة بناء
cargo build --release

# فحص الكود
cargo check
cargo clippy
```

### إصلاح مشاكل الشبكة
```bash
# إعادة تعيين الشبكة
sudo systemctl restart networking

# إعادة تعيين جدار الحماية
sudo ufw disable
sudo ufw enable

# فحص إعدادات DNS
cat /etc/resolv.conf

# إعادة تشغيل الخدمات
sudo systemctl restart systemd-resolved
```

## 📊 أدوات التشخيص

### أدوات النظام
```bash
# مراقبة النظام
htop
iotop
nethogs

# فحص الشبكة
iftop
nethogs
ss

# فحص الملفات
lsof
fuser
```

### أدوات Rust
```bash
# فحص الكود
cargo check
cargo clippy
cargo fmt

# اختبارات
cargo test
cargo test -- --nocapture

# قياسات الأداء
cargo bench
cargo flamegraph
```

### أدوات الأمان
```bash
# فحص الثغرات
cargo audit

# فحص التبعيات
cargo tree

# فحص الأمان
cargo-geiger
```

## 📋 قائمة فحص استكشاف الأخطاء

### قبل البدء
- [ ] قراءة رسالة الخطأ بعناية
- [ ] تحديد نوع المشكلة
- [ ] جمع معلومات النظام
- [ ] فحص الوثائق

### أثناء الحل
- [ ] تطبيق الحلول خطوة بخطوة
- [ ] اختبار كل حل
- [ ] تسجيل النتائج
- [ ] عدم تطبيق حلول متعددة معاً

### بعد الحل
- [ ] اختبار التطبيق
- [ ] توثيق الحل
- [ ] تحديث الوثائق
- [ ] مشاركة الحل مع المجتمع

## 🆘 الحصول على المساعدة

### متى تطلب المساعدة
- [ ] جربت جميع الحلول المقترحة
- [ ] المشكلة غير مذكورة في الوثائق
- [ ] المشكلة تؤثر على الإنتاجية
- [ ] تحتاج خبرة متخصصة

### معلومات مطلوبة
```markdown
## وصف المشكلة
وصف واضح للمشكلة

## خطوات إعادة الإنتاج
1. اذهب إلى...
2. اضغط على...
3. شاهد الخطأ...

## معلومات النظام
- نظام التشغيل: [مثل Ubuntu 22.04]
- إصدار Rust: [مثل 1.70.0]
- إصدار liboqs: [مثل 0.7.2]

## رسائل الخطأ
```
[نسخ رسالة الخطأ هنا]
```

## ما جربته
- [ ] قرأت الوثائق
- [ ] جربت الحلول المقترحة
- [ ] بحثت في Issues
- [ ] راجعت FAQ
```

### قنوات المساعدة
- **GitHub Issues**: للمشاكل التقنية
- **GitHub Discussions**: للأسئلة العامة
- **Documentation**: للأسئلة البسيطة
- **Community**: للمناقشات

## 🔮 منع المشاكل

### أفضل الممارسات
- **تحديثات منتظمة**: تحديث النظام والمكتبات
- **اختبارات شاملة**: اختبار جميع الميزات
- **نسخ احتياطية**: نسخ احتياطية منتظمة
- **مراقبة النظام**: مراقبة الأداء والأخطاء

### الصيانة الوقائية
- **تنظيف دوري**: تنظيف الملفات المؤقتة
- **فحص الأمان**: فحص الثغرات بانتظام
- **تحديث التبعيات**: تحديث المكتبات
- **مراجعة السجلات**: مراجعة السجلات دورياً

---

**استكشاف الأخطاء مهارة مهمة! 🚀**

*تذكر: المشاكل جزء من التطوير، والحلول تجربة قيمة.*
