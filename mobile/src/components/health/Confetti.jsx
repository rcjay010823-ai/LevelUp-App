import React, { useEffect, useRef } from "react";
import { View, Animated, Dimensions } from "react-native";

const ConfettiPiece = ({ delay, colors }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const translateX = useRef(
    new Animated.Value(Math.random() * 200 - 100)
  ).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(translateY, {
        toValue: Dimensions.get("window").height + 100,
        duration: 3000 + delay,
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: 360 * 4,
        duration: 3000 + delay,
        useNativeDriver: true,
      }),
    ]);

    const timer = setTimeout(() => animation.start(), delay);
    return () => clearTimeout(timer);
  }, [delay, translateY, rotate]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: 10,
        height: 10,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        transform: [
          { translateY },
          { translateX },
          {
            rotate: rotate.interpolate({
              inputRange: [0, 360],
              outputRange: ["0deg", "360deg"],
            }),
          },
        ],
      }}
    />
  );
};

export const ConfettiAnimation = ({ visible, onComplete }) => {
  const confettiColors = [
    "#FFD700",
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FECA57",
  ];

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onComplete, 4000);
      return () => clearTimeout(timer);
    }
  }, [visible, onComplete]);

  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
      }}
    >
      {Array.from({ length: 50 }).map((_, i) => (
        <ConfettiPiece key={i} delay={i * 50} colors={confettiColors} />
      ))}
    </View>
  );
};
