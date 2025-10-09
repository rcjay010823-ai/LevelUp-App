import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { 
  X,
  Plus,
  Calendar,
  Target,
  CheckCircle,
  Heart,
  Droplets,
  Coffee,
  BookOpen
} from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useRouter } from "expo-router";
import { useThemeStore } from "@/utils/theme";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

const QuickActionCard = ({ icon, title, description, color, onPress }) => {
  const { currentTheme: colors } = useThemeStore();
  
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: color + "20",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
      }}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontFamily: "Inter_600SemiBold",
          color: colors.text,
          marginBottom: 2,
        }}>
          {title}
        </Text>
        <Text style={{
          fontSize: 14,
          fontFamily: "Inter_400Regular",
          color: colors.text + "80",
        }}>
          {description}
        </Text>
      </View>
      <Plus size={20} color={colors.text + "60"} />
    </TouchableOpacity>
  );
};

const QuickEntryModal = ({ type, visible, onClose, onSubmit }) => {
  const { currentTheme: colors } = useThemeStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState(format(new Date(), "HH:mm"));

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }
    
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      time,
      type
    });
    
    setTitle("");
    setDescription("");
    setTime(format(new Date(), "HH:mm"));
    onClose();
  };

  if (!visible) return null;

  return (
    <View style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
      zIndex: 1000,
    }}>
      <View style={{
        backgroundColor: colors.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        minHeight: 300,
      }}>
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}>
          <Text style={{
            fontSize: 18,
            fontFamily: "Inter_600SemiBold",
            color: colors.text,
          }}>
            Add {type}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={`${type} title`}
          placeholderTextColor={colors.text + "60"}
          style={{
            borderWidth: 1,
            borderColor: colors.accent,
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: colors.text,
            marginBottom: 16,
          }}
        />

        {type === "Event" && (
          <TextInput
            value={time}
            onChangeText={setTime}
            placeholder="HH:MM"
            placeholderTextColor={colors.text + "60"}
            style={{
              borderWidth: 1,
              borderColor: colors.accent,
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              fontFamily: "Inter_400Regular",
              color: colors.text,
              marginBottom: 16,
            }}
          />
        )}

        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Description (optional)"
          placeholderTextColor={colors.text + "60"}
          multiline
          numberOfLines={3}
          style={{
            borderWidth: 1,
            borderColor: colors.accent,
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: colors.text,
            marginBottom: 20,
            textAlignVertical: "top",
          }}
        />

        <View style={{
          flexDirection: "row",
          gap: 12,
        }}>
          <TouchableOpacity
            onPress={onClose}
            style={{
              flex: 1,
              backgroundColor: colors.accent,
              borderRadius: 12,
              padding: 16,
              alignItems: "center",
            }}
          >
            <Text style={{
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
              color: colors.text,
            }}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmit}
            style={{
              flex: 1,
              backgroundColor: colors.primary,
              borderRadius: 12,
              padding: 16,
              alignItems: "center",
            }}
          >
            <Text style={{
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
              color: "white",
            }}>
              Add
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function QuickAdd() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentTheme: colors } = useThemeStore();
  const queryClient = useQueryClient();
  const [modalType, setModalType] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
  });

  // Mutations for different quick add actions
  const addEventMutation = useMutation({
    mutationFn: async (eventData) => {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventData.title,
          event_date: format(new Date(), 'yyyy-MM-dd'),
          event_time: eventData.time,
          location: eventData.description,
          type: 'general',
          priority: 'medium',
          color: colors.primary,
        }),
      });
      if (!response.ok) throw new Error('Failed to add event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      Alert.alert("Success", "Event added successfully!");
    },
  });

  const addHabitMutation = useMutation({
    mutationFn: async (habitData) => {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: "demo",
          title: habitData.title,
          color: colors.primary,
        }),
      });
      if (!response.ok) throw new Error('Failed to add habit');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['habits']);
      Alert.alert("Success", "Habit added successfully!");
    },
  });

  const addTodoMutation = useMutation({
    mutationFn: async (todoData) => {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: todoData.title,
          todo_date: format(new Date(), 'yyyy-MM-dd'),
        }),
      });
      if (!response.ok) throw new Error('Failed to add todo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['todos']);
      Alert.alert("Success", "Task added successfully!");
    },
  });

  const logMoodMutation = useMutation({
    mutationFn: async (moodData) => {
      const response = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: "demo",
          entry_date: format(new Date(), 'yyyy-MM-dd'),
          mood_value: 4,
          mood_emoji: "😊",
          notes: moodData.description,
        }),
      });
      if (!response.ok) throw new Error('Failed to log mood');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mood']);
      Alert.alert("Success", "Mood logged successfully!");
    },
  });

  const handleQuickAction = (actionType) => {
    setModalType(actionType);
    setShowModal(true);
  };

  const handleSubmit = (data) => {
    switch (data.type) {
      case "Event":
        addEventMutation.mutate(data);
        break;
      case "Habit":
        addHabitMutation.mutate(data);
        break;
      case "Task":
        addTodoMutation.mutate(data);
        break;
      case "Mood":
        logMoodMutation.mutate(data);
        break;
      default:
        Alert.alert("Error", "Unknown action type");
    }
  };

  const quickActions = [
    {
      icon: <Calendar size={24} color={colors.primary} />,
      title: "Add Event",
      description: "Schedule something for today",
      color: colors.primary,
      type: "Event",
    },
    {
      icon: <Target size={24} color="#34C759" />,
      title: "New Habit",
      description: "Start tracking a new habit",
      color: "#34C759",
      type: "Habit",
    },
    {
      icon: <CheckCircle size={24} color="#FF6B35" />,
      title: "Add Task",
      description: "Quick task for today",
      color: "#FF6B35",
      type: "Task",
    },
    {
      icon: <Heart size={24} color="#FF6B9D" />,
      title: "Log Mood",
      description: "How are you feeling?",
      color: "#FF6B9D",
      type: "Mood",
    },
    {
      icon: <Droplets size={24} color="#007AFF" />,
      title: "Log Water",
      description: "Track your hydration",
      color: "#007AFF",
      action: () => {
        // Quick water log without modal
        fetch('/api/wellness', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wellness_date: format(new Date(), 'yyyy-MM-dd'),
            water_ml: 250, // Standard glass
          }),
        }).then(() => {
          queryClient.invalidateQueries(['wellness']);
          Alert.alert("Success", "250ml water logged!");
        });
      },
    },
    {
      icon: <BookOpen size={24} color="#8E44AD" />,
      title: "Quick Reflection",
      description: "Start journaling",
      color: "#8E44AD",
      action: () => router.push('/(tabs)/reflect'),
    },
  ];

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={{
        paddingTop: insets.top + 20,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: colors.surface,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
      }}>
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <Text style={{
            fontSize: 24,
            fontFamily: "Inter_600SemiBold",
            color: colors.text,
          }}>
            Quick Add
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <Text style={{
          fontSize: 14,
          fontFamily: "Inter_400Regular",
          color: colors.text + "80",
          marginTop: 4,
        }}>
          Add something to your day quickly
        </Text>
      </View>

      {/* Quick Actions */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {quickActions.map((action, index) => (
          <QuickActionCard
            key={index}
            icon={action.icon}
            title={action.title}
            description={action.description}
            color={action.color}
            onPress={action.action || (() => handleQuickAction(action.type))}
          />
        ))}

        {/* Recently Used Section */}
        <View style={{ marginTop: 20 }}>
          <Text style={{
            fontSize: 18,
            fontFamily: "Inter_600SemiBold",
            color: colors.text,
            marginBottom: 16,
          }}>
            Recently Used
          </Text>
          <Text style={{
            fontSize: 14,
            fontFamily: "Inter_400Regular",
            color: colors.text + "60",
            textAlign: "center",
            paddingVertical: 20,
          }}>
            Your frequently used actions will appear here
          </Text>
        </View>
      </ScrollView>

      {/* Quick Entry Modal */}
      <QuickEntryModal
        type={modalType}
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
      />
    </View>
  );
}