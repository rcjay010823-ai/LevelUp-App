import React from "react";
import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import { format, addDays, subDays, isSameDay } from "date-fns";
import { useThemeStore } from "@/utils/theme";

export default function CalendarStrip({
  selectedDate,
  setSelectedDate,
  events = [],
}) {
  const { currentTheme: colors } = useThemeStore();

  const calendarDays = [];
  const startDate = subDays(selectedDate, 3);
  for (let i = 0; i < 7; i++) {
    calendarDays.push(addDays(startDate, i));
  }

  // Helper function to get the highest priority event color for a date
  const getEventIndicatorColor = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayEvents = events.filter((event) => event.event_date === dateStr);

    if (dayEvents.length === 0) return null;

    // Find the highest priority event (high > medium > low)
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const highestPriorityEvent = dayEvents.reduce((highest, event) => {
      const eventPriority = priorityOrder[event.priority || "medium"];
      const highestPriority = priorityOrder[highest.priority || "medium"];
      return eventPriority > highestPriority ? event : highest;
    }, dayEvents[0]);

    // Return the color based on priority, fallback to event color, then theme primary
    if (highestPriorityEvent.priority === "high") return "#EF4444"; // Red
    if (highestPriorityEvent.priority === "low") return "#10B981"; // Green
    return highestPriorityEvent.color || colors.primary; // Use event color or theme primary
  };

  // Helper function to check if a date has events
  const hasEvents = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return events.some((event) => event.event_date === dateStr);
  };

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.accent,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {calendarDays.map((date, index) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());
          const dateHasEvents = hasEvents(date);
          const eventColor = getEventIndicatorColor(date);

          return (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedDate(date)}
              style={{
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginRight: 8,
                borderRadius: 20,
                backgroundColor: isSelected ? colors.primary : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: isSelected ? colors.background : colors.text,
                  marginBottom: 4,
                  opacity: isSelected ? 1 : 0.7,
                }}
              >
                {format(date, "EEE")}
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: isSelected
                    ? colors.background
                    : isToday
                      ? colors.primary
                      : colors.text,
                }}
              >
                {format(date, "d")}
              </Text>
              {/* Enhanced event indicator dot with priority-based colors */}
              {dateHasEvents && (
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: isSelected
                      ? colors.background
                      : eventColor,
                    marginTop: 4,
                  }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
