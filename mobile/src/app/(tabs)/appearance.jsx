import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Palette } from 'lucide-react-native';
import { useThemeStore, themes } from '@/utils/theme';
import { useFonts, PlayfairDisplay_400Regular, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';

export default function AppearancePage() {
  const insets = useSafeAreaInsets();
  const { currentTheme, setTheme, loadTheme } = useThemeStore();
  
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  const handleThemeSelect = async (themeKey) => {
    await setTheme(themeKey);
    Alert.alert('✨', 'Theme updated beautifully!', [{ text: 'Perfect!' }]);
  };

  if (!fontsLoaded) {
    return null;
  }

  const colors = currentTheme;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={{
        backgroundColor: colors.surface,
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.accent,
      }}>
        <Text style={{ 
          fontSize: 28, 
          fontWeight: 'bold', 
          color: colors.text,
          fontFamily: 'PlayfairDisplay_700Bold'
        }}>
          Appearance
        </Text>
        <Text style={{ 
          fontSize: 16, 
          color: colors.text, 
          marginTop: 4,
          opacity: 0.7,
          fontFamily: 'Poppins_400Regular'
        }}>
          Choose your perfect theme
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Theme Preview */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 20,
          padding: 20,
          marginBottom: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 16,
            fontFamily: 'Poppins_600SemiBold'
          }}>
            Current Theme Preview
          </Text>
          
          {/* Mock UI Preview */}
          <View style={{
            backgroundColor: colors.background,
            borderRadius: 16,
            padding: 16,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
            }}>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.primary,
                marginRight: 12,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Palette size={16} color={colors.background} />
              </View>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text,
                fontFamily: 'Poppins_600SemiBold'
              }}>
                Sample Header
              </Text>
            </View>
            
            <View style={{
              backgroundColor: colors.accent,
              borderRadius: 12,
              padding: 12,
              marginBottom: 8,
            }}>
              <Text style={{
                fontSize: 14,
                color: colors.text,
                fontFamily: 'Poppins_400Regular'
              }}>
                This is how cards will look
              </Text>
            </View>
            
            <View style={{
              backgroundColor: colors.primary,
              borderRadius: 8,
              padding: 10,
              alignItems: 'center',
              alignSelf: 'flex-start',
            }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: colors.background,
                fontFamily: 'Poppins_500Medium'
              }}>
                Button
              </Text>
            </View>
          </View>
        </View>

        {/* Theme Options */}
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 16,
          fontFamily: 'Poppins_600SemiBold'
        }}>
          Choose Theme
        </Text>

        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          {Object.values(themes).map((theme) => {
            const isSelected = currentTheme.key === theme.key;
            
            return (
              <TouchableOpacity
                key={theme.key}
                onPress={() => handleThemeSelect(theme.key)}
                style={{
                  width: '47%',
                  backgroundColor: theme.surface,
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 2,
                  borderColor: isSelected ? theme.primary : 'transparent',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                {/* Theme Name */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: theme.text,
                    fontFamily: 'Poppins_600SemiBold'
                  }}>
                    {theme.name}
                  </Text>
                  {isSelected && (
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: theme.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Check size={12} color={theme.background} />
                    </View>
                  )}
                </View>

                {/* Color Dots */}
                <View style={{
                  flexDirection: 'row',
                  gap: 6,
                  marginBottom: 8,
                }}>
                  <View style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: theme.primary,
                  }} />
                  <View style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: theme.background,
                    borderWidth: 1,
                    borderColor: theme.accent,
                  }} />
                  <View style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: theme.accent,
                  }} />
                </View>

                {/* Mini Preview */}
                <View style={{
                  backgroundColor: theme.background,
                  borderRadius: 8,
                  padding: 8,
                }}>
                  <View style={{
                    width: '70%',
                    height: 3,
                    backgroundColor: theme.text,
                    borderRadius: 2,
                    marginBottom: 4,
                    opacity: 0.7,
                  }} />
                  <View style={{
                    width: '50%',
                    height: 3,
                    backgroundColor: theme.text,
                    borderRadius: 2,
                    opacity: 0.4,
                  }} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Info Text */}
        <View style={{
          backgroundColor: colors.accent,
          borderRadius: 12,
          padding: 16,
          marginTop: 24,
          alignItems: 'center',
        }}>
          <Text style={{
            fontSize: 14,
            color: colors.text,
            textAlign: 'center',
            opacity: 0.8,
            fontFamily: 'Poppins_400Regular'
          }}>
            ✨ Applied instantly across the app
          </Text>
        </View>

        {/* Typography Info */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          marginTop: 12,
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
            fontFamily: 'PlayfairDisplay_700Bold'
          }}>
            Typography
          </Text>
          <Text style={{
            fontSize: 14,
            color: colors.text,
            opacity: 0.7,
            fontFamily: 'Poppins_400Regular'
          }}>
            Headings: Playfair Display{'\n'}
            Body: Poppins
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}