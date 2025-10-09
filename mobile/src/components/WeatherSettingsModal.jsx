import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, MapPin, Smartphone } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeStore } from '@/utils/theme';

const WEATHER_SETTINGS_KEY = '@weather_settings';

export default function WeatherSettingsModal({ visible, onClose }) {
  const insets = useSafeAreaInsets();
  const { currentTheme: colors } = useThemeStore();
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [customCity, setCustomCity] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const settings = {
        useCurrentLocation,
        customCity: customCity.trim(),
      };
      
      await AsyncStorage.setItem(WEATHER_SETTINGS_KEY, JSON.stringify(settings));
      Alert.alert('Success', 'Weather location settings saved!');
      onClose();
    } catch (error) {
      console.error('Error saving weather settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(WEATHER_SETTINGS_KEY);
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setUseCurrentLocation(settings.useCurrentLocation ?? true);
        setCustomCity(settings.customCity ?? '');
      }
    } catch (error) {
      console.error('Error loading weather settings:', error);
    }
  };

  React.useEffect(() => {
    if (visible) {
      loadSettings();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <StatusBar style="light" />
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            paddingBottom: insets.bottom + 20,
            minHeight: 300,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: colors.text,
              }}
            >
              Weather Location
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.accent,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Current Location Option */}
          <View
            style={{
              backgroundColor: colors.background,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.accent,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <Smartphone size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: colors.text,
                    }}
                  >
                    Use Current Location
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    Automatically detect your location
                  </Text>
                </View>
              </View>
              <Switch
                value={useCurrentLocation}
                onValueChange={setUseCurrentLocation}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={useCurrentLocation ? '#fff' : colors.textSecondary}
              />
            </View>
          </View>

          {/* Custom City Option */}
          <View
            style={{
              backgroundColor: colors.background,
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: useCurrentLocation ? 0.5 : 1,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <MapPin size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: colors.text,
                  }}
                >
                  Custom Location
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                    marginTop: 2,
                  }}
                >
                  Enter a specific city name
                </Text>
              </View>
            </View>
            
            <TextInput
              value={customCity}
              onChangeText={setCustomCity}
              placeholder="Enter city name (e.g., London, New York)"
              placeholderTextColor={colors.textSecondary}
              editable={!useCurrentLocation}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: colors.text,
                backgroundColor: useCurrentLocation ? colors.accent : colors.surface,
              }}
            />
          </View>

          {/* Buttons */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: colors.accent,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.textSecondary, fontWeight: '600', fontSize: 16 }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: colors.primary,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Export a function to get weather settings
export const getWeatherSettings = async () => {
  try {
    const savedSettings = await AsyncStorage.getItem(WEATHER_SETTINGS_KEY);
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return { useCurrentLocation: true, customCity: '' };
  } catch (error) {
    console.error('Error loading weather settings:', error);
    return { useCurrentLocation: true, customCity: '' };
  }
};