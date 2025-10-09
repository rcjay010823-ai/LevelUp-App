import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Calendar, Clock } from "lucide-react-native";
import { useThemeStore } from "@/utils/theme";

export default function EventsSection({ events }) {
  const { currentTheme: colors } = useThemeStore();

  return (
    <View style={{ marginHorizontal: 16, marginBottom: 24 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
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
            <Calendar size={20} color={colors.primary} />
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
            What's On
          </Text>
        </View>
      </View>

      {/* Events List */}
      {events.length === 0 ? (
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
          <Calendar
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
            No events scheduled for today
          </Text>
          <Text
            style={{
              marginTop: 4,
              color: colors.textSecondary,
              fontSize: 12,
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            Go to Calendar to add events
          </Text>
        </View>
      ) : (
        events.map((event) => (
          <View
            key={event.id}
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
            {/* Color indicator dot */}
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: event.color || colors.primary,
                marginRight: 12,
              }}
            />

            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: colors.accent,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Clock size={14} color={colors.primary} />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.text,
                }}
              >
                {event.title}
              </Text>

              {/* Show location if it exists */}
              {event.location && (
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginTop: 2,
                  }}
                >
                  📍 {event.location}
                </Text>
              )}
            </View>

            {/* Time display */}
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                fontWeight: "500",
                marginLeft: 8,
              }}
            >
              {event.event_time.slice(0, 5)}
              {event.end_time && `\n${event.end_time.slice(0, 5)}`}
            </Text>
          </View>
        ))
      )}

      {/* Hint text */}
      {events.length > 0 && (
        <Text
          style={{
            fontSize: 12,
            color: colors.textSecondary,
            textAlign: "center",
            marginTop: 8,
            fontStyle: "italic",
          }}
        >
          Go to Calendar to edit events
        </Text>
      )}
    </View>
  );
}
