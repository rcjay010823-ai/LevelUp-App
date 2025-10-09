import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Target,
  Check,
  CheckCircle2,
  Circle,
  Save,
  Trophy,
  Trash,
} from "lucide-react-native";
import { useThemeStore } from "@/utils/theme";
import {
  useFonts,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export default function GoalsPage() {
  const insets = useSafeAreaInsets();
  const { currentTheme, loadTheme } = useThemeStore();
  const queryClient = useQueryClient();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showAddSubGoalModal, setShowAddSubGoalModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(null);

  // Form state
  const [goalTitle, setGoalTitle] = useState("");
  const [goalNotes, setGoalNotes] = useState("");
  const [subGoalTitle, setSubGoalTitle] = useState("");

  // Mock user ID - in real app this would come from auth context
  const userId = "demo-user-123";

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  React.useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  // Fetch yearly goals
  const { data: goalsData = { goals: [] } } = useQuery({
    queryKey: ["yearly-goals", userId, selectedYear],
    queryFn: async () => {
      const response = await fetch(
        `/api/yearly-goals?userId=${userId}&year=${selectedYear}`,
      );
      if (!response.ok) throw new Error("Failed to fetch yearly goals");
      return response.json();
    },
  });

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (goalData) => {
      const response = await fetch("/api/yearly-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalData),
      });
      if (!response.ok) throw new Error("Failed to create goal");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["yearly-goals", userId, selectedYear],
      });
      setShowAddGoalModal(false);
      resetGoalForm();
      Alert.alert("Success", "Goal created!");
    },
    onError: () => Alert.alert("Error", "Failed to create goal"),
  });

  // Create sub-goal mutation
  const createSubGoalMutation = useMutation({
    mutationFn: async (subGoalData) => {
      const response = await fetch("/api/sub-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subGoalData),
      });
      if (!response.ok) throw new Error("Failed to create sub-goal");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["yearly-goals", userId, selectedYear],
      });
      // Also invalidate the sub-goals query to refresh the list
      queryClient.invalidateQueries({
        queryKey: ["sub-goals", selectedGoalId, userId],
      });
      setShowAddSubGoalModal(false);
      setSubGoalTitle("");
      Alert.alert("Success", "Sub-goal added!");
    },
    onError: (error) => {
      console.error("Error creating sub-goal:", error);
      Alert.alert("Error", "Failed to create sub-goal");
    },
  });

  // Toggle sub-goal completion
  const toggleSubGoalMutation = useMutation({
    mutationFn: async ({ id, isDone }) => {
      const response = await fetch("/api/sub-goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, userId, isDone }),
      });
      if (!response.ok) throw new Error("Failed to update sub-goal");
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["yearly-goals", userId, selectedYear],
      });
      // Also invalidate the specific sub-goals query
      queryClient.invalidateQueries({
        queryKey: ["sub-goals"],
      });
    },
    onError: (error) => {
      console.error("Error toggling sub-goal:", error);
      Alert.alert("Error", "Failed to update sub-goal");
    },
  });

  // Delete sub-goal mutation
  const deleteSubGoalMutation = useMutation({
    mutationFn: async (subGoalId) => {
      const response = await fetch(
        `/api/sub-goals?id=${subGoalId}&userId=${userId}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) throw new Error("Failed to delete sub-goal");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["yearly-goals", userId, selectedYear],
      });
      queryClient.invalidateQueries({
        queryKey: ["sub-goals"],
      });
      Alert.alert("Success", "Sub-goal deleted!");
    },
    onError: (error) => {
      console.error("Error deleting sub-goal:", error);
      Alert.alert("Error", "Failed to delete sub-goal");
    },
  });

  const resetGoalForm = () => {
    setGoalTitle("");
    setGoalNotes("");
  };

  const handleAddGoal = useCallback(() => {
    // Check if already at max goals (10)
    if (goalsData.goals.length >= 10) {
      Alert.alert(
        "Limit Reached",
        "You can have a maximum of 10 goals per year.",
      );
      return;
    }
    resetGoalForm();
    setShowAddGoalModal(true);
  }, [goalsData.goals.length]);

  const handleSaveGoal = useCallback(() => {
    if (!goalTitle.trim()) {
      Alert.alert("Error", "Please enter a goal title");
      return;
    }

    createGoalMutation.mutate({
      userId,
      title: goalTitle.trim(),
      notes: goalNotes.trim(),
      year: selectedYear,
    });
  }, [goalTitle, goalNotes, selectedYear, userId, createGoalMutation]);

  const handleAddSubGoal = useCallback(
    (goalId) => {
      // Find the goal and check sub-goal count
      const goal = goalsData.goals.find((g) => g.id === goalId);
      if (goal && goal.subGoalsCount >= 5) {
        Alert.alert(
          "Limit Reached",
          "Each goal can have a maximum of 5 sub-goals.",
        );
        return;
      }

      setSelectedGoalId(goalId);
      setSubGoalTitle("");
      setShowAddSubGoalModal(true);
    },
    [goalsData.goals],
  );

  const handleSaveSubGoal = useCallback(() => {
    if (!subGoalTitle.trim()) {
      Alert.alert("Error", "Please enter a sub-goal title");
      return;
    }

    createSubGoalMutation.mutate({
      goalId: selectedGoalId,
      userId,
      title: subGoalTitle.trim(),
    });
  }, [subGoalTitle, selectedGoalId, userId, createSubGoalMutation]);

  const handleToggleSubGoal = useCallback(
    (subGoalId, currentStatus) => {
      toggleSubGoalMutation.mutate({
        id: subGoalId,
        isDone: !currentStatus,
      });
    },
    [toggleSubGoalMutation],
  );

  const handleDeleteSubGoal = useCallback(
    (subGoalId, subGoalTitle) => {
      Alert.alert(
        "Delete Sub-Goal",
        `Are you sure you want to delete "${subGoalTitle}"?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              deleteSubGoalMutation.mutate(subGoalId);
            },
          },
        ],
      );
    },
    [deleteSubGoalMutation],
  );

  const renderProgressBar = (progress) => (
    <View
      style={{
        height: 6,
        backgroundColor: currentTheme.accent,
        borderRadius: 3,
        overflow: "hidden",
        marginTop: 8,
      }}
    >
      <View
        style={{
          height: "100%",
          backgroundColor: currentTheme.primary,
          width: `${Math.round(progress * 100)}%`,
          borderRadius: 3,
        }}
      />
    </View>
  );

  if (!fontsLoaded) {
    return null;
  }

  const colors = currentTheme;

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

        {/* Header */}
        <View
          style={{
            backgroundColor: colors.surface,
            paddingHorizontal: 20,
            paddingVertical: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.accent,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: colors.text,
              fontFamily: "PlayfairDisplay_700Bold",
            }}
          >
            Yearly Goals
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: colors.text,
              marginTop: 4,
              opacity: 0.7,
              fontFamily: "Poppins_400Regular",
            }}
          >
            {selectedYear} • {goalsData.goals.length}/10 goals
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 100,
            paddingTop: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Goals List */}
          {goalsData.goals.length === 0 ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 40,
                paddingVertical: 60,
              }}
            >
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: colors.primary + "20",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 24,
                }}
              >
                <Target size={48} color={colors.primary} />
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 8,
                  textAlign: "center",
                  fontFamily: "Poppins_600SemiBold",
                }}
              >
                Create Your First Goal
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: colors.text,
                  opacity: 0.7,
                  textAlign: "center",
                  marginBottom: 32,
                  lineHeight: 24,
                  fontFamily: "Poppins_400Regular",
                }}
              >
                Set meaningful yearly goals and break them down into actionable
                steps.
              </Text>
            </View>
          ) : (
            <View style={{ paddingHorizontal: 16 }}>
              {goalsData.goals.map((goal) => {
                const isCompleted = goal.progress === 1;
                return (
                  <View
                    key={goal.id}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      marginBottom: 16,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                      opacity: isCompleted ? 0.8 : 1,
                    }}
                  >
                    {/* Goal Header */}
                    <View
                      style={{
                        padding: 16,
                        borderBottomWidth: goal.subGoalsCount > 0 ? 1 : 0,
                        borderBottomColor: colors.accent,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginBottom: 4,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: "600",
                                color: colors.text,
                                flex: 1,
                                fontFamily: "Poppins_600SemiBold",
                                textDecorationLine: isCompleted
                                  ? "line-through"
                                  : "none",
                              }}
                            >
                              {goal.title}
                            </Text>
                            {isCompleted && (
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  backgroundColor: colors.primary + "20",
                                  paddingHorizontal: 8,
                                  paddingVertical: 4,
                                  borderRadius: 12,
                                  marginLeft: 8,
                                }}
                              >
                                <Trophy size={14} color={colors.primary} />
                                <Text
                                  style={{
                                    fontSize: 12,
                                    color: colors.primary,
                                    marginLeft: 4,
                                    fontFamily: "Poppins_600SemiBold",
                                  }}
                                >
                                  Achieved
                                </Text>
                              </View>
                            )}
                          </View>

                          {goal.notes && (
                            <Text
                              style={{
                                fontSize: 14,
                                color: colors.text,
                                opacity: 0.7,
                                marginBottom: 8,
                                lineHeight: 20,
                                fontFamily: "Poppins_400Regular",
                              }}
                            >
                              {goal.notes}
                            </Text>
                          )}

                          <Text
                            style={{
                              fontSize: 12,
                              color: colors.text,
                              opacity: 0.6,
                              fontFamily: "Poppins_400Regular",
                            }}
                          >
                            {goal.completedSubGoalsCount || 0} of{" "}
                            {goal.subGoalsCount || 0} steps completed
                          </Text>

                          {renderProgressBar(goal.progress || 0)}
                        </View>
                      </View>
                    </View>

                    {/* Sub-goals (always visible) */}
                    <View
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: goal.subGoalsCount > 0 ? 16 : 0,
                      }}
                    >
                      <SubGoalsList
                        goalId={goal.id}
                        userId={userId}
                        colors={colors}
                        onToggle={handleToggleSubGoal}
                        onDelete={handleDeleteSubGoal}
                      />

                      {/* Add Sub-goal Button */}
                      {(goal.subGoalsCount || 0) < 5 && (
                        <TouchableOpacity
                          onPress={() => handleAddSubGoal(goal.id)}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            padding: 12,
                            marginTop: goal.subGoalsCount > 0 ? 8 : 0,
                            backgroundColor: colors.accent,
                            borderRadius: 8,
                          }}
                        >
                          <Plus size={16} color={colors.primary} />
                          <Text
                            style={{
                              fontSize: 14,
                              color: colors.primary,
                              marginLeft: 8,
                              fontFamily: "Poppins_500Medium",
                            }}
                          >
                            Add Sub-goal ({goal.subGoalsCount || 0}/5)
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* Floating Add Button */}
        {goalsData.goals.length < 10 && (
          <TouchableOpacity
            onPress={handleAddGoal}
            style={{
              position: "absolute",
              bottom: insets.bottom + 20,
              right: 20,
              backgroundColor: colors.primary,
              width: 56,
              height: 56,
              borderRadius: 28,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Plus size={24} color={colors.surface} />
          </TouchableOpacity>
        )}

        {/* Add Goal Modal */}
        <Modal visible={showAddGoalModal} transparent animationType="slide">
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
                maxHeight: "80%",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  marginBottom: 20,
                  color: colors.text,
                  fontFamily: "Poppins_600SemiBold",
                }}
              >
                Add New Goal
              </Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                <TextInput
                  value={goalTitle}
                  onChangeText={setGoalTitle}
                  placeholder="Goal title (e.g., Grow TikTok to 100k followers)"
                  placeholderTextColor={colors.text + "60"}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.accent,
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16,
                    fontSize: 16,
                    color: colors.text,
                    fontFamily: "Poppins_400Regular",
                  }}
                />

                <TextInput
                  value={goalNotes}
                  onChangeText={setGoalNotes}
                  placeholder="Notes (optional)"
                  placeholderTextColor={colors.text + "60"}
                  multiline
                  numberOfLines={3}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.accent,
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 20,
                    fontSize: 16,
                    color: colors.text,
                    textAlignVertical: "top",
                    fontFamily: "Poppins_400Regular",
                  }}
                />
              </ScrollView>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  onPress={() => {
                    setShowAddGoalModal(false);
                    resetGoalForm();
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor: colors.accent,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: colors.text,
                      fontWeight: "600",
                      fontFamily: "Poppins_600SemiBold",
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSaveGoal}
                  disabled={!goalTitle.trim()}
                  style={{
                    flex: 2,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor: goalTitle.trim()
                      ? colors.primary
                      : colors.accent,
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                  }}
                >
                  <Save size={16} color={colors.surface} />
                  <Text
                    style={{
                      color: colors.surface,
                      fontWeight: "600",
                      marginLeft: 8,
                      fontFamily: "Poppins_600SemiBold",
                    }}
                  >
                    Create Goal
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Add Sub-Goal Modal */}
        <Modal visible={showAddSubGoalModal} transparent animationType="slide">
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
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  marginBottom: 20,
                  color: colors.text,
                  fontFamily: "Poppins_600SemiBold",
                }}
              >
                Add Sub-Goal
              </Text>

              <TextInput
                value={subGoalTitle}
                onChangeText={setSubGoalTitle}
                placeholder="Sub-goal title"
                placeholderTextColor={colors.text + "60"}
                style={{
                  borderWidth: 1,
                  borderColor: colors.accent,
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 20,
                  fontSize: 16,
                  color: colors.text,
                  fontFamily: "Poppins_400Regular",
                }}
              />

              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  onPress={() => {
                    setShowAddSubGoalModal(false);
                    setSubGoalTitle("");
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor: colors.accent,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: colors.text,
                      fontWeight: "600",
                      fontFamily: "Poppins_600SemiBold",
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSaveSubGoal}
                  disabled={!subGoalTitle.trim()}
                  style={{
                    flex: 2,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor: subGoalTitle.trim()
                      ? colors.primary
                      : colors.accent,
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                  }}
                >
                  <Save size={16} color={colors.surface} />
                  <Text
                    style={{
                      color: colors.surface,
                      fontWeight: "600",
                      marginLeft: 8,
                      fontFamily: "Poppins_600SemiBold",
                    }}
                  >
                    Add Sub-Goal
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}

