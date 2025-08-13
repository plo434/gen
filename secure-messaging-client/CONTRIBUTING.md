# 🤝 دليل المساهمة

شكراً لاهتمامك بالمساهمة في نظام الرسائل الآمن مع Kyber768! هذا الدليل سيساعدك على البدء.

## 📋 قبل البدء

### المتطلبات
- Rust 1.70+
- معرفة أساسية بلغة Rust
- فهم أساسيات التشفير
- Git

### إعداد البيئة
```bash
# استنساخ المشروع
git clone <your-fork-url>
cd secure-messaging-client

# تثبيت التبعيات
make install-deps

# بناء المشروع
make build
```

## 🔧 كيفية المساهمة

### 1. إنشاء Issue
- ابحث عن Issues موجودة
- إذا لم تجد ما تبحث عنه، أنشئ Issue جديد
- وصف المشكلة أو الميزة بوضوح

### 2. Fork المشروع
- اضغط على زر "Fork" في GitHub
- استنسخ Fork إلى جهازك المحلي

### 3. إنشاء فرع جديد
```bash
git checkout -b feature/your-feature-name
# أو
git checkout -b fix/your-bug-fix
```

### 4. تطوير الميزة
- اكتب الكود
- اتبع معايير الكود
- اكتب اختبارات
- حدث الوثائق

### 5. Commit التغييرات
```bash
git add .
git commit -m "feat: إضافة ميزة جديدة"
git commit -m "fix: إصلاح مشكلة معروفة"
git commit -m "docs: تحديث الوثائق"
```

### 6. Push التغييرات
```bash
git push origin feature/your-feature-name
```

### 7. إنشاء Pull Request
- اذهب إلى GitHub
- اضغط على "New Pull Request"
- اختر الفرع الصحيح
- املأ الوصف

## 📝 معايير الكود

### Rust
- استخدم `cargo fmt` لتنسيق الكود
- استخدم `cargo clippy` للتحقق من الجودة
- اتبع [Rust Style Guide](https://doc.rust-lang.org/1.0.0/style/style/naming/README.html)

### التعليقات
```rust
/// إنشاء زوج مفاتيح جديد باستخدام Kyber768
/// 
/// # Returns
/// 
/// `Result<KeyPair>` - زوج المفاتيح أو خطأ
/// 
/// # Examples
/// 
/// ```
/// let key_pair = kyber.generate_key_pair()?;
/// ```
pub fn generate_key_pair(&self) -> Result<KeyPair> {
    // الكود هنا
}
```

### معالجة الأخطاء
```rust
use anyhow::{Context, Result};

pub fn encrypt_message(&self, message: &str) -> Result<EncryptedMessage> {
    let encrypted = self.cipher
        .encrypt(message.as_bytes())
        .context("فشل في تشفير الرسالة")?;
    
    Ok(EncryptedMessage::new(encrypted))
}
```

## 🧪 الاختبارات

### كتابة الاختبارات
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_key_generation() {
        let kyber = Kyber768::new().unwrap();
        let key_pair = kyber.generate_key_pair().unwrap();
        
        assert_eq!(key_pair.public_key.len(), 1184);
        assert_eq!(key_pair.private_key.len(), 2400);
    }

    #[test]
    fn test_encryption_decryption() {
        let message = "رسالة اختبار";
        let encrypted = encrypt_message(message).unwrap();
        let decrypted = decrypt_message(&encrypted).unwrap();
        
        assert_eq!(message, decrypted);
    }
}
```

### تشغيل الاختبارات
```bash
# جميع الاختبارات
cargo test

# اختبارات محددة
cargo test test_key_generation

# اختبارات مع معلومات مفصلة
cargo test -- --nocapture
```

## 📚 الوثائق

### تحديث README
- حدث `README.md` عند إضافة ميزات جديدة
- أضف أمثلة على الاستخدام
- حدث قائمة المتطلبات

### تعليقات الكود
- اكتب تعليقات واضحة باللغة العربية
- اشرح الخوارزميات المعقدة
- أضف أمثلة على الاستخدام

## 🔍 مراجعة الكود

### قبل إرسال PR
- [ ] الكود يعمل بشكل صحيح
- [ ] الاختبارات تمر
- [ ] الكود منسق (`cargo fmt`)
- [ ] لا توجد تحذيرات (`cargo clippy`)
- [ ] الوثائق محدثة
- [ ] الرسائل واضحة

### مراجعة PRs أخرى
- اقرأ الكود بعناية
- اطرح أسئلة واضحة
- اقترح تحسينات
- كن محترماً ومشجعاً

## 🚀 الميزات المقترحة

### أولوية عالية
- [ ] تحسين أداء Kyber768
- [ ] إضافة اختبارات شاملة
- [ ] تحسين معالجة الأخطاء

### أولوية متوسطة
- [ ] دعم خوارزميات PQC إضافية
- [ ] واجهة رسومية بسيطة
- [ ] دعم الملفات المشفرة

### أولوية منخفضة
- [ ] دعم الأجهزة المحمولة
- [ ] إحصائيات الاستخدام
- [ ] تكامل مع أنظمة أخرى

## 📞 التواصل

### قنوات التواصل
- **GitHub Issues**: للمشاكل والميزات
- **GitHub Discussions**: للمناقشات العامة
- **Pull Requests**: للمراجعة والتعليقات

### قواعد السلوك
- كن محترماً ومهذباً
- استخدم لغة واضحة ومفهومة
- اطرح أسئلة عند الحاجة
- شجع المساهمين الجدد

## 🎯 نصائح للمبتدئين

### ابدأ بسهولة
- ابحث عن Issues مع علامة "good first issue"
- ابدأ بإصلاح أخطاء بسيطة
- اقرأ الكود الموجود

### تعلم من الآخرين
- راجع PRs أخرى
- اقرأ التعليقات
- اسأل عن أي شيء غير واضح

### لا تستسلم
- التعلم يأخذ وقتاً
- الأخطاء جزء من العملية
- المجتمع هنا لمساعدتك

---

**شكراً لك على المساهمة في جعل الإنترنت أكثر أماناً! 🚀**
