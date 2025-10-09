import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export function useDailyPlanner(userId, selectedDateStr) {
  const queryClient = useQueryClient();

  // Fetch events
  const { data: eventsData = { events: [] } } = useQuery({
    queryKey: ["events", userId, selectedDateStr],
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated");
      const response = await fetch(
        `/api/events?date=${selectedDateStr}&userId=${userId}`,
      );
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
    enabled: !!userId,
  });

  // Fetch todos
  const { data: todosData = { todos: [] } } = useQuery({
    queryKey: ["todos", userId, selectedDateStr],
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated");
      const response = await fetch(
        `/api/todos?date=${selectedDateStr}&userId=${userId}`,
      );
      if (!response.ok) throw new Error("Failed to fetch todos");
      return response.json();
    },
    enabled: !!userId,
  });

  // Fetch habits and habit entries
  const { data: habitsData = { habits: [] } } = useQuery({
    queryKey: ["habits", userId, selectedDateStr],
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated");
      const response = await fetch(
        `/api/habits?userId=${userId}&date=${selectedDateStr}`,
      );
      if (!response.ok) throw new Error("Failed to fetch habits");
      return response.json();
    },
    enabled: !!userId,
  });

  // Fetch wellness data
  const {
    data: wellnessData = {
      wellness: { water_ml: 0, steps: 0, sleep_hours: 0 },
    },
  } = useQuery({
    queryKey: ["wellness", userId, selectedDateStr],
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated");
      const response = await fetch(
        `/api/wellness?date=${selectedDateStr}&userId=${userId}`,
      );
      if (!response.ok) throw new Error("Failed to fetch wellness data");
      return response.json();
    },
    enabled: !!userId,
  });

  // Add event mutation - updated to handle new fields
  const addEventMutation = useMutation({
    mutationFn: async (eventData) => {
      if (!userId) throw new Error("User not authenticated");
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...eventData, userId }),
      });
      if (!response.ok) throw new Error("Failed to add event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events", userId, selectedDateStr],
      });
    },
    onError: () => Alert.alert("Error", "Failed to add event"),
  });

  // Add todo mutation
  const addTodoMutation = useMutation({
    mutationFn: async ({ title, todo_date }) => {
      if (!userId) throw new Error("User not authenticated");
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, todo_date, userId }),
      });
      if (!response.ok) throw new Error("Failed to add todo");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["todos", userId, selectedDateStr],
      });
    },
    onError: () => Alert.alert("Error", "Failed to add todo"),
  });

  // Toggle todo mutation
  const toggleTodoMutation = useMutation({
    mutationFn: async ({ id, completed }) => {
      if (!userId) throw new Error("User not authenticated");
      const response = await fetch("/api/todos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed, userId }),
      });
      if (!response.ok) throw new Error("Failed to update todo");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["todos", userId, selectedDateStr],
      });
    },
    onError: () => Alert.alert("Error", "Failed to update todo"),
  });

  // Add habit mutation
  const addHabitMutation = useMutation({
    mutationFn: async (habitData) => {
      if (!userId) throw new Error("User not authenticated");
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...habitData, userId: userId }),
      });
      if (!response.ok) throw new Error("Failed to add habit");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["habits", userId, selectedDateStr],
      });
    },
    onError: () => Alert.alert("Error", "Failed to add habit"),
  });

  // Toggle habit mutation
  const toggleHabitMutation = useMutation({
    mutationFn: async ({ habitId, completed }) => {
      if (!userId) throw new Error("User not authenticated");
      const response = await fetch("/api/habit-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habit_id: habitId,
          user_id: userId,
          entry_date: selectedDateStr,
          completed,
        }),
      });
      if (!response.ok) throw new Error("Failed to update habit");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["habits", userId, selectedDateStr],
      });
    },
    onError: () => Alert.alert("Error", "Failed to update habit"),
  });

  // Delete habit mutation
  const deleteHabitMutation = useMutation({
    mutationFn: async (habitId) => {
      if (!userId) throw new Error("User not authenticated");
      const response = await fetch(
        `/api/habits?id=${habitId}&userId=${userId}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) throw new Error("Failed to delete habit");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["habits", userId, selectedDateStr],
      });
    },
    onError: () => Alert.alert("Error", "Failed to delete habit"),
  });

  // Update wellness mutation
  const updateWellnessMutation = useMutation({
    mutationFn: async ({ wellness_date, field, value }) => {
      if (!userId) throw new Error("User not authenticated");
      const response = await fetch("/api/wellness", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wellness_date, field, value, userId }),
      });
      if (!response.ok) throw new Error("Failed to update wellness");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["wellness", userId, selectedDateStr],
      });
    },
    onError: () => Alert.alert("Error", "Failed to update wellness"),
  });

  // Refetch all function
  const refetchAll = () => {
    queryClient.invalidateQueries({
      queryKey: ["events", userId, selectedDateStr],
    });
    queryClient.invalidateQueries({
      queryKey: ["todos", userId, selectedDateStr],
    });
    queryClient.invalidateQueries({
      queryKey: ["habits", userId, selectedDateStr],
    });
    queryClient.invalidateQueries({
      queryKey: ["wellness", userId, selectedDateStr],
    });
  };

  // Quick add water function
  const quickAddWater = () => {
    const currentWater = wellnessData.wellness.water_ml || 0;
    updateWellnessMutation.mutate({
      wellness_date: selectedDateStr,
      field: "water_ml",
      value: currentWater + 250,
    });
  };

  return {
    events: eventsData.events,
    todos: todosData.todos,
    habits: habitsData.habits,
    wellness: wellnessData.wellness,
    addEvent: addEventMutation.mutate,
    addTodo: addTodoMutation.mutate,
    toggleTodo: toggleTodoMutation.mutate,
    addHabit: addHabitMutation.mutate,
    toggleHabit: toggleHabitMutation.mutate,
    deleteHabit: deleteHabitMutation.mutate,
    updateWellness: updateWellnessMutation.mutate,
    quickAddWater,
    refetchAll,
  };
}
