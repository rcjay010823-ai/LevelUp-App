import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Activity, Calendar } from "lucide-react-native";
import { useThemeStore } from "../../utils/theme";
import { WorkoutCalendar } from "./WorkoutCalendar";
import { format } from "date-fns";

export const WorkoutTab = ({
  workoutData,
  monthlyWorkoutData,
  selectedDate,
  calendarDate,
  onDateSelect,
  onMonthNavigate,
  onLogWorkout,
  isLogging,
}) => {
  const { currentTheme: colors } = useThemeStore();
  const isToday =
    format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
  const dateLabel = isToday ? "Today" : format(selectedDate, "EEEE, MMMM d");
  const hasWorkedOut = workoutData?.entry?.worked_out;

  return (
    <View style={{ paddingHorizontal: 16 }}>
      {/* Daily Check-In */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: colors.text,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          {isToday ? "Daily Check-In" : "Workout Log"}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: "center",
            marginBottom: 20,
            fontStyle: "italic",
          }}
        >
          {dateLabel}
        </Text>

        {/* Workout Button */}
        <TouchableOpacity
          onPress={() => onLogWorkout(true)}
          disabled={isLogging}
          style={{
            backgroundColor: hasWorkedOut ? colors.primary : colors.accent,
            borderRadius: 12,
            paddingVertical: 16,
            paddingHorizontal: 20,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            opacity: isLogging ? 0.7 : 1,
            marginBottom: hasWorkedOut ? 12 : 0,
          }}
        >
          <Activity
            size={24}
            color={hasWorkedOut ? colors.surface : colors.primary}
          />
          <Text
            style={{
              marginLeft: 12,
              fontSize: 16,
              fontWeight: "bold",
              color: hasWorkedOut ? colors.surface : colors.primary,
            }}
          >
            {hasWorkedOut
              ? "✓ Worked Out!"
              : isToday
                ? "I Worked Out Today"
                : "I Worked Out This Day"}
          </Text>
        </TouchableOpacity>

        {/* Remove Workout Button - only show if workout is logged */}
        {hasWorkedOut && (
          <TouchableOpacity
            onPress={() => onLogWorkout(false)}
            disabled={isLogging}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 20,
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.border,
              opacity: isLogging ? 0.7 : 1,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
              }}
            >
              Remove Workout
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Visual Calendar Tracker */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Calendar size={20} color={colors.primary} />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: colors.text,
              marginLeft: 8,
            }}
          >
            Visual Tracker
          </Text>
        </View>
        <Text
          style={{
            fontSize: 12,
            color: colors.textSecondary,
            marginBottom: 8,
            fontStyle: "italic",
          }}
        >
          Each workout appears as a colored checkmark. Tap any date to log or
          edit.
        </Text>
        <WorkoutCalendar
          monthlyData={monthlyWorkoutData}
          selectedDate={selectedDate}
          calendarDate={calendarDate}
          onDateSelect={onDateSelect}
          onMonthNavigate={onMonthNavigate}
        />
      </View>
    </View>
  );
};
