# 🔨 تعليمات البناء - نظام الرسائل الآمن مع Kyber768

## 📋 المتطلبات الأساسية

### 1. Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
rustc --version  # يجب أن يكون 1.70+
```

### 2. أدوات البناء
```bash
# Ubuntu/Debian
sudo apt-get install build-essential cmake git pkg-config

# macOS
brew install cmake git pkg-config

# Windows
# تثبيت Visual Studio Build Tools
```

## 🚀 تثبيت liboqs

### الطريقة الأولى: تثبيت من الحزم (الأسهل)

#### Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install liboqs-dev
```

#### macOS:
```bash
brew install liboqs
```

#### Windows:
```bash
# تثبيت vcpkg
git clone https://github.com/Microsoft/vcpkg.git
cd vcpkg
./bootstrap-vcpkg.bat
./vcpkg integrate install
./vcpkg install liboqs:x64-windows
```

### الطريقة الثانية: البناء من المصدر

```bash
# استنساخ liboqs
git clone https://github.com/open-quantum-safe/liboqs.git
cd liboqs

# إنشاء مجلد البناء
mkdir build && cd build

# تكوين CMake
cmake -GNinja -DCMAKE_INSTALL_PREFIX=/usr/local ..

# البناء
ninja

# التثبيت
sudo ninja install

# تحديث مكتبات النظام
sudo ldconfig
```

## 🔧 بناء التطبيق

### 1. استنساخ المشروع
```bash
git clone <your-repo-url>
cd secure-messaging-client
```

### 2. التحقق من تثبيت liboqs
```bash
# Linux/macOS
pkg-config --exists liboqs && echo "✅ liboqs مثبت" || echo "❌ liboqs غير مثبت"

# Windows
# تأكد من وجود oqs.lib في C:/vcpkg/installed/x64-windows/lib
```

### 3. بناء التطبيق
```bash
# البناء العادي
cargo build

# البناء للإنتاج
cargo build --release

# البناء مع معلومات مفصلة
cargo build --release --verbose
```

## 🐛 استكشاف الأخطاء

### خطأ: "cannot find -loqs"
```bash
# تأكد من تثبيت liboqs
sudo apt-get install liboqs-dev  # Ubuntu/Debian
brew install liboqs              # macOS

# إعادة تشغيل shell
source ~/.bashrc
```

### خطأ: "undefined reference to OQS_KEM_new"
```bash
# تأكد من تحديث مكتبات النظام
sudo ldconfig

# إعادة بناء المشروع
cargo clean
cargo build
```

### خطأ: "pkg-config not found"
```bash
# Ubuntu/Debian
sudo apt-get install pkg-config

# macOS
brew install pkg-config
```

### خطأ: "cmake not found"
```bash
# Ubuntu/Debian
sudo apt-get install cmake

# macOS
brew install cmake

# Windows
# تثبيت Visual Studio Build Tools
```

## 🔍 التحقق من التثبيت

### 1. التحقق من liboqs
```bash
# البحث عن المكتبة
ldconfig -p | grep oqs

# التحقق من pkg-config
pkg-config --libs liboqs
pkg-config --cflags liboqs
```

### 2. اختبار التطبيق
```bash
# بناء التطبيق
cargo build --release

# تشغيل الاختبارات
cargo test

# تشغيل التطبيق
./target/release/secure-messaging-client
```

## 📁 هيكل الملفات

```
secure-messaging-client/
├── src/
│   └── main.rs              # الكود الرئيسي
├── Cargo.toml               # تبعيات المشروع
├── build.rs                 # سكريبت البناء
├── .cargo/
│   └── config.toml         # إعدادات Cargo
├── build-instructions.md    # هذا الملف
└── README.md               # الوثائق الرئيسية
```

## 🌐 دعم المنصات

### Linux (Ubuntu/Debian)
- ✅ مدعوم بالكامل
- ✅ تثبيت سهل عبر apt
- ✅ أداء عالي

### macOS
- ✅ مدعوم بالكامل
- ✅ تثبيت سهل عبر Homebrew
- ✅ أداء جيد

### Windows
- ⚠️ مدعوم مع vcpkg
- ⚠️ يتطلب Visual Studio Build Tools
- ⚠️ قد يحتاج تكوين إضافي

## 🔗 روابط مفيدة

- [liboqs GitHub](https://github.com/open-quantum-safe/liboqs)
- [NIST PQC Project](https://csrc.nist.gov/projects/post-quantum-cryptography)
- [Kyber Algorithm](https://pq-crystals.org/kyber/)
- [Rust Installation](https://rustup.rs/)
- [CMake Installation](https://cmake.org/install/)

## 📞 الدعم

إذا واجهت مشاكل في البناء:

1. تأكد من تثبيت جميع المتطلبات
2. راجع رسائل الخطأ بعناية
3. تأكد من تحديث النظام
4. افتح Issue في GitHub مع تفاصيل الخطأ

---

**ملاحظة**: تأكد من تثبيت liboqs قبل محاولة بناء التطبيق. بدون liboqs، لن يعمل التطبيق.
