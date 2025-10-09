import React from "react";
import { View, Text } from "react-native";
import { useThemeStore } from "@/utils/theme";
import {
  useFonts,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";

export default function CalendarHeader() {
  const { currentTheme: colors } = useThemeStore();
  const [fontsLoaded] = useFonts({ PlayfairDisplay_700Bold });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.accent,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          color: colors.text,
          fontFamily: "PlayfairDisplay_700Bold",
        }}
      >
        Calendar
      </Text>
    </View>
  );
}
