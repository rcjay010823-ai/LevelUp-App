import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, TextInput } from "react-native";
import { Check, Plus, X, Target } from "lucide-react-native";
import { useThemeStore } from "@/utils/theme";
import {
  useFonts,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";

export default function HabitsSection({
  habits = [],
  onHabitToggle,
  onAddHabit,
  onDeleteHabit,
}) {
  const { currentTheme: colors } = useThemeStore();
  const [fontsLoaded] = useFonts({ PlayfairDisplay_700Bold });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState("");

  const handleAddHabit = async () => {
    if (!newHabitTitle.trim()) return;

    try {
      await onAddHabit({
        title: newHabitTitle.trim(),
        color: colors.primary,
      });
      setNewHabitTitle("");
      setShowAddForm(false);
    } catch (error) {
      Alert.alert("Error", "Failed to add habit");
    }
  };

  const handleToggleHabit = async (habit) => {
    try {
      await onHabitToggle(habit.id, !habit.completed);
    } catch (error) {
      Alert.alert("Error", "Failed to update habit");
    }
  };

  const handleDeleteHabit = (habitId) => {
    Alert.alert("Delete Habit", "Are you sure you want to delete this habit?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDeleteHabit(habitId),
      },
    ]);
  };

  const completedCount = habits.filter((h) => h.completed).length;

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
            <Target size={20} color={colors.primary} />
          </View>
          <View>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: colors.text,
                letterSpacing: 0.3,
                fontFamily: "PlayfairDisplay_700Bold",
              }}
            >
              Daily Habits
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                marginTop: 2,
              }}
            >
              {completedCount} of {habits.length} completed
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setShowAddForm(!showAddForm)}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 16,
            width: 32,
            height: 32,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Plus size={18} color="white" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {showAddForm && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
              padding: 12,
              backgroundColor: colors.accent,
              borderRadius: 12,
            }}
          >
            <TextInput
              placeholder="New habit..."
              placeholderTextColor={colors.textSecondary}
              value={newHabitTitle}
              onChangeText={setNewHabitTitle}
              onSubmitEditing={handleAddHabit}
              returnKeyType="done"
              style={{
                flex: 1,
                fontSize: 16,
                color: colors.text,
                padding: 0,
              }}
            />
            <TouchableOpacity
              onPress={handleAddHabit}
              style={{ marginLeft: 12 }}
            >
              <Check size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowAddForm(false);
                setNewHabitTitle("");
              }}
              style={{ marginLeft: 8 }}
            >
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {habits.length === 0 ? (
          <Text
            style={{
              textAlign: "center",
              color: colors.textSecondary,
              fontSize: 16,
              fontStyle: "italic",
              paddingVertical: 20,
            }}
          >
            No habits yet. Add one to get started!
          </Text>
        ) : (
          <View>
            {habits.map((habit) => (
              <TouchableOpacity
                key={habit.id}
                onPress={() => handleToggleHabit(habit)}
                onLongPress={() => handleDeleteHabit(habit.id)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 4,
                  borderBottomWidth:
                    habits.indexOf(habit) === habits.length - 1 ? 0 : 1,
                  borderBottomColor: colors.border,
                }}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: habit.completed
                      ? colors.primary
                      : "transparent",
                    borderWidth: 2,
                    borderColor: colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  {habit.completed && <Check size={14} color="white" />}
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: habit.completed ? colors.textSecondary : colors.text,
                    textDecorationLine: habit.completed
                      ? "line-through"
                      : "none",
                  }}
                >
                  {habit.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {habits.length > 0 && (
          <View
            style={{
              marginTop: 12,
              backgroundColor: colors.accent,
              borderRadius: 8,
              height: 6,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: "100%",
                backgroundColor: colors.primary,
                width: `${habits.length > 0 ? (completedCount / habits.length) * 100 : 0}%`,
              }}
            />
          </View>
        )}
      </View>
    </View>
  );
}
