import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/utils/auth/useAuth";
import useUser from "@/utils/auth/useUser";
import { useThemeStore } from "@/utils/theme";
import * as SecureStore from "expo-secure-store";
import {
  LogIn,
  LogOut,
  User,
  CheckCircle,
  XCircle,
  TestTube,
  Trash2,
  RefreshCw,
} from "lucide-react-native";

export default function AuthDebug() {
  const insets = useSafeAreaInsets();
  const { currentTheme: colors } = useThemeStore();
  const { signIn, signOut, isAuthenticated, isReady, auth } = useAuth();
  const { data: user, loading: userLoading } = useUser();
  const authKey = "auth-token"; // Standard auth key
  const [rawStorageData, setRawStorageData] = useState(null);
  const [envVarStatus, setEnvVarStatus] = useState(null);
  const [apiTestResult, setApiTestResult] = useState(null);
  const [storageTestResult, setStorageTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDebugData();
  }, []);

  const loadDebugData = async () => {
    // Check environment variables
    const envVars = {
      EXPO_PUBLIC_BASE_URL: process.env.EXPO_PUBLIC_BASE_URL,
      EXPO_PUBLIC_PROXY_BASE_URL: process.env.EXPO_PUBLIC_PROXY_BASE_URL,
      EXPO_PUBLIC_HOST: process.env.EXPO_PUBLIC_HOST,
      EXPO_PUBLIC_PROJECT_GROUP_ID: process.env.EXPO_PUBLIC_PROJECT_GROUP_ID,
    };
    setEnvVarStatus(envVars);

    // Check raw storage data
    try {
      const rawAuth = await SecureStore.getItemAsync(authKey);
      setRawStorageData(rawAuth);
    } catch (error) {
      setRawStorageData(`Error: ${error.message}`);
    }
  };

  const clearAuthData = async () => {
    try {
      setLoading(true);
      await SecureStore.deleteItemAsync(authKey);
      await signOut();
      setRawStorageData(null);
      setLoading(false);
      Alert.alert("Success", "Auth data cleared successfully");
      loadDebugData();
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", `Failed to clear auth data: ${error.message}`);
    }
  };

  const testApiEndpoint = async () => {
    try {
      setApiTestResult("Testing...");
      const response = await fetch("/api/auth/token");
      const data = await response.json();
      setApiTestResult({
        status: response.status,
        statusText: response.statusText,
        data: JSON.stringify(data, null, 2),
      });
    } catch (error) {
      setApiTestResult({
        error: error.message,
      });
    }
  };

  const testSecureStorage = async () => {
    try {
      setStorageTestResult("Testing...");

      // Test write
      const testData = { test: "data", timestamp: Date.now() };
      await SecureStore.setItemAsync("test-key", JSON.stringify(testData));

      // Test read
      const retrieved = await SecureStore.getItemAsync("test-key");
      const parsed = JSON.parse(retrieved);

      // Test delete
      await SecureStore.deleteItemAsync("test-key");

      setStorageTestResult({
        writeSuccess: true,
        readSuccess: parsed.test === "data",
        deleteSuccess: true,
        data: parsed,
      });
    } catch (error) {
      setStorageTestResult({
        error: error.message,
      });
    }
  };

  const InfoRow = ({ label, value, status }) => (
    <View
      style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
    >
      {status !== undefined &&
        (status ? (
          <CheckCircle size={16} color="#22c55e" style={{ marginRight: 8 }} />
        ) : (
          <XCircle size={16} color="#ef4444" style={{ marginRight: 8 }} />
        ))}
      <Text style={{ fontSize: 12, color: colors.text, flex: 1 }}>
        <Text style={{ fontWeight: "600" }}>{label}:</Text> {value}
      </Text>
    </View>
  );

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
          🐛 TestFlight Auth Debug
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.text,
            opacity: 0.7,
            marginTop: 4,
          }}
        >
          Comprehensive authentication debugging for TestFlight
        </Text>
      </View>

      <View style={{ flex: 1, padding: 20 }}>
        {/* Environment Variables */}
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
            🔧 Environment Variables
          </Text>

          {envVarStatus &&
            Object.entries(envVarStatus).map(([key, value]) => (
              <InfoRow
                key={key}
                label={key}
                value={value ? "✅ SET" : "❌ MISSING"}
                status={!!value}
              />
            ))}
        </View>

        {/* Auth State */}
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
            🔐 Auth State
          </Text>

          <InfoRow
            label="Auth Ready"
            value={isReady ? "Yes" : "No"}
            status={isReady}
          />
          <InfoRow
            label="Authenticated"
            value={isAuthenticated ? "Yes" : "No"}
            status={isAuthenticated}
          />
          <InfoRow
            label="User Loading"
            value={userLoading ? "Yes" : "No"}
            status={!userLoading}
          />
          <InfoRow
            label="User Data"
            value={user ? `${user.email || user.id}` : "None"}
            status={!!user}
          />
          <InfoRow
            label="Auth Object"
            value={auth ? "Present" : "Null"}
            status={!!auth}
          />
          <InfoRow label="Storage Key" value={authKey} />
        </View>

        {/* Raw Storage Data */}
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
            💾 Raw Storage Data
          </Text>

          <Text
            style={{
              fontSize: 12,
              color: colors.text,
              fontFamily: "monospace",
            }}
          >
            {rawStorageData || "No data stored"}
          </Text>
        </View>

        {/* API Test */}
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
            🌐 API Connectivity Test
          </Text>

          <TouchableOpacity
            onPress={testApiEndpoint}
            style={{
              backgroundColor: colors.accent,
              padding: 12,
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: colors.text, textAlign: "center" }}>
              Test /api/auth/token
            </Text>
          </TouchableOpacity>

          {apiTestResult && (
            <Text
              style={{
                fontSize: 12,
                color: colors.text,
                fontFamily: "monospace",
              }}
            >
              {typeof apiTestResult === "string"
                ? apiTestResult
                : JSON.stringify(apiTestResult, null, 2)}
            </Text>
          )}
        </View>

        {/* Storage Test */}
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
            🔒 Secure Storage Test
          </Text>

          <TouchableOpacity
            onPress={testSecureStorage}
            style={{
              backgroundColor: colors.accent,
              padding: 12,
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: colors.text, textAlign: "center" }}>
              Test SecureStore
            </Text>
          </TouchableOpacity>

          {storageTestResult && (
            <Text
              style={{
                fontSize: 12,
                color: colors.text,
                fontFamily: "monospace",
              }}
            >
              {typeof storageTestResult === "string"
                ? storageTestResult
                : JSON.stringify(storageTestResult, null, 2)}
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={{ gap: 12 }}>
          <TouchableOpacity
            onPress={clearAuthData}
            disabled={loading}
            style={{
              backgroundColor: "#ef4444",
              padding: 16,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Trash2 size={20} color="white" />
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                    fontWeight: "600",
                    marginLeft: 8,
                  }}
                >
                  Clear Auth Data
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={loadDebugData}
            style={{
              backgroundColor: colors.accent,
              padding: 16,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RefreshCw size={20} color={colors.text} />
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: "600",
                marginLeft: 8,
              }}
            >
              Refresh Debug Data
            </Text>
          </TouchableOpacity>

          {/* Sign In/Out Button */}
          {isAuthenticated ? (
            <TouchableOpacity
              onPress={signOut}
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
              onPress={signIn}
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
                Test Sign In
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
