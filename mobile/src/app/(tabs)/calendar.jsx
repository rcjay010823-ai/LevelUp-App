import React, { useState, useCallback, useMemo } from "react";
import { View, ScrollView, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { useThemeStore } from "@/utils/theme";
import {
  useFonts,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";

import CalendarHeader from "../../components/calendar/CalendarHeader";
import MonthlyCalendarView from "../../components/calendar/MonthlyCalendarView";
import SelectedDateHeader from "../../components/calendar/SelectedDateHeader";
import EventList from "../../components/calendar/EventList";
import AddEventFab from "../../components/calendar/AddEventFab";
import EventModal from "../../components/calendar/EventModal";
import CountdownSection from "../../components/calendar/CountdownSection";
import CopyDayModal from "../../components/calendar/CopyDayModal";

export default function CalendarPage() {
  const insets = useSafeAreaInsets();
  const { currentTheme: colors } = useThemeStore();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showCopyDayModal, setShowCopyDayModal] = useState(false);

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
  });

  const userId = "demo-user-123";
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  const { data: eventsData = { events: [] } } = useQuery({
    queryKey: ["events", userId, selectedDateStr],
    queryFn: async () => {
      const response = await fetch(
        `/api/events?userId=${userId}&date=${selectedDateStr}`,
      );
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
  });

  const { data: monthEventsData = { events: [] } } = useQuery({
    queryKey: ["month-events", userId, format(selectedDate, "yyyy-MM")],
    queryFn: async () => {
      const startDate = format(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
        "yyyy-MM-dd",
      );
      const endDate = format(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0),
        "yyyy-MM-dd",
      );
      const response = await fetch(
        `/api/events?userId=${userId}&startDate=${startDate}&endDate=${endDate}`,
      );
      if (!response.ok) throw new Error("Failed to fetch month events");
      return response.json();
    },
  });

  const { data: countdownData = { countdownEvents: [] } } = useQuery({
    queryKey: ["countdown-events", userId],
    queryFn: async () => {
      const response = await fetch(`/api/countdown-events?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch countdown events");
      return response.json();
    },
  });

  const markedDates = useMemo(() => {
    const marked = {};
    const today = format(new Date(), "yyyy-MM-dd");
    marked[today] = {
      ...marked[today],
      today: true,
      todayTextColor: colors.primary,
    };
    marked[selectedDateStr] = {
      ...marked[selectedDateStr],
      selected: true,
      selectedColor: colors.primary,
      selectedTextColor: colors.surface,
    };
    monthEventsData.events?.forEach((event) => {
      const eventDate = event.event_date;
      marked[eventDate] = {
        ...marked[eventDate],
        marked: true,
        dotColor: colors.primary,
      };
    });
    return marked;
  }, [selectedDateStr, monthEventsData.events, colors]);

  const createEventMutation = useMutation({
    mutationFn: async (eventData) => {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...eventData, userId }),
      });
      if (!response.ok) throw new Error("Failed to create event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events", userId, selectedDateStr],
      });
      queryClient.invalidateQueries({ queryKey: ["month-events", userId] });
      setShowEventModal(false);
      Alert.alert("Success", "Event created!");
    },
    onError: () => Alert.alert("Error", "Failed to create event"),
  });

  const updateEventMutation = useMutation({
    mutationFn: async (eventData) => {
      const response = await fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...eventData, id: editingEvent.id, userId }),
      });
      if (!response.ok) throw new Error("Failed to update event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events", userId, selectedDateStr],
      });
      queryClient.invalidateQueries({ queryKey: ["month-events", userId] });
      setShowEventModal(false);
      setEditingEvent(null);
      Alert.alert("Success", "Event updated!");
    },
    onError: () => Alert.alert("Error", "Failed to update event"),
  });

  const deleteEventMutation = useMutation({
    mutationFn: async ({ id }) => {
      const response = await fetch(`/api/events?id=${id}&userId=${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events", userId, selectedDateStr],
      });
      queryClient.invalidateQueries({ queryKey: ["month-events", userId] });
      setShowEventModal(false);
      setEditingEvent(null);
      Alert.alert("Success", "Event deleted!");
    },
    onError: () => Alert.alert("Error", "Failed to delete event"),
  });

  const createCountdownMutation = useMutation({
    mutationFn: async (countdownData) => {
      const response = await fetch("/api/countdown-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...countdownData, userId }),
      });
      if (!response.ok) throw new Error("Failed to create countdown");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countdown-events", userId] });
      Alert.alert("Success", "Countdown created!");
    },
    onError: () => Alert.alert("Error", "Failed to create countdown"),
  });

  const updateCountdownMutation = useMutation({
    mutationFn: async (countdownData) => {
      const response = await fetch("/api/countdown-events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...countdownData, userId }),
      });
      if (!response.ok) throw new Error("Failed to update countdown");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countdown-events", userId] });
      Alert.alert("Success", "Countdown updated!");
    },
    onError: () => Alert.alert("Error", "Failed to update countdown"),
  });

  const deleteCountdownMutation = useMutation({
    mutationFn: async (countdown) => {
      const response = await fetch(
        `/api/countdown-events?id=${countdown.id}&userId=${userId}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) throw new Error("Failed to delete countdown");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countdown-events", userId] });
      Alert.alert("Success", "Countdown deleted!");
    },
    onError: () => Alert.alert("Error", "Failed to delete countdown"),
  });

  const copyDayMutation = useMutation({
    mutationFn: async (targetDate) => {
      const response = await fetch("/api/events/copy-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          sourceDate: selectedDateStr,
          targetDate,
        }),
      });
      if (!response.ok) throw new Error("Failed to copy day events");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", userId] });
      queryClient.invalidateQueries({ queryKey: ["month-events", userId] });
      setShowCopyDayModal(false);
    },
    onError: (error) => {
      console.error("Copy day error:", error);
      Alert.alert("Error", "Failed to copy day events");
    },
  });

  const handleAddEvent = useCallback(() => {
    setEditingEvent(null);
    setShowEventModal(true);
  }, []);

  const handleEditEvent = useCallback((event) => {
    setEditingEvent(event);
    setShowEventModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowEventModal(false);
    setEditingEvent(null);
  }, []);

  const handleSaveEvent = useCallback(
    (eventData) => {
      if (editingEvent) {
        updateEventMutation.mutate(eventData);
      } else {
        createEventMutation.mutate(eventData);
      }
    },
    [editingEvent, createEventMutation, updateEventMutation],
  );

  const handleDeleteEvent = useCallback(
    (event) => {
      deleteEventMutation.mutate({ id: event.id });
    },
    [deleteEventMutation],
  );

  const handleAddCountdown = useCallback(
    (countdownData) => {
      createCountdownMutation.mutate(countdownData);
    },
    [createCountdownMutation],
  );

  const handleEditCountdown = useCallback(
    (countdownData) => {
      updateCountdownMutation.mutate(countdownData);
    },
    [updateCountdownMutation],
  );

  const handleDeleteCountdown = useCallback(
    (countdown) => {
      deleteCountdownMutation.mutate(countdown);
    },
    [deleteCountdownMutation],
  );

  const handleDuplicateEvent = useCallback(
    (duplicateData) => {
      createEventMutation.mutate(duplicateData);
    },
    [createEventMutation],
  );

  const handleCopyDay = useCallback(() => {
    setShowCopyDayModal(true);
  }, []);

  const handleConfirmCopyDay = useCallback(
    (targetDate) => {
      copyDayMutation.mutate(targetDate);
    },
    [copyDayMutation],
  );

  const onDayPress = (day) => {
    setSelectedDate(parseISO(day.dateString));
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          paddingTop: insets.top,
        }}
      >
        <StatusBar style="dark" />
        <CalendarHeader />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
        >
          <CountdownSection
            countdowns={countdownData.countdownEvents}
            onAddCountdown={handleAddCountdown}
            onEditCountdown={handleEditCountdown}
            onDeleteCountdown={handleDeleteCountdown}
          />

          <MonthlyCalendarView
            selectedDateStr={selectedDateStr}
            onDayPress={onDayPress}
            markedDates={markedDates}
          />
          <SelectedDateHeader
            selectedDate={selectedDate}
            onCopyDay={handleCopyDay}
            eventsCount={eventsData.events?.length || 0}
          />
          <EventList events={eventsData.events} onEditEvent={handleEditEvent} />
        </ScrollView>
        <AddEventFab onPress={handleAddEvent} />
        <EventModal
          visible={showEventModal}
          onClose={handleCloseModal}
          onSubmit={handleSaveEvent}
          onDelete={handleDeleteEvent}
          onDuplicate={handleDuplicateEvent}
          editingEvent={editingEvent}
          selectedDateStr={selectedDateStr}
        />
        <CopyDayModal
          visible={showCopyDayModal}
          onClose={() => setShowCopyDayModal(false)}
          onCopyDay={handleConfirmCopyDay}
          selectedDate={selectedDate}
          eventsCount={eventsData.events?.length || 0}
        />
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
