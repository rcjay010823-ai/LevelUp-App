import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { CheckSquare, Square, Plus, Check } from "lucide-react-native";
import { useThemeStore } from "@/utils/theme";
import {
  useFonts,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import { useDailyPlanner } from "@/hooks/useDailyPlanner";
import { format } from "date-fns";
import AddTodoModal from "./modals/AddTodoModal";

export default function TodoSection({ selectedDate }) {
  const { currentTheme: colors } = useThemeStore();
  const [fontsLoaded] = useFonts({ PlayfairDisplay_700Bold });
  const [showAddModal, setShowAddModal] = useState(false);

  const today = format(selectedDate, "yyyy-MM-dd");
  const { todos, addTodo, toggleTodo } = useDailyPlanner("demo", today);

  const handleAddTodo = async (title) => {
    await addTodo({ title, todo_date: today });
    setShowAddModal(false);
  };

  const handleToggleTodo = async (id, currentCompleted) => {
    await toggleTodo({ id, completed: !currentCompleted });
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ marginHorizontal: 16, marginBottom: 24 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.accent,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <CheckSquare size={20} color={colors.primary} />
          </View>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "bold",
              color: colors.text,
              letterSpacing: 0.3,
              fontFamily: "PlayfairDisplay_700Bold",
            }}
          >
            To-Do List
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Plus size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Todos List */}
      {todos.length === 0 ? (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            paddingVertical: 20,
            paddingHorizontal: 16,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.border,
            borderStyle: "dashed",
          }}
        >
          <CheckSquare
            size={24}
            color={colors.textSecondary}
            style={{ opacity: 0.5 }}
          />
          <Text
            style={{
              marginTop: 8,
              color: colors.textSecondary,
              fontSize: 14,
              textAlign: "center",
            }}
          >
            No tasks for today
          </Text>
        </View>
      ) : (
        todos.map((todo) => (
          <TouchableOpacity
            key={todo.id}
            onPress={() => handleToggleTodo(todo.id, todo.completed)}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 16,
              marginBottom: 8,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: todo.completed
                  ? colors.primary
                  : "transparent",
                borderWidth: 2,
                borderColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              {todo.completed && <Check size={14} color="white" />}
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 16,
                fontWeight: "500",
                color: todo.completed ? colors.textSecondary : colors.text,
                textDecorationLine: todo.completed ? "line-through" : "none",
              }}
            >
              {todo.title}
            </Text>
          </TouchableOpacity>
        ))
      )}

      {/* Add Todo Modal */}
      <AddTodoModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTodo}
      />
    </View>
  );
}
