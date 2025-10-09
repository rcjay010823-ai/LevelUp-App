import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { useThemeStore } from "@/utils/theme";
import { Check, X } from "lucide-react-native";

export function EatingTab({
  eatingData,
  weeklyEatingData,
  selectedDate,
  onLogEating,
  isLogging,
}) {
  const { currentTheme: colors } = useThemeStore();

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getEatingStatusForDate = (date) => {
    return weeklyEatingData?.find((entry) =>
      isSameDay(new Date(entry.entry_date), date)
    );
  };

  const handleLogEating = (ateClean) => {
    onLogEating(selectedDate, ateClean);
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Weekly Overview */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: colors.text,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          This Week's Eating
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          {weekDays.map((day, index) => {
            const eatingEntry = getEatingStatusForDate(day);
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);

            return (
              <View
                key={index}
                style={{
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginBottom: 8,
                    fontWeight: isToday ? "600" : "400",
                  }}
                >
                  {format(day, "EEE")}
                </Text>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: eatingEntry
                      ? eatingEntry.ate_clean
                        ? colors.success
                        : colors.error
                      : colors.accent,
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: isSelected ? 2 : 0,
                    borderColor: colors.primary,
                  }}
                >
                  {eatingEntry ? (
                    eatingEntry.ate_clean ? (
                      <Check size={16} color={colors.surface} />
                    ) : (
                      <X size={16} color={colors.surface} />
                    )
                  ) : (
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.textSecondary,
                        fontWeight: "500",
                      }}
                    >
                      {format(day, "d")}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 16,
            marginTop: 8,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: colors.success,
                marginRight: 6,
              }}
            />
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              Clean Eating
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: colors.error,
                marginRight: 6,
              }}
            />
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              Cheat Day
            </Text>
          </View>
        </View>
      </View>

      {/* Today's Eating Log */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: colors.text,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          {format(selectedDate, "MMMM d, yyyy")}
        </Text>

        {eatingData ? (
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: eatingData.ate_clean
                  ? colors.success
                  : colors.error,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              {eatingData.ate_clean ? (
                <Check size={32} color={colors.surface} />
              ) : (
                <X size={32} color={colors.surface} />
              )}
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 8,
              }}
            >
              {eatingData.ate_clean ? "Clean Eating Day!" : "Cheat Day"}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              {eatingData.ate_clean
                ? "Great job staying on track with your nutrition goals!"
                : "It's okay to have cheat days. Get back on track tomorrow!"}
            </Text>
            <TouchableOpacity
              onPress={() => handleLogEating(!eatingData.ate_clean)}
              disabled={isLogging}
              style={{
                backgroundColor: colors.accent,
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                {isLogging
                  ? "Updating..."
                  : `Change to ${eatingData.ate_clean ? "Cheat Day" : "Clean Eating"}`}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: 16,
                color: colors.textSecondary,
                marginBottom: 24,
                textAlign: "center",
              }}
            >
              How did your eating go today?
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 16,
              }}
            >
              <TouchableOpacity
                onPress={() => handleLogEating(true)}
                disabled={isLogging}
                style={{
                  backgroundColor: colors.success,
                  paddingHorizontal: 24,
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: "center",
                  flex: 1,
                  opacity: isLogging ? 0.6 : 1,
                }}
              >
                <Check size={24} color={colors.surface} />
                <Text
                  style={{
                    color: colors.surface,
                    fontWeight: "600",
                    fontSize: 16,
                    marginTop: 8,
                  }}
                >
                  Clean Eating
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleLogEating(false)}
                disabled={isLogging}
                style={{
                  backgroundColor: colors.error,
                  paddingHorizontal: 24,
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: "center",
                  flex: 1,
                  opacity: isLogging ? 0.6 : 1,
                }}
              >
                <X size={24} color={colors.surface} />
                <Text
                  style={{
                    color: colors.surface,
                    fontWeight: "600",
                    fontSize: 16,
                    marginTop: 8,
                  }}
                >
                  Cheat Day
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}