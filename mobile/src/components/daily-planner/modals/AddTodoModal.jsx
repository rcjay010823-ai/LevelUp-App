import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeStore } from "@/utils/theme";

export default function AddTodoModal({ visible, onClose, onAdd }) {
  const { currentTheme: colors } = useThemeStore();
  const insets = useSafeAreaInsets();
  const [todoTitle, setTodoTitle] = useState("");

  const handleAdd = () => {
    if (todoTitle.trim()) {
      onAdd(todoTitle.trim());
      setTodoTitle("");
    }
  };

  const handleClose = () => {
    setTodoTitle("");
    onClose();
  };

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
            Add To-Do
          </Text>

          <TextInput
            value={todoTitle}
            onChangeText={setTodoTitle}
            placeholder="To-do item"
            placeholderTextColor={colors.text + "80"}
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
              onPress={handleAdd}
              disabled={!todoTitle.trim()}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: todoTitle.trim()
                  ? colors.primary
                  : colors.accent,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.background, fontWeight: "600" }}>
                Add To-Do
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
