import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Alert } from "react-native";
import { Activity, Droplets, Moon, Plus } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CircularProgress from "@/components/CircularProgress";
import { useThemeStore } from "@/utils/theme";
import { useGoalsStore } from "@/utils/goals";

function WellnessRing({
  label,
  Icon,
  progress,
  currentValue,
  goalValue,
  unit,
  onPress,
  onUpdateGoal,
  goalType,
}) {
  const { currentTheme: colors } = useThemeStore();
  return (
    <View style={{ alignItems: "center" }}>
      <CircularProgress
        size={100}
        strokeWidth={6}
        progress={progress}
        color={colors.primary}
        backgroundColor={colors.accent}
        onPress={onPress}
      >
        <View style={{ alignItems: "center" }}>
          <Icon size={20} color={colors.primary} />
          <Text
            style={{
              fontSize: 10,
              color: colors.text,
              marginTop: 2,
              opacity: 0.7,
            }}
          >
            {label}
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "bold",
              color: colors.text,
              textAlign: "center",
            }}
          >
            {currentValue}
          </Text>
          <Text
            style={{
              fontSize: 8,
              color: colors.text,
              opacity: 0.6,
            }}
          >
            /{goalValue}
            {unit}
          </Text>
        </View>
      </CircularProgress>

      {goalType && (
        <TouchableOpacity
          onPress={() => onUpdateGoal(goalType)}
          style={{
            backgroundColor: colors.accent,
            borderRadius: 12,
            paddingHorizontal: 6,
            paddingVertical: 3,
            marginTop: 6,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Plus size={10} color={colors.primary} />
          <Text
            style={{
              fontSize: 9,
              color: colors.primary,
              fontWeight: "600",
              marginLeft: 2,
            }}
          >
            Goal
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const GoalUpdateModal = ({
  visible,
  onClose,
  goalType,
  currentGoal,
  onUpdateGoal,
}) => {
  const insets = useSafeAreaInsets();
  const { currentTheme: colors } = useThemeStore();

  const getGoalOptions = () => {
    if (goalType === "steps") {
      return [
        { label: "2k steps", value: 2000 },
        { label: "5k steps", value: 5000 },
        { label: "8k steps", value: 8000 },
        { label: "10k steps", value: 10000 },
        { label: "15k steps", value: 15000 },
      ];
    } else if (goalType === "sleep") {
      return [
        { label: "6 hours", value: 6.0 },
        { label: "7 hours", value: 7.0 },
        { label: "8 hours", value: 8.0 },
        { label: "9 hours", value: 9.0 },
        { label: "10 hours", value: 10.0 },
      ];
    }
    return [];
  };

  const goalOptions = getGoalOptions();
  const goalTypeTitle =
    goalType === "steps"
      ? "Steps Goal"
      : goalType === "sleep"
        ? "Sleep Goal"
        : "Goal";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
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
            maxHeight: "60%",
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: colors.text,
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            Update {goalTypeTitle}
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: colors.text,
              opacity: 0.7,
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            Current goal:{" "}
            {goalType === "steps"
              ? `${currentGoal} steps`
              : `${currentGoal} hours`}
          </Text>

          <View style={{ gap: 12 }}>
            {goalOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  onUpdateGoal(option.value);
                  onClose();
                }}
                style={{
                  backgroundColor:
                    currentGoal === option.value
                      ? colors.primary
                      : colors.accent,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color:
                      currentGoal === option.value
                        ? colors.surface
                        : colors.text,
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: colors.accent,
              borderRadius: 12,
              padding: 16,
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
              }}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function WellnessSection({
  wellness,
  onOpenModal,
  onQuickAddWater,
}) {
  const { currentTheme: colors } = useThemeStore();
  const { goals, updateStepsGoal, updateSleepGoal } = useGoalsStore();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedGoalType, setSelectedGoalType] = useState(null);

  // Provide default values if wellness is undefined
  const wellnessData = wellness || {
    water_ml: 0,
    steps: 0,
    sleep_hours: 0,
  };

  const handleOpenGoalModal = (goalType) => {
    setSelectedGoalType(goalType);
    setShowGoalModal(true);
  };

  const handleUpdateGoal = async (newGoalValue) => {
    try {
      if (selectedGoalType === "steps") {
        await updateStepsGoal(newGoalValue);
        Alert.alert(
          "Success",
          `Steps goal updated to ${newGoalValue.toLocaleString()}`,
        );
      } else if (selectedGoalType === "sleep") {
        await updateSleepGoal(newGoalValue);
        Alert.alert("Success", `Sleep goal updated to ${newGoalValue} hours`);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update goal. Please try again.");
    }
  };

  return (
    <View style={{ marginHorizontal: 16, marginBottom: 24 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.accent,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Activity size={20} color={colors.primary} />
        </View>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: colors.text,
            letterSpacing: 0.3,
            fontFamily: "PlayfairDisplay_700Bold",
          }}
        >
          Wellness
        </Text>
      </View>

      {/* Wellness Content */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          {/* Water Ring */}
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <WellnessRing
              label="Water"
              Icon={Droplets}
              progress={Math.min(wellnessData.water_ml / goals.waterGoalMl, 1)}
              currentValue={wellnessData.water_ml}
              goalValue={goals.waterGoalMl}
              unit="ml"
              onPress={() => onOpenModal && onOpenModal("water_ml")}
            />
            <TouchableOpacity
              onPress={onQuickAddWater}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 4,
                marginTop: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  color: colors.background,
                  fontWeight: "600",
                }}
              >
                +250ml
              </Text>
            </TouchableOpacity>
          </View>

          {/* Steps Ring */}
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <WellnessRing
              label="Steps"
              Icon={Activity}
              progress={Math.min(wellnessData.steps / goals.stepsGoal, 1)}
              currentValue={wellnessData.steps}
              goalValue={goals.stepsGoal}
              unit=""
              onPress={() => onOpenModal && onOpenModal("steps")}
              onUpdateGoal={handleOpenGoalModal}
              goalType="steps"
            />
          </View>

          {/* Sleep Ring */}
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <WellnessRing
              label="Sleep"
              Icon={Moon}
              progress={Math.min(
                wellnessData.sleep_hours / goals.sleepGoalHrs,
                1,
              )}
              currentValue={wellnessData.sleep_hours}
              goalValue={goals.sleepGoalHrs}
              unit="h"
              onPress={() => onOpenModal && onOpenModal("sleep_hours")}
              onUpdateGoal={handleOpenGoalModal}
              goalType="sleep"
            />
          </View>
        </View>
        <Text
          style={{
            fontSize: 12,
            color: colors.text,
            opacity: 0.6,
            textAlign: "center",
            marginTop: 16,
          }}
        >
          Tap rings to edit • Use + buttons to update goals
        </Text>
      </View>

      <GoalUpdateModal
        visible={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        goalType={selectedGoalType}
        currentGoal={
          selectedGoalType === "steps"
            ? goals.stepsGoal
            : selectedGoalType === "sleep"
              ? goals.sleepGoalHrs
              : 0
        }
        onUpdateGoal={handleUpdateGoal}
      />
    </View>
  );
}
