// Rust Example
// Testing syntax highlighting for Rust code

use std::collections::HashMap;

// Struct definition
#[derive(Debug, Clone)]
struct CyberpunkTheme {
    name: String,
    version: String,
    colors: ColorPalette,
    is_dark: bool,
}

// Struct with methods
impl CyberpunkTheme {
    // Associated function (like static method)
    fn new(name: String, version: String) -> Self {
        Self {
            name,
            version,
            colors: ColorPalette::default(),
            is_dark: true,
        }
    }

    // Instance method
    fn apply_theme(&self) -> bool {
        println!("Applying {} theme v{}", self.name, self.version);
        true
    }

    // Method with mutable reference
    fn update_version(&mut self, version: String) {
        self.version = version;
    }

    // Getter method
    fn get_name(&self) -> &str {
        &self.name
    }
}

// Struct with tuple fields
struct ColorPalette {
    primary: String,
    secondary: String,
    background: String,
    accents: HashMap<String, String>,
}

impl Default for ColorPalette {
    fn default() -> Self {
        let mut accents = HashMap::new();
        accents.insert("neon_cyan".to_string(), "#00ffff".to_string());
        accents.insert("neon_magenta".to_string(), "#ff00ff".to_string());
        accents.insert("neon_green".to_string(), "#00ff88".to_string());

        Self {
            primary: "#00ffff".to_string(),
            secondary: "#ff00ff".to_string(),
            background: "#0d0d1a".to_string(),
            accents,
        }
    }
}

// Enum
enum ThemeType {
    Dark,
    Light,
    Auto,
}

// Enum with data
enum ThemeStatus {
    Active,
    Inactive,
    Loading(String),
    Error { code: u32, message: String },
}

// Function with generics
fn calculate_brightness<T: AsRef<str>>(color: T) -> f64 {
    let hex = color.as_ref().replace("#", "");
    let r = u8::from_str_radix(&hex[0..2], 16).unwrap_or(0);
    let g = u8::from_str_radix(&hex[2..4], 16).unwrap_or(0);
    let b = u8::from_str_radix(&hex[4..6], 16).unwrap_or(0);
    (r as f64 * 299.0 + g as f64 * 587.0 + b as f64 * 114.0) / 1000.0
}

// Async function
async fn load_theme_config() -> Result<CyberpunkTheme, Box<dyn std::error::Error>> {
    // Simulated async operation
    Ok(CyberpunkTheme::new(
        "Ephemeral".to_string(),
        "0.0.1".to_string(),
    ))
}

// Trait definition
trait ThemeTrait {
    fn apply(&self) -> bool;
    fn get_colors(&self) -> &ColorPalette;
}

// Trait implementation
impl ThemeTrait for CyberpunkTheme {
    fn apply(&self) -> bool {
        self.apply_theme()
    }

    fn get_colors(&self) -> &ColorPalette {
        &self.colors
    }
}

// Generic function with trait bounds
fn process_theme<T: ThemeTrait>(theme: &T) -> bool {
    theme.apply()
}

// Pattern matching
fn match_theme_status(status: ThemeStatus) -> String {
    match status {
        ThemeStatus::Active => "Theme is active".to_string(),
        ThemeStatus::Inactive => "Theme is inactive".to_string(),
        ThemeStatus::Loading(msg) => format!("Loading: {}", msg),
        ThemeStatus::Error { code, message } => {
            format!("Error {}: {}", code, message)
        }
    }
}

// Closures
let create_theme = |name: String| -> CyberpunkTheme {
    CyberpunkTheme::new(name, "0.0.1".to_string())
};

// Iterator example
let neon_colors = vec!["#00ffff", "#ff00ff", "#00ff88", "#ffd700"];
let bright_colors: Vec<&str> = neon_colors
    .iter()
    .filter(|&&color| calculate_brightness(color) > 128.0)
    .copied()
    .collect();

// Error handling
fn try_load_theme() -> Result<CyberpunkTheme, String> {
    let theme = CyberpunkTheme::new("Ephemeral".to_string(), "0.0.1".to_string());
    if theme.is_dark {
        Ok(theme)
    } else {
        Err("Theme must be dark".to_string())
    }
}

// Main function
fn main() {
    let mut theme = CyberpunkTheme::new(
        "Ephemeral".to_string(),
        "0.0.1".to_string(),
    );
    
    theme.apply_theme();
    println!("Theme name: {}", theme.get_name());
}
