import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/utils/auth/useAuth";
import useUser from "@/utils/auth/useUser";
import { useThemeStore } from "@/utils/theme";
import {
  LogIn,
  LogOut,
  User,
  CheckCircle,
  XCircle,
  TestTube,
} from "lucide-react-native";

export default function TestAuth() {
  const insets = useSafeAreaInsets();
  const { currentTheme: colors } = useThemeStore();
  const { signIn, signOut, isAuthenticated, isReady } = useAuth();
  const { data: user, loading: userLoading } = useUser();
  const [testEmail, setTestEmail] = useState("test@example.com");
  const [testPassword, setTestPassword] = useState("password123");
  const [directTestResult, setDirectTestResult] = useState(null);

  // Log environment variables for debugging
  useEffect(() => {
    console.log("🔧 Environment Variables Test:");
    console.log("EXPO_PUBLIC_BASE_URL:", process.env.EXPO_PUBLIC_BASE_URL);
    console.log(
      "EXPO_PUBLIC_PROXY_BASE_URL:",
      process.env.EXPO_PUBLIC_PROXY_BASE_URL,
    );
    console.log("EXPO_PUBLIC_HOST:", process.env.EXPO_PUBLIC_HOST);
    console.log(
      "EXPO_PUBLIC_PROJECT_GROUP_ID:",
      process.env.EXPO_PUBLIC_PROJECT_GROUP_ID,
    );

    console.log("🔐 Auth State:");
    console.log("isReady:", isReady);
    console.log("isAuthenticated:", isAuthenticated);
    console.log("user:", user);
  }, [isReady, isAuthenticated, user]);

  const handleSignIn = async () => {
    try {
      console.log("🔑 Attempting sign in...");
      await signIn();
    } catch (error) {
      console.error("❌ Sign in error:", error);
      Alert.alert("Sign In Error", error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log("🚪 Attempting sign out...");
      await signOut();
    } catch (error) {
      console.error("❌ Sign out error:", error);
      Alert.alert("Sign Out Error", error.message);
    }
  };

  const testApiConnection = async () => {
    try {
      console.log("🌐 Testing API connection...");
      const response = await fetch("/api/test-auth");

      if (response.ok) {
        const data = await response.json();
        console.log("✅ API Response:", data);
        Alert.alert("API Test Success", JSON.stringify(data, null, 2));
      } else {
        console.log(
          "❌ API Response failed:",
          response.status,
          response.statusText,
        );
        Alert.alert("API Test Failed", `Status: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ API Test error:", error);
      Alert.alert("API Test Error", error.message);
    }
  };

  const testDirectAuth = async () => {
    try {
      console.log("🧪 Testing direct auth with test credentials...");
      setDirectTestResult("Testing...");

      // First try to access the signup page directly
      const signupResponse = await fetch("/account/signup");
      console.log("Signup page response:", signupResponse.status);

      // Try to access the signin page directly
      const signinResponse = await fetch("/account/signin");
      console.log("Signin page response:", signinResponse.status);

      // Try to access the token endpoint
      const tokenResponse = await fetch("/api/auth/token");
      console.log("Token endpoint response:", tokenResponse.status);

      setDirectTestResult(
        `Signup: ${signupResponse.status}, Signin: ${signinResponse.status}, Token: ${tokenResponse.status}`,
      );
    } catch (error) {
      console.error("❌ Direct auth test error:", error);
      setDirectTestResult(`Error: ${error.message}`);
    }
  };

  return (
    <ScrollView
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
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: colors.accent,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: colors.text,
          }}
        >
          🧪 Auth Testing
        </Text>
      </View>

      <View style={{ flex: 1, padding: 20 }}>
        {/* Environment Status */}
        <View
          style={{
            backgroundColor: colors.surface,
            padding: 16,
            borderRadius: 12,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.text,
              marginBottom: 12,
            }}
          >
            🔧 Environment Check
          </Text>

          {[
            {
              key: "EXPO_PUBLIC_BASE_URL",
              value: process.env.EXPO_PUBLIC_BASE_URL,
            },
            {
              key: "EXPO_PUBLIC_PROXY_BASE_URL",
              value: process.env.EXPO_PUBLIC_PROXY_BASE_URL,
            },
            { key: "EXPO_PUBLIC_HOST", value: process.env.EXPO_PUBLIC_HOST },
            {
              key: "EXPO_PUBLIC_PROJECT_GROUP_ID",
              value: process.env.EXPO_PUBLIC_PROJECT_GROUP_ID,
            },
          ].map(({ key, value }) => (
            <View
              key={key}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              {value ? (
                <CheckCircle size={16} color="#22c55e" />
              ) : (
                <XCircle size={16} color="#ef4444" />
              )}
              <Text
                style={{
                  fontSize: 12,
                  color: colors.text,
                  marginLeft: 8,
                  flex: 1,
                }}
              >
                {key}: {value ? "✅ Set" : "❌ Missing"}
              </Text>
            </View>
          ))}
        </View>

        {/* Auth Status */}
        <View
          style={{
            backgroundColor: colors.surface,
            padding: 16,
            borderRadius: 12,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.text,
              marginBottom: 12,
            }}
          >
            🔐 Auth Status
          </Text>

          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 14, color: colors.text }}>
              Auth Ready: {isReady ? "✅ Yes" : "❌ No"}
            </Text>
            <Text style={{ fontSize: 14, color: colors.text }}>
              Authenticated: {isAuthenticated ? "✅ Yes" : "❌ No"}
            </Text>
            <Text style={{ fontSize: 14, color: colors.text }}>
              User Loading: {userLoading ? "⏳ Yes" : "✅ No"}
            </Text>
            <Text style={{ fontSize: 14, color: colors.text }}>
              User Data: {user ? `✅ ${user.email}` : "❌ None"}
            </Text>
          </View>
        </View>

        {/* Direct API Test */}
        <View
          style={{
            backgroundColor: colors.surface,
            padding: 16,
            borderRadius: 12,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.text,
              marginBottom: 12,
            }}
          >
            🧪 Direct API Test
          </Text>

          <TouchableOpacity
            onPress={testDirectAuth}
            style={{
              backgroundColor: colors.accent,
              padding: 12,
              borderRadius: 8,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <TestTube size={16} color={colors.text} />
            <Text
              style={{
                color: colors.text,
                fontSize: 14,
                fontWeight: "600",
                marginLeft: 8,
              }}
            >
              Test Auth Endpoints
            </Text>
          </TouchableOpacity>

          {directTestResult && (
            <View
              style={{
                backgroundColor: colors.accent,
                padding: 12,
                borderRadius: 8,
              }}
            >
              <Text style={{ fontSize: 12, color: colors.text }}>
                Result: {directTestResult}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={{ gap: 12 }}>
          {/* API Test Button */}
          <TouchableOpacity
            onPress={testApiConnection}
            style={{
              backgroundColor: colors.primary,
              padding: 16,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle size={20} color="white" />
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: "600",
                marginLeft: 8,
              }}
            >
              Test API Connection
            </Text>
          </TouchableOpacity>

          {/* Sign In/Out Button */}
          {isAuthenticated ? (
            <TouchableOpacity
              onPress={handleSignOut}
              style={{
                backgroundColor: "#ef4444",
                padding: 16,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LogOut size={20} color="white" />
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  fontWeight: "600",
                  marginLeft: 8,
                }}
              >
                Sign Out
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleSignIn}
              style={{
                backgroundColor: "#22c55e",
                padding: 16,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LogIn size={20} color="white" />
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  fontWeight: "600",
                  marginLeft: 8,
                }}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* User Info */}
        {user && (
          <View
            style={{
              backgroundColor: colors.surface,
              padding: 16,
              borderRadius: 12,
              marginTop: 20,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 12,
              }}
            >
              👤 User Info
            </Text>

            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 14, color: colors.text }}>
                ID: {user.id}
              </Text>
              <Text style={{ fontSize: 14, color: colors.text }}>
                Email: {user.email}
              </Text>
              <Text style={{ fontSize: 14, color: colors.text }}>
                Name: {user.name || "Not set"}
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
