import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { format } from "date-fns";
import { RefreshCw } from "lucide-react-native";
import { useThemeStore } from "@/utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CompactWeather from "./CompactWeather";

export default function PlannerHeader({ selectedDate, onRefresh }) {
  const { currentTheme: colors } = useThemeStore();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top + 12,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: colors.surface,
        borderBottomWidth: 2,
        borderBottomColor: colors.accent,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "900",
                color: colors.text,
                fontFamily: "PlayfairDisplay_700Bold",
                flex: 1,
                letterSpacing: -0.5,
              }}
            >
              Today
            </Text>
            {onRefresh && (
              <TouchableOpacity
                onPress={onRefresh}
                style={{
                  padding: 10,
                  marginLeft: 12,
                  marginRight: 8,
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <RefreshCw size={18} color={colors.surface} />
              </TouchableOpacity>
            )}
          </View>
          <Text
            style={{
              fontSize: 17,
              color: colors.text,
              marginTop: 6,
              opacity: 0.8,
              fontWeight: "500",
            }}
          >
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </Text>
        </View>

        <CompactWeather />
      </View>
    </View>
  );
}
