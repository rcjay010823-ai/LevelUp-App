import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Theme palettes
export const themes = {
  beige: {
    key: "beige",
    name: "Beige",
    primary: "#D4B896",
    background: "#FFFCF8",
    surface: "#FEFBF6",
    text: "#3B2F2F",
    textSecondary: "#6B5B5B",
    accent: "#F5F0EA",
    border: "#E8DCC6",
    inputBackground: "#FEFBF6",
    priority: {
      low: "#F0E6D2",
      medium: "#D4B896",
      high: "#B8965C",
    },
  },
  beigeDark: {
    key: "beigeDark",
    name: "Beige Dark",
    primary: "#D4B896",
    background: "#1A1614",
    surface: "#2A2420",
    text: "#F5F0EA",
    textSecondary: "#C9B99B",
    accent: "#3A332C",
    border: "#4A3E36",
    inputBackground: "#2A2420",
    priority: {
      low: "#F0E6D2",
      medium: "#D4B896",
      high: "#B8965C",
    },
  },
  pink: {
    key: "pink",
    name: "Light Pink",
    primary: "#F8CDE1",
    background: "#FFFAFC",
    surface: "#FEF7FA",
    text: "#4A334C",
    textSecondary: "#8B6B8D",
    accent: "#FFE8F0",
    border: "#F0D6E8",
    inputBackground: "#FEF7FA",
    priority: {
      low: "#FAD4E6",
      medium: "#F78DB7",
      high: "#C2185B",
    },
  },
  pinkDark: {
    key: "pinkDark",
    name: "Pink Dark",
    primary: "#F8CDE1",
    background: "#1A0F13",
    surface: "#2A1D23",
    text: "#FFE8F0",
    textSecondary: "#D9B3C7",
    accent: "#3A2B33",
    border: "#4A3943",
    inputBackground: "#2A1D23",
    priority: {
      low: "#FAD4E6",
      medium: "#F78DB7",
      high: "#C2185B",
    },
  },
  olive: {
    key: "olive",
    name: "Olive Green",
    primary: "#84B376",
    background: "#FBFCFA",
    surface: "#F7FAF5",
    text: "#2F3B2F",
    textSecondary: "#5A6B5A",
    accent: "#E8F2E1",
    border: "#D0E8C5",
    inputBackground: "#F7FAF5",
    priority: {
      low: "#D5E8CC",
      medium: "#84B376",
      high: "#5A7A4D",
    },
  },
  oliveDark: {
    key: "oliveDark",
    name: "Olive Dark",
    primary: "#84B376",
    background: "#0F1A0F",
    surface: "#1D2A1D",
    text: "#E8F2E1",
    textSecondary: "#B8D5AC",
    accent: "#2B3A2B",
    border: "#3B4A3B",
    inputBackground: "#1D2A1D",
    priority: {
      low: "#D5E8CC",
      medium: "#84B376",
      high: "#5A7A4D",
    },
  },
  blue: {
    key: "blue",
    name: "Light Blue",
    primary: "#B4D1EA",
    background: "#FBFDFF",
    surface: "#F6FBFF",
    text: "#2E3A47",
    textSecondary: "#5A6B78",
    accent: "#E5F1FA",
    border: "#C8E0F2",
    inputBackground: "#F6FBFF",
    priority: {
      low: "#E3F2FD",
      medium: "#64B5F6",
      high: "#1976D2",
    },
  },
  blueDark: {
    key: "blueDark",
    name: "Blue Dark",
    primary: "#B4D1EA",
    background: "#0F1A1F",
    surface: "#1D2A2F",
    text: "#E5F1FA",
    textSecondary: "#A8C5D9",
    accent: "#2B3A3F",
    border: "#3B4A4F",
    inputBackground: "#1D2A2F",
    priority: {
      low: "#E3F2FD",
      medium: "#64B5F6",
      high: "#1976D2",
    },
  },
};

const THEME_STORAGE_KEY = "@theme_selection";

export const useThemeStore = create((set, get) => ({
  currentTheme: themes.pink, // Default to pink

  setTheme: async (themeKey) => {
    const theme = themes[themeKey];
    if (theme) {
      set({ currentTheme: theme });
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, themeKey);
      } catch (error) {
        console.error("Failed to save theme:", error);
      }
    }
  },

  loadTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && themes[savedTheme]) {
        set({ currentTheme: themes[savedTheme] });
      }
    } catch (error) {
      console.error("Failed to load theme:", error);
    }
  },

  // Helper to get current colors
  colors: () => get().currentTheme,
}));

// Hook for easier theme access
export const useTheme = () => {
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const loadTheme = useThemeStore((state) => state.loadTheme);

  return {
    theme: {
      colors: currentTheme,
    },
    setTheme,
    loadTheme,
  };
};
