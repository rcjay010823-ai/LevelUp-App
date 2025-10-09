import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Clock } from "lucide-react-native";
import { useThemeStore } from "@/utils/theme";
import { timeOptions } from "../../utils/time";

const TimePickerModal = ({
  visible,
  onClose,
  onSelect,
  selectedTime,
  title,
}) => {
  const { currentTheme: colors } = useThemeStore();
  const insets = useSafeAreaInsets();

  // Quick preset times
  const quickTimes = [
    { label: "Now", value: "now" },
    { label: "9:00 AM", value: "09:00" },
    { label: "12:00 PM", value: "12:00" },
    { label: "1:00 PM", value: "13:00" },
    { label: "5:00 PM", value: "17:00" },
    { label: "6:00 PM", value: "18:00" },
    { label: "7:00 PM", value: "19:00" },
  ];

  const handleQuickSelect = (value) => {
    if (value === "now") {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = Math.ceil(now.getMinutes() / 15) * 15; // Round to next 15 min
      const roundedTime = `${hours}:${minutes.toString().padStart(2, "0")}`;
      onSelect(roundedTime);
    } else {
      onSelect(value);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: insets.bottom + 20,
            maxHeight: "80%",
          }}
        >
          <View
            style={{
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: colors.accent,
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "bold", color: colors.text }}
            >
              {title}
            </Text>
          </View>

          {/* Quick Time Presets */}
          <View style={{ padding: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.text,
                opacity: 0.8,
                marginBottom: 12,
              }}
            >
              Quick Select
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {quickTimes.map((time) => (
                <TouchableOpacity
                  key={time.value}
                  onPress={() => handleQuickSelect(time.value)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 16,
                    backgroundColor: colors.primary + "20",
                    borderWidth: 1,
                    borderColor: colors.primary + "40",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.primary,
                      fontWeight: "500",
                    }}
                  >
                    {time.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* All Times List */}
          <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.text,
                opacity: 0.8,
                marginBottom: 8,
              }}
            >
              All Times
            </Text>
          </View>

          <ScrollView
            style={{ maxHeight: 250 }}
            showsVerticalScrollIndicator={false}
          >
            {timeOptions.map((time) => (
              <TouchableOpacity
                key={time.value}
                onPress={() => onSelect(time.value)}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.accent + "40",
                  backgroundColor:
                    selectedTime === time.value
                      ? colors.primary + "20"
                      : "transparent",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                {selectedTime === time.value && (
                  <Clock
                    size={16}
                    color={colors.primary}
                    style={{ marginRight: 12 }}
                  />
                )}
                <Text
                  style={{
                    fontSize: 16,
                    color:
                      selectedTime === time.value
                        ? colors.primary
                        : colors.text,
                    fontWeight: selectedTime === time.value ? "600" : "400",
                  }}
                >
                  {time.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={{ padding: 20 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: colors.accent,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.text, fontWeight: "600" }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TimePickerModal;
