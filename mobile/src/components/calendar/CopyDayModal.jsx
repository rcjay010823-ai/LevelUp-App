import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calendar, Copy } from "lucide-react-native";
import { useThemeStore } from "@/utils/theme";
import { format, addDays, addWeeks, addMonths } from "date-fns";

const CopyDayModal = ({
  visible,
  onClose,
  onCopyDay,
  selectedDate,
  eventsCount,
}) => {
  const { currentTheme: colors } = useThemeStore();
  const insets = useSafeAreaInsets();
  const [targetDate, setTargetDate] = useState(
    format(addDays(new Date(), 1), "yyyy-MM-dd"),
  );

  // Quick date options
  const getQuickDates = () => {
    const today = new Date();
    return [
      { label: "Tomorrow", date: format(addDays(today, 1), "yyyy-MM-dd") },
      { label: "Next Week", date: format(addWeeks(today, 1), "yyyy-MM-dd") },
      { label: "Next Month", date: format(addMonths(today, 1), "yyyy-MM-dd") },
    ];
  };

  const quickDates = getQuickDates();

  const handleConfirmCopy = () => {
    if (!targetDate) {
      Alert.alert("Error", "Please select a target date");
      return;
    }

    if (targetDate === format(selectedDate, "yyyy-MM-dd")) {
      Alert.alert("Error", "Target date cannot be the same as source date");
      return;
    }

    if (onCopyDay) {
      onCopyDay(targetDate);
    }

    onClose();
    Alert.alert(
      "Success", 
      `${eventsCount} event${eventsCount !== 1 ? 's' : ''} copied to ${format(new Date(targetDate), "MMM dd, yyyy")}`
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            paddingBottom: insets.bottom + 20,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 8,
              color: colors.text,
              textAlign: "center",
            }}
          >
            Copy Entire Day
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: colors.text,
              opacity: 0.7,
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            Copy {eventsCount} event{eventsCount !== 1 ? 's' : ''} from {format(selectedDate, "MMM dd, yyyy")}
          </Text>

          {/* Quick Date Options */}
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: colors.text,
              marginBottom: 12,
            }}
          >
            Copy to Date
          </Text>

          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: colors.text,
                opacity: 0.8,
                marginBottom: 8,
              }}
            >
              Quick Select
            </Text>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {quickDates.map((option) => (
                <TouchableOpacity
                  key={option.label}
                  onPress={() => setTargetDate(option.date)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 16,
                    backgroundColor:
                      targetDate === option.date
                        ? colors.primary + "30"
                        : colors.accent + "60",
                    borderWidth: 1,
                    borderColor:
                      targetDate === option.date
                        ? colors.primary
                        : colors.accent,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color:
                        targetDate === option.date
                          ? colors.primary
                          : colors.text,
                      fontWeight: "500",
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Manual Date Input */}
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: colors.text,
              opacity: 0.8,
              marginBottom: 8,
            }}
          >
            Enter Manually
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 24,
            }}
          >
            <Calendar size={16} color={colors.text + "60"} />
            <TextInput
              value={targetDate}
              onChangeText={setTargetDate}
              placeholder="YYYY-MM-DD"
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: colors.accent,
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: colors.text,
              }}
              placeholderTextColor={colors.text + "60"}
            />
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: colors.accent,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.text, fontWeight: "600" }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirmCopy}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: colors.primary,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Copy size={16} color={colors.surface} />
              <Text style={{ color: colors.surface, fontWeight: "600" }}>
                Copy Day
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CopyDayModal;