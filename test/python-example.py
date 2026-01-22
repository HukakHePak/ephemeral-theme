# Python Example
# Testing syntax highlighting for Python code

class CyberpunkTheme:
    """A cyberpunk-themed color scheme for code editors."""
    
    def __init__(self, name: str, version: str):
        self.name = name
        self.version = version
        self.colors = {
            "primary": "#00ffff",
            "secondary": "#ff00ff",
            "background": "#0d0d1a"
        }
    
    def apply_theme(self) -> bool:
        """Apply the theme to the editor."""
        print(f"Applying {self.name} theme v{self.version}")
        return True
    
    @staticmethod
    def get_default_colors() -> dict:
        """Get default color palette."""
        return {
            "neon_cyan": "#00ffff",
            "neon_magenta": "#ff00ff",
            "dark_purple": "#0d0d1a"
        }

# Function definitions
def calculate_brightness(color: str) -> float:
    """Calculate brightness of a hex color."""
    hex_color = color.replace("#", "")
    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)
    return (r * 299 + g * 587 + b * 114) / 1000

# Lambda functions
create_theme = lambda name, colors: {
    "name": name,
    "colors": colors,
    "is_dark": True,
    "created_at": datetime.now()
}

# Async/await example
async def load_theme_config():
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("/api/theme/config") as response:
                data = await response.json()
                return data
    except Exception as error:
        print(f"Failed to load theme: {error}")
        return None

# F-strings
theme_description = f"""
  Theme: {theme.name}
  Colors: {json.dumps(theme.colors)}
  Version: {theme.version}
"""

# Lists and dictionaries
neon_colors = ["#00ffff", "#ff00ff", "#00ff88", "#ffd700"]
theme_settings = {
    "editor": {
        "background": "#0d0d1a",
        "foreground": "#e0e0ff"
    },
    "syntax": {
        "functions": "#00ffff",
        "keywords": "#ff00ff",
        "strings": "#00ff88"
    }
}

# Boolean and None
is_active = True
is_disabled = False
current_theme = None

# List comprehensions
bright_colors = [color for color in neon_colors if calculate_brightness(color) > 128]
squared_numbers = [x**2 for x in range(10)]

# Decorators
@staticmethod
def get_version():
    return "0.0.1"

# Type hints
from typing import Dict, List, Optional

def process_colors(colors: List[str]) -> Optional[Dict[str, str]]:
    return {f"color_{i}": color for i, color in enumerate(colors)}
