import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { format, getDaysInMonth } from "date-fns";
import { useThemeStore } from "../../utils/theme";
import {
  useFonts,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";

export const WorkoutCalendar = ({
  monthlyData,
  selectedDate,
  calendarDate,
  onDateSelect,
  onMonthNavigate,
}) => {
  const { currentTheme: colors } = useThemeStore();
  const [fontsLoaded] = useFonts({ PlayfairDisplay_700Bold });

  if (!fontsLoaded) return null;

  const entries = monthlyData?.entries || [];

  // Debug logging - more comprehensive
  console.log("🏋️ WorkoutCalendar Debug - Full Data:", {
    monthlyData,
    entries,
    entriesLength: entries.length,
    calendarMonth: format(calendarDate, "yyyy-MM"),
    rawEntries: entries.map((e) => ({
      date: e.entry_date,
      worked_out: e.worked_out,
    })),
  });

  const entryMap = entries.reduce((acc, entry) => {
    // Convert database date (which might include timestamp) to simple YYYY-MM-DD format
    const dateKey = entry.entry_date.split("T")[0]; // Remove timestamp if present
    const workedOutValue = entry.worked_out;
    console.log("📅 Processing entry:", {
      original_date: entry.entry_date,
      formatted_date: dateKey,
      worked_out: workedOutValue,
      type: typeof workedOutValue,
    });
    acc[dateKey] = workedOutValue === true || workedOutValue === 1;
    return acc;
  }, {});

  console.log("🗺️ Final Entry Map:", entryMap);
  console.log("🗺️ Entry Map Keys:", Object.keys(entryMap));

  const daysInMonth = getDaysInMonth(calendarDate);
  const firstDay = new Date(
    calendarDate.getFullYear(),
    calendarDate.getMonth(),
    1,
  );
  const startDay = firstDay.getDay();

  const calendarDays = [];

  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const todayStr = format(new Date(), "yyyy-MM-dd");

  for (let day = 1; day <= daysInMonth; day++) {
    const date = format(
      new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day),
      "yyyy-MM-dd",
    );
    const workedOutValue = entryMap[date];

    // Check if this is today
    const isToday = date === todayStr;

    console.log(`Day ${day} (${date}):`, {
      date,
      workedOutValue,
      entryExists: date in entryMap,
      isToday,
      todayStr,
    });

    calendarDays.push({
      day,
      date,
      workedOut: workedOutValue, // Use real data only
      isSelected: date === selectedDateStr,
      isToday: isToday,
    });
  }

  return (
    <View style={{ marginTop: 16 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          paddingHorizontal: 8,
        }}
      >
        <TouchableOpacity
          onPress={() => onMonthNavigate("prev")}
          style={{
            padding: 8,
            borderRadius: 8,
            backgroundColor: colors.accent,
          }}
        >
          <ChevronLeft size={20} color={colors.primary} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: colors.text,
            fontFamily: "PlayfairDisplay_700Bold",
          }}
        >
          {format(calendarDate, "MMMM yyyy")}
        </Text>
        <TouchableOpacity
          onPress={() => onMonthNavigate("next")}
          style={{
            padding: 8,
            borderRadius: 8,
            backgroundColor: colors.accent,
          }}
        >
          <ChevronRight size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <View
            key={day}
            style={{ width: "14.28%", alignItems: "center", marginBottom: 8 }}
          >
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                fontWeight: "500",
              }}
            >
              {day}
            </Text>
          </View>
        ))}
        {calendarDays.map((dayData, index) => (
          <View
            key={index}
            style={{ width: "14.28%", alignItems: "center", marginBottom: 8 }}
          >
            {dayData ? (
              <TouchableOpacity
                onPress={() => onDateSelect(new Date(dayData.date))}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: dayData.workedOut
                    ? "#22C55E" // Bright green for workout days
                    : dayData.isSelected
                      ? colors.accent
                      : dayData.isToday
                        ? colors.accent
                        : colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: dayData.isSelected ? 2 : dayData.isToday ? 1 : 0,
                  borderColor: dayData.isSelected
                    ? colors.primary
                    : colors.textSecondary,
                  // Add shadow for workout days to make them pop
                  shadowColor: dayData.workedOut ? "#22C55E" : "transparent",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: dayData.workedOut ? 0.3 : 0,
                  shadowRadius: 4,
                  elevation: dayData.workedOut ? 3 : 0,
                }}
              >
                {dayData.workedOut ? (
                  <Text
                    style={{
                      color: "#FFFFFF", // Pure white for maximum contrast
                      fontSize: 16, // Larger checkmark
                      fontWeight: "bold",
                    }}
                  >
                    ✓
                  </Text>
                ) : (
                  <Text
                    style={{
                      color:
                        dayData.isSelected || dayData.isToday
                          ? colors.primary
                          : colors.text,
                      fontSize: 12,
                      fontWeight: dayData.isSelected ? "bold" : "normal",
                    }}
                  >
                    {dayData.day}
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <View style={{ width: 32, height: 32 }} />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};
