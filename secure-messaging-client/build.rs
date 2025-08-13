use std::env;
use std::path::PathBuf;

fn main() {
    // Tell cargo to look for shared libraries in the specified directory
    println!("cargo:rustc-link-search=native={}", env::var("OUT_DIR").unwrap());
    
    // Tell cargo to tell rustc to link our C library
    println!("cargo:rustc-link-lib=dylib=oqs");
    
    // Only rerun if our build script changes
    println!("cargo:rerun-if-changed=build.rs");
    
    // Build liboqs
    let out_dir = PathBuf::from(env::var("OUT_DIR").unwrap());
    
    // Clone and build liboqs if not already present
    let liboqs_dir = out_dir.join("liboqs");
    if !liboqs_dir.exists() {
        // This is a simplified build - in practice you'd want to handle this more robustly
        println!("cargo:warning=liboqs not found. Please install liboqs development libraries.");
        println!("cargo:warning=On Ubuntu/Debian: sudo apt-get install liboqs-dev");
        println!("cargo:warning=On macOS: brew install liboqs");
        println!("cargo:warning=On Windows: Download from https://github.com/open-quantum-safe/liboqs");
    }
}
