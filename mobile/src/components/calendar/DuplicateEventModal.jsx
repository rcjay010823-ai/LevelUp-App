import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, Calendar, Copy, Repeat } from "lucide-react-native";
import { useThemeStore } from "@/utils/theme";
import { format, parseISO, addDays, addWeeks, addMonths } from "date-fns";

const DuplicateEventModal = ({
  visible,
  onClose,
  onDuplicate,
  editingEvent,
  eventData,
}) => {
  const { currentTheme: colors } = useThemeStore();
  const insets = useSafeAreaInsets();
  const [duplicateDate, setDuplicateDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState("weekly");
  const [recurringCount, setRecurringCount] = useState(4);
  const [duplicateMode, setDuplicateMode] = useState("single"); // 'single' or 'recurring'

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

  const handleConfirmDuplicate = () => {
    if (!editingEvent || !duplicateDate) {
      Alert.alert("Error", "Please select a date for the duplicate event");
      return;
    }

    const duplicateData = {
      title: editingEvent.title,
      startAt: `${duplicateDate}T${editingEvent.event_time}:00`,
      endAt: editingEvent.end_time
        ? `${duplicateDate}T${editingEvent.end_time}:00`
        : `${duplicateDate}T${editingEvent.event_time}:00`,
      location: editingEvent.location || "",
      type: editingEvent.type || "general",
      priority: editingEvent.priority || "medium",
      color: editingEvent.color || "#3B82F6",
      notes: editingEvent.notes || "",
      isRecurring: duplicateMode === "recurring",
      recurringType: duplicateMode === "recurring" ? recurringType : null,
      recurringCount: duplicateMode === "recurring" ? recurringCount : null,
    };

    if (onDuplicate) {
      onDuplicate(duplicateData);
    }

    onClose();
    setDuplicateMode("single");
    setRecurringType("weekly");
    setRecurringCount(4);

    const targetDateFormatted = format(parseISO(duplicateDate), "MMM dd, yyyy");
    const recurringText =
      duplicateMode === "recurring"
        ? ` and ${recurringCount - 1} more ${recurringType} occurrences`
        : "";
    Alert.alert(
      "Success",
      `Event duplicated to ${targetDateFormatted}${recurringText}`,
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
            maxHeight: "85%",
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
            Duplicate Event
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
            {editingEvent ? `"${editingEvent.title}"` : ""}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Duplicate Mode Selection */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 12,
              }}
            >
              Duplication Type
            </Text>

            <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
              <TouchableOpacity
                onPress={() => setDuplicateMode("single")}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor:
                    duplicateMode === "single" ? colors.primary : colors.accent,
                  borderWidth: 1,
                  borderColor:
                    duplicateMode === "single" ? colors.primary : colors.accent,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Copy
                  size={16}
                  color={
                    duplicateMode === "single" ? colors.surface : colors.text
                  }
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color:
                      duplicateMode === "single" ? colors.surface : colors.text,
                  }}
                >
                  Single Copy
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setDuplicateMode("recurring")}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor:
                    duplicateMode === "recurring"
                      ? colors.primary
                      : colors.accent,
                  borderWidth: 1,
                  borderColor:
                    duplicateMode === "recurring"
                      ? colors.primary
                      : colors.accent,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Repeat
                  size={16}
                  color={
                    duplicateMode === "recurring" ? colors.surface : colors.text
                  }
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color:
                      duplicateMode === "recurring"
                        ? colors.surface
                        : colors.text,
                  }}
                >
                  Recurring
                </Text>
              </TouchableOpacity>
            </View>

            {/* Date Selection */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 12,
              }}
            >
              {duplicateMode === "single"
                ? "Duplicate to Date"
                : "Start Date for Series"}
            </Text>

            {/* Quick Date Options */}
            <View style={{ marginBottom: 12 }}>
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
                    onPress={() => setDuplicateDate(option.date)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor:
                        duplicateDate === option.date
                          ? colors.primary + "30"
                          : colors.accent + "60",
                      borderWidth: 1,
                      borderColor:
                        duplicateDate === option.date
                          ? colors.primary
                          : colors.accent,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color:
                          duplicateDate === option.date
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <Calendar size={16} color={colors.text + "60"} />
              <TextInput
                value={duplicateDate}
                onChangeText={setDuplicateDate}
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

            {/* Recurring Options */}
            {duplicateMode === "recurring" && (
              <>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: colors.text,
                    opacity: 0.8,
                    marginBottom: 8,
                  }}
                >
                  Repeat Pattern
                </Text>
                <View
                  style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}
                >
                  {["daily", "weekly", "monthly"].map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setRecurringType(type)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 16,
                        backgroundColor:
                          recurringType === type
                            ? colors.primary
                            : colors.accent,
                        borderWidth: 1,
                        borderColor:
                          recurringType === type
                            ? colors.primary
                            : colors.accent,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          color:
                            recurringType === type
                              ? colors.surface
                              : colors.text,
                          textTransform: "capitalize",
                          fontWeight: "500",
                        }}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: colors.text,
                    opacity: 0.8,
                    marginBottom: 8,
                  }}
                >
                  Number of Events
                </Text>
                <View
                  style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}
                >
                  {[2, 4, 8, 12].map((count) => (
                    <TouchableOpacity
                      key={count}
                      onPress={() => setRecurringCount(count)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 16,
                        backgroundColor:
                          recurringCount === count
                            ? colors.primary
                            : colors.accent,
                        borderWidth: 1,
                        borderColor:
                          recurringCount === count
                            ? colors.primary
                            : colors.accent,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          color:
                            recurringCount === count
                              ? colors.surface
                              : colors.text,
                          fontWeight: "500",
                        }}
                      >
                        {count}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View
                  style={{
                    backgroundColor: colors.accent + "40",
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.text,
                      opacity: 0.8,
                      textAlign: "center",
                    }}
                  >
                    This will create {recurringCount} events, {recurringType}
                  </Text>
                </View>
              </>
            )}
          </ScrollView>

          <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
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
              onPress={handleConfirmDuplicate}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: colors.primary,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.surface, fontWeight: "600" }}>
                {duplicateMode === "single" ? "Duplicate" : "Create Series"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DuplicateEventModal;
