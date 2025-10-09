import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeStore } from "@/utils/theme";
import {
  getPriorityOptions,
  getPriorityTextColor,
  COLOR_OPTIONS,
} from "@/utils/calendarConstants";
import * as Calendar from "expo-calendar";

export default function AddEventModal({ visible, onClose, onAdd }) {
  const { currentTheme: colors } = useThemeStore();
  const insets = useSafeAreaInsets();
  const [eventTitle, setEventTitle] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [ampm, setAmpm] = useState("AM");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState("medium");
  const [selectedColor, setSelectedColor] = useState(colors.primary);
  const [syncToAppleCalendar, setSyncToAppleCalendar] = useState(false);

  // Get priority options with theme-based colors
  const priorityOptions = getPriorityOptions(colors);

  // Convert 12-hour time to 24-hour format
  const convertTo24Hour = (time, period) => {
    if (!time) return "";

    let [hours, minutes] = time.split(":");
    hours = parseInt(hours);
    minutes = minutes || "00";

    if (period === "AM") {
      if (hours === 12) hours = 0;
    } else {
      if (hours !== 12) hours += 12;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  };

  const handleAdd = async () => {
    if (eventTitle.trim() && timeInput.trim()) {
      try {
        const time24Hour = convertTo24Hour(timeInput, ampm);

        // Add to our app's database
        await onAdd({
          title: eventTitle.trim(),
          time: time24Hour,
          notes: notes.trim(),
          priority,
          color: selectedColor,
        });

        // Sync to Apple Calendar if requested
        if (syncToAppleCalendar) {
          await syncToAppleCalendarFunc();
        }

        // Reset form
        setEventTitle("");
        setTimeInput("");
        setAmpm("AM");
        setNotes("");
        setPriority("medium");
        setSelectedColor(colors.primary);
        setSyncToAppleCalendar(false);
      } catch (error) {
        Alert.alert("Error", "Failed to add event. Please try again.");
      }
    }
  };

  const syncToAppleCalendarFunc = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === "granted") {
        const calendars = await Calendar.getCalendarsAsync(
          Calendar.EntityTypes.EVENT,
        );
        const defaultCalendar = calendars.find(
          (cal) => cal.source.name === "Default",
        );

        if (defaultCalendar) {
          const time24Hour = convertTo24Hour(timeInput, ampm);
          const [hours, minutes] = time24Hour.split(":").map(Number);
          const eventDate = new Date();
          eventDate.setHours(hours, minutes, 0, 0);

          await Calendar.createEventAsync(defaultCalendar.id, {
            title: eventTitle,
            startDate: eventDate,
            endDate: new Date(eventDate.getTime() + 60 * 60 * 1000), // 1 hour later
            notes: notes,
            allDay: false,
          });
        }
      } else {
        Alert.alert(
          "Permission Required",
          "Calendar permission is needed to sync events.",
        );
      }
    } catch (error) {
      console.error("Error syncing to Apple Calendar:", error);
      Alert.alert("Sync Error", "Failed to sync to Apple Calendar.");
    }
  };

  const handleClose = () => {
    setEventTitle("");
    setTimeInput("");
    setAmpm("AM");
    setNotes("");
    setPriority("medium");
    setSelectedColor(colors.primary);
    setSyncToAppleCalendar(false);
    onClose();
  };

  const isValidTime = (time) => {
    const timeRegex = /^(0?[1-9]|1[0-2]):?([0-5][0-9])?$/;
    return timeRegex.test(time);
  };

  const formatTimeInput = (text) => {
    // Remove non-numeric characters except colon
    let cleaned = text.replace(/[^\d:]/g, "");

    // Auto-add colon after 2 digits if not present
    if (cleaned.length === 3 && cleaned[2] !== ":") {
      cleaned = cleaned.slice(0, 2) + ":" + cleaned.slice(2);
    }

    // Limit to HH:MM format
    if (cleaned.length > 5) {
      cleaned = cleaned.slice(0, 5);
    }

    return cleaned;
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
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
            maxHeight: "90%",
          }}
        >
          <ScrollView
            style={{ padding: 20, paddingBottom: 0 }}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            showsVerticalScrollIndicator={false}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 20,
                color: colors.text,
              }}
            >
              Add Event
            </Text>

            <TextInput
              value={eventTitle}
              onChangeText={setEventTitle}
              placeholder="Event title"
              placeholderTextColor={colors.text + "80"}
              style={{
                borderWidth: 1,
                borderColor: colors.accent,
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                fontSize: 16,
                color: colors.text,
                backgroundColor: colors.background,
              }}
            />

            {/* Time Input Section */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 8,
              }}
            >
              Time
            </Text>
            <View style={{ flexDirection: "row", marginBottom: 16, gap: 8 }}>
              <TextInput
                value={timeInput}
                onChangeText={(text) => setTimeInput(formatTimeInput(text))}
                placeholder="12:30"
                placeholderTextColor={colors.text + "80"}
                keyboardType="numeric"
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: colors.accent,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: colors.text,
                  backgroundColor: colors.background,
                }}
              />
              <View style={{ flexDirection: "row", gap: 4 }}>
                <TouchableOpacity
                  onPress={() => setAmpm("AM")}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    backgroundColor:
                      ampm === "AM" ? colors.primary : colors.accent,
                    borderWidth: 1,
                    borderColor: ampm === "AM" ? colors.primary : colors.accent,
                  }}
                >
                  <Text
                    style={{
                      color: ampm === "AM" ? "white" : colors.text,
                      fontWeight: "600",
                      fontSize: 16,
                    }}
                  >
                    AM
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setAmpm("PM")}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    backgroundColor:
                      ampm === "PM" ? colors.primary : colors.accent,
                    borderWidth: 1,
                    borderColor: ampm === "PM" ? colors.primary : colors.accent,
                  }}
                >
                  <Text
                    style={{
                      color: ampm === "PM" ? "white" : colors.text,
                      fontWeight: "600",
                      fontSize: 16,
                    }}
                  >
                    PM
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes (optional)"
              placeholderTextColor={colors.text + "80"}
              multiline
              numberOfLines={3}
              style={{
                borderWidth: 1,
                borderColor: colors.accent,
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                fontSize: 16,
                color: colors.text,
                backgroundColor: colors.background,
                textAlignVertical: "top",
              }}
            />

            {/* Priority Selection */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 8,
              }}
            >
              Priority
            </Text>
            <View style={{ flexDirection: "row", marginBottom: 16, gap: 8 }}>
              {priorityOptions
                .filter((option) => option.value !== "") // Exclude "No Priority"
                .map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setPriority(option.value)}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      backgroundColor:
                        priority === option.value
                          ? option.color
                          : colors.accent,
                      alignItems: "center",
                      borderWidth: 2,
                      borderColor:
                        priority === option.value
                          ? option.color
                          : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        color:
                          priority === option.value
                            ? getPriorityTextColor(option.value, colors)
                            : colors.text,
                        fontWeight: priority === option.value ? "600" : "500",
                        fontSize: 14,
                      }}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>

            {/* Color Selection */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 8,
              }}
            >
              Color
            </Text>
            <View style={{ flexDirection: "row", marginBottom: 16, gap: 8 }}>
              {COLOR_OPTIONS.map((colorOption) => (
                <TouchableOpacity
                  key={colorOption.value}
                  onPress={() => setSelectedColor(colorOption.value)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colorOption.value,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: selectedColor === colorOption.value ? 3 : 1,
                    borderColor:
                      selectedColor === colorOption.value
                        ? colors.text
                        : colors.accent,
                  }}
                >
                  {selectedColor === colorOption.value && (
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: "white",
                      }}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Apple Calendar Sync */}
            <TouchableOpacity
              onPress={() => setSyncToAppleCalendar(!syncToAppleCalendar)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
                padding: 12,
                borderRadius: 8,
                backgroundColor: colors.accent,
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  backgroundColor: syncToAppleCalendar
                    ? colors.primary
                    : "transparent",
                  borderWidth: 2,
                  borderColor: colors.primary,
                  marginRight: 12,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {syncToAppleCalendar && (
                  <Text
                    style={{ color: "white", fontSize: 12, fontWeight: "bold" }}
                  >
                    ✓
                  </Text>
                )}
              </View>
              <Text style={{ color: colors.text, fontSize: 15 }}>
                Sync to Apple Calendar
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={handleClose}
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
                onPress={handleAdd}
                disabled={
                  !eventTitle.trim() ||
                  !timeInput.trim() ||
                  !isValidTime(timeInput)
                }
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor:
                    eventTitle.trim() &&
                    timeInput.trim() &&
                    isValidTime(timeInput)
                      ? colors.primary
                      : colors.accent,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.background, fontWeight: "600" }}>
                  Add Event
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
