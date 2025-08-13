# 🧪 دليل الاختبار

## 📋 نظرة عامة

هذا الدليل يشرح كيفية اختبار نظام الرسائل الآمن مع Kyber768 لضمان جودته وأمانه.

## 🎯 أنواع الاختبارات

### 🧪 اختبارات الوحدة
- **الغرض**: اختبار المكونات الفردية
- **النطاق**: دوال وفئات منفصلة
- **التكرار**: مع كل تغيير
- **الأدوات**: Rust tests, cargo test

### 🔗 اختبارات التكامل
- **الغرض**: اختبار تفاعل المكونات
- **النطاق**: وحدات متعددة معاً
- **التكرار**: مع كل إصدار
- **الأدوات**: Integration tests

### 🚀 اختبارات الأداء
- **الغرض**: قياس سرعة وكفاءة النظام
- **النطاق**: النظام بأكمله
- **التكرار**: دوري
- **الأدوات**: Benchmarks, profiling

### 🛡️ اختبارات الأمان
- **الغرض**: كشف الثغرات الأمنية
- **النطاق**: جميع نقاط الضعف
- **التكرار**: دوري
- **الأدوات**: Security scanners, penetration testing

## 🚀 تشغيل الاختبارات

### الاختبارات الأساسية
```bash
# جميع الاختبارات
cargo test

# اختبارات محددة
cargo test test_key_generation

# اختبارات مع معلومات مفصلة
cargo test -- --nocapture

# اختبارات مع تقرير مفصل
cargo test -- --nocapture --test-threads=1
```

### اختبارات الأداء
```bash
# تشغيل benchmarks
cargo bench

# اختبارات الأداء مع معلومات مفصلة
cargo bench -- --verbose

# اختبارات الأداء لمكون محدد
cargo bench kyber768
```

### اختبارات التغطية
```bash
# تثبيت cargo-tarpaulin
cargo install cargo-tarpaulin

# تشغيل اختبارات التغطية
cargo tarpaulin

# تقرير مفصل
cargo tarpaulin --out Html
```

## 📝 كتابة الاختبارات

### اختبارات الوحدة

#### اختبار إنشاء المفاتيح
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_kyber768_key_generation() {
        let kyber = Kyber768::new().unwrap();
        let key_pair = kyber.generate_key_pair().unwrap();
        
        // اختبار أحجام المفاتيح
        assert_eq!(key_pair.public_key.len(), 1184);
        assert_eq!(key_pair.private_key.len(), 2400);
        
        // اختبار أن المفاتيح مختلفة
        assert_ne!(key_pair.public_key, key_pair.private_key);
        
        // اختبار أن المفاتيح ليست فارغة
        assert!(!key_pair.public_key.iter().all(|&x| x == 0));
        assert!(!key_pair.private_key.iter().all(|&x| x == 0));
    }

    #[test]
    fn test_kyber768_encapsulation() {
        let kyber = Kyber768::new().unwrap();
        let key_pair = kyber.generate_key_pair().unwrap();
        
        let (shared_secret, ciphertext) = kyber.encapsulate(&key_pair.public_key).unwrap();
        
        // اختبار أحجام النتائج
        assert_eq!(shared_secret.len(), 32);
        assert_eq!(ciphertext.len(), 1088);
        
        // اختبار أن النتائج مختلفة
        assert_ne!(shared_secret, ciphertext);
    }

    #[test]
    fn test_kyber768_decapsulation() {
        let kyber = Kyber768::new().unwrap();
        let key_pair = kyber.generate_key_pair().unwrap();
        
        let (shared_secret1, ciphertext) = kyber.encapsulate(&key_pair.public_key).unwrap();
        let shared_secret2 = kyber.decapsulate(&ciphertext, &key_pair.private_key).unwrap();
        
        // اختبار أن المفاتيح المشتركة متطابقة
        assert_eq!(shared_secret1, shared_secret2);
    }
}
```

#### اختبار التشفير
```rust
#[test]
fn test_encryption_decryption() {
    let encryption_manager = EncryptionManager::new().unwrap();
    let message = "رسالة اختبار باللغة العربية";
    
    // إنشاء مفتاح مشترك
    let shared_secret = vec![1u8; 32];
    
    // تشفير الرسالة
    let encrypted = encryption_manager.encrypt_message(message, &shared_secret).unwrap();
    
    // فك تشفير الرسالة
    let decrypted = encryption_manager.decrypt_message(&encrypted, &shared_secret).unwrap();
    
    // اختبار أن الرسالة الأصلية والمشفرة متطابقتان
    assert_eq!(message, decrypted);
}

