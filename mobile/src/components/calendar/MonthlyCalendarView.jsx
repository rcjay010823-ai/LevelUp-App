import React from "react";
import { View } from "react-native";
import { Calendar } from "react-native-calendars";
import { useThemeStore } from "@/utils/theme";

export default function MonthlyCalendarView({
  selectedDateStr,
  onDayPress,
  markedDates,
}) {
  const { currentTheme: colors } = useThemeStore();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        margin: 16,
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <Calendar
        current={selectedDateStr}
        onDayPress={onDayPress}
        markedDates={markedDates}
        theme={{
          backgroundColor: colors.surface,
          calendarBackground: colors.surface,
          textSectionTitleColor: colors.text + "80",
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: colors.surface,
          todayTextColor: colors.primary,
          dayTextColor: colors.text,
          textDisabledColor: colors.text + "40",
          dotColor: colors.primary,
          selectedDotColor: colors.surface,
          arrowColor: colors.primary,
          disabledArrowColor: colors.text + "40",
          monthTextColor: colors.text,
          indicatorColor: colors.primary,
          textDayFontFamily: "System",
          textMonthFontFamily: "System",
          textDayHeaderFontFamily: "System",
          textDayFontWeight: "400",
          textMonthFontWeight: "700",
          textDayHeaderFontWeight: "600",
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
        }}
      />
    </View>
  );
}
