import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { CheckCircle2 } from "lucide-react-native";

export const Toast = ({ message, visible, type = "success" }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -50,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [visible, opacity, translateY]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 60,
        left: 16,
        right: 16,
        zIndex: 1000,
        opacity,
        transform: [{ translateY }],
      }}
    >
      <View
        style={{
          backgroundColor: type === "success" ? "#10B981" : "#EF4444",
          borderRadius: 12,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <CheckCircle2 size={20} color="white" />
        <Text
          style={{
            color: "white",
            fontSize: 14,
            fontWeight: "600",
            marginLeft: 8,
            flex: 1,
          }}
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};
