import React, { useState, useCallback } from "react";
import { View, ScrollView, RefreshControl } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { addMonths, subMonths } from "date-fns";
import { useThemeStore } from "@/utils/theme";
import {
  useFonts,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";

import { useHealthData } from "@/hooks/useHealthData";
import { Toast } from "@/components/health/Toast";
import { ConfettiAnimation } from "@/components/health/Confetti";
import { BadgeModal } from "@/components/health/BadgeModal";
import { HealthHeader } from "@/components/health/HealthHeader";
import { WorkoutTab } from "@/components/health/WorkoutTab";

export default function Health() {
  const insets = useSafeAreaInsets();
  const { currentTheme: colors } = useThemeStore();
  const [fontsLoaded] = useFonts({ PlayfairDisplay_700Bold });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [newBadge, setNewBadge] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [showConfetti, setShowConfetti] = useState(false);

  const showToast = useCallback((message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 100);
  }, []);

  const triggerCelebration = useCallback((badgeData) => {
    setNewBadge(badgeData);
    setShowConfetti(true);
    setTimeout(() => {
      setShowBadgeModal(true);
    }, 500);
  }, []);

  const {
    workoutData,
    monthlyWorkoutData,
    logWorkout,
    isLoggingWorkout,
    handleRefresh: refreshData,
  } = useHealthData({
    selectedDate,
    calendarDate,
    showToast,
    triggerCelebration,
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } finally {
      setRefreshing(false);
    }
  }, [refreshData]);

  const navigateMonth = useCallback((direction) => {
    setCalendarDate((prev) =>
      direction === "next" ? addMonths(prev, 1) : subMonths(prev, 1),
    );
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top,
      }}
    >
      <StatusBar style="dark" />
      <Toast
        message={toast.message}
        visible={toast.visible}
        type={toast.type}
      />
      <ConfettiAnimation
        visible={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      <HealthHeader />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <WorkoutTab
          workoutData={workoutData}
          monthlyWorkoutData={monthlyWorkoutData}
          selectedDate={selectedDate}
          calendarDate={calendarDate}
          onDateSelect={setSelectedDate}
          onMonthNavigate={navigateMonth}
          onLogWorkout={logWorkout}
          isLogging={isLoggingWorkout}
        />
      </ScrollView>

      <BadgeModal
        visible={showBadgeModal}
        onClose={() => setShowBadgeModal(false)}
        badge={newBadge}
      />
    </View>
  );
}
