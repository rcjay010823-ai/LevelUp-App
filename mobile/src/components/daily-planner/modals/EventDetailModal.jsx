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
import {
  Clock,
  Edit3,
  Trash2,
  Calendar as CalendarIcon,
} from "lucide-react-native";
import { useThemeStore } from "@/utils/theme";
import {
  getPriorityOptions,
  getPriorityTextColor,
} from "@/utils/calendarConstants";
import * as Calendar from "expo-calendar";

const COLOR_OPTIONS = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#8B5CF6", // Purple
  "#EC4899", // Pink
];

export default function EventDetailModal({
  visible,
  onClose,
  event,
  onUpdate,
  onDelete,
}) {
  const { currentTheme: colors } = useThemeStore();
  const insets = useSafeAreaInsets();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(event?.title || "");
  const [time, setTime] = useState(event?.event_time || "");
  const [notes, setNotes] = useState(event?.notes || "");
  const [priority, setPriority] = useState(event?.priority || "medium");
  const [selectedColor, setSelectedColor] = useState(event?.color || "#3B82F6");

  // Get priority options with theme-based colors
  const priorityOptions = getPriorityOptions(colors);

  React.useEffect(() => {
    if (event) {
      setTitle(event.title || "");
      setTime(event.event_time || "");
      setNotes(event.notes || "");
      setPriority(event.priority || "medium");
      setSelectedColor(event.color || "#3B82F6");
    }
  }, [event]);

  const handleUpdate = async () => {
    if (title.trim() && time.trim()) {
      try {
        await onUpdate({
          id: event.id,
          title: title.trim(),
          event_time: time.trim(),
          notes: notes.trim(),
          priority,
          color: selectedColor,
        });
        setIsEditing(false);
      } catch (error) {
        Alert.alert("Error", "Failed to update event. Please try again.");
      }
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await onDelete(event.id);
            onClose();
          } catch (error) {
            Alert.alert("Error", "Failed to delete event. Please try again.");
          }
        },
      },
    ]);
  };

  const syncToAppleCalendar = async () => {
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
          const [hours, minutes] = time.split(":").map(Number);
          const eventDate = new Date();
          eventDate.setHours(hours, minutes, 0, 0);

          await Calendar.createEventAsync(defaultCalendar.id, {
            title: title,
            startDate: eventDate,
            endDate: new Date(eventDate.getTime() + 60 * 60 * 1000), // 1 hour later
            notes: notes,
            allDay: false,
          });

          Alert.alert("Success", "Event synced to Apple Calendar!");
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
    setIsEditing(false);
    onClose();
  };

  if (!event) return null;

  const priorityOption =
    priorityOptions.find((p) => p.value === priority) ||
    priorityOptions.find((p) => p.value === "medium");

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
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: selectedColor,
                    marginRight: 8,
                  }}
                />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: colors.text,
                  }}
                >
                  Event Details
                </Text>
              </View>

              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  onPress={() => setIsEditing(!isEditing)}
                  style={{
                    padding: 8,
                    borderRadius: 8,
                    backgroundColor: colors.accent,
                  }}
                >
                  <Edit3 size={18} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDelete}
                  style={{
                    padding: 8,
                    borderRadius: 8,
                    backgroundColor: "#EF4444",
                  }}
                >
                  <Trash2 size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Event Title */}
            {isEditing ? (
              <TextInput
                value={title}
                onChangeText={setTitle}
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
            ) : (
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: colors.text,
                  marginBottom: 16,
                }}
              >
                {title}
              </Text>
            )}

            {/* Time */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Clock size={16} color={colors.textSecondary} />
              {isEditing ? (
                <TextInput
                  value={time}
                  onChangeText={setTime}
                  placeholder="Time (e.g., 14:30)"
                  placeholderTextColor={colors.text + "80"}
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: colors.accent,
                    borderRadius: 8,
                    padding: 8,
                    marginLeft: 8,
                    fontSize: 14,
                    color: colors.text,
                    backgroundColor: colors.background,
                  }}
                />
              ) : (
                <Text
                  style={{
                    fontSize: 16,
                    color: colors.textSecondary,
                    marginLeft: 8,
                  }}
                >
                  {time}
                </Text>
              )}
            </View>

            {/* Priority - Always show now */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                Priority
              </Text>
              {isEditing ? (
                <View style={{ flexDirection: "row", gap: 8 }}>
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
                        }}
                      >
                        <Text
                          style={{
                            color:
                              priority === option.value
                                ? getPriorityTextColor(option.value, colors)
                                : colors.text,
                            fontWeight: "600",
                            fontSize: 14,
                          }}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              ) : (
                <View
                  style={{
                    alignSelf: "flex-start",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: priorityOption.color,
                  }}
                >
                  <Text
                    style={{
                      color: getPriorityTextColor(priorityOption.value, colors),
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    {priorityOption.label} Priority
                  </Text>
                </View>
              )}
            </View>

            {/* Color Selection */}
            {isEditing && (
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: 8,
                  }}
                >
                  Color
                </Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {COLOR_OPTIONS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      onPress={() => setSelectedColor(color)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: color,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: selectedColor === color ? 3 : 1,
                        borderColor:
                          selectedColor === color ? colors.text : colors.accent,
                      }}
                    >
                      {selectedColor === color && (
                        <View
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 8,
                            backgroundColor: "white",
                          }}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Notes */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                Notes
              </Text>
              {isEditing ? (
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add notes..."
                  placeholderTextColor={colors.text + "80"}
                  multiline
                  numberOfLines={4}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.accent,
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 14,
                    color: colors.text,
                    backgroundColor: colors.background,
                    textAlignVertical: "top",
                  }}
                />
              ) : (
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                    lineHeight: 20,
                    fontStyle: notes ? "normal" : "italic",
                  }}
                >
                  {notes || "No notes added"}
                </Text>
              )}
            </View>

            {/* Apple Calendar Sync Button */}
            {!isEditing && (
              <TouchableOpacity
                onPress={syncToAppleCalendar}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: colors.accent,
                  marginBottom: 16,
                }}
              >
                <CalendarIcon size={18} color={colors.text} />
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 15,
                    fontWeight: "500",
                    marginLeft: 8,
                  }}
                >
                  Sync to Apple Calendar
                </Text>
              </TouchableOpacity>
            )}

            {/* Action Buttons */}
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
                  {isEditing ? "Cancel" : "Close"}
                </Text>
              </TouchableOpacity>

              {isEditing && (
                <TouchableOpacity
                  onPress={handleUpdate}
                  disabled={!title.trim() || !time.trim()}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor:
                      title.trim() && time.trim()
                        ? colors.primary
                        : colors.accent,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: colors.background, fontWeight: "600" }}>
                    Save Changes
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
