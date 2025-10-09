import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TextInput, Alert, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeStore } from "@/utils/theme";
import { convertTo12Hour, convertTo24Hour } from "../../utils/time";

import TimePickerModal from "./TimePickerModal";
import DuplicateEventModal from "./DuplicateEventModal";
import PrioritySelector from "./EventForm/PrioritySelector";
import ColorSelector from "./EventForm/ColorSelector";
import EventTypeSelector from "./EventForm/EventTypeSelector";
import ActionButtons from "./EventForm/ActionButtons";
import TimeInput from "./EventForm/TimeInput";

export default function EventModal({
  visible,
  onClose,
  onSubmit,
  onDelete,
  onDuplicate,
  editingEvent,
  selectedDateStr,
}) {
  const insets = useSafeAreaInsets();
  const { currentTheme: colors } = useThemeStore();

  const [eventTitle, setEventTitle] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventType, setEventType] = useState("general");
  const [eventPriority, setEventPriority] = useState("");
  const [eventColor, setEventColor] = useState(colors.primary);

  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [startAmPm, setStartAmPm] = useState("AM");
  const [endAmPm, setEndAmPm] = useState("AM");
  const [startTime12, setStartTime12] = useState("");
  const [endTime12, setEndTime12] = useState("");

  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // Helper function to add duration to a time
  const addDurationToTime = (timeString, durationMinutes = 60) => {
    if (!timeString) return "";

    const [hours, minutes] = timeString.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;

    return `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`;
  };

  // Smart default start time
  const getSmartDefaultTime = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Round to next 15-minute interval
    const roundedMinutes = Math.ceil(currentMinute / 15) * 15;
    let finalHour = currentHour;
    let finalMinutes = roundedMinutes;

    if (roundedMinutes >= 60) {
      finalHour += 1;
      finalMinutes = 0;
    }

    return `${finalHour.toString().padStart(2, "0")}:${finalMinutes.toString().padStart(2, "0")}`;
  };

  const resetForm = useCallback(() => {
    setEventTitle("");
    setEventLocation("");
    setEventType("general");
    setEventPriority("");
    setEventColor(colors.primary);

    // Set smart defaults for new events
    if (!editingEvent) {
      const defaultStartTime = getSmartDefaultTime();
      const defaultEndTime = addDurationToTime(defaultStartTime, 60); // 1 hour default

      setEventTime(defaultStartTime);
      setEventEndTime(defaultEndTime);

      const start12 = convertTo12Hour(defaultStartTime);
      const end12 = convertTo12Hour(defaultEndTime);

      setStartTime12(start12.time);
      setStartAmPm(start12.period);
      setEndTime12(end12.time);
      setEndAmPm(end12.period);
    } else {
      setEventTime("");
      setEventEndTime("");
      setStartTime12("");
      setEndTime12("");
      setStartAmPm("AM");
      setEndAmPm("AM");
    }
  }, [colors.primary, editingEvent]);

  useEffect(() => {
    if (visible) {
      if (editingEvent) {
        setEventTitle(editingEvent.title);
        setEventTime(editingEvent.event_time || "");
        setEventEndTime(editingEvent.end_time || "");
        setEventLocation(editingEvent.location || "");
        setEventType(editingEvent.type || "general");
        setEventPriority(editingEvent.priority || "");
        setEventColor(editingEvent.color || colors.primary);

        if (editingEvent.event_time) {
          const start12 = convertTo12Hour(editingEvent.event_time);
          setStartTime12(start12.time);
          setStartAmPm(start12.period);
        }
        if (editingEvent.end_time) {
          const end12 = convertTo12Hour(editingEvent.end_time);
          setEndTime12(end12.time);
          setEndAmPm(end12.period);
        }
      } else {
        resetForm();
      }
    }
  }, [visible, editingEvent, resetForm, colors.primary]);

  const handleSave = () => {
    if (!eventTitle.trim() || !eventTime.trim()) {
      Alert.alert("Error", "Please fill in title and start time");
      return;
    }
    const startAt = `${selectedDateStr}T${eventTime}:00`;
    const endAt = eventEndTime
      ? `${selectedDateStr}T${eventEndTime}:00`
      : startAt;

    const eventData = {
      title: eventTitle.trim(),
      startAt,
      endAt,
      location: eventLocation.trim(),
      type: eventType,
      priority: eventPriority,
      color: eventColor,
    };

    onSubmit(eventData);
  };

  const handleDelete = () => {
    if (!editingEvent) return;
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(editingEvent),
      },
    ]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleStartTimeSelect = (time) => {
    setEventTime(time);
    const time12 = convertTo12Hour(time);
    setStartTime12(time12.time);
    setStartAmPm(time12.period);
    setShowStartTimePicker(false);

    // Auto-calculate end time if not set or if it's before start time
    if (!eventEndTime || eventEndTime <= time) {
      const newEndTime = addDurationToTime(time, 60);
      setEventEndTime(newEndTime);
      const end12 = convertTo12Hour(newEndTime);
      setEndTime12(end12.time);
      setEndAmPm(end12.period);
    }
  };

  const handleEndTimeSelect = (time) => {
    // Validate that end time is after start time
    if (eventTime && time <= eventTime) {
      Alert.alert("Invalid Time", "End time must be after start time");
      return;
    }

    setEventEndTime(time);
    const time12 = convertTo12Hour(time);
    setEndTime12(time12.time);
    setEndAmPm(time12.period);
    setShowEndTimePicker(false);
  };

  const handleStartTimeChange = (time12, time24) => {
    setStartTime12(time12);
    setEventTime(time24);

    // Auto-calculate end time if not set or if it's before start time
    if (!eventEndTime || eventEndTime <= time24) {
      const newEndTime = addDurationToTime(time24, 60);
      setEventEndTime(newEndTime);
      const end12 = convertTo12Hour(newEndTime);
      setEndTime12(end12.time);
      setEndAmPm(end12.period);
    }
  };

  const handleEndTimeChange = (time12, time24) => {
    // Validate that end time is after start time
    if (eventTime && time24 <= eventTime) {
      Alert.alert("Invalid Time", "End time must be after start time");
      return;
    }

    setEndTime12(time12);
    setEventEndTime(time24);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
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
            maxHeight: "90%",
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 20,
              color: colors.text,
            }}
          >
            {editingEvent ? "Edit Event" : "Add Event"}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput
              value={eventTitle}
              onChangeText={setEventTitle}
              placeholder="Event title"
              placeholderTextColor={colors.text + "60"}
              style={{
                borderWidth: 1,
                borderColor: colors.accent,
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                fontSize: 16,
                color: colors.text,
              }}
            />

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
              <TimeInput
                label="Start Time"
                time12={startTime12}
                amPm={startAmPm}
                onTimeChange={handleStartTimeChange}
                onAmPmChange={(period) => {
                  setStartAmPm(period);
                  const newTime24 = convertTo24Hour(startTime12, period);
                  setEventTime(newTime24);

                  // Auto-update end time if needed
                  if (!eventEndTime || eventEndTime <= newTime24) {
                    const newEndTime = addDurationToTime(newTime24, 60);
                    setEventEndTime(newEndTime);
                    const end12 = convertTo12Hour(newEndTime);
                    setEndTime12(end12.time);
                    setEndAmPm(end12.period);
                  }
                }}
                onShowTimePicker={() => setShowStartTimePicker(true)}
                placeholder="9:00 AM"
              />
              <TimeInput
                label="End Time"
                time12={endTime12}
                amPm={endAmPm}
                onTimeChange={handleEndTimeChange}
                onAmPmChange={(period) => {
                  setEndAmPm(period);
                  const newTime24 = convertTo24Hour(endTime12, period);
                  if (eventTime && newTime24 <= eventTime) {
                    Alert.alert(
                      "Invalid Time",
                      "End time must be after start time",
                    );
                    return;
                  }
                  setEventEndTime(newTime24);
                }}
                onShowTimePicker={() => setShowEndTimePicker(true)}
                placeholder="10:00 AM"
              />
            </View>

            <TextInput
              value={eventLocation}
              onChangeText={setEventLocation}
              placeholder="Location (optional)"
              placeholderTextColor={colors.text + "60"}
              style={{
                borderWidth: 1,
                borderColor: colors.accent,
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                fontSize: 16,
                color: colors.text,
              }}
            />

            <PrioritySelector
              eventPriority={eventPriority}
              onSelect={(priority, color) => {
                setEventPriority(priority);
                setEventColor(color);
              }}
            />

            <ColorSelector eventColor={eventColor} onSelect={setEventColor} />

            <EventTypeSelector eventType={eventType} onSelect={setEventType} />
          </ScrollView>

          <ActionButtons
            editingEvent={editingEvent}
            isFormValid={!!(eventTitle.trim() && eventTime.trim())}
            onClose={handleClose}
            onSave={handleSave}
            onDelete={handleDelete}
            onDuplicate={() => setShowDuplicateModal(true)}
          />
        </View>
      </View>

      <DuplicateEventModal
        visible={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        onDuplicate={onDuplicate}
        editingEvent={editingEvent}
        eventData={{
          eventTitle,
          eventTime,
          eventEndTime,
          eventLocation,
          eventType,
          eventPriority,
          eventColor,
        }}
      />

      <TimePickerModal
        visible={showStartTimePicker}
        onClose={() => setShowStartTimePicker(false)}
        onSelect={handleStartTimeSelect}
        selectedTime={eventTime}
        title="Select Start Time"
      />

      <TimePickerModal
        visible={showEndTimePicker}
        onClose={() => setShowEndTimePicker(false)}
        onSelect={handleEndTimeSelect}
        selectedTime={eventEndTime}
        title="Select End Time"
      />
    </Modal>
  );
}
