# 🚀 دليل النشر

## 📋 نظرة عامة

هذا الدليل يشرح كيفية نشر نظام الرسائل الآمن مع Kyber768 في بيئة إنتاجية.

## 🎯 بيئات النشر

### 🏠 التطوير المحلي
- **الغرض**: تطوير واختبار
- **الأمان**: أساسي
- **الأداء**: منخفض
- **التكلفة**: مجانية

### ☁️ السحابة العامة
- **الغرض**: اختبار وتطوير
- **الأمان**: متوسط
- **الأداء**: متوسط
- **التكلفة**: منخفضة

### 🏢 الإنتاج
- **الغرض**: استخدام حقيقي
- **الأمان**: عالي
- **الأداء**: عالي
- **التكلفة**: متوسطة إلى عالية

## 🛠️ متطلبات النشر

### 📦 المتطلبات الأساسية
- **Rust 1.70+**: لغة البرمجة
- **liboqs**: مكتبة التشفير
- **Node.js 18+**: لتشغيل السيرفر
- **Git**: إدارة الكود

### 🔐 متطلبات الأمان
- **شهادة SSL**: HTTPS
- **جدار الحماية**: حماية الشبكة
- **مراقبة الأمان**: كشف التهديدات
- **نسخ احتياطية**: حماية البيانات

### 🌐 متطلبات الشبكة
- **منفذ مفتوح**: 8080 (أو المنفذ المخصص)
- **DNS**: اسم نطاق
- **CDN**: تسريع المحتوى
- **Load Balancer**: توزيع الحمل

## 🚀 خطوات النشر

### 1. إعداد البيئة

#### تثبيت التبعيات
```bash
# تحديث النظام
sudo apt-get update && sudo apt-get upgrade -y

# تثبيت التبعيات الأساسية
sudo apt-get install -y build-essential cmake git pkg-config

# تثبيت Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# تثبيت liboqs
sudo apt-get install -y liboqs-dev

# تثبيت Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### استنساخ المشروع
```bash
# استنساخ المشروع
git clone https://github.com/your-username/secure-messaging-client.git
cd secure-messaging-client

# بناء التطبيق
cargo build --release

# تثبيت التبعيات
npm install
```

### 2. تكوين التطبيق

#### ملف التكوين
```bash
# إنشاء ملف التكوين
cat > config.toml << EOF
[server]
host = "0.0.0.0"
port = 8080
ssl = true
cert_file = "/path/to/cert.pem"
key_file = "/path/to/key.pem"

[database]
type = "postgresql"
host = "localhost"
port = 5432
name = "secure_messaging"
user = "messaging_user"
password = "secure_password"

[security]
kyber_level = "kyber768"
aes_mode = "aes256-gcm"
key_rotation = 86400
max_connections = 1000

[logging]
level = "info"
file = "/var/log/secure-messaging.log"
max_size = "100MB"
backup_count = 5
EOF
```

#### متغيرات البيئة
```bash
# إنشاء ملف البيئة
cat > .env << EOF
NODE_ENV=production
PORT=8080
HOST=0.0.0.0
SSL_KEY_PATH=/path/to/key.pem
SSL_CERT_PATH=/path/to/cert.pem
DATABASE_URL=postgresql://user:pass@localhost/db
LOG_LEVEL=info
EOF

# تحميل المتغيرات
source .env
```

### 3. إعداد قاعدة البيانات

#### PostgreSQL
```bash
# تثبيت PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# إنشاء قاعدة البيانات
sudo -u postgres createdb secure_messaging

# إنشاء المستخدم
sudo -u postgres createuser messaging_user

# تعيين كلمة المرور
sudo -u postgres psql -c "ALTER USER messaging_user PASSWORD 'secure_password';"

# منح الصلاحيات
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE secure_messaging TO messaging_user;"
```

#### Redis (اختياري)
```bash
# تثبيت Redis
sudo apt-get install -y redis-server

# تكوين Redis
sudo nano /etc/redis/redis.conf

# إعادة تشغيل Redis
sudo systemctl restart redis
```

### 4. إعداد SSL

#### شهادة Let's Encrypt
```bash
# تثبيت Certbot
sudo apt-get install -y certbot

# الحصول على شهادة
sudo certbot certonly --standalone -d your-domain.com

# تجديد تلقائي
sudo crontab -e
# أضف: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### شهادة مخصصة
```bash
# إنشاء مفتاح خاص
openssl genrsa -out private.key 2048

# إنشاء طلب توقيع شهادة
openssl req -new -key private.key -out request.csr

# توقيع الشهادة (إذا كان لديك CA)
openssl x509 -req -in request.csr -signkey private.key -out certificate.pem
```

### 5. إعداد الخدمة

