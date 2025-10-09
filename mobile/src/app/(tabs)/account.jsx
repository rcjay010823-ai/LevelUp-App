import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Animated,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, Redirect } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  User,
  Edit3,
  Target,
  LogOut,
  Settings,
  Save,
  Camera,
  Palette,
  Calendar,
  ChevronRight,
  Cloud,
  Activity,
  CheckCircle,
  Clock,
  Heart,
  Droplets,
  Sun,
  Moon,
  Plus,
  TrendingUp,
  Images,
} from "lucide-react-native";
import { Image } from "expo-image";
import WeatherSettingsModal from "@/components/WeatherSettingsModal";
import { useGoalsStore } from "@/utils/goals";
import useUpload from "@/utils/useUpload";
import { useThemeStore } from "@/utils/theme";
import { useDailyPlanner } from "@/hooks/useDailyPlanner";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import useUser from "@/utils/auth/useUser";
import { useRequireAuth, useAuth } from "@/utils/auth/useAuth";

// Quick stats component for overview
const QuickStat = ({ icon, value, label, color, onPress }) => {
  const { currentTheme: colors } = useThemeStore();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 12,
        alignItems: "center",
        marginHorizontal: 2,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: color + "20",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 6,
        }}
      >
        {icon}
      </View>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: colors.text,
          marginBottom: 2,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: 10,
          color: colors.text + "80",
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default function AccountPage() {
  const insets = useSafeAreaInsets();
  const { currentTheme: colors } = useThemeStore();
  const { data: user, loading: userLoading } = useUser();
  const { signOut } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [showWellnessModal, setShowWellnessModal] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [editingDisplayName, setEditingDisplayName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [upload, { loading: uploadingPhoto }] = useUpload();
  const [refreshing, setRefreshing] = useState(false);

  const { goals, updateGoals } = useGoalsStore();
  const [editingWaterGoal, setEditingWaterGoal] = useState(
    goals.waterGoalMl.toString(),
  );
  const [editingStepsGoal, setEditingStepsGoal] = useState(
    goals.stepsGoal.toString(),
  );
  const [editingSleepGoal, setEditingSleepGoal] = useState(
    goals.sleepGoalHrs.toString(),
  );

  // Update state when user data loads
  React.useEffect(() => {
    if (user) {
      setDisplayName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Daily planner data for overview - use real user ID
  const today = format(new Date(), "yyyy-MM-dd");
  const userId = user?.id;
  const { todos, events, habits, wellness, moodEntry, refetchAll } =
    useDailyPlanner(userId, today);

  // Analytics data - use real user ID
  const { data: analyticsData } = useQuery({
    queryKey: ["analytics", userId],
    queryFn: () =>
      fetch(`/api/analytics?userId=${userId}`).then((res) => res.json()),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId, // Only fetch if user is authenticated
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchAll();
    setRefreshing(false);
  };

  const completedTodos = todos?.filter((todo) => todo.completed) || [];
  const completedHabits = habits?.filter((habit) => habit.completed) || [];

  const handleEditProfile = () => {
    setEditingDisplayName(displayName);
    setShowEditModal(true);
  };

  const handleSaveProfile = () => {
    // In a real app, this would update the user profile via API
    setDisplayName(editingDisplayName);
    setShowEditModal(false);
    Alert.alert("Success", "Profile updated!");
  };

  const handleChangePhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const { url, error } = await upload({
          reactNativeAsset: result.assets[0],
        });

        if (error) {
          Alert.alert("Upload Error", error);
          return;
        }

        setProfilePhoto(url);
        Alert.alert("Success", "Profile photo updated!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleEditWellnessGoals = () => {
    setEditingWaterGoal(goals.waterGoalMl.toString());
    setEditingStepsGoal(goals.stepsGoal.toString());
    setEditingSleepGoal(goals.sleepGoalHrs.toString());
    setShowWellnessModal(true);
  };

  const handleSaveWellnessGoals = () => {
    const waterGoal = parseInt(editingWaterGoal);
    const stepsGoal = parseInt(editingStepsGoal);
    const sleepGoal = parseFloat(editingSleepGoal);

    if (isNaN(waterGoal) || waterGoal <= 0) {
      Alert.alert("Error", "Please enter a valid water goal (ml)");
      return;
    }
    if (isNaN(stepsGoal) || stepsGoal <= 0) {
      Alert.alert("Error", "Please enter a valid steps goal");
      return;
    }
    if (isNaN(sleepGoal) || sleepGoal <= 0) {
      Alert.alert("Error", "Please enter a valid sleep goal (hours)");
      return;
    }

    updateGoals({
      waterGoalMl: waterGoal,
      stepsGoal: stepsGoal,
      sleepGoalHrs: sleepGoal,
    });

    setShowWellnessModal(false);
    Alert.alert("Success", "Wellness goals updated!");
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          signOut();
        },
      },
    ]);
  };

  // Show loading screen while user is loading
  if (userLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
          paddingTop: insets.top,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 16 }}>Loading...</Text>
      </View>
    );
  }

  // If no user, redirect to authentication
  if (!user) {
    return <Redirect href="/" />;
  }

  const menuItems = [
    {
      title: "Edit Profile",
      subtitle: "Update your display name and photo",
      icon: Edit3,
      color: "#2196f3",
      bgColor: "#e3f2fd",
      onPress: handleEditProfile,
    },
    {
      title: "Wellness Goals",
      subtitle: "Set your daily water, steps, and sleep targets",
      icon: Activity,
      color: "#4caf50",
      bgColor: "#e8f5e8",
      onPress: handleEditWellnessGoals,
    },
    {
      title: "Appearance / Theme",
      subtitle: "Customize colors and appearance",
      icon: Palette,
      color: "#9c27b0",
      bgColor: "#f3e5f5",
      onPress: () => router.push("/(tabs)/appearance"),
    },
    {
      title: "Weather Location",
      subtitle: "Choose your weather location source",
      icon: Cloud,
      color: "#ff9800",
      bgColor: "#fff3e0",
      onPress: () => setShowWeatherModal(true),
    },
    {
      title: "Progress & Analytics",
      subtitle: "View your wellness trends and stats",
      icon: Target,
      color: "#f44336",
      bgColor: "#ffebee",
      onPress: () => router.push("/(tabs)/analytics"),
    },
  ];

  return (
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
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.accent,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Image
          source={{
            uri: "https://raw.createusercontent.com/12e62c2b-6472-40b5-8d4c-59c1533a0175/",
          }}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            marginRight: 12,
          }}
          contentFit="cover"
        />
        <Text style={{ fontSize: 28, fontWeight: "bold", color: colors.text }}>
          Account
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 20,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Today's Overview Section */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <View>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 20,
                  fontWeight: "700",
                }}
              >
                Today's Overview
              </Text>
              <Text
                style={{
                  color: colors.text + "80",
                  fontSize: 14,
                  marginTop: 2,
                }}
              >
                {format(new Date(), "EEEE, MMMM do")}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/quick-add")}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={18} color="white" />
            </TouchableOpacity>
          </View>

          {/* Quick stats */}
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
            <QuickStat
              icon={<CheckCircle size={16} color={colors.primary} />}
              value={completedTodos.length}
              label="Tasks"
              color={colors.primary}
              onPress={() => router.push("/calendar")}
            />
            <QuickStat
              icon={<Target size={16} color="#34C759" />}
              value={completedHabits.length}
              label="Habits"
              color="#34C759"
              onPress={() => router.push("/health")}
            />
            <QuickStat
              icon={<Droplets size={16} color="#007AFF" />}
              value={wellness?.water_ml || 0}
              label="Water"
              color="#007AFF"
              onPress={() => router.push("/health")}
            />
            <QuickStat
              icon={<Heart size={16} color="#FF6B9D" />}
              value={moodEntry?.mood_emoji || "😊"}
              label="Mood"
              color="#FF6B9D"
              onPress={() => router.push("/reflect")}
            />
          </View>

          {/* Quick actions */}
          <View
            style={{
              flexDirection: "row",
              gap: 8,
            }}
          >
            <TouchableOpacity
              onPress={() => router.push("/calendar")}
              style={{
                flex: 1,
                backgroundColor: colors.accent,
                borderRadius: 12,
                padding: 12,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Calendar size={16} color={colors.text} />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: colors.text,
                  marginLeft: 6,
                }}
              >
                Schedule
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/analytics")}
              style={{
                flex: 1,
                backgroundColor: colors.accent,
                borderRadius: 12,
                padding: 12,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <TrendingUp size={16} color={colors.text} />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: colors.text,
                  marginLeft: 6,
                }}
              >
                Analytics
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            {/* Avatar */}
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#007bff",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              {user.photoURL ? (
                <Image
                  source={{ uri: user.photoURL }}
                  style={{ width: 80, height: 80, borderRadius: 40 }}
                  contentFit="cover"
                />
              ) : (
                <User size={32} color="#fff" />
              )}
            </View>

            {/* User Info */}
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: "#212529",
                marginBottom: 4,
              }}
            >
              {user.displayName || "User"}
            </Text>
            <Text style={{ fontSize: 14, color: "#6c757d" }}>{user.email}</Text>
          </View>

          {/* Quick Stats */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: "#f8f9fa",
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text
                style={{ fontSize: 18, fontWeight: "600", color: "#212529" }}
              >
                7
              </Text>
              <Text style={{ fontSize: 12, color: "#6c757d", marginTop: 2 }}>
                Days Active
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{ fontSize: 18, fontWeight: "600", color: "#212529" }}
              >
                23
              </Text>
              <Text style={{ fontSize: 12, color: "#6c757d", marginTop: 2 }}>
                Journal Entries
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{ fontSize: 18, fontWeight: "600", color: "#212529" }}
              >
                45
              </Text>
              <Text style={{ fontSize: 12, color: "#6c757d", marginTop: 2 }}>
                Affirmations
              </Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            marginBottom: 20,
          }}
        >
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={item.title}
                onPress={item.onPress}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
                  borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                  borderBottomColor: "#f8f9fa",
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: item.bgColor,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  <IconComponent size={20} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#212529",
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{ fontSize: 14, color: "#6c757d", marginTop: 2 }}
                  >
                    {item.subtitle}
                  </Text>
                </View>
                <ChevronRight size={20} color="#6c757d" />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#ffebee",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 16,
            }}
          >
            <LogOut size={20} color="#dc3545" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#dc3545" }}>
              Sign Out
            </Text>
            <Text style={{ fontSize: 14, color: "#6c757d", marginTop: 2 }}>
              Sign out of your account
            </Text>
          </View>
        </TouchableOpacity>

        {/* App Info */}
        <View
          style={{
            backgroundColor: "#f8f9fa",
            borderRadius: 12,
            padding: 16,
            marginTop: 20,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 14, color: "#6c757d", textAlign: "center" }}>
            Daily Planner v1.0.0
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: "#adb5bd",
              marginTop: 4,
              textAlign: "center",
            }}
          >
            Made with ❤️ for your wellbeing
          </Text>
        </View>
      </ScrollView>

      {/* Weather Settings Modal */}
      <WeatherSettingsModal
        visible={showWeatherModal}
        onClose={() => setShowWeatherModal(false)}
      />

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
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
                color: "#212529",
              }}
            >
              Edit Profile
            </Text>

            {/* Avatar Section */}
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: "#007bff",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                {profilePhoto ? (
                  <Image
                    source={{ uri: profilePhoto }}
                    style={{ width: 80, height: 80, borderRadius: 40 }}
                    contentFit="cover"
                  />
                ) : (
                  <User size={32} color="#fff" />
                )}
              </View>
              <TouchableOpacity
                onPress={handleChangePhoto}
                disabled={uploadingPhoto}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: "#f8f9fa",
                  borderRadius: 16,
                }}
              >
                <Camera size={16} color="#6c757d" />
                <Text style={{ marginLeft: 6, fontSize: 14, color: "#6c757d" }}>
                  {uploadingPhoto ? "Uploading..." : "Change Photo"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Display Name */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: "#6c757d",
                marginBottom: 8,
              }}
            >
              Display Name
            </Text>
            <TextInput
              value={editingDisplayName}
              onChangeText={setEditingDisplayName}
              placeholder="Enter your display name"
              style={{
                borderWidth: 1,
                borderColor: "#dee2e6",
                borderRadius: 8,
                padding: 12,
                marginBottom: 20,
                fontSize: 16,
              }}
            />

            {/* Email (read-only) */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: "#6c757d",
                marginBottom: 8,
              }}
            >
              Email
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#dee2e6",
                borderRadius: 8,
                padding: 12,
                marginBottom: 20,
                backgroundColor: "#f8f9fa",
              }}
            >
              <Text style={{ fontSize: 16, color: "#6c757d" }}>
                {user.email}
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: "#6c757d",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveProfile}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: "#007bff",
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <Save size={16} color="#fff" />
                <Text
                  style={{ color: "#fff", fontWeight: "600", marginLeft: 8 }}
                >
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Wellness Goals Modal */}
      <Modal visible={showWellnessModal} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
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
                color: "#212529",
              }}
            >
              Wellness Goals
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Water Goal */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: "#6c757d",
                  marginBottom: 8,
                }}
              >
                Daily Water Goal (ml)
              </Text>
              <TextInput
                value={editingWaterGoal}
                onChangeText={setEditingWaterGoal}
                placeholder="e.g. 2000"
                keyboardType="numeric"
                style={{
                  borderWidth: 1,
                  borderColor: "#dee2e6",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16,
                  fontSize: 16,
                }}
              />

              {/* Steps Goal */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: "#6c757d",
                  marginBottom: 8,
                }}
              >
                Daily Steps Goal
              </Text>
              <TextInput
                value={editingStepsGoal}
                onChangeText={setEditingStepsGoal}
                placeholder="e.g. 10000"
                keyboardType="numeric"
                style={{
                  borderWidth: 1,
                  borderColor: "#dee2e6",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16,
                  fontSize: 16,
                }}
              />

              {/* Sleep Goal */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: "#6c757d",
                  marginBottom: 8,
                }}
              >
                Daily Sleep Goal (hours)
              </Text>
              <TextInput
                value={editingSleepGoal}
                onChangeText={setEditingSleepGoal}
                placeholder="e.g. 8"
                keyboardType="decimal-pad"
                style={{
                  borderWidth: 1,
                  borderColor: "#dee2e6",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 20,
                  fontSize: 16,
                }}
              />

              {/* Current Goals Display */}
              <View
                style={{
                  backgroundColor: "#f8f9fa",
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: "#6c757d",
                    marginBottom: 8,
                  }}
                >
                  Current Goals
                </Text>
                <Text
                  style={{ fontSize: 14, color: "#212529", marginBottom: 4 }}
                >
                  Water: {goals.waterGoalMl} ml
                </Text>
                <Text
                  style={{ fontSize: 14, color: "#212529", marginBottom: 4 }}
                >
                  Steps: {goals.stepsGoal.toLocaleString()}
                </Text>
                <Text style={{ fontSize: 14, color: "#212529" }}>
                  Sleep: {goals.sleepGoalHrs} hours
                </Text>
              </View>
            </ScrollView>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowWellnessModal(false)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: "#6c757d",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveWellnessGoals}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: "#4caf50",
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <Save size={16} color="#fff" />
                <Text
                  style={{ color: "#fff", fontWeight: "600", marginLeft: 8 }}
                >
                  Save Goals
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
