import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useThemeStore } from "@/utils/theme";

const EVENT_TYPES = ["general", "work", "personal", "health"];

const EventTypeSelector = ({ eventType, onSelect }) => {
  const { currentTheme: colors } = useThemeStore();

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
        Event Type
      </Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {EVENT_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => onSelect(type)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 16,
              backgroundColor:
                eventType === type ? colors.primary : colors.accent,
              borderWidth: 1,
              borderColor:
                eventType === type ? colors.primary : colors.accent,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: eventType === type ? colors.surface : colors.text,
                textTransform: "capitalize",
              }}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default EventTypeSelector;
