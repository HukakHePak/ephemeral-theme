# Ephemeral Theme

A beautiful cyberpunk-inspired dark theme for Cursor and Visual Studio Code.

## Features

- 🌙 **Dark, easy-on-the-eyes** color scheme
- 🎨 **Carefully crafted** syntax highlighting
- 💫 **Smooth, modern** UI elements
- 🔧 **Optimized** for long coding sessions

## Color Palette

Inspired by cyberpunk neon aesthetics:

| Color | Hex | Usage |
|-------|-----|-------|
| Neon Cyan | `#00ffff` | Primary accent, functions |
| Neon Magenta | `#ff00ff` | Secondary accent, keywords |
| Neon Green | `#00ff88` | Strings |
| Gold | `#ffd700` | Numbers |
| Dark Purple | `#0d0d1a` | Background |

## Installation

### From VSIX file

1. Download the `.vsix` file
2. Open VS Code or Cursor
3. Go to Extensions (Ctrl+Shift+X)
4. Click the `...` menu and select "Install from VSIX..."
5. Select the downloaded file

### From source

```bash
git clone https://github.com/your-username/ephemeral-theme.git
cd ephemeral-theme
vsce package
```

## Usage

1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Type "Preferences: Color Theme"
3. Select "Ephemeral"

## Code Examples

### JavaScript

```javascript
function createTheme(name, colors) {
  return {
    name,
    colors,
    isDark: true
  };
}
```

### Python

```python
def apply_theme(theme_name: str) -> bool:
    """Apply the theme to the editor."""
    print(f"Applying {theme_name} theme")
    return True
```

### HTML

```html
<div class="neon-container">
  <h1>Ephemeral Theme</h1>
</div>
```

## Development

To modify the theme:

1. Edit `themes/ephemeral-color-theme.json`
2. Press `F5` to test changes
3. Run `vsce package` to build the extension

## License

MIT License - feel free to use and modify!

---

> "In the neon-lit streets of the digital city, code becomes art."
