import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Heart, Edit3, Sparkles, Star } from "lucide-react-native";
import { useThemeStore } from "@/utils/theme";

const tabs = [
  { title: "Power Statements", icon: Sparkles },
  { title: "Gratitude Boost", icon: Heart },
  { title: "Mind Unwind", icon: Edit3 },
];

export const ReflectTabNavigator = ({ activeTab, setActiveTab }) => {
  const { currentTheme: colors } = useThemeStore();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.accent,
      }}
    >
      <View style={{ flexDirection: "row" }}>
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === index;
          const iconColor = isActive ? colors.primary : colors.text + "80";

          return (
            <TouchableOpacity
              key={index}
              onPress={() => setActiveTab(index)}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 8,
                borderBottomWidth: 2,
                borderBottomColor: isActive ? colors.primary : "transparent",
              }}
            >
              <Icon size={20} color={iconColor} />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? "600" : "400",
                  color: iconColor,
                  marginTop: 4,
                  textAlign: "center",
                }}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
