import React from "react";
import { View, Text } from "react-native";
import { Calendar as CalendarIcon } from "lucide-react-native";
import EventItem from "./EventItem";
import { useThemeStore } from "@/utils/theme";

export default function EventList({ events, onEditEvent }) {
  const { currentTheme: colors } = useThemeStore();

  if (events.length === 0) {
    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 40,
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          marginHorizontal: 16,
        }}
      >
        <CalendarIcon size={48} color={colors.text + "60"} />
        <Text
          style={{
            fontSize: 16,
            color: colors.text,
            opacity: 0.7,
            marginTop: 16,
            textAlign: "center",
          }}
        >
          No events for this day
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.text,
            opacity: 0.5,
            marginTop: 4,
            textAlign: "center",
          }}
        >
          Tap the + button to add your first event
        </Text>
      </View>
    );
  }

  return (
    <View style={{ paddingHorizontal: 16 }}>
      {events.map((event) => (
        <EventItem key={event.id} event={event} onEdit={onEditEvent} />
      ))}
    </View>
  );
}
