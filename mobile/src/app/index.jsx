import { Redirect } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LogIn, Sparkles, UserPlus } from "lucide-react-native";
import { useAuth } from "@/utils/auth/useAuth";
import { useThemeStore } from "@/utils/theme";

export default function Index() {
  const insets = useSafeAreaInsets();
  const { currentTheme: colors } = useThemeStore();
  const { isAuthenticated, isReady, signIn, signUp } = useAuth();

  console.log(
    "Index.jsx - isReady:",
    isReady,
    "isAuthenticated:",
    isAuthenticated,
  );

  // Show loading while checking authentication status
  if (!isReady) {
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
        <StatusBar style="dark" />
        <Sparkles size={60} color={colors.primary} />
        <Text
          style={{
            color: colors.text,
            marginTop: 16,
            fontSize: 16,
            fontWeight: "500",
          }}
        >
          Loading...
        </Text>
      </View>
    );
  }

  // If user is authenticated, redirect to main app
  if (isAuthenticated) {
    console.log("User is authenticated, redirecting to /(tabs)/home");
    return <Redirect href="/(tabs)/home" />;
  }

  // Show authentication welcome screen
  console.log("Showing welcome screen with auth options");
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top,
      }}
    >
      <StatusBar style="dark" />

      {/* Main Authentication Screen */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 32,
        }}
      >
        {/* App Logo/Icon */}
        <View
          style={{
            backgroundColor: colors.primary + "15",
            padding: 24,
            borderRadius: 20,
            marginBottom: 32,
          }}
        >
          <Sparkles size={64} color={colors.primary} />
        </View>

        {/* Welcome Text */}
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: colors.text,
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          Welcome to Daily Planner
        </Text>

        <Text
          style={{
            fontSize: 16,
            color: colors.text,
            opacity: 0.7,
            textAlign: "center",
            marginBottom: 48,
            lineHeight: 22,
            paddingHorizontal: 16,
          }}
        >
          Plan your days, track habits, build your vision board, and achieve
          your goals
        </Text>

        {/* Create Account Button (Primary) */}
        <TouchableOpacity
          onPress={() => {
            console.log("Create Account button pressed - calling signUp()");
            signUp();
          }}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 32,
            paddingVertical: 16,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            marginBottom: 16,
            width: "100%",
            minHeight: 56,
          }}
        >
          <UserPlus size={20} color={colors.surface} />
          <Text
            style={{
              color: colors.surface,
              fontWeight: "600",
              marginLeft: 8,
              fontSize: 17,
            }}
          >
            Create Account
          </Text>
        </TouchableOpacity>

        {/* Sign In Button (Secondary) */}
        <TouchableOpacity
          onPress={() => {
            console.log("Log In button pressed - calling signIn()");
            signIn();
          }}
          style={{
            backgroundColor: "transparent",
            paddingHorizontal: 32,
            paddingVertical: 16,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: colors.primary,
            width: "100%",
            minHeight: 56,
          }}
        >
          <LogIn size={20} color={colors.primary} />
          <Text
            style={{
              color: colors.primary,
              fontWeight: "600",
              marginLeft: 8,
              fontSize: 17,
            }}
          >
            Log In
          </Text>
        </TouchableOpacity>

        {/* Footer Text */}
        <Text
          style={{
            fontSize: 12,
            color: colors.text,
            opacity: 0.5,
            textAlign: "center",
            marginTop: 32,
            paddingHorizontal: 24,
            lineHeight: 16,
          }}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
}
