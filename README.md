# Ephemeral Theme

A beautiful, ephemeral dark theme for Visual Studio Code and Cursor

## Features

- 🌙 Dark, easy-on-the-eyes color scheme
- 🎨 Carefully crafted syntax highlighting
- 💫 Smooth, modern UI elements
- 🔧 Optimized for long coding sessions
-  ⎛⎝ ≽ > ⩊ < ≼ ⎠⎞ Infinite animeeee

## Inspiration

[❤️ Geoxor - Ephemeral ❤️](https://youtu.be/Hbj3z8Db4Rk?si=ZxeWDGI0jvnLgzD3)

This track was one of the first compositions that got me actively listening to this amazing artist, and it became the inspiration for creating this theme.

## Color Palettes

### Ephemeral (Pure)

Soft, pure colors with gentle purple accents:

- **Background**: `#0d0d1a` - Deep dark purple-blue
- **Foreground**: `#d0e8ff` - Bright almost-white blue
- **Primary Accent**: `#d488ff` - Bright purple
- **Secondary Accent**: `#d4b3f0` - Soft purple
- **Strings**: `#66d4a0` - Soft green
- **Keywords**: `#d4b3f0` - Soft purple
- **Functions**: `#ff88c4` - Pink
- **Numbers**: `#e6c866` - Gold
- **Comments**: `#6b4a9d` - Muted purple

### Ephemeral Contrast

Bright neon colors with high contrast, inspired by cyberpunk aesthetics:

- **Background**: `#0d0d1a` - Deep dark purple-blue
- **Foreground**: `#e0e0ff` - Soft bluish white
- **Primary Accent**: `#cc66ff` - Bright neon purple
- **Secondary Accent**: `#ff00ff` - Neon magenta/pink
- **Strings**: `#00ff88` - Neon green
- **Keywords**: `#ff00ff` - Neon magenta
- **Functions**: `#00ffff` - Bright cyan
- **Numbers**: `#ffd700` - Gold/yellow
- **Comments**: `#9d8cc0` - Lilac
- **JSON Keys / JS/TS Keywords**: `#ff6600` - Neon orange
- **Scrollbar**: Purple with neon purple hover
- **Input Fields**: Purple background with neon purple border

## Background Image Settings

The theme includes an optional animated background image. You can control it through VS Code/Cursor settings:

### Configuration Options

1. **Enable/Disable Background**
   - Setting: `ephemeral-theme.enabled`
   - Type: `boolean`
   - Default: `true`
   - Description: Enable or disable the background image

2. **Background Opacity**
   - Setting: `ephemeral-theme.opacity`
   - Type: `number`
   - Default: `0.05`
   - Range: `0.0` to `1.0`
   - Description: Control the opacity of the background image (0 = transparent, 1 = fully opaque)

### How to Configure

1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Type "Preferences: Open User Settings (JSON)"
3. Add or modify the settings:
   ```json
   {
       "ephemeral-theme.enabled": true,
       "ephemeral-theme.opacity": 0.05
   }
   ```
4. Save the file and reload the window to apply changes

**Note:** The background is automatically enabled when you switch to an Ephemeral theme. You can disable it anytime through settings.

**Note:** Background image functionality is adapted from [shalldie/vscode-background](https://github.com/shalldie/vscode-background) extension. Background images and GIFs are sourced from the video linked in the Inspiration section above.

## License

MIT
