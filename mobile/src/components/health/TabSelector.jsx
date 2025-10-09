import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useThemeStore } from "@/utils/theme";

export function TabSelector({ selectedTab, onSelectTab }) {
  const { currentTheme: colors } = useThemeStore();

  const tabs = [
    { id: 0, label: "Workout" },
    { id: 1, label: "Eating" },
  ];

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: colors.surface,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        padding: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          onPress={() => onSelectTab(tab.id)}
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
            backgroundColor: selectedTab === tab.id ? colors.primary : "transparent",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: selectedTab === tab.id ? "600" : "500",
              color: selectedTab === tab.id ? colors.surface : colors.text,
            }}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}