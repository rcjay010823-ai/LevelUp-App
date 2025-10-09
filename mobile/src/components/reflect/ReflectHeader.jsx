import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { format, addDays, subDays } from "date-fns";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";
import { useThemeStore } from "@/utils/theme";
import {
    useFonts,
    PlayfairDisplay_700Bold,
  } from "@expo-google-fonts/playfair-display";

export const ReflectHeader = ({ selectedDate, setSelectedDate, onDatePickerPress }) => {
  const { currentTheme: colors } = useThemeStore();
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.accent,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: colors.text,
              fontFamily: "PlayfairDisplay_700Bold",
            }}
          >
            Reflect
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.text,
              opacity: 0.7,
              marginTop: 2,
            }}
          >
            {format(selectedDate, "EEE d MMM")}
          </Text>
        </View>

        <View
          style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
        >
          <TouchableOpacity
            onPress={() => setSelectedDate(subDays(selectedDate, 1))}
            style={{ padding: 8 }}
          >
            <ChevronLeft size={20} color={colors.text + "80"} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onDatePickerPress}
            style={{
              backgroundColor: colors.accent,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Calendar size={16} color={colors.text + "80"} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedDate(addDays(selectedDate, 1))}
            style={{ padding: 8 }}
          >
            <ChevronRight size={20} color={colors.text + "80"} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
