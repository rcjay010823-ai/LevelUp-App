import { create } from "zustand";
import { router } from "expo-router";
import { Platform, Linking } from "react-native";

// Simple auth store for managing authentication state
const useAuthStore = create((set, get) => ({
  auth: null,
  isReady: false,
  authModal: { isOpen: false, mode: "signin" },

  setAuth: (authData) => {
    console.log("Setting auth data:", !!authData);
    set({ auth: authData });
  },

  setAuthModal: (modalState) => {
    console.log("Setting auth modal:", modalState);
    set({ authModal: modalState });
  },

  initAuth: async () => {
    console.log("Initializing auth...");
    // In a real implementation, this would check stored tokens
    set({ isReady: true });
  },
}));

/**
 * This hook provides authentication functionality for screen-based auth flow.
 */
export const useAuth = () => {
  const { auth, isReady, authModal, setAuth, setAuthModal, initAuth } =
    useAuthStore();

  const signIn = () => {
    console.log("SignIn triggered");

    // On web platform, directly navigate to the signin page
    if (Platform.OS === "web") {
      const baseURL = process.env.EXPO_PUBLIC_BASE_URL || "http://localhost:4000";
      const signinURL = `${baseURL}/account/signin`;
      console.log("Navigating to signin page:", signinURL);

      if (typeof window !== "undefined") {
        window.location.href = signinURL;
      }
    } else {
      // On native platforms, use the modal with WebView
      console.log("Opening auth modal");
      setAuthModal({ isOpen: true, mode: "signin", showWebView: true });
    }
  };

  const signUp = () => {
    console.log("SignUp triggered");

    // On web platform, directly navigate to the signup page
    if (Platform.OS === "web") {
      const baseURL = process.env.EXPO_PUBLIC_BASE_URL || "http://localhost:4000";
      const signupURL = `${baseURL}/account/signup`;
      console.log("Navigating to signup page:", signupURL);

      if (typeof window !== "undefined") {
        window.location.href = signupURL;
      }
    } else {
      // On native platforms, use the modal with WebView
      console.log("Opening auth modal");
      setAuthModal({ isOpen: true, mode: "signup", showWebView: true });
    }
  };

  const signOut = async () => {
    console.log("SignOut triggered");
    await setAuth(null);
    router.replace("/"); // Go back to authentication screen
  };

  const isAuthenticated = isReady ? !!auth : false;

  return {
    isReady,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    auth,
    setAuth,
    authModal,
    setAuthModal,
    initAuth,
    user: auth?.user || null,
  };
};

/**
 * This hook will check if the user is authenticated and redirect to auth screen if not.
 * Use this for pages that require authentication.
 */
export const useRequireAuth = () => {
  const { isAuthenticated, isReady, setAuthModal } = useAuth();

  if (isReady && !isAuthenticated) {
    // Show authentication modal
    setAuthModal({ isOpen: true, mode: "signin", showWebView: true });
    return { isAuthenticated: false, isReady: true };
  }

  return { isAuthenticated, isReady };
};

export default useAuth;