#### systemd Service
```bash
# إنشاء ملف الخدمة
sudo nano /etc/systemd/system/secure-messaging.service
```

```ini
[Unit]
Description=Secure Messaging System
After=network.target

[Service]
Type=simple
User=messaging
WorkingDirectory=/opt/secure-messaging
ExecStart=/opt/secure-messaging/target/release/secure-messaging-client
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=8080

[Install]
WantedBy=multi-user.target
```

#### تشغيل الخدمة
```bash
# إعادة تحميل systemd
sudo systemctl daemon-reload

# تفعيل الخدمة
sudo systemctl enable secure-messaging

# تشغيل الخدمة
sudo systemctl start secure-messaging

# فحص الحالة
sudo systemctl status secure-messaging
```

### 6. إعداد Nginx

#### تثبيت Nginx
```bash
# تثبيت Nginx
sudo apt-get install -y nginx

# إنشاء ملف التكوين
sudo nano /etc/nginx/sites-available/secure-messaging
```

#### تكوين Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### تفعيل الموقع
```bash
# إنشاء رابط رمزي
sudo ln -s /etc/nginx/sites-available/secure-messaging /etc/nginx/sites-enabled/

# اختبار التكوين
sudo nginx -t

# إعادة تشغيل Nginx
sudo systemctl restart nginx
```

### 7. إعداد جدار الحماية

#### UFW
```bash
# تثبيت UFW
sudo apt-get install -y ufw

# تكوين UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 8080

# تفعيل UFW
sudo ufw enable
```

#### iptables (متقدم)
```bash
# إنشاء قواعد iptables
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
sudo iptables -A INPUT -j DROP

# حفظ القواعد
sudo iptables-save > /etc/iptables/rules.v4
```

### 8. مراقبة النظام

#### تثبيت أدوات المراقبة
```bash
# تثبيت htop
sudo apt-get install -y htop

# تثبيت netstat
sudo apt-get install -y net-tools

# تثبيت logrotate
sudo apt-get install -y logrotate
```

#### تكوين logrotate
```bash
# إنشاء ملف logrotate
sudo nano /etc/logrotate.d/secure-messaging
```

```
/var/log/secure-messaging.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 messaging messaging
    postrotate
        systemctl reload secure-messaging
    endscript
}
```

## 🔒 أمان الإنتاج

### 🔐 أفضل الممارسات الأمنية
- **تحديثات منتظمة**: تحديث النظام والمكتبات
- **مراقبة السجلات**: مراقبة السجلات للأحداث المشبوهة
- **نسخ احتياطية**: نسخ احتياطية منتظمة
- **اختبارات الاختراق**: اختبارات أمنية دورية

### 🚨 استجابة الحوادث
- **خطة الاستجابة**: خطة واضحة للاستجابة للحوادث
- **فريق الاستجابة**: فريق مدرب للاستجابة
- **توثيق الحوادث**: توثيق شامل للحوادث
- **الدروس المستفادة**: تحليل الحوادث للتعلم

## 📊 مراقبة الأداء

### 📈 مؤشرات الأداء
- **استخدام CPU**: < 80%
- **استخدام الذاكرة**: < 80%
- **استخدام القرص**: < 90%
- **وقت الاستجابة**: < 100ms

### 🛠️ أدوات المراقبة
- **Prometheus**: جمع المقاييس
- **Grafana**: عرض المقاييس
- **Alertmanager**: إدارة التنبيهات
- **Node Exporter**: مقاييس النظام

## 🔄 التحديثات والصيانة

### 📦 التحديثات
```bash
# سحب التحديثات
git pull origin main

# إعادة البناء
cargo build --release

# إعادة تشغيل الخدمة
sudo systemctl restart secure-messaging
```

### 🧹 الصيانة
```bash
# تنظيف الملفات المؤقتة
sudo journalctl --vacuum-time=7d

# تنظيف السجلات القديمة
sudo logrotate -f /etc/logrotate.d/secure-messaging

# تحديث النظام
sudo apt-get update && sudo apt-get upgrade -y
```

## 🆘 استكشاف الأخطاء

### 🔍 المشاكل الشائعة
- **مشاكل الاتصال**: فحص الشبكة والمنافذ
- **مشاكل الذاكرة**: فحص استخدام الذاكرة
- **مشاكل الأداء**: فحص استخدام الموارد
- **مشاكل الأمان**: فحص السجلات والتنبيهات

### 📞 الحصول على المساعدة
- **GitHub Issues**: للمشاكل التقنية
- **Documentation**: للأسئلة العامة
- **Community**: للمناقشات
- **Support**: للمشاكل الحرجة

---

**نشر سعيد! 🚀**

*تذكر أن الأمان مسؤولية مستمرة. راقب نظامك بانتظام وحافظ على تحديثه.*
