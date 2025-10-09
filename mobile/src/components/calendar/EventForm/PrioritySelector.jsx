import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useThemeStore } from "@/utils/theme";
import {
  getPriorityOptions,
  getPriorityTextColor,
} from "@/utils/calendarConstants";

const PrioritySelector = ({ eventPriority, onSelect }) => {
  const { currentTheme: colors } = useThemeStore();
  const priorityOptions = getPriorityOptions(colors);

  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "500",
          color: colors.text,
          opacity: 0.8,
          marginBottom: 8,
        }}
      >
        Priority
      </Text>
      <View style={{ flexDirection: "row", gap: 6 }}>
        {priorityOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => onSelect(option.value, option.color || "#6B7280")}
            style={{
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 8,
              borderRadius: 8,
              backgroundColor:
                eventPriority === option.value
                  ? option.color || colors.accent
                  : colors.accent,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color:
                  eventPriority === option.value && option.color
                    ? getPriorityTextColor(option.value, colors)
                    : colors.text,
                fontWeight: "600",
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default PrioritySelector;
