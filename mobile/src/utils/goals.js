import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GOALS_STORAGE_KEY = "@wellness_goals";

const defaultGoals = {
  waterGoalMl: 2000,
  stepsGoal: 8000,
  sleepGoalHrs: 8.0,
  gymGoalMinutes: 60, // Default goal of 60 minutes per day
};

export const useGoalsStore = create((set, get) => ({
  goals: defaultGoals,

  setGoals: async (newGoals) => {
    const updatedGoals = { ...get().goals, ...newGoals };
    set({ goals: updatedGoals });
    try {
      await AsyncStorage.setItem(
        GOALS_STORAGE_KEY,
        JSON.stringify(updatedGoals),
      );
    } catch (error) {
      console.error("Failed to save goals:", error);
    }
  },

  loadGoals: async () => {
    try {
      const savedGoals = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
      if (savedGoals) {
        const parsedGoals = JSON.parse(savedGoals);
        set({ goals: { ...defaultGoals, ...parsedGoals } });
      }
    } catch (error) {
      console.error("Failed to load goals:", error);
    }
  },

  updateWaterGoal: async (waterGoalMl) => {
    get().setGoals({ waterGoalMl });
  },

  updateStepsGoal: async (stepsGoal) => {
    get().setGoals({ stepsGoal });
  },

  updateSleepGoal: async (sleepGoalHrs) => {
    get().setGoals({ sleepGoalHrs });
  },

  updateGymGoal: async (gymGoalMinutes) => {
    get().setGoals({ gymGoalMinutes });
  },
}));
