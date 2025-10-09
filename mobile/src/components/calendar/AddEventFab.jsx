import React from "react";
import { TouchableOpacity } from "react-native";
import { Plus } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeStore } from "@/utils/theme";

export default function AddEventFab({ onPress }) {
  const insets = useSafeAreaInsets();
  const { currentTheme: colors } = useThemeStore();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        position: "absolute",
        bottom: insets.bottom + 20,
        right: 20,
        backgroundColor: colors.primary,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <Plus size={24} color={colors.surface} />
    </TouchableOpacity>
  );
}
