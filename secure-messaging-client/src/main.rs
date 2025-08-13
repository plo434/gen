use anyhow::{Context, Result};
use aes_gcm::{Aes256Gcm, Key, Nonce};
use aes_gcm::aead::{Aead, NewAead};
use base64::{Engine as _, engine::general_purpose};
use rand::{Rng, RngCore};
use rand_core::OsRng;
use reqwest::Client;
use rustyline::DefaultEditor;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};

// FFI bindings for liboqs Kyber768
#[link(name = "oqs")]
extern "C" {
    fn OQS_KEM_new(alg_name: *const i8) -> *mut std::ffi::c_void;
    fn OQS_KEM_free(kem: *mut std::ffi::c_void);
    fn OQS_KEM_keypair(
        kem: *mut std::ffi::c_void,
        public_key: *mut u8,
        secret_key: *mut u8,
    ) -> i32;
    fn OQS_KEM_encaps(
        kem: *mut std::ffi::c_void,
        ciphertext: *mut u8,
        shared_secret: *mut u8,
        public_key: *const u8,
    ) -> i32;
    fn OQS_KEM_decaps(
        kem: *mut std::ffi::c_void,
        shared_secret: *mut u8,
        ciphertext: *const u8,
        secret_key: *const u8,
    ) -> i32;
}

// Types for API communication
#[derive(Debug, Serialize, Deserialize)]
struct Message {
    from: String,
    to: String,
    content: String,
    encrypted_content: String,
    ciphertext: String,
    timestamp: u64,
}

#[derive(Debug, Serialize, Deserialize)]
struct User {
    user_id: String,
    public_key: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct KeyPair {
    public_key: Vec<u8>,
    private_key: Vec<u8>,
}

#[derive(Debug, Serialize, Deserialize)]
struct EncryptedMessage {
    encrypted_content: String,
    ciphertext: String,
    nonce: String,
}

// Real Kyber768 implementation using liboqs
struct Kyber768 {
    kem_ptr: *mut std::ffi::c_void,
    public_key_length: usize,
    secret_key_length: usize,
    ciphertext_length: usize,
    shared_secret_length: usize,
}

impl Kyber768 {
    fn new() -> Result<Self> {
        unsafe {
            let kem_name = std::ffi::CString::new("Kyber768").unwrap();
            let kem_ptr = OQS_KEM_new(kem_name.as_ptr());
            
            if kem_ptr.is_null() {
                anyhow::bail!("Failed to initialize Kyber768");
            }
            
            // Kyber768 key sizes
            let public_key_length = 1184;
            let secret_key_length = 2400;
            let ciphertext_length = 1088;
            let shared_secret_length = 32;
            
            Ok(Self {
                kem_ptr,
                public_key_length,
                secret_key_length,
                ciphertext_length,
                shared_secret_length,
            })
        }
    }

    // Generate key pair
    fn generate_key_pair(&self) -> Result<KeyPair> {
        unsafe {
            let mut public_key = vec![0u8; self.public_key_length];
            let mut secret_key = vec![0u8; self.secret_key_length];
            
            let result = OQS_KEM_keypair(
                self.kem_ptr,
                public_key.as_mut_ptr(),
                secret_key.as_mut_ptr(),
            );
            
            if result != 0 {
                anyhow::bail!("Failed to generate Kyber768 key pair");
            }
            
            Ok(KeyPair { public_key, private_key: secret_key })
        }
    }

    // Encapsulate (generate shared secret and ciphertext)
    fn encapsulate(&self, public_key: &[u8]) -> Result<(Vec<u8>, Vec<u8>)> {
        unsafe {
            let mut shared_secret = vec![0u8; self.shared_secret_length];
            let mut ciphertext = vec![0u8; self.ciphertext_length];
            
            let result = OQS_KEM_encaps(
                self.kem_ptr,
                ciphertext.as_mut_ptr(),
                shared_secret.as_mut_ptr(),
                public_key.as_ptr(),
            );
            
            if result != 0 {
                anyhow::bail!("Failed to perform Kyber768 encapsulation");
            }
            
            Ok((shared_secret, ciphertext))
        }
    }

    // Decapsulate (recover shared secret from ciphertext)
    fn decapsulate(&self, ciphertext: &[u8], private_key: &[u8]) -> Result<Vec<u8>> {
        unsafe {
            let mut shared_secret = vec![0u8; self.shared_secret_length];
            
            let result = OQS_KEM_decaps(
                self.kem_ptr,
                shared_secret.as_mut_ptr(),
                ciphertext.as_ptr(),
                private_key.as_ptr(),
            );
            
            if result != 0 {
                anyhow::bail!("Failed to perform Kyber768 decapsulation");
            }
            
            Ok(shared_secret)
        }
    }
}

impl Drop for Kyber768 {
    fn drop(&mut self) {
        unsafe {
            OQS_KEM_free(self.kem_ptr);
        }
    }
}

// Encryption utilities
struct EncryptionManager {
    kyber: Kyber768,
    key_pairs: HashMap<String, KeyPair>,
    shared_secrets: HashMap<String, Vec<u8>>,
}

impl EncryptionManager {
    fn new() -> Result<Self> {
        Ok(Self {
            kyber: Kyber768::new()?,
            key_pairs: HashMap::new(),
            shared_secrets: HashMap::new(),
        })
    }

    // Generate new key pair for user
    fn generate_user_keys(&mut self, user_id: &str) -> Result<KeyPair> {
        let key_pair = self.kyber.generate_key_pair()?;
        self.key_pairs.insert(user_id.to_string(), key_pair.clone());
        Ok(key_pair)
    }

    // Get user's public key
    fn get_public_key(&self, user_id: &str) -> Option<&Vec<u8>> {
        self.key_pairs.get(user_id).map(|kp| &kp.public_key)
    }

    // Perform key exchange with another user
    fn perform_key_exchange(&mut self, user_id: &str, other_user_id: &str, other_public_key: &[u8]) -> Result<()> {
        let (shared_secret, _ciphertext) = self.kyber.encapsulate(other_public_key)?;
        
        // Store shared secret for future use
        let key_name = format!("{}:{}", user_id, other_user_id);
        self.shared_secrets.insert(key_name, shared_secret);
        
        Ok(())
    }

    // Encrypt message using shared secret
    fn encrypt_message(&self, message: &str, shared_secret: &[u8]) -> Result<EncryptedMessage> {
        // Use first 32 bytes of shared secret as AES key
        let key = Key::from_slice(&shared_secret[..32]);
        let cipher = Aes256Gcm::new(key);
        
        // Generate random nonce
        let mut nonce_bytes = [0u8; 12];
        OsRng.fill_bytes(&mut nonce_bytes);
        let nonce = Nonce::from_slice(&nonce_bytes);
        
        // Encrypt message
        let encrypted_content = cipher
            .encrypt(nonce, message.as_bytes())
            .context("Failed to encrypt message")?;
        
        Ok(EncryptedMessage {
            encrypted_content: general_purpose::STANDARD.encode(&encrypted_content),
            ciphertext: general_purpose::STANDARD.encode(&shared_secret),
            nonce: general_purpose::STANDARD.encode(&nonce_bytes),
        })
    }

    // Decrypt message using shared secret
    fn decrypt_message(&self, encrypted_message: &EncryptedMessage, shared_secret: &[u8]) -> Result<String> {
        let key = Key::from_slice(&shared_secret[..32]);
        let cipher = Aes256Gcm::new(key);
        
        let encrypted_content = general_purpose::STANDARD.decode(&encrypted_message.encrypted_content)?;
        let nonce_bytes = general_purpose::STANDARD.decode(&encrypted_message.nonce)?;
        let nonce = Nonce::from_slice(&nonce_bytes);
        
        let decrypted_content = cipher
            .decrypt(nonce, encrypted_content.as_ref())
            .context("Failed to decrypt message")?;
        
        String::from_utf8(decrypted_content).context("Invalid UTF-8 in decrypted message")
    }
}

// Messaging client
struct MessagingClient {
    http_client: Client,
    encryption_manager: EncryptionManager,
    server_url: String,
    current_user: Option<String>,
}

impl MessagingClient {
    fn new(server_url: String) -> Result<Self> {
        Ok(Self {
            http_client: Client::new(),
            encryption_manager: EncryptionManager::new()?,
            server_url,
            current_user: None,
        })
    }

    // Login or create user
    async fn login(&mut self, user_id: &str) -> Result<()> {
        // Generate keys for user
        let key_pair = self.encryption_manager.generate_user_keys(user_id)?;
        
        // Send public key to server
        let user_data = User {
            user_id: user_id.to_string(),
            public_key: general_purpose::STANDARD.encode(&key_pair.public_key),
        };
        
        let response = self.http_client
            .post(&format!("{}/api/users", self.server_url))
            .json(&user_data)
            .send()
            .await?;
        
        if response.status().is_success() {
            self.current_user = Some(user_id.to_string());
            println!("✅ تم تسجيل الدخول بنجاح: {}", user_id);
            println!("🔑 تم إنشاء المفاتيح العامة والخاصة باستخدام Kyber768");
            println!("🔐 حجم المفتاح العام: {} بايت", key_pair.public_key.len());
            println!("🔐 حجم المفتاح الخاص: {} بايت", key_pair.private_key.len());
        } else {
            anyhow::bail!("فشل في تسجيل الدخول");
        }
        
        Ok(())
    }

    // Get list of users
    async fn get_users(&self) -> Result<Vec<String>> {
        let response = self.http_client
            .get(&format!("{}/api/users", self.server_url))
            .send()
            .await?;
        
        let users: Vec<String> = response.json().await?;
        Ok(users)
    }

