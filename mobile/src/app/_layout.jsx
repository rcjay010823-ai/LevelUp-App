import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/utils/auth/useAuth";
import { AuthModal } from "@/utils/auth/useAuthModal";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const { isReady, initAuth } = useAuth();

  useEffect(() => {
    console.log("🚀 Daily Planner App initializing...");
    console.log("📱 Platform:", require("react-native").Platform.OS);

    const envVars = {
      EXPO_PUBLIC_BASE_URL: process.env.EXPO_PUBLIC_BASE_URL,
      EXPO_PUBLIC_PROXY_BASE_URL: process.env.EXPO_PUBLIC_PROXY_BASE_URL,
      EXPO_PUBLIC_HOST: process.env.EXPO_PUBLIC_HOST,
      EXPO_PUBLIC_PROJECT_GROUP_ID: process.env.EXPO_PUBLIC_PROJECT_GROUP_ID,
    };

    Object.entries(envVars).forEach(([key, value]) => {
      console.log(`  ${key}: ${value ? "SET" : "MISSING"}`);
    });

    console.log("🔐 Initializing auth system...");
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (isReady) {
      console.log("✅ Auth system ready, hiding splash screen");
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="quick-add" options={{ presentation: "modal" }} />
          <Stack.Screen name="yearly-goals" options={{ headerShown: false }} />
          <Stack.Screen name="test-auth" options={{ headerShown: false }} />
          <Stack.Screen name="auth-debug" options={{ headerShown: false }} />
          <Stack.Screen
            name="test-platform-auth"
            options={{ headerShown: false }}
          />
        </Stack>
        <AuthModal />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
