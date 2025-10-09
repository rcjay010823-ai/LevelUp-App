import React, { useState } from "react";
import { View, ScrollView, RefreshControl } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useRequireAuth } from "@/utils/auth/useAuth";
import useUser from "@/utils/auth/useUser";
import { useThemeStore } from "@/utils/theme";
import { useDailyPlanner } from "@/hooks/useDailyPlanner";
import { format } from "date-fns";

// Import daily planner components
import PlannerHeader from "@/components/daily-planner/PlannerHeader";
import CalendarStrip from "@/components/daily-planner/CalendarStrip";
import EventsSection from "@/components/daily-planner/EventsSection";
import WellnessSection from "@/components/daily-planner/WellnessSection";
import TodoSection from "@/components/daily-planner/TodoSection";
import HabitsSection from "@/components/daily-planner/HabitsSection";
import AffirmationsSection from "@/components/daily-planner/AffirmationsSection";
import UpdateWellnessModal from "@/components/daily-planner/modals/UpdateWellnessModal";

export default function Home() {
  // Ensure user is authenticated
  useRequireAuth();

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentTheme: colors } = useThemeStore();
  const { data: user } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [wellnessModalVisible, setWellnessModalVisible] = useState(false);
  const [wellnessField, setWellnessField] = useState(null);

  const today = format(selectedDate, "yyyy-MM-dd");
  const userId = user?.id;

  const {
    todos,
    events,
    habits,
    wellness,
    addHabit,
    toggleHabit,
    deleteHabit,
    updateWellness,
    quickAddWater,
    refetchAll,
  } = useDailyPlanner(userId, today);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchAll();
    setRefreshing(false);
  };

  const handleOpenWellnessModal = (field) => {
    setWellnessField(field);
    setWellnessModalVisible(true);
  };

  const handleUpdateWellness = async (value) => {
    await updateWellness({
      wellness_date: today,
      field: wellnessField,
      value,
    });
    setWellnessModalVisible(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />

      {/* Header */}
      <PlannerHeader selectedDate={selectedDate} />

      {/* Scrollable Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Calendar Strip */}
        <CalendarStrip
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />

        {/* Compact Power Statement */}
        <AffirmationsSection selectedDate={selectedDate} />

        {/* Events Section */}
        <EventsSection events={events || []} />

        {/* Todo Section */}
        <TodoSection selectedDate={selectedDate} />

        {/* Wellness Section */}
        <WellnessSection
          selectedDate={selectedDate}
          wellness={wellness}
          onOpenModal={handleOpenWellnessModal}
          onQuickAddWater={quickAddWater}
        />

        {/* Habits Section */}
        <HabitsSection
          selectedDate={selectedDate}
          habits={habits || []}
          onHabitToggle={(habitId, completed) =>
            toggleHabit({ habitId, completed })
          }
          onAddHabit={addHabit}
          onDeleteHabit={deleteHabit}
        />
      </ScrollView>

      {/* Wellness Modal */}
      <UpdateWellnessModal
        visible={wellnessModalVisible}
        onClose={() => setWellnessModalVisible(false)}
        field={wellnessField}
        currentValue={wellness?.[wellnessField] || 0}
        onUpdate={handleUpdateWellness}
      />
    </View>
  );
}
