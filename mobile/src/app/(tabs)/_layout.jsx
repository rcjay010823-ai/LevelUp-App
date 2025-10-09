import { Tabs } from "expo-router";
import {
  Calendar,
  Images,
  Heart,
  User,
  Target,
  Activity,
  Home,
} from "lucide-react-native";
import { useThemeStore } from "@/utils/theme";
import { useRequireAuth } from "@/utils/auth/useAuth";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";

export default function TabLayout() {
  const { currentTheme, loadTheme } = useThemeStore();
  const { isAuthenticated, isReady } = useRequireAuth();

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  // Show loading while checking auth
  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: currentTheme.background,
        }}
      >
        <ActivityIndicator size="large" color={currentTheme.primary} />
      </View>
    );
  }

  // If not authenticated, useRequireAuth will handle the redirect
  if (!isAuthenticated) {
    return null;
  }

  const colors = currentTheme;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.accent,
          paddingTop: 4,
          paddingBottom: 8,
          height: 88,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text + "80",
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: "600",
          marginBottom: 2,
          marginTop: 1,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Today",
          tabBarIcon: ({ color, size }) => <Home color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="vision-board"
        options={{
          title: "Vision",
          tabBarIcon: ({ color, size }) => <Images color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: "Goals",
          tabBarIcon: ({ color, size }) => <Target color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="reflect"
        options={{
          title: "Reflect",
          tabBarIcon: ({ color, size }) => <Heart color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: "Health",
          tabBarIcon: ({ color, size }) => <Activity color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => <User color={color} size={22} />,
        }}
      />
      {/* Hidden tabs - accessible from Account but not shown in tab bar */}
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Hide from tab bar - now redirects to account
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          href: null, // Hide from tab bar but keep accessible
        }}
      />
      <Tabs.Screen
        name="appearance"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
