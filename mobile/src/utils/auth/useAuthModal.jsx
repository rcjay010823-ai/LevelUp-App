import React from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Platform,
  Linking,
} from "react-native";
import { X } from "lucide-react-native";
import { WebView } from "react-native-webview";
import { useAuth } from "./useAuth";

/**
 * Auth modal that shows sign in/up webview
 */
export const AuthModal = () => {
  const { authModal, setAuthModal, setAuth } = useAuth();
  const isOpen = authModal?.isOpen || false;
  const mode = authModal?.mode || "signin";
  const showWebView = authModal?.showWebView || false;
  const isWeb = Platform.OS === "web";

  console.log(
    "AuthModal render - isOpen:",
    isOpen,
    "mode:",
    mode,
    "showWebView:",
    showWebView,
    "authModal:",
    authModal,
  );

  const close = () => {
    console.log("AuthModal close() called");
    setAuthModal({ isOpen: false });
  };

  // Environment variables for the webview
  const baseURL = process.env.EXPO_PUBLIC_BASE_URL || "";

  const authURL = `${baseURL}/account/${mode}?callbackUrl=/api/auth/token`;

  console.log("AuthModal - Environment variables:");
  console.log("  EXPO_PUBLIC_BASE_URL:", process.env.EXPO_PUBLIC_BASE_URL);
  console.log("  EXPO_PUBLIC_HOST:", process.env.EXPO_PUBLIC_HOST);
  console.log(
    "  EXPO_PUBLIC_PROJECT_GROUP_ID:",
    process.env.EXPO_PUBLIC_PROJECT_GROUP_ID,
  );
  console.log("AuthModal - Constructed authURL:", authURL);

  // Check if environment variables are configured
  const hasRequiredEnvVars = !!(
    process.env.EXPO_PUBLIC_BASE_URL &&
    process.env.EXPO_PUBLIC_HOST &&
    process.env.EXPO_PUBLIC_PROJECT_GROUP_ID
  );

  // On web platform, redirect to the web app instead of using iframe
  // This avoids CORS issues when running mobile app in web mode
  if (isWeb && showWebView && hasRequiredEnvVars) {
    return (
      <Modal visible={isOpen} transparent={true} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", padding: 20 }}>
          <TouchableOpacity
            onPress={close}
            style={{ alignSelf: "flex-end", padding: 10 }}
          >
            <X size={24} color="#000" />
          </TouchableOpacity>
          <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: 20,
                textAlign: "center",
                color: "#333",
              }}
            >
              {mode === "signup" ? "Create Account" : "Sign In"}
            </Text>
            <Text
              style={{
                fontSize: 16,
                marginBottom: 30,
                textAlign: "center",
                color: "#666",
                lineHeight: 24,
              }}
            >
              For the best experience on web, please use the main web application
              to {mode === "signup" ? "create your account" : "sign in"}.
            </Text>
            <TouchableOpacity
              onPress={() => {
                // Open the auth page in a new tab
                if (typeof window !== "undefined") {
                  window.open(authURL, "_blank");
                } else {
                  Linking.openURL(authURL);
                }
                close();
              }}
              style={{
                backgroundColor: "#007AFF",
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                Open {mode === "signup" ? "Sign Up" : "Sign In"} Page
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 12,
                textAlign: "center",
                color: "#999",
                marginTop: 10,
              }}
            >
              This will open in a new tab at {baseURL}
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  // Show debug info in UI if env vars are missing or if explicitly requested
  if (!showWebView || !hasRequiredEnvVars) {
    return (
      <Modal visible={isOpen} transparent={true} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", padding: 20 }}>
          <TouchableOpacity
            onPress={close}
            style={{ alignSelf: "flex-end", padding: 10 }}
          >
            <X size={24} color="#000" />
          </TouchableOpacity>
          <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                marginBottom: 10,
                textAlign: "center",
                color: "#d32f2f",
              }}
            >
              ⚠️ Configuration Required
            </Text>
            <Text
              style={{
                fontSize: 14,
                marginBottom: 20,
                textAlign: "center",
                color: "#666",
              }}
            >
              Environment variables are not configured properly.
            </Text>
            <Text style={{ fontSize: 14, marginBottom: 10, fontWeight: "600" }}>
              Missing Environment Variables:
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontFamily: "monospace",
                backgroundColor: "#f5f5f5",
                padding: 10,
                marginBottom: 20,
              }}
            >
              EXPO_PUBLIC_BASE_URL:{" "}
              {process.env.EXPO_PUBLIC_BASE_URL || "❌ NOT SET"}
              {"\n"}
              EXPO_PUBLIC_HOST:{" "}
              {process.env.EXPO_PUBLIC_HOST || "❌ NOT SET"}
              {"\n"}
              EXPO_PUBLIC_PROJECT_GROUP_ID:{" "}
              {process.env.EXPO_PUBLIC_PROJECT_GROUP_ID || "❌ NOT SET"}
            </Text>

            <Text style={{ fontSize: 14, marginBottom: 10, fontWeight: "600" }}>
              How to Fix:
            </Text>
            <Text
              style={{
                fontSize: 13,
                backgroundColor: "#e3f2fd",
                padding: 15,
                marginBottom: 20,
                borderRadius: 8,
                lineHeight: 20,
              }}
            >
              1. Create a <Text style={{ fontFamily: "monospace", fontWeight: "bold" }}>.env</Text> file in the mobile directory{"\n"}
              2. Add these variables with your values:{"\n\n"}
              <Text style={{ fontFamily: "monospace", fontSize: 11 }}>
                EXPO_PUBLIC_BASE_URL=https://your-domain.com{"\n"}
                EXPO_PUBLIC_HOST=your-domain.com{"\n"}
                EXPO_PUBLIC_PROJECT_GROUP_ID=your-id
              </Text>
              {"\n\n"}
              3. Restart the development server
            </Text>

            {hasRequiredEnvVars && (
              <TouchableOpacity
                onPress={() => {
                  setAuthModal({ isOpen: true, mode: mode, showWebView: true });
                }}
                style={{
                  backgroundColor: "#007AFF",
                  padding: 15,
                  borderRadius: 8,
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 16 }}>
                  Continue to {mode === "signup" ? "Sign Up" : "Sign In"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  const handleNavigationStateChange = (navState) => {
    console.log("WebView navigation state change:", navState.url);

    // Check if we've hit the callback URL
    if (navState.url.includes("/api/auth/token")) {
      console.log("Detected callback URL, fetching token...");
      // Fetch the token from the callback
      fetch(navState.url)
        .then((response) => {
          console.log("Token fetch response status:", response.status);
          return response.json();
        })
        .then((data) => {
          console.log("Token fetch response data:", data);
          if (data.jwt && data.user) {
            setAuth({ jwt: data.jwt, user: data.user });
            close();
          }
        })
        .catch((error) => {
          console.error("Auth error:", error);
        });
    }
  };

  const handleWebViewError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error("WebView error:", nativeEvent);
  };

  const handleWebViewHttpError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error("WebView HTTP error:", nativeEvent);
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={close}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        {/* Close button */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: "#e1e5e9",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#333" }}>
            {mode === "signup" ? "Create Account" : "Sign In"}
          </Text>
          <TouchableOpacity
            onPress={close}
            style={{
              padding: 8,
              borderRadius: 20,
              backgroundColor: "#f1f3f4",
            }}
          >
            <X size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Auth WebView */}
        <View style={{ flex: 1 }}>
          <WebView
            source={{ uri: authURL }}
            onNavigationStateChange={handleNavigationStateChange}
            onError={handleWebViewError}
            onHttpError={handleWebViewHttpError}
            sharedCookiesEnabled={true}
            headers={{
              "x-createxyz-project-group-id":
                process.env.EXPO_PUBLIC_PROJECT_GROUP_ID,
              host: process.env.EXPO_PUBLIC_HOST,
              "x-forwarded-host": process.env.EXPO_PUBLIC_HOST,
              "x-createxyz-host": process.env.EXPO_PUBLIC_HOST,
            }}
            style={{ flex: 1 }}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};
