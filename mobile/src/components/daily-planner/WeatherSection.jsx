import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Cloud, Sun, CloudRain, MapPin, RefreshCw } from 'lucide-react-native';
import { useTheme } from '@/utils/theme';
import * as Location from 'expo-location';

export default function WeatherSection() {
  const { theme } = useTheme();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    setLoading(true);
    try {
      // Get location permission and current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Default to a major city if location permission denied
        await fetchWeatherForCity('New York');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      // Get city name from coordinates using reverse geocoding
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      if (geocode && geocode.length > 0) {
        const city = geocode[0].city || geocode[0].subregion || 'Unknown';
        await fetchWeatherForCity(city);
      }
    } catch (error) {
      console.error('Error loading weather:', error);
      // Fallback to default city
      await fetchWeatherForCity('New York');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherForCity = async (cityName) => {
    try {
      const response = await fetch(`/integrations/weather-by-city/weather/${encodeURIComponent(cityName)}`);
      if (!response.ok) throw new Error('Weather fetch failed');
      
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error('Error fetching weather:', error);
      Alert.alert('Weather Error', 'Could not load weather data');
    }
  };

  const getWeatherIcon = (condition) => {
    const text = condition?.text?.toLowerCase() || '';
    if (text.includes('sun') || text.includes('clear')) {
      return <Sun size={24} color="#FFA500" />;
    } else if (text.includes('rain') || text.includes('shower')) {
      return <CloudRain size={24} color="#4A90E2" />;
    } else {
      return <Cloud size={24} color="#8E8E93" />;
    }
  };

  const formatTemperature = (temp) => {
    return `${Math.round(temp)}°`;
  };

  if (loading && !weather) {
    return (
      <View style={{
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100,
      }}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={{
          fontSize: 14,
          color: theme.colors.textSecondary,
          marginTop: 8,
        }}>
          Loading weather...
        </Text>
      </View>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <View style={{
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <MapPin size={16} color={theme.colors.textSecondary} />
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            marginLeft: 6,
          }}>
            {weather.location?.name || 'Current Location'}
          </Text>
        </View>
        
        <TouchableOpacity 
          onPress={loadWeather}
          disabled={loading}
          style={{
            opacity: loading ? 0.5 : 1,
          }}
        >
          <RefreshCw 
            size={16} 
            color={theme.colors.textSecondary}
            style={{
              transform: [{ rotate: loading ? '180deg' : '0deg' }]
            }}
          />
        </TouchableOpacity>
      </View>

      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          {getWeatherIcon(weather.current?.condition)}
          <View style={{ marginLeft: 12 }}>
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: theme.colors.text,
            }}>
              {formatTemperature(weather.current?.temp_c)}
            </Text>
            <Text style={{
              fontSize: 14,
              color: theme.colors.textSecondary,
              marginTop: 2,
            }}>
              {weather.current?.condition?.text || 'Unknown'}
            </Text>
          </View>
        </View>

        <View style={{
          alignItems: 'flex-end',
        }}>
          <Text style={{
            fontSize: 12,
            color: theme.colors.textSecondary,
          }}>
            Feels like {formatTemperature(weather.current?.feelslike_c)}
          </Text>
          <Text style={{
            fontSize: 12,
            color: theme.colors.textSecondary,
            marginTop: 2,
          }}>
            Humidity {weather.current?.humidity}%
          </Text>
          <Text style={{
            fontSize: 12,
            color: theme.colors.textSecondary,
            marginTop: 2,
          }}>
            Wind {Math.round(weather.current?.wind_kph || 0)} km/h
          </Text>
        </View>
      </View>
    </View>
  );
}