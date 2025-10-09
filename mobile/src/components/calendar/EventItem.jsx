import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Clock, MapPin, Edit3 } from "lucide-react-native";
import { useThemeStore } from "@/utils/theme";
import {
  getPriorityOptions,
  getPriorityColor,
  getPriorityTextColor,
  formatTime,
} from "@/utils/calendarConstants";

export default function EventItem({ event, onEdit }) {
  const { currentTheme: colors } = useThemeStore();
  const priorityOptions = getPriorityOptions(colors);
  const priority = priorityOptions.find((p) => p.value === event.priority);

  const priorityColor = getPriorityColor(event.priority, colors);
  const priorityTextColor = getPriorityTextColor(event.priority, colors);

  return (
    <TouchableOpacity
      onPress={() => onEdit(event)}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: event.color || "#3B82F6",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
                flex: 1,
              }}
            >
              {event.title}
            </Text>
            {event.priority && priority && (
              <View
                style={{
                  backgroundColor: priorityColor,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 8,
                  marginLeft: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    color: priorityTextColor,
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  {priority.label}
                </Text>
              </View>
            )}
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Clock size={14} color={colors.text + "80"} />
            <Text
              style={{
                marginLeft: 6,
                fontSize: 14,
                color: colors.text,
                opacity: 0.8,
              }}
            >
              {formatTime(event.event_time)}
              {event.end_time &&
                event.end_time !== event.event_time &&
                ` - ${formatTime(event.end_time)}`}
            </Text>
          </View>

          {event.location && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <MapPin size={14} color={colors.text + "80"} />
              <Text
                style={{
                  marginLeft: 6,
                  fontSize: 14,
                  color: colors.text,
                  opacity: 0.8,
                }}
              >
                {event.location}
              </Text>
            </View>
          )}

          {event.type && event.type !== "general" && (
            <View
              style={{
                backgroundColor: colors.primary + "20",
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 12,
                alignSelf: "flex-start",
                marginTop: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: colors.primary,
                }}
              >
                {event.type}
              </Text>
            </View>
          )}
        </View>

        <Edit3 size={16} color={colors.text + "80"} />
      </View>
    </TouchableOpacity>
  );
}
