# 📊 دليل قياسات الأداء

## 📋 نظرة عامة

هذا الدليل يشرح كيفية قياس أداء نظام الرسائل الآمن مع Kyber768 ومراقبة تحسيناته.

## 🎯 أنواع القياسات

### ⚡ قياسات السرعة
- **إنشاء المفاتيح**: سرعة توليد أزواج المفاتيح
- **تبادل المفاتيح**: سرعة عملية تبادل المفاتيح
- **التشفير**: سرعة تشفير الرسائل
- **فك التشفير**: سرعة فك تشفير الرسائل

### 💾 قياسات الذاكرة
- **استخدام الذاكرة**: كمية الذاكرة المستخدمة
- **تسريبات الذاكرة**: كشف تسريبات الذاكرة
- **كفاءة الذاكرة**: نسبة الاستخدام الفعال

### 🌐 قياسات الشبكة
- **وقت الاستجابة**: سرعة استجابة النظام
- **معدل الإنتاجية**: عدد العمليات في الثانية
- **استخدام النطاق**: كمية البيانات المرسلة

### 🔄 قياسات التزامن
- **العمليات المتزامنة**: عدد العمليات المتوازية
- **توزيع الحمل**: توزيع العمل بين المعالجات
- **قابلية التوسع**: أداء النظام مع زيادة الحمل

## 🚀 تشغيل القياسات

### القياسات الأساسية
```bash
# تشغيل جميع القياسات
cargo bench

# قياسات محددة
cargo bench kyber768
cargo bench encryption
cargo bench network

# قياسات مع معلومات مفصلة
cargo bench -- --verbose

# قياسات مع تقرير مفصل
cargo bench -- --verbose --test-threads=1
```

### قياسات مخصصة
```bash
# قياسات مع معاملات محددة
cargo bench -- --bench --message-size=1024

# قياسات مع عدد التكرارات
cargo bench -- --bench --iterations=1000

# قياسات مع حجم المفاتيح
cargo bench -- --bench --key-size=256
```

## 📝 كتابة القياسات

### قياسات Kyber768

#### قياس إنشاء المفاتيح
```rust
#[bench]
fn bench_kyber768_key_generation(b: &mut Bencher) {
    let kyber = Kyber768::new().unwrap();
    
    b.iter(|| {
        kyber.generate_key_pair().unwrap();
    });
}

#[bench]
fn bench_kyber768_key_generation_batch(b: &mut Bencher) {
    let kyber = Kyber768::new().unwrap();
    
    b.iter(|| {
        for _ in 0..10 {
            kyber.generate_key_pair().unwrap();
        }
    });
}
```

#### قياس تبادل المفاتيح
```rust
#[bench]
fn bench_kyber768_encapsulation(b: &mut Bencher) {
    let kyber = Kyber768::new().unwrap();
    let key_pair = kyber.generate_key_pair().unwrap();
    
    b.iter(|| {
        kyber.encapsulate(&key_pair.public_key).unwrap();
    });
}

#[bench]
fn bench_kyber768_decapsulation(b: &mut Bencher) {
    let kyber = Kyber768::new().unwrap();
    let key_pair = kyber.generate_key_pair().unwrap();
    let (_, ciphertext) = kyber.encapsulate(&key_pair.public_key).unwrap();
    
    b.iter(|| {
        kyber.decapsulate(&ciphertext, &key_pair.private_key).unwrap();
    });
}
```

### قياسات التشفير

#### قياس تشفير الرسائل
```rust
#[bench]
fn bench_aes_encryption(b: &mut Bencher) {
    let encryption_manager = EncryptionManager::new().unwrap();
    let message = "رسالة اختبار متوسطة الحجم للقياس الدقيق للأداء";
    let shared_secret = vec![1u8; 32];
    
    b.iter(|| {
        encryption_manager.encrypt_message(message, &shared_secret).unwrap();
    });
}

#[bench]
fn bench_aes_encryption_different_sizes(b: &mut Bencher) {
    let encryption_manager = EncryptionManager::new().unwrap();
    let shared_secret = vec![1u8; 32];
    
    b.iter(|| {
        // رسائل بأحجام مختلفة
        let messages = [
            "قصيرة",
            "رسالة متوسطة الحجم",
            "رسالة طويلة جداً تحتوي على الكثير من النص العربي والإنجليزي",
            &"أ".repeat(1000),
        ];
        
        for message in &messages {
            encryption_manager.encrypt_message(message, &shared_secret).unwrap();
        }
    });
}
```

#### قياس فك تشفير الرسائل
```rust
#[bench]
fn bench_aes_decryption(b: &mut Bencher) {
    let encryption_manager = EncryptionManager::new().unwrap();
    let message = "رسالة اختبار";
    let shared_secret = vec![1u8; 32];
    let encrypted = encryption_manager.encrypt_message(message, &shared_secret).unwrap();
    
    b.iter(|| {
        encryption_manager.decrypt_message(&encrypted, &shared_secret).unwrap();
    });
}
```

