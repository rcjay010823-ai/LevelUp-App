import React from "react";
import { View, Text } from "react-native";
import { useThemeStore } from "../../utils/theme";

export const ProgressRing = ({ percentage, cleanDays, totalDays }) => {
  const { currentTheme: colors } = useThemeStore();

  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: colors.accent,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 8,
          borderColor: colors.primary,
          borderStyle: percentage > 70 ? "solid" : "dashed",
        }}
      >
        <Text
          style={{ fontSize: 18, fontWeight: "bold", color: colors.primary }}
        >
          {percentage}%
        </Text>
      </View>
      <Text
        style={{
          marginTop: 8,
          fontSize: 14,
          color: colors.textSecondary,
          textAlign: "center",
        }}
      >
        Clean days this week
      </Text>
      <Text
        style={{
          marginTop: 16,
          fontSize: 14,
          color: colors.text,
          textAlign: "center",
        }}
      >
        {cleanDays || 0} of {totalDays || 0} clean days
      </Text>
    </View>
  );
};
