import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Canvas, Circle, Path, Skia } from "@shopify/react-native-skia";

export default function CircularProgress({
  size = 120,
  strokeWidth = 8,
  progress = 0,
  color = "#007bff",
  backgroundColor = "#f0f0f0",
  children,
  onPress,
  style,
}) {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = radius * 2 * Math.PI;

  // Ensure progress is between 0 and 1
  const normalizedProgress = Math.max(0, Math.min(1, progress));

  // Create the progress path
  const progressPath = Skia.Path.Make();
  const startAngle = -Math.PI / 2; // Start at top
  const endAngle = startAngle + 2 * Math.PI * normalizedProgress;

  progressPath.addArc(
    {
      x: center - radius,
      y: center - radius,
      width: radius * 2,
      height: radius * 2,
    },
    (startAngle * 180) / Math.PI,
    normalizedProgress * 360,
  );

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component onPress={onPress} style={[{ alignItems: "center" }, style]}>
      <View style={{ position: "relative" }}>
        <Canvas style={{ width: size, height: size }}>
          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            style="stroke"
            strokeWidth={strokeWidth}
            color={backgroundColor}
          />

          {/* Progress arc */}
          {normalizedProgress > 0 && (
            <Path
              path={progressPath}
              style="stroke"
              strokeWidth={strokeWidth}
              strokeCap="round"
              color={color}
            />
          )}
        </Canvas>

        {/* Center content */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {children}
        </View>
      </View>
    </Component>
  );
}