### قياسات الشبكة

#### قياس وقت الاستجابة
```rust
#[bench]
fn bench_network_latency(b: &mut Bencher) {
    let client = MessagingClient::new("http://localhost:8080".to_string()).unwrap();
    let mut client = client;
    
    b.iter(|| {
        // قياس وقت تسجيل الدخول
        let start = std::time::Instant::now();
        let _ = client.login("benchmark_user");
        let duration = start.elapsed();
        
        // إرجاع الوقت بالميكروثانية
        duration.as_micros() as u64
    });
}
```

#### قياس معدل الإنتاجية
```rust
#[bench]
fn bench_message_throughput(b: &mut Bencher) {
    let client = MessagingClient::new("http://localhost:8080".to_string()).unwrap();
    let mut client = client;
    
    // تسجيل الدخول مرة واحدة
    client.login("benchmark_user").unwrap();
    
    b.iter(|| {
        let start = std::time::Instant::now();
        
        // إرسال 10 رسائل
        for i in 0..10 {
            let message = format!("رسالة اختبار رقم {}", i);
            let _ = client.send_message("receiver", &message);
        }
        
        let duration = start.elapsed();
        // إرجاع عدد الرسائل في الثانية
        (10.0 / duration.as_secs_f64()) as u64
    });
}
```

### قياسات التزامن

#### قياس العمليات المتوازية
```rust
#[bench]
fn bench_concurrent_encryption(b: &mut Bencher) {
    use tokio::task;
    use std::sync::Arc;
    
    let encryption_manager = Arc::new(EncryptionManager::new().unwrap());
    let shared_secret = vec![1u8; 32];
    let message = "رسالة اختبار";
    
    b.iter(|| {
        let rt = tokio::runtime::Runtime::new().unwrap();
        
        rt.block_on(async {
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
            
            let results = futures::future::join_all(handles).await;
            results.len() as u64
        })
    });
}
```

#### قياس توزيع الحمل
```rust
#[bench]
fn bench_load_distribution(b: &mut Bencher) {
    use std::sync::Arc;
    use std::sync::atomic::{AtomicUsize, Ordering};
    
    let counter = Arc::new(AtomicUsize::new(0));
    let encryption_manager = Arc::new(EncryptionManager::new().unwrap());
    let shared_secret = vec![1u8; 32];
    let message = "رسالة اختبار";
    
    b.iter(|| {
        let start = std::time::Instant::now();
        
        // تشغيل عمليات على خيوط مختلفة
        let handles: Vec<_> = (0..4)
            .map(|_| {
                let counter = Arc::clone(&counter);
                let manager = Arc::clone(&encryption_manager);
                let secret = shared_secret.clone();
                let msg = message.to_string();
                
                std::thread::spawn(move || {
                    for _ in 0..25 {
                        manager.encrypt_message(&msg, &secret).unwrap();
                        counter.fetch_add(1, Ordering::Relaxed);
                    }
                })
            })
            .collect();
        
        // انتظار اكتمال جميع الخيوط
        for handle in handles {
            handle.join().unwrap();
        }
        
        let duration = start.elapsed();
        let count = counter.load(Ordering::Relaxed);
        
        // إرجاع العمليات في الثانية
        (count as f64 / duration.as_secs_f64()) as u64
    });
}
```

## 📊 تحليل النتائج

### تحليل الإحصائيات
```rust
#[bench]
fn bench_with_statistics(b: &mut Bencher) {
    let encryption_manager = EncryptionManager::new().unwrap();
    let shared_secret = vec![1u8; 32];
    let message = "رسالة اختبار";
    
    let mut times = Vec::new();
    
    b.iter(|| {
        let start = std::time::Instant::now();
        let _ = encryption_manager.encrypt_message(message, &shared_secret);
        let duration = start.elapsed();
        times.push(duration.as_micros());
        
        duration.as_micros() as u64
    });
    
    // حساب الإحصائيات
    if times.len() > 1 {
        let sum: u128 = times.iter().sum();
        let mean = sum / times.len() as u128;
        let variance: u128 = times.iter()
            .map(|&x| (x as i128 - mean as i128).pow(2) as u128)
            .sum::<u128>() / (times.len() - 1) as u128;
        let std_dev = (variance as f64).sqrt();
        
        println!("Mean: {} μs", mean);
        println!("Std Dev: {:.2} μs", std_dev);
        println!("Min: {} μs", times.iter().min().unwrap());
        println!("Max: {} μs", times.iter().max().unwrap());
    }
}
```

