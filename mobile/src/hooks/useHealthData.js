import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfWeek } from "date-fns";
import { BADGES } from "../utils/healthBadges";

const userId = "demo"; // In a real app, get from auth context

export const useHealthData = ({
  selectedDate,
  calendarDate,
  showToast,
  triggerCelebration,
}) => {
  const queryClient = useQueryClient();

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const currentMonth = format(calendarDate, "yyyy-MM");
  const weekStart = format(startOfWeek(selectedDate), "yyyy-MM-dd");

  // --- QUERIES ---

  const { data: workoutData } = useQuery({
    queryKey: ["workouts", userId, selectedDateStr],
    queryFn: async () => {
      const response = await fetch(
        `/api/health/workouts?userId=${userId}&date=${selectedDateStr}`,
      );
      if (!response.ok) throw new Error("Failed to fetch workout data");
      return response.json();
    },
  });

  const { data: monthlyWorkoutData } = useQuery({
    queryKey: ["workouts-monthly", userId, currentMonth],
    queryFn: async () => {
      console.log("Fetching monthly workout data for:", currentMonth);
      const response = await fetch(
        `/api/health/workouts?userId=${userId}&month=${currentMonth}`,
      );
      if (!response.ok) throw new Error("Failed to fetch monthly workout data");
      const data = await response.json();
      console.log("Monthly workout data response:", data);
      return data;
    },
  });

  const { data: eatingData } = useQuery({
    queryKey: ["eating", userId, selectedDateStr],
    queryFn: async () => {
      const response = await fetch(
        `/api/health/eating?userId=${userId}&date=${selectedDateStr}`,
      );
      if (!response.ok) throw new Error("Failed to fetch eating data");
      return response.json();
    },
  });

  const { data: weeklyEatingData } = useQuery({
    queryKey: ["eating-weekly", userId, weekStart],
    queryFn: async () => {
      const response = await fetch(
        `/api/health/eating?userId=${userId}&week=${weekStart}`,
      );
      if (!response.ok) throw new Error("Failed to fetch weekly eating data");
      return response.json();
    },
  });

  // --- MUTATIONS ---

  const workoutMutation = useMutation({
    mutationFn: async (workedOut) => {
      console.log("🚀 Starting workout mutation with:", {
        userId,
        selectedDateStr,
        workedOut,
        currentMonth,
      });

      const response = await fetch("/api/health/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, date: selectedDateStr, workedOut }),
      });
      if (!response.ok) throw new Error("Failed to log workout");

      const data = await response.json();
      console.log("✅ Workout API response:", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("🎉 Workout logged successfully:", data);
      showToast("Workout logged ✅");

      if (data.newBadges && data.newBadges.length > 0) {
        const badge = data.newBadges[0];
        const badgeInfo = BADGES.workout[badge.streak_days];
        if (badgeInfo) {
          triggerCelebration({
            ...badgeInfo,
            type: "workout",
            streak: badge.streak_days,
          });
        }
      }

      // Update the cache immediately with the new entry
      queryClient.setQueryData(["workouts", userId, selectedDateStr], data);
      console.log("📦 Updated single workout cache for:", selectedDateStr);

      // AGGRESSIVE cache invalidation - remove all cached data and refetch
      console.log("🧹 Starting aggressive cache cleanup...");

      // Clear all workout-related cache
      queryClient.removeQueries({ queryKey: ["workouts"] });
      queryClient.removeQueries({ queryKey: ["workouts-monthly"] });

      // Force immediate refetch of monthly data
      setTimeout(() => {
        console.log("🔄 Force refetching monthly data...");
        queryClient.invalidateQueries({
          queryKey: ["workouts-monthly", userId, currentMonth],
          refetchType: "active",
        });
      }, 100);

      console.log("🔄 Invalidated queries:", {
        monthlyKey: ["workouts-monthly", userId, currentMonth],
        allWorkouts: ["workouts"],
      });
    },
    onError: (error) => {
      console.error("❌ Workout mutation error:", error);
      showToast("Couldn't save. Tap to retry.", "error");
    },
  });

  const eatingMutation = useMutation({
    mutationFn: async (ateClean) => {
      const response = await fetch("/api/health/eating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, date: selectedDateStr, ateClean }),
      });
      if (!response.ok) throw new Error("Failed to log eating");
      return response.json();
    },
    onSuccess: (data) => {
      const message = data.entry?.ate_clean
        ? "Clean day logged ✅"
        : "Treat day logged ✅";
      showToast(message);
      if (data.newBadges && data.newBadges.length > 0) {
        const badge = data.newBadges[0];
        const badgeInfo = BADGES.eating[badge.streak_days];
        if (badgeInfo) {
          triggerCelebration({
            ...badgeInfo,
            type: "eating",
            streak: badge.streak_days,
          });
        }
      }
      // Invalidate both daily and weekly eating queries
      queryClient.invalidateQueries({ queryKey: ["eating"] });
      queryClient.invalidateQueries({ queryKey: ["eating-weekly"] });
    },
    onError: () => {
      showToast("Couldn't save. Tap to retry.", "error");
    },
  });

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["workouts"] }),
      queryClient.invalidateQueries({ queryKey: ["workouts-monthly"] }),
      queryClient.invalidateQueries({ queryKey: ["eating"] }),
      queryClient.invalidateQueries({ queryKey: ["eating-weekly"] }),
    ]);
  };

  return {
    workoutData,
    monthlyWorkoutData,
    eatingData,
    weeklyEatingData,
    logWorkout: workoutMutation.mutate,
    isLoggingWorkout: workoutMutation.isPending,
    logEating: eatingMutation.mutate,
    isLoggingEating: eatingMutation.isPending,
    handleRefresh,
  };
};
