import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { Award } from "lucide-react-native";
import { useThemeStore } from "../../utils/theme";
import {
  useFonts,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";

export const BadgeModal = ({ visible, onClose, badge }) => {
  const { currentTheme: colors } = useThemeStore();
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
  });

  if (!fontsLoaded || !badge) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.7)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 24,
            padding: 32,
            marginHorizontal: 32,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.border,
            maxWidth: 320,
          }}
        >
          <Award size={64} color={colors.primary} />
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: colors.text,
              marginTop: 16,
              textAlign: "center",
              fontFamily: "PlayfairDisplay_700Bold",
            }}
          >
            {badge.name}
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: colors.textSecondary,
              marginTop: 8,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            {badge.message}
          </Text>

          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 24,
              marginTop: 24,
            }}
          >
            <Text
              style={{
                color: colors.surface,
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              Awesome!
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
