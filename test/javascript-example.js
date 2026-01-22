// JavaScript/TypeScript Example
// Testing syntax highlighting for functions, classes, and variables

class CyberpunkTheme {
  constructor(name, version) {
    this.name = name;
    this.version = version;
    this.colors = {
      primary: "#00ffff",
      secondary: "#ff00ff",
      background: "#0d0d1a"
    };
  }

  // Method to apply theme
  applyTheme() {
    console.log(`Applying ${this.name} theme v${this.version}`);
    return true;
  }

  // Static method
  static getDefaultColors() {
    return {
      neonCyan: "#00ffff",
      neonMagenta: "#ff00ff",
      darkPurple: "#0d0d1a"
    };
  }
}

// Function declarations
function calculateBrightness(color) {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

// Arrow function
const createTheme = (name, colors) => {
  return {
    name,
    colors,
    isDark: true,
    createdAt: new Date()
  };
};

// Async/await example
async function loadThemeConfig() {
  try {
    const response = await fetch("/api/theme/config");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to load theme:", error);
    return null;
  }
}

// Template literals
const themeDescription = `
  Theme: ${theme.name}
  Colors: ${JSON.stringify(theme.colors)}
  Version: ${theme.version}
`;

// Arrays and objects
const neonColors = ["#00ffff", "#ff00ff", "#00ff88", "#ffd700"];
const themeSettings = {
  editor: {
    background: "#0d0d1a",
    foreground: "#e0e0ff"
  },
  syntax: {
    functions: "#00ffff",
    keywords: "#ff00ff",
    strings: "#00ff88"
  }
};

// Boolean and null
const isActive = true;
const isDisabled = false;
const currentTheme = null;
const defaultTheme = undefined;

// Regular expressions
const hexColorPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const isValidColor = hexColorPattern.test("#00ffff");

// Export
export default CyberpunkTheme;
export { calculateBrightness, createTheme };