### مقارنة الخوارزميات
```rust
#[bench]
fn bench_algorithm_comparison(b: &mut Bencher) {
    let encryption_manager = EncryptionManager::new().unwrap();
    let message = "رسالة اختبار";
    let shared_secret = vec![1u8; 32];
    
    b.iter(|| {
        // قياس Kyber768
        let kyber_start = std::time::Instant::now();
        let kyber = Kyber768::new().unwrap();
        let key_pair = kyber.generate_key_pair().unwrap();
        let (shared_secret_kyber, _) = kyber.encapsulate(&key_pair.public_key).unwrap();
        let kyber_time = kyber_start.elapsed();
        
        // قياس AES
        let aes_start = std::time::Instant::now();
        let _ = encryption_manager.encrypt_message(message, &shared_secret);
        let aes_time = aes_start.elapsed();
        
        // إرجاع الوقت الإجمالي
        (kyber_time + aes_time).as_micros() as u64
    });
}
```

## 🔍 مراقبة الأداء

### مراقبة استخدام الموارد
```rust
#[bench]
fn bench_memory_usage(b: &mut Bencher) {
    use std::alloc::{alloc, dealloc, Layout};
    
    b.iter(|| {
        let start_memory = get_memory_usage();
        
        // تشغيل العملية
        let encryption_manager = EncryptionManager::new().unwrap();
        let shared_secret = vec![1u8; 32];
        let message = "رسالة اختبار";
        
        for _ in 0..100 {
            let _ = encryption_manager.encrypt_message(message, &shared_secret);
        }
        
        let end_memory = get_memory_usage();
        let memory_diff = end_memory - start_memory;
        
        memory_diff
    });
}

fn get_memory_usage() -> usize {
    // تنفيذ بسيط لقياس الذاكرة
    // في التطبيق الحقيقي، استخدم مكتبة مثل `sysinfo`
    0
}
```

### مراقبة الأداء في الوقت الفعلي
```rust
#[bench]
fn bench_real_time_performance(b: &mut Bencher) {
    let encryption_manager = EncryptionManager::new().unwrap();
    let shared_secret = vec![1u8; 32];
    let message = "رسالة اختبار";
    
    let mut performance_history = Vec::new();
    
    b.iter(|| {
        let start = std::time::Instant::now();
        
        // تشغيل العملية
        let _ = encryption_manager.encrypt_message(message, &shared_secret);
        
        let duration = start.elapsed();
        performance_history.push(duration.as_micros());
        
        // حساب متوسط الأداء
        if performance_history.len() > 10 {
            performance_history.remove(0);
        }
        
        let avg_performance: u128 = performance_history.iter().sum::<u128>() / performance_history.len() as u128;
        avg_performance as u64
    });
}
```

## 📈 تحسين الأداء

### تحسينات الذاكرة
```rust
#[bench]
fn bench_memory_optimization(b: &mut Bencher) {
    // قبل التحسين
    b.iter(|| {
        let mut encryption_manager = EncryptionManager::new().unwrap();
        let shared_secret = vec![1u8; 32];
        let message = "رسالة اختبار";
        
        for _ in 0..1000 {
            let _ = encryption_manager.encrypt_message(message, &shared_secret);
        }
    });
}

#[bench]
fn bench_memory_optimized(b: &mut Bencher) {
    // بعد التحسين - إعادة استخدام الكائنات
    b.iter(|| {
        let encryption_manager = EncryptionManager::new().unwrap();
        let shared_secret = vec![1u8; 32];
        let message = "رسالة اختبار";
        
        for _ in 0..1000 {
            let _ = encryption_manager.encrypt_message(message, &shared_secret);
        }
    });
}
```

### تحسينات الخوارزميات
```rust
#[bench]
fn bench_algorithm_optimization(b: &mut Bencher) {
    // قبل التحسين
    b.iter(|| {
        let kyber = Kyber768::new().unwrap();
        let key_pair = kyber.generate_key_pair().unwrap();
        let _ = kyber.encapsulate(&key_pair.public_key);
    });
}

#[bench]
fn bench_algorithm_optimized(b: &mut Bencher) {
    // بعد التحسين - إعادة استخدام الكائنات
    let kyber = Kyber768::new().unwrap();
    let key_pair = kyber.generate_key_pair().unwrap();
    
    b.iter(|| {
        let _ = kyber.encapsulate(&key_pair.public_key);
    });
}
```

## 📋 قائمة فحص القياسات

### قبل تشغيل القياسات
- [ ] النظام في حالة مستقرة
- [ ] لا توجد عمليات أخرى تعمل
- [ ] الذاكرة متاحة كافية
- [ ] الشبكة مستقرة
- [ ] جميع التبعيات مثبتة

### أثناء القياسات
- [ ] مراقبة استخدام الموارد
- [ ] تسجيل النتائج
- [ ] فحص الأخطاء
- [ ] مقارنة النتائج
- [ ] تحليل الانحرافات

### بعد القياسات
- [ ] تحليل النتائج
- [ ] تحديد نقاط الضعف
- [ ] تطبيق التحسينات
- [ ] إعادة القياسات
- [ ] توثيق التحسينات

---

**قياسات دقيقة تعني تحسينات فعالة! 🚀**

*تذكر: الأداء الجيد هو نتيجة قياسات دقيقة وتحسينات مستمرة.*
