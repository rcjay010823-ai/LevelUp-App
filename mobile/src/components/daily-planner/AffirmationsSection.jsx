import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Heart, Sparkles } from "lucide-react-native";
import { useThemeStore } from "@/utils/theme";
import { useRouter } from "expo-router";

export default function AffirmationsSection({ selectedDate }) {
  const { currentTheme: colors } = useThemeStore();
  const router = useRouter();

  // Mock user ID - in real app this would come from auth context
  const userId = "demo";

  // Fetch user settings for active affirmation
  const { data: userSettings } = useQuery({
    queryKey: ["userSettings", userId],
    queryFn: async () => {
      const response = await fetch(`/api/user-settings?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user settings");
      return response.json();
    },
  });

  // Get the active affirmation from user settings
  const activeAffirmation = userSettings?.settings?.active_affirmation_text;

  return (
    <View style={{ marginHorizontal: 16, marginTop: 8, marginBottom: 16 }}>
      {/* Content */}
      {activeAffirmation ? (
        <View
          style={{
            backgroundColor: colors.primary + "10",
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderLeftWidth: 3,
            borderLeftColor: colors.primary,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: colors.text,
              lineHeight: 20,
              fontStyle: "italic",
              textAlign: "center",
              fontWeight: "500",
              opacity: 0.9,
            }}
          >
            "{activeAffirmation}"
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/reflect")}
          style={{
            backgroundColor: colors.accent,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.primary + "30",
            borderStyle: "dashed",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Sparkles
              size={14}
              color={colors.primary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={{
                fontSize: 12,
                color: colors.text,
                opacity: 0.8,
                textAlign: "center",
                fontWeight: "500",
              }}
            >
              Set your daily motivation
            </Text>
          </View>
          <Text
            style={{
              fontSize: 11,
              color: colors.primary,
              textAlign: "center",
              opacity: 0.7,
            }}
          >
            Tap to add in Reflect
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
