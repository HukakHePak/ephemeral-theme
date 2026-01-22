# Ephemeral Theme

A beautiful, ephemeral dark theme for Cursor and Visual Studio Code.

## Features

- 🌙 Dark, easy-on-the-eyes color scheme
- 🎨 Carefully crafted syntax highlighting
- 💫 Smooth, modern UI elements
- 🔧 Optimized for long coding sessions

## Installation

### From VSIX file

1. Download the `.vsix` file
2. Open VS Code or Cursor
3. Go to Extensions (Ctrl+Shift+X)
4. Click the `...` menu and select "Install from VSIX..."
5. Select the downloaded file

### From source

1. Clone this repository
2. Open the folder in VS Code or Cursor
3. Press `F5` to open a new window with the theme loaded
4. Or run `vsce package` to create a `.vsix` file

## Usage

1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Type "Preferences: Color Theme"
3. Select "Ephemeral"

## Color Palette

Inspired by cyberpunk neon aesthetics:

- **Background**: `#0d0d1a` - Deep dark purple-blue
- **Foreground**: `#e0e0ff` - Soft bluish white
- **Primary Accent**: `#00ffff` - Bright neon cyan (like the EPHEMERAL sign)
- **Secondary Accent**: `#ff00ff` - Neon magenta/pink
- **Strings**: `#00ff88` - Neon green
- **Keywords**: `#ff00ff` - Neon magenta
- **Functions**: `#00ffff` - Bright cyan
- **Numbers**: `#ffd700` - Gold/yellow
- **Comments**: `#6b4a9d` - Muted purple

## Development

To modify the theme:

1. Edit `themes/ephemeral-color-theme.json`
2. Press `F5` to test changes
3. Run `vsce package` to build the extension

## License

MIT