#[test]
fn test_encryption_uniqueness() {
    let encryption_manager = EncryptionManager::new().unwrap();
    let message = "رسالة اختبار";
    let shared_secret = vec![1u8; 32];
    
    // تشفير الرسالة مرتين
    let encrypted1 = encryption_manager.encrypt_message(message, &shared_secret).unwrap();
    let encrypted2 = encryption_manager.encrypt_message(message, &shared_secret).unwrap();
    
    // اختبار أن النتائج مختلفة (بسبب nonce عشوائي)
    assert_ne!(encrypted1.encrypted_content, encrypted2.encrypted_content);
    assert_ne!(encrypted1.nonce, encrypted2.nonce);
}
```

#### اختبار إدارة المفاتيح
```rust
#[test]
fn test_key_management() {
    let mut encryption_manager = EncryptionManager::new().unwrap();
    
    // إنشاء مفاتيح لمستخدم
    let key_pair = encryption_manager.generate_user_keys("alice").unwrap();
    
    // اختبار أن المفاتيح تم حفظها
    let stored_public_key = encryption_manager.get_public_key("alice");
    assert!(stored_public_key.is_some());
    assert_eq!(stored_public_key.unwrap(), &key_pair.public_key);
    
    // اختبار أن المستخدمين المختلفين لديهم مفاتيح مختلفة
    let key_pair2 = encryption_manager.generate_user_keys("bob").unwrap();
    assert_ne!(key_pair.public_key, key_pair2.public_key);
}

#[test]
fn test_key_exchange() {
    let mut encryption_manager = EncryptionManager::new().unwrap();
    
    // إنشاء مفاتيح للمستخدمين
    let alice_keys = encryption_manager.generate_user_keys("alice").unwrap();
    let bob_keys = encryption_manager.generate_user_keys("bob").unwrap();
    
    // تبادل المفاتيح
    encryption_manager.perform_key_exchange("alice", "bob", &bob_keys.public_key).unwrap();
    
    // اختبار أن المفتاح المشترك تم حفظه
    let key_name = "alice:bob";
    assert!(encryption_manager.shared_secrets.contains_key(key_name));
}
```

### اختبارات التكامل

#### اختبار العميل الكامل
```rust
#[tokio::test]
async fn test_client_integration() {
    // إنشاء عميل
    let client = MessagingClient::new("http://localhost:8080".to_string()).unwrap();
    let mut client = client;
    
    // تسجيل الدخول
    let result = client.login("test_user").await;
    assert!(result.is_ok());
    
    // التحقق من تسجيل الدخول
    assert_eq!(client.current_user, Some("test_user".to_string()));
}

#[tokio::test]
async fn test_message_sending() {
    let client = MessagingManager::new("http://localhost:8080".to_string()).unwrap();
    let mut client = client;
    
    // تسجيل الدخول
    client.login("sender").await.unwrap();
    
    // إرسال رسالة
    let result = client.send_message("receiver", "رسالة اختبار").await;
    assert!(result.is_ok());
}
```

### اختبارات الأداء

#### اختبار سرعة التشفير
```rust
#[bench]
fn bench_kyber768_key_generation(b: &mut Bencher) {
    let kyber = Kyber768::new().unwrap();
    
    b.iter(|| {
        kyber.generate_key_pair().unwrap();
    });
}

#[bench]
fn bench_encryption(b: &mut Bencher) {
    let encryption_manager = EncryptionManager::new().unwrap();
    let message = "رسالة اختبار طويلة للقياس الدقيق للأداء";
    let shared_secret = vec![1u8; 32];
    
    b.iter(|| {
        encryption_manager.encrypt_message(message, &shared_secret).unwrap();
    });
}

