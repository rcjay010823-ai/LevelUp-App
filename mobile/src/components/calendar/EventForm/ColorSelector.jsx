import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useThemeStore } from "@/utils/theme";
import { COLOR_OPTIONS } from "@/utils/calendarConstants";

const ColorSelector = ({ eventColor, onSelect }) => {
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
        Color
      </Text>
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          justifyContent: "center",
        }}
      >
        {COLOR_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: option.value,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: eventColor === option.value ? 4 : 2,
              borderColor:
                eventColor === option.value ? colors.text : colors.accent,
            }}
          >
            {eventColor === option.value && (
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: "white",
                }}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default ColorSelector;
