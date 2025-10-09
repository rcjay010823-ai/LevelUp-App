import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { format } from "date-fns";
import { Copy } from "lucide-react-native";
import { useThemeStore } from "@/utils/theme";

export default function SelectedDateHeader({
  selectedDate,
  onCopyDay,
  eventsCount = 0,
}) {
  const { currentTheme: colors } = useThemeStore();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: colors.text,
            marginBottom: 4,
          }}
        >
          {format(selectedDate, "EEEE")}
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: colors.text,
            opacity: 0.7,
          }}
        >
          {format(selectedDate, "MMMM d, yyyy")}
        </Text>
      </View>

      {eventsCount > 0 && onCopyDay && (
        <TouchableOpacity
          onPress={onCopyDay}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: colors.primary + "20",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.primary + "40",
          }}
        >
          <Copy size={16} color={colors.primary} />
          <Text
            style={{
              fontSize: 12,
              color: colors.primary,
              fontWeight: "600",
            }}
          >
            Copy Day
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