#[bench]
fn bench_decryption(b: &mut Bencher) {
    let encryption_manager = EncryptionManager::new().unwrap();
    let message = "رسالة اختبار";
    let shared_secret = vec![1u8; 32];
    let encrypted = encryption_manager.encrypt_message(message, &shared_secret).unwrap();
    
    b.iter(|| {
        encryption_manager.decrypt_message(&encrypted, &shared_secret).unwrap();
    });
}
```

#### اختبار استخدام الذاكرة
```rust
#[test]
fn test_memory_usage() {
    use std::mem;
    
    // قياس حجم الهياكل
    let key_pair_size = mem::size_of::<KeyPair>();
    let message_size = mem::size_of::<Message>();
    let encrypted_size = mem::size_of::<EncryptedMessage>();
    
    // اختبار أن الأحجام معقولة
    assert!(key_pair_size < 10000); // أقل من 10KB
    assert!(message_size < 1000);    // أقل من 1KB
    assert!(encrypted_size < 1000);  // أقل من 1KB
    
    println!("KeyPair size: {} bytes", key_pair_size);
    println!("Message size: {} bytes", message_size);
    println!("EncryptedMessage size: {} bytes", encrypted_size);
}
```

## 🛡️ اختبارات الأمان

### اختبارات التشفير
```rust
#[test]
fn test_cryptographic_properties() {
    let encryption_manager = EncryptionManager::new().unwrap();
    
    // اختبار أن الرسائل المختلفة تنتج نتائج مختلفة
    let message1 = "رسالة 1";
    let message2 = "رسالة 2";
    let shared_secret = vec![1u8; 32];
    
    let encrypted1 = encryption_manager.encrypt_message(message1, &shared_secret).unwrap();
    let encrypted2 = encryption_manager.encrypt_message(message2, &shared_secret).unwrap();
    
    assert_ne!(encrypted1.encrypted_content, encrypted2.encrypted_content);
}

#[test]
fn test_key_isolation() {
    let mut encryption_manager = EncryptionManager::new().unwrap();
    
    // إنشاء مفاتيح لمستخدمين مختلفين
    let alice_keys = encryption_manager.generate_user_keys("alice").unwrap();
    let bob_keys = encryption_manager.generate_user_keys("bob").unwrap();
    
    // اختبار أن المفاتيح معزولة
    assert_ne!(alice_keys.public_key, bob_keys.public_key);
    assert_ne!(alice_keys.private_key, bob_keys.private_key);
}
```

### اختبارات مقاومة الهجمات
```rust
#[test]
fn test_replay_attack_resistance() {
    let encryption_manager = EncryptionManager::new().unwrap();
    let message = "رسالة اختبار";
    let shared_secret = vec![1u8; 32];
    
    // تشفير الرسالة
    let encrypted = encryption_manager.encrypt_message(message, &shared_secret).unwrap();
    
    // محاولة فك تشفير نفس الرسالة المشفرة مرتين
    let decrypted1 = encryption_manager.decrypt_message(&encrypted, &shared_secret).unwrap();
    let decrypted2 = encryption_manager.decrypt_message(&encrypted, &shared_secret).unwrap();
    
    // يجب أن تعمل في كلتا المرتين (nonce مختلف)
    assert_eq!(decrypted1, decrypted2);
}

#[test]
fn test_key_derivation_consistency() {
    let encryption_manager = EncryptionManager::new().unwrap();
    let shared_secret = vec![1u8; 32];
    
    // تشفير رسائل متعددة بنفس المفتاح
    let message1 = "رسالة 1";
    let message2 = "رسالة 2";
    
    let encrypted1 = encryption_manager.encrypt_message(message1, &shared_secret).unwrap();
    let encrypted2 = encryption_manager.encrypt_message(message2, &shared_secret).unwrap();
    
    // فك تشفير الرسائل
    let decrypted1 = encryption_manager.decrypt_message(&encrypted1, &shared_secret).unwrap();
    let decrypted2 = encryption_manager.decrypt_message(&encrypted2, &shared_secret).unwrap();
    
    assert_eq!(message1, decrypted1);
    assert_eq!(message2, decrypted2);
}
```

## 🔍 اختبارات التغطية

### تقرير التغطية
```bash
# تثبيت grcov
cargo install grcov

# تشغيل الاختبارات مع تغطية
CARGO_INCREMENTAL=0 RUSTFLAGS='-Cinstrument-coverage' LLVM_PROFILE_FILE='cargo-test-%p-%m.profraw' cargo test

