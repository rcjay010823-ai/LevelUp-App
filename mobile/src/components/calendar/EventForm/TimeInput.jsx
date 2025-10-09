import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Clock } from "lucide-react-native";
import { useThemeStore } from "@/utils/theme";
import {
  formatTimeInput,
  convertTo24Hour,
  convertTo12Hour,
} from "../../../utils/time";

const TimeInput = ({
  label,
  time12,
  amPm,
  onTimeChange,
  onAmPmChange,
  onShowTimePicker,
  placeholder,
}) => {
  const { currentTheme: colors } = useThemeStore();

  const handleTextChange = (text) => {
    const formatted = formatTimeInput(text);
    const time24 = convertTo24Hour(formatted, amPm);
    onTimeChange(formatted, time24);
  };

  // Display the current time in a friendly format
  const displayTime = time12 && amPm ? `${time12} ${amPm}` : "";

  return (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "500",
          color: colors.text,
          opacity: 0.8,
          marginBottom: 8,
        }}
      >
        {label}
      </Text>

      {/* Primary Time Picker Button */}
      <TouchableOpacity
        onPress={onShowTimePicker}
        style={{
          borderWidth: 1,
          borderColor: colors.accent,
          borderRadius: 8,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: colors.surface,
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: displayTime ? colors.text : colors.text + "60",
          }}
        >
          {displayTime || placeholder || "Select time"}
        </Text>
        <Clock size={20} color={colors.primary} />
      </TouchableOpacity>

      {/* Secondary Manual Input */}
      <View style={{ gap: 8 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <TextInput
            value={time12}
            onChangeText={handleTextChange}
            placeholder="12:30"
            placeholderTextColor={colors.text + "40"}
            keyboardType="numeric"
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: colors.accent + "60",
              borderRadius: 6,
              padding: 8,
              fontSize: 14,
              color: colors.text,
              backgroundColor: colors.surface,
            }}
          />
        </View>

        {time12 && (
          <View style={{ flexDirection: "row", gap: 4 }}>
            <TouchableOpacity
              onPress={() => onAmPmChange("AM")}
              style={{
                flex: 1,
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 6,
                backgroundColor:
                  amPm === "AM" ? colors.primary : colors.accent + "60",
                borderWidth: 1,
                borderColor:
                  amPm === "AM" ? colors.primary : colors.accent + "60",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: amPm === "AM" ? "white" : colors.text,
                  fontWeight: "500",
                  fontSize: 12,
                }}
              >
                AM
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onAmPmChange("PM")}
              style={{
                flex: 1,
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 6,
                backgroundColor:
                  amPm === "PM" ? colors.primary : colors.accent + "60",
                borderWidth: 1,
                borderColor:
                  amPm === "PM" ? colors.primary : colors.accent + "60",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: amPm === "PM" ? "white" : colors.text,
                  fontWeight: "500",
                  fontSize: 12,
                }}
              >
                PM
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default TimeInput;
