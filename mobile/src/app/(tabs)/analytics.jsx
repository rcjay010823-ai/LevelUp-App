import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LineGraph } from "react-native-graph";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { TrendingUp, Activity, Smile, Target } from "lucide-react-native";
import { useTheme } from "@/utils/theme";
import CircularProgress from "@/components/CircularProgress";

const { width: screenWidth } = Dimensions.get("window");

export default function AnalyticsPage() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedRange, setSelectedRange] = useState("week");
  const [analyticsData, setAnalyticsData] = useState({
    wellness: [],
    mood: [],
    habits: [],
    goals: {},
  });
  const [loading, setLoading] = useState(true);

  const ranges = [
    { key: "week", label: "7D" },
    { key: "month", label: "30D" },
    { key: "year", label: "1Y" },
  ];

  useEffect(() => {
    loadAnalytics();
  }, [selectedRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const userId = "demo"; // In real app, get from auth

      const [wellnessRes, moodRes, habitsRes, goalsRes] = await Promise.all([
        fetch(
          `/api/analytics?userId=${userId}&type=wellness&range=${selectedRange}`,
        ),
        fetch(
          `/api/analytics?userId=${userId}&type=mood&range=${selectedRange}`,
        ),
        fetch(
          `/api/analytics?userId=${userId}&type=habits&range=${selectedRange}`,
        ),
        fetch(
          `/api/analytics?userId=${userId}&type=goals&range=${selectedRange}`,
        ),
      ]);

      const [wellness, mood, habits, goals] = await Promise.all([
        wellnessRes.json(),
        moodRes.json(),
        habitsRes.json(),
        goalsRes.json(),
      ]);

      setAnalyticsData({
        wellness: wellness.data || [],
        mood: mood.data || [],
        habits: habits.data || [],
        goals: goals.data || {},
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatWellnessData = (data, field) => {
    return data.map((item) => ({
      date: new Date(item.date),
      value: parseFloat(item[field]) || 0,
    }));
  };

  const formatMoodData = (data) => {
    return data.map((item) => ({
      date: new Date(item.date),
      value: item.mood_value,
    }));
  };

  const graphWidth = screenWidth - 64;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: insets.top,
      }}
    >
      <StatusBar
        style={theme.colors.background === "#FFFAFC" ? "dark" : "light"}
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: theme.colors.text,
          }}
        >
          Progress
        </Text>

        <View
          style={{
            flexDirection: "row",
            backgroundColor: theme.colors.surface,
            borderRadius: 20,
            padding: 4,
          }}
        >
          {ranges.map((range) => (
            <TouchableOpacity
              key={range.key}
              onPress={() => setSelectedRange(range.key)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 16,
                backgroundColor:
                  selectedRange === range.key
                    ? theme.colors.primary
                    : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color:
                    selectedRange === range.key
                      ? "white"
                      : theme.colors.textSecondary,
                }}
              >
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Goals Overview */}
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Target size={20} color={theme.colors.primary} />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: theme.colors.text,
                marginLeft: 8,
              }}
            >
              Goals Progress
            </Text>
          </View>

          <View
            style={{ flexDirection: "row", justifyContent: "space-around" }}
          >
            <View style={{ alignItems: "center" }}>
              <CircularProgress
                progress={
                  (analyticsData.goals.yearly_goals?.completion_rate || 0) / 100
                }
                size={80}
                strokeWidth={8}
                color={theme.colors.primary}
                backgroundColor={theme.colors.accent}
              />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: theme.colors.text,
                  marginTop: 8,
                }}
              >
                Yearly Goals
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                }}
              >
                {analyticsData.goals.yearly_goals?.completed_goals || 0}/
                {analyticsData.goals.yearly_goals?.total_goals || 0}
              </Text>
            </View>

            <View style={{ alignItems: "center" }}>
              <CircularProgress
                progress={
                  (analyticsData.goals.sub_goals?.completion_rate || 0) / 100
                }
                size={80}
                strokeWidth={8}
                color={theme.colors.primary}
                backgroundColor={theme.colors.accent}
              />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: theme.colors.text,
                  marginTop: 8,
                }}
              >
                Sub Goals
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                }}
              >
                {analyticsData.goals.sub_goals?.completed_sub_goals || 0}/
                {analyticsData.goals.sub_goals?.total_sub_goals || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Mood Tracking */}
        {analyticsData.mood.length > 0 && (
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Smile size={20} color={theme.colors.primary} />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: theme.colors.text,
                  marginLeft: 8,
                }}
              >
                Mood Trends
              </Text>
            </View>

            <View style={{ height: 200, width: "100%" }}>
              <LineGraph
                points={formatMoodData(analyticsData.mood)}
                color={theme.colors.primary}
                animated={true}
                style={{ width: "100%", height: "100%" }}
                width={graphWidth}
                height={200}
                gradientFillColors={[
                  `${theme.colors.primary}20`,
                  `${theme.colors.primary}00`,
                ]}
              />
            </View>
          </View>
        )}

        {/* Water Intake */}
        {analyticsData.wellness.length > 0 && (
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Activity size={20} color={theme.colors.primary} />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: theme.colors.text,
                  marginLeft: 8,
                }}
              >
                Water Intake (ml)
              </Text>
            </View>

            <View style={{ height: 200, width: "100%" }}>
              <LineGraph
                points={formatWellnessData(analyticsData.wellness, "water_ml")}
                color="#60A5FA"
                animated={true}
                style={{ width: "100%", height: "100%" }}
                width={graphWidth}
                height={200}
                gradientFillColors={[
                  "rgba(96, 165, 250, 0.2)",
                  "rgba(96, 165, 250, 0)",
                ]}
              />
            </View>
          </View>
        )}

        {/* Steps */}
        {analyticsData.wellness.length > 0 && (
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <TrendingUp size={20} color={theme.colors.primary} />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: theme.colors.text,
                  marginLeft: 8,
                }}
              >
                Daily Steps
              </Text>
            </View>

            <View style={{ height: 200, width: "100%" }}>
              <LineGraph
                points={formatWellnessData(analyticsData.wellness, "steps")}
                color="#10B981"
                animated={true}
                style={{ width: "100%", height: "100%" }}
                width={graphWidth}
                height={200}
                gradientFillColors={[
                  "rgba(16, 185, 129, 0.2)",
                  "rgba(16, 185, 129, 0)",
                ]}
              />
            </View>
          </View>
        )}

        {/* Habits Completion */}
        {analyticsData.habits.length > 0 && (
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Target size={20} color={theme.colors.primary} />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: theme.colors.text,
                  marginLeft: 8,
                }}
              >
                Habit Completion Rates
              </Text>
            </View>

            {analyticsData.habits.map((habit, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: habit.color || theme.colors.primary,
                    marginRight: 12,
                  }}
                />
                <Text
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: theme.colors.text,
                  }}
                >
                  {habit.title}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: theme.colors.primary,
                  }}
                >
                  {habit.completion_rate || 0}%
                </Text>
              </View>
            ))}
          </View>
        )}

        {loading && (
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 16,
              padding: 40,
              alignItems: "center",
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: theme.colors.textSecondary,
              }}
            >
              Loading analytics...
            </Text>
          </View>
        )}

        {!loading &&
          analyticsData.wellness.length === 0 &&
          analyticsData.mood.length === 0 && (
            <View
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: 16,
                padding: 40,
                alignItems: "center",
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: theme.colors.textSecondary,
                  textAlign: "center",
                }}
              >
                Start tracking your daily activities to see analytics here!
              </Text>
            </View>
          )}
      </ScrollView>
    </View>
  );
}
