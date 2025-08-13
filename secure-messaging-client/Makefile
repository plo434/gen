# Makefile for Secure Messaging Client with Kyber768

.PHONY: help build clean test run install-deps check-deps

# Default target
help:
	@echo "🔐 نظام الرسائل الآمن مع Kyber768"
	@echo "=================================="
	@echo ""
	@echo "الأهداف المتاحة:"
	@echo "  build        - بناء التطبيق"
	@echo "  clean        - تنظيف ملفات البناء"
	@echo "  test         - تشغيل الاختبارات"
	@echo "  run          - تشغيل التطبيق"
	@echo "  install-deps - تثبيت التبعيات"
	@echo "  check-deps   - التحقق من التبعيات"
	@echo "  help         - عرض هذه المساعدة"

# Check dependencies
check-deps:
	@echo "🔍 التحقق من التبعيات..."
	@which rustc > /dev/null || (echo "❌ Rust غير مثبت" && exit 1)
	@which cargo > /dev/null || (echo "❌ Cargo غير مثبت" && exit 1)
	@pkg-config --exists liboqs 2>/dev/null || (echo "❌ liboqs غير مثبت" && echo "💡 راجع build-instructions.md" && exit 1)
	@echo "✅ جميع التبعيات مثبتة"

# Install dependencies (Ubuntu/Debian)
install-deps:
	@echo "📦 تثبيت التبعيات..."
	sudo apt-get update
	sudo apt-get install -y build-essential cmake git pkg-config
	sudo apt-get install -y liboqs-dev
	@echo "✅ تم تثبيت التبعيات"

# Build the application
build: check-deps
	@echo "🔨 بناء التطبيق..."
	cargo build --release
	@echo "✅ تم بناء التطبيق بنجاح"

# Clean build files
clean:
	@echo "🧹 تنظيف ملفات البناء..."
	cargo clean
	@echo "✅ تم التنظيف"

# Run tests
test: check-deps
	@echo "🧪 تشغيل الاختبارات..."
	cargo test
	@echo "✅ تم تشغيل الاختبارات"

# Run the application
run: build
	@echo "🚀 تشغيل التطبيق..."
	./target/release/secure-messaging-client

# Development build
dev: check-deps
	@echo "🔨 بناء التطبيق للتطوير..."
	cargo build
	@echo "✅ تم البناء للتطوير"

# Check code
check: check-deps
	@echo "🔍 فحص الكود..."
	cargo check
	cargo clippy
	@echo "✅ تم فحص الكود"

# Format code
fmt:
	@echo "✨ تنسيق الكود..."
	cargo fmt
	@echo "✅ تم التنسيق"

# Install to system
install: build
	@echo "📥 تثبيت التطبيق..."
	sudo cp target/release/secure-messaging-client /usr/local/bin/
	@echo "✅ تم التثبيت في /usr/local/bin/"

# Uninstall from system
uninstall:
	@echo "🗑️ إزالة التطبيق..."
	sudo rm -f /usr/local/bin/secure-messaging-client
	@echo "✅ تم الإزالة"

# Show version
version:
	@echo "📋 معلومات الإصدار:"
	@echo "Rust: $(shell rustc --version)"
	@echo "Cargo: $(shell cargo --version)"
	@echo "liboqs: $(shell pkg-config --modversion liboqs 2>/dev/null || echo "غير مثبت")"
