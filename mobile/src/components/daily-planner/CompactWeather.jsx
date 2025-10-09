import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Cloud, Sun, CloudRain, MapPin } from "lucide-react-native";
import { useTheme } from "@/utils/theme";
import * as Location from "expo-location";
import { getWeatherSettings } from "@/components/WeatherSettingsModal";

export default function CompactWeather() {
  const { theme } = useTheme();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    setLoading(true);
    try {
      // Get user's weather settings
      const settings = await getWeatherSettings();

      if (settings.useCurrentLocation) {
        // Get location permission and current location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          // Default to a major city if location permission denied
          await fetchWeatherForCity("New York");
          return;
        }

        const location = await Location.getCurrentPositionAsync({});

        // Get city name from coordinates using reverse geocoding
        const geocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (geocode && geocode.length > 0) {
          const city = geocode[0].city || geocode[0].subregion || "Unknown";
          await fetchWeatherForCity(city);
        }
      } else if (settings.customCity && settings.customCity.trim()) {
        // Use custom city from settings
        await fetchWeatherForCity(settings.customCity.trim());
      } else {
        // Fallback to default city
        await fetchWeatherForCity("New York");
      }
    } catch (error) {
      console.error("Error loading weather:", error);
      // Fallback to default city
      await fetchWeatherForCity("New York");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherForCity = async (cityName) => {
    try {
      const response = await fetch(
        `/integrations/weather-by-city/weather/${encodeURIComponent(cityName)}`,
      );
      if (!response.ok) throw new Error("Weather fetch failed");

      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  };

  const getWeatherIcon = (condition) => {
    const text = condition?.text?.toLowerCase() || "";
    if (text.includes("sun") || text.includes("clear")) {
      return <Sun size={16} color="#FFA500" />;
    } else if (text.includes("rain") || text.includes("shower")) {
      return <CloudRain size={16} color="#4A90E2" />;
    } else {
      return <Cloud size={16} color="#8E8E93" />;
    }
  };

  const formatTemperature = (temp) => {
    return `${Math.round(temp)}°`;
  };

  if (loading && !weather) {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          minWidth: 80,
        }}
      >
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <View
      style={{
        alignItems: "flex-end",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 2,
        }}
      >
        <MapPin size={12} color={theme.colors.textSecondary} />
        <Text
          style={{
            fontSize: 12,
            color: theme.colors.textSecondary,
            marginLeft: 4,
            maxWidth: 80,
          }}
          numberOfLines={1}
        >
          {weather.location?.name || "Location"}
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {getWeatherIcon(weather.current?.condition)}
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: theme.colors.text,
            marginLeft: 6,
          }}
        >
          {formatTemperature(weather.current?.temp_c)}
        </Text>
      </View>
    </View>
  );
}