// Component to fetch and display sub-goals
function SubGoalsList({ goalId, userId, colors, onToggle, onDelete }) {
  const { data: subGoalsData = { subGoals: [] } } = useQuery({
    queryKey: ["sub-goals", goalId, userId],
    queryFn: async () => {
      const response = await fetch(
        `/api/sub-goals?goalId=${goalId}&userId=${userId}`,
      );
      if (!response.ok) throw new Error("Failed to fetch sub-goals");
      return response.json();
    },
  });

  return (
    <View>
      {subGoalsData.subGoals.map((subGoal) => (
        <View
          key={subGoal.id}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 12,
            paddingHorizontal: 8,
            backgroundColor: subGoal.is_done
              ? colors.accent + "50"
              : "transparent",
            borderRadius: 8,
            marginBottom: 4,
          }}
        >
          {/* Clickable area for toggling */}
          <TouchableOpacity
            onPress={() => onToggle(subGoal.id, subGoal.is_done)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: subGoal.is_done
                  ? colors.primary
                  : colors.text + "40",
                backgroundColor: subGoal.is_done
                  ? colors.primary
                  : "transparent",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              {subGoal.is_done && (
                <Check size={14} color={colors.surface} strokeWidth={3} />
              )}
            </View>
            <Text
              style={{
                fontSize: 15,
                color: subGoal.is_done ? colors.text + "60" : colors.text,
                flex: 1,
                textDecorationLine: subGoal.is_done ? "line-through" : "none",
                fontFamily: "Poppins_400Regular",
              }}
            >
              {subGoal.title}
            </Text>
          </TouchableOpacity>

          {/* Delete button */}
          <TouchableOpacity
            onPress={() => onDelete(subGoal.id, subGoal.title)}
            style={{
              padding: 8,
              marginLeft: 8,
              borderRadius: 6,
              backgroundColor: "transparent",
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash size={16} color={colors.text + "60"} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}