# إنشاء تقرير HTML
grcov . --binary-path ./target/debug/ -s . -t html --branch --ignore-not-existing -o ./coverage/
```

### تحليل التغطية
```rust
// إضافة تعليقات لتوجيه التغطية
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_all_code_paths() {
        // اختبار المسار السعيد
        let result = normal_operation();
        assert!(result.is_ok());
        
        // اختبار المسار مع الأخطاء
        let result = operation_with_error();
        assert!(result.is_err());
        
        // اختبار الحالات الحدية
        let result = edge_case_operation();
        assert!(result.is_ok());
    }
}
```

## 🚨 اختبارات الأخطاء

### اختبارات معالجة الأخطاء
```rust
#[test]
fn test_error_handling() {
    let encryption_manager = EncryptionManager::new().unwrap();
    
    // اختبار رسالة فارغة
    let result = encryption_manager.encrypt_message("", &vec![1u8; 32]);
    assert!(result.is_ok()); // الرسائل الفارغة مسموحة
    
    // اختبار مفتاح قصير جداً
    let result = encryption_manager.encrypt_message("رسالة", &vec![1u8; 16]);
    assert!(result.is_err()); // يجب أن يكون المفتاح 32 بايت
    
    // اختبار رسالة طويلة جداً
    let long_message = "أ".repeat(10000);
    let result = encryption_manager.encrypt_message(&long_message, &vec![1u8; 32]);
    assert!(result.is_ok()); // الرسائل الطويلة مسموحة
}

#[test]
fn test_invalid_inputs() {
    let encryption_manager = EncryptionManager::new().unwrap();
    
    // اختبار مدخلات غير صالحة
    let result = encryption_manager.encrypt_message("رسالة", &vec![]);
    assert!(result.is_err());
    
    let result = encryption_manager.encrypt_message("رسالة", &vec![1u8; 64]);
    assert!(result.is_err());
}
```

## 📊 اختبارات الأداء

### اختبارات الحمل
```rust
#[tokio::test]
async fn test_concurrent_operations() {
    use tokio::task;
    use std::sync::Arc;
    
    let encryption_manager = Arc::new(EncryptionManager::new().unwrap());
    let shared_secret = vec![1u8; 32];
    let message = "رسالة اختبار";
    
    // إنشاء 100 مهمة متزامنة
    let handles: Vec<_> = (0..100)
        .map(|_| {
            let manager = Arc::clone(&encryption_manager);
            let secret = shared_secret.clone();
            let msg = message.to_string();
            
            task::spawn(async move {
                manager.encrypt_message(&msg, &secret).unwrap()
            })
        })
        .collect();
    
    // انتظار اكتمال جميع المهام
    let results = futures::future::join_all(handles).await;
    
    // اختبار أن جميع العمليات نجحت
    assert_eq!(results.len(), 100);
    for result in results {
        assert!(result.is_ok());
    }
}
```

## 🔧 أدوات الاختبار

### أدوات Rust
- **cargo test**: اختبارات الوحدة والتكامل
- **cargo bench**: اختبارات الأداء
- **cargo tarpaulin**: قياس التغطية
- **cargo clippy**: فحص جودة الكود

### أدوات خارجية
- **Valgrind**: كشف تسريبات الذاكرة
- **Clang Sanitizer**: كشف الأخطاء
- **Criterion**: قياسات أداء متقدمة
- **proptest**: اختبارات الخصائص

## 📋 قائمة فحص الاختبار

### قبل الإصدار
- [ ] جميع الاختبارات تمر
- [ ] تغطية الكود > 80%
- [ ] اختبارات الأداء مقبولة
- [ ] اختبارات الأمان مكتملة
- [ ] اختبارات التكامل تعمل
- [ ] اختبارات الأخطاء شاملة

### اختبارات الأمان
- [ ] اختبارات التشفير
- [ ] اختبارات مقاومة الهجمات
- [ ] اختبارات عزل المفاتيح
- [ ] اختبارات معالجة الأخطاء
- [ ] اختبارات التغطية الأمنية

### اختبارات الأداء
- [ ] اختبارات سرعة التشفير
- [ ] اختبارات استخدام الذاكرة
- [ ] اختبارات العمليات المتزامنة
- [ ] اختبارات الحمل
- [ ] اختبارات الاستجابة

---

**اختبار شامل يعني نظام آمن! 🚀**

*تذكر: الاختبارات هي استثمار في جودة وأمان النظام.*
