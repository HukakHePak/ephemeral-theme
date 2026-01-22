// Java Example
// Testing syntax highlighting for Java code

package com.ephemeral.theme;

import java.util.*;
import java.util.stream.Collectors;

/**
 * CyberpunkTheme class represents a cyberpunk-inspired color theme
 * for code editors.
 */
public class CyberpunkTheme {
    // Class fields
    private String name;
    private String version;
    private ColorPalette colors;
    private boolean isDark;

    // Constants
    private static final String DEFAULT_NAME = "Ephemeral";
    private static final String DEFAULT_VERSION = "0.0.1";
    private static final String NEON_CYAN = "#00ffff";
    private static final String NEON_MAGENTA = "#ff00ff";

    /**
     * Constructor
     */
    public CyberpunkTheme(String name, String version) {
        this.name = name;
        this.version = version;
        this.colors = new ColorPalette();
        this.isDark = true;
    }

    /**
     * Default constructor
     */
    public CyberpunkTheme() {
        this(DEFAULT_NAME, DEFAULT_VERSION);
    }

    /**
     * Apply the theme to the editor
     * @return true if successful
     */
    public boolean applyTheme() {
        System.out.println("Applying " + name + " theme v" + version);
        return true;
    }

    /**
     * Get theme name
     * @return theme name
     */
    public String getName() {
        return name;
    }

    /**
     * Set theme name
     * @param name theme name
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Static factory method
     */
    public static CyberpunkTheme createDefault() {
        return new CyberpunkTheme(DEFAULT_NAME, DEFAULT_VERSION);
    }

    // Inner class
    static class ColorPalette {
        private String primary;
        private String secondary;
        private String background;
        private Map<String, String> accents;

        public ColorPalette() {
            this.primary = NEON_CYAN;
            this.secondary = NEON_MAGENTA;
            this.background = "#0d0d1a";
            this.accents = new HashMap<>();
            this.accents.put("neonCyan", NEON_CYAN);
            this.accents.put("neonMagenta", NEON_MAGENTA);
            this.accents.put("neonGreen", "#00ff88");
        }

        public String getPrimary() {
            return primary;
        }
    }

    // Enum
    public enum ThemeType {
        DARK, LIGHT, AUTO
    }

    // Interface
    public interface ThemeListener {
        void onThemeChanged(String themeName);
        default void onThemeApplied() {
            System.out.println("Theme applied");
        }
    }

    // Lambda expressions and streams
    public List<String> filterBrightColors(List<String> colors) {
        return colors.stream()
            .filter(color -> calculateBrightness(color) > 128.0)
            .collect(Collectors.toList());
    }

    // Method with generics
    public <T extends Number> double calculateBrightness(T value) {
        return value.doubleValue();
    }

    // Overloaded method
    public double calculateBrightness(String hexColor) {
        String hex = hexColor.replace("#", "");
        int r = Integer.parseInt(hex.substring(0, 2), 16);
        int g = Integer.parseInt(hex.substring(2, 4), 16);
        int b = Integer.parseInt(hex.substring(4, 6), 16);
        return (r * 299 + g * 587 + b * 114) / 1000.0;
    }

    // Exception handling
    public void loadThemeConfig() throws ThemeLoadException {
        try {
            // Simulated loading
            if (name == null || name.isEmpty()) {
                throw new ThemeLoadException("Theme name cannot be empty");
            }
        } catch (Exception e) {
            throw new ThemeLoadException("Failed to load theme", e);
        }
    }

    // Custom exception
    static class ThemeLoadException extends Exception {
        public ThemeLoadException(String message) {
            super(message);
        }

        public ThemeLoadException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    // Main method
    public static void main(String[] args) {
        CyberpunkTheme theme = new CyberpunkTheme();
        theme.applyTheme();
        System.out.println("Theme name: " + theme.getName());

        // Anonymous class
        ThemeListener listener = new ThemeListener() {
            @Override
            public void onThemeChanged(String themeName) {
                System.out.println("Theme changed to: " + themeName);
            }
        };

        listener.onThemeChanged("Ephemeral");
    }
}
