import { useThemeStore } from "./theme";

// Function to get priority options with theme-based colors
export const getPriorityOptions = (colors) => [
  { value: "", label: "No Priority", color: null },
  { value: "low", label: "Low", color: colors.priority.low },
  { value: "medium", label: "Medium", color: colors.priority.medium },
  { value: "high", label: "High", color: colors.priority.high },
];

// Legacy PRIORITY_OPTIONS for backward compatibility (but should use getPriorityOptions)
export const PRIORITY_OPTIONS = [
  { value: "", label: "No Priority", color: null },
  { value: "low", label: "Low", color: "#10B981" },
  { value: "medium", label: "Medium", color: "#3B82F6" },
  { value: "high", label: "High", color: "#EF4444" },
];

export const COLOR_OPTIONS = [
  { value: "#D4B896", label: "Beige" },
  { value: "#F8CDE1", label: "Pink" },
  { value: "#84B376", label: "Olive" },
  { value: "#B4D1EA", label: "Blue" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#10B981", label: "Emerald" },
];

export const formatTime = (timeString) => {
  if (!timeString) return "";
  return timeString.slice(0, 5); // "HH:MM"
};

// Helper function to get priority color from theme
export const getPriorityColor = (priority, colors) => {
  if (!priority) return null;
  return colors.priority[priority] || colors.primary;
};

// Helper function to determine if text should be white or dark on priority backgrounds
export const getPriorityTextColor = (priority, colors) => {
  if (!priority) return colors.text;

  // For high priority, use white text for better contrast
  if (priority === "high") return "white";

  // For low/medium priority, check if it's a dark theme
  const isDarkTheme =
    colors.background.includes("1A") || colors.background.includes("0F");
  return isDarkTheme ? "white" : colors.text;
};
