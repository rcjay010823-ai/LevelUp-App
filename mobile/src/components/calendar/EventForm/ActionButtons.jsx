import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Trash2, Save, Copy } from "lucide-react-native";
import { useThemeStore } from "@/utils/theme";

const ActionButtons = ({
  editingEvent,
  isFormValid,
  onClose,
  onSave,
  onDelete,
  onDuplicate,
}) => {
  const { currentTheme: colors } = useThemeStore();

  return (
    <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
      <TouchableOpacity
        onPress={onClose}
        style={{
          flex: 1,
          paddingVertical: 12,
          borderRadius: 8,
          backgroundColor: colors.accent,
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.text, fontWeight: "600" }}>Cancel</Text>
      </TouchableOpacity>

      {editingEvent && (
        <>
          <TouchableOpacity
            onPress={onDuplicate}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 8,
              backgroundColor: colors.primary + "20",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Copy size={16} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onDelete}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 8,
              backgroundColor: "#dc3545",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Trash2 size={16} color="#fff" />
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        onPress={onSave}
        disabled={!isFormValid}
        style={{
          flex: editingEvent ? 1 : 2,
          paddingVertical: 12,
          borderRadius: 8,
          backgroundColor: isFormValid ? colors.primary : colors.accent,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <Save size={16} color={colors.surface} />
        <Text
          style={{
            color: colors.surface,
            fontWeight: "600",
            marginLeft: 8,
          }}
        >
          {editingEvent ? "Update" : "Create"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActionButtons;
