import React, { useState, useEffect } from "react";
import { View, Text, Modal, TextInput, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeStore } from "@/utils/theme";

export default function UpdateWellnessModal({
  visible,
  onClose,
  onUpdate,
  field,
  currentValue,
}) {
  const { currentTheme: colors } = useThemeStore();
  const insets = useSafeAreaInsets();
  const [wellnessValue, setWellnessValue] = useState("");

  useEffect(() => {
    if (visible && currentValue !== undefined) {
      setWellnessValue(currentValue.toString());
    }
  }, [visible, currentValue]);

  const handleUpdate = () => {
    if (wellnessValue.trim() && field) {
      const value =
        field === "sleep_hours"
          ? parseFloat(wellnessValue)
          : parseInt(wellnessValue);

      if (!isNaN(value) && value >= 0) {
        onUpdate(value);
      }
    }
  };

  const handleClose = () => {
    setWellnessValue("");
    onClose();
  };

  const getTitleAndPlaceholder = () => {
    switch (field) {
      case "water_ml":
        return { title: "Update Water Intake", placeholder: "ml (e.g., 250)" };
      case "steps":
        return { title: "Update Steps", placeholder: "steps (e.g., 5000)" };
      case "sleep_hours":
        return {
          title: "Update Sleep Hours",
          placeholder: "hours (e.g., 8.5)",
        };
      default:
        return { title: "Update Wellness", placeholder: "" };
    }
  };

  const { title, placeholder } = getTitleAndPlaceholder();

  return (
    <Modal visible={visible} transparent animationType="slide">
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
            padding: 20,
            paddingBottom: insets.bottom + 20,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 20,
              color: colors.text,
            }}
          >
            {title}
          </Text>

          <TextInput
            value={wellnessValue}
            onChangeText={setWellnessValue}
            placeholder={placeholder}
            placeholderTextColor={colors.text + "80"}
            keyboardType={field === "sleep_hours" ? "decimal-pad" : "numeric"}
            style={{
              borderWidth: 1,
              borderColor: colors.accent,
              borderRadius: 8,
              padding: 12,
              marginBottom: 20,
              fontSize: 16,
              color: colors.text,
              backgroundColor: colors.background,
            }}
            autoFocus
          />

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={handleClose}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: colors.accent,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.text, fontWeight: "600" }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleUpdate}
              disabled={!wellnessValue.trim()}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: wellnessValue.trim()
                  ? colors.primary
                  : colors.accent,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.background, fontWeight: "600" }}>
                Update
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
