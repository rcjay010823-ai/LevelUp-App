import React from "react";
import { View, Text } from "react-native";
import { useThemeStore } from "../../utils/theme";
import {
  useFonts,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";

export const HealthHeader = () => {
  const { currentTheme: colors } = useThemeStore();
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          color: "#000000",
          fontFamily: "PlayfairDisplay_700Bold",
          textAlign: "center",
        }}
      >
        Health
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: colors.textSecondary,
          textAlign: "center",
          marginTop: 4,
          fontStyle: "italic",
        }}
      >
        A simple, motivating space to track healthy habits
      </Text>
    </View>
  );
};
