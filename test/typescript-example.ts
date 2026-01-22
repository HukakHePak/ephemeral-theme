// TypeScript Example
// Testing syntax highlighting with types and interfaces

interface ColorPalette {
  primary: string;
  secondary: string;
  background: string;
  accents: {
    neonCyan: string;
    neonMagenta: string;
    neonGreen: string;
  };
}

interface ThemeConfig {
  name: string;
  version: string;
  colors: ColorPalette;
  isDark: boolean;
}

// Class with generics
class CyberpunkTheme<T extends ThemeConfig> {
  private config: T;
  private isActive: boolean = false;

  constructor(config: T) {
    this.config = config;
  }

  // Public method
  public applyTheme(): boolean {
    console.log(`Applying ${this.config.name} theme v${this.config.version}`);
    this.isActive = true;
    return this.isActive;
  }

  // Getter
  get themeName(): string {
    return this.config.name;
  }

  // Setter
  set themeName(name: string) {
    this.config.name = name;
  }

  // Static method
  static createDefault(): CyberpunkTheme<ThemeConfig> {
    return new CyberpunkTheme<ThemeConfig>({
      name: "Ephemeral",
      version: "0.0.1",
      colors: {
        primary: "#00ffff",
        secondary: "#ff00ff",
        background: "#0d0d1a",
        accents: {
          neonCyan: "#00ffff",
          neonMagenta: "#ff00ff",
          neonGreen: "#00ff88"
        }
      },
      isDark: true
    });
  }
}

// Type aliases
type HexColor = string;
type ThemeName = string;
type ColorArray = HexColor[];

// Function with type parameters
function calculateBrightness<T extends HexColor>(color: T): number {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

// Generic function
function createTheme<T extends ThemeConfig>(
  name: string,
  colors: ColorPalette
): T {
  return {
    name,
    version: "0.0.1",
    colors,
    isDark: true
  } as T;
}

// Async function with return type
async function loadThemeConfig(): Promise<ThemeConfig | null> {
  try {
    const response = await fetch("/api/theme/config");
    const data: ThemeConfig = await response.json();
    return data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Failed to load theme:", error.message);
    }
    return null;
  }
}

// Enums
enum ThemeType {
  Dark = "dark",
  Light = "light",
  Auto = "auto"
}

enum AccentColor {
  NeonCyan = "#00ffff",
  NeonMagenta = "#ff00ff",
  NeonGreen = "#00ff88",
  Gold = "#ffd700"
}

// Union types
type ThemeStatus = "active" | "inactive" | "loading";
type ColorValue = string | number | null;

// Template literal types
type ThemePath = `themes/${string}-color-theme.json`;

// Arrays with type annotations
const neonColors: ColorArray = ["#00ffff", "#ff00ff", "#00ff88", "#ffd700"];
const themeSettings: Partial<ThemeConfig> = {
  name: "Ephemeral",
  isDark: true
};

// Optional chaining and nullish coalescing
const themeName = themeSettings?.name ?? "Default";
const version = themeSettings?.version || "0.0.1";

// Export statements
export default CyberpunkTheme;
export { ThemeConfig, ColorPalette, calculateBrightness, createTheme };
export type { HexColor, ThemeName, ColorArray };