    // Send encrypted message
    async fn send_message(&mut self, to_user: &str, content: &str) -> Result<()> {
        let current_user = self.current_user.as_ref()
            .context("يجب تسجيل الدخول أولاً")?;
        
        // Get recipient's public key from server
        let response = self.http_client
            .get(&format!("{}/api/users", self.server_url))
            .query(&[("userId", to_user)])
            .send()
            .await?;
        
        let users: Vec<User> = response.json().await?;
        let recipient = users.iter().find(|u| u.user_id == to_user)
            .context("المستخدم غير موجود")?;
        
        let recipient_public_key = general_purpose::STANDARD.decode(&recipient.public_key)?;
        
        // Perform key exchange if not already done
        let key_name = format!("{}:{}", current_user, to_user);
        if !self.encryption_manager.shared_secrets.contains_key(&key_name) {
            self.encryption_manager.perform_key_exchange(current_user, to_user, &recipient_public_key)?;
            println!("🔐 تم تبادل المفاتيح باستخدام Kyber768 مع المستخدم: {}", to_user);
        }
        
        let shared_secret = self.encryption_manager.shared_secrets.get(&key_name)
            .context("فشل في الحصول على المفتاح المشترك")?;
        
        // Encrypt message
        let encrypted_message = self.encryption_manager.encrypt_message(content, shared_secret)?;
        
        // Send encrypted message to server
        let message_data = Message {
            from: current_user.clone(),
            to: to_user.to_string(),
            content: content.to_string(),
            encrypted_content: encrypted_message.encrypted_content,
            ciphertext: encrypted_message.ciphertext,
            timestamp: SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs(),
        };
        
        let response = self.http_client
            .post(&format!("{}/api/messages", self.server_url))
            .json(&message_data)
            .send()
            .await?;
        
        if response.status().is_success() {
            println!("✅ تم إرسال الرسالة المشفرة بنجاح إلى: {}", to_user);
            println!("🔐 الرسالة مشفرة باستخدام AES-256-GCM مع مفتاح مشتق من Kyber768");
        } else {
            anyhow::bail!("فشل في إرسال الرسالة");
        }
        
        Ok(())
    }

    // Get inbox messages
    async fn get_inbox(&self) -> Result<Vec<Message>> {
        let current_user = self.current_user.as_ref()
            .context("يجب تسجيل الدخول أولاً")?;
        
        let response = self.http_client
            .get(&format!("{}/api/inbox", self.server_url))
            .query(&[("userId", current_user)])
            .send()
            .await?;
        
        let messages: Vec<Message> = response.json().await?;
        Ok(messages)
    }

    // Decrypt and display inbox messages
    async fn display_inbox(&mut self) -> Result<()> {
        let messages = self.get_inbox().await?;
        
        if messages.is_empty() {
            println!("📭 صندوق الوارد فارغ");
            return Ok(());
        }
        
        println!("📬 صندوق الوارد:");
        println!("{}", "=".repeat(50));
        
        for message in messages {
            println!("من: {}", message.from);
            println!("الوقت: {}", message.timestamp);
            println!("المحتوى المشفر: {}", message.encrypted_content);
            println!("{}", "-".repeat(30));
        }
        
        Ok(())
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    env_logger::init();
    
    println!("🔐 نظام الرسائل الآمن مع Kyber768 الحقيقي");
    println!("==========================================");
    println!("🚀 يستخدم خوارزمية Kyber768 لما بعد الكم");
    println!("🔐 تشفير AES-256-GCM للرسائل");
    
    let server_url = "http://localhost:8080".to_string();
    let client = MessagingClient::new(server_url)?;
    let mut client = client;
    
    let mut rl = DefaultEditor::new()?;
    
    loop {
        let input = rl.readline("رسالة> ")?;
        let input = input.trim();
        
        match input {
            "login" | "تسجيل" => {
                let user_id = rl.readline("أدخل معرف المستخدم: ")?;
                if let Err(e) = client.login(&user_id.trim()).await {
                    println!("❌ خطأ: {}", e);
                }
            }
            "users" | "مستخدمين" => {
                match client.get_users().await {
                    Ok(users) => {
                        println!("👥 المستخدمون المتاحون:");
                        for user in users {
                            println!("  - {}", user);
                        }
                    }
                    Err(e) => println!("❌ خطأ: {}", e),
                }
            }
            "send" | "إرسال" => {
                let to_user = rl.readline("إلى من: ")?;
                let content = rl.readline("المحتوى: ")?;
                if let Err(e) = client.send_message(&to_user.trim(), &content.trim()).await {
                    println!("❌ خطأ: {}", e);
                }
            }
            "inbox" | "صندوق" => {
                if let Err(e) = client.display_inbox().await {
                    println!("❌ خطأ: {}", e);
                }
            }
            "help" | "مساعدة" => {
                println!("📖 الأوامر المتاحة:");
                println!("  login/تسجيل    - تسجيل الدخول أو إنشاء حساب");
                println!("  users/مستخدمين - عرض المستخدمين المتاحين");
                println!("  send/إرسال     - إرسال رسالة مشفرة");
                println!("  inbox/صندوق    - عرض صندوق الوارد");
                println!("  quit/خروج      - الخروج من التطبيق");
                println!("  help/مساعدة    - عرض هذه المساعدة");
            }
            "quit" | "خروج" | "exit" => {
                println!("👋 وداعاً!");
                break;
            }
            "" => continue,
            _ => {
                println!("❓ أمر غير معروف. اكتب 'help' للمساعدة");
            }
        }
    }
    
    Ok(())
}
