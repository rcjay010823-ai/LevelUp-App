import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useTheme } from '@/utils/theme';

const MOODS = [
  { value: 1, emoji: '😢', label: 'Very Sad' },
  { value: 2, emoji: '😔', label: 'Sad' },
  { value: 3, emoji: '😐', label: 'Neutral' },
  { value: 4, emoji: '😊', label: 'Happy' },
  { value: 5, emoji: '😄', label: 'Very Happy' },
];

export default function MoodSection({ mood, onMoodUpdate, date }) {
  const { theme } = useTheme();
  const [selectedMood, setSelectedMood] = useState(mood?.mood_value || null);
  const [notes, setNotes] = useState(mood?.notes || '');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMoodSelect = async (moodValue) => {
    setSelectedMood(moodValue);
    const selectedMoodData = MOODS.find(m => m.value === moodValue);
    
    try {
      await onMoodUpdate({
        moodValue,
        moodEmoji: selectedMoodData.emoji,
        notes
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save mood');
      setSelectedMood(mood?.mood_value || null);
    }
  };

  const handleNotesUpdate = async () => {
    if (selectedMood) {
      const selectedMoodData = MOODS.find(m => m.value === selectedMood);
      try {
        await onMoodUpdate({
          moodValue: selectedMood,
          moodEmoji: selectedMoodData.emoji,
          notes
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to save mood notes');
      }
    }
  };

  return (
    <View style={{
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    }}>
      <TouchableOpacity 
        onPress={() => setIsExpanded(!isExpanded)}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: theme.colors.text,
        }}>
          How are you feeling?
        </Text>
        <Text style={{
          fontSize: 24,
          color: theme.colors.primary,
        }}>
          {selectedMood ? MOODS.find(m => m.value === selectedMood)?.emoji : '😐'}
        </Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={{ marginTop: 16 }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            {MOODS.map((mood) => (
              <TouchableOpacity
                key={mood.value}
                onPress={() => handleMoodSelect(mood.value)}
                style={{
                  alignItems: 'center',
                  padding: 8,
                  borderRadius: 12,
                  backgroundColor: selectedMood === mood.value ? theme.colors.primary + '20' : 'transparent',
                  borderWidth: selectedMood === mood.value ? 2 : 1,
                  borderColor: selectedMood === mood.value ? theme.colors.primary : theme.colors.border,
                  flex: 1,
                  marginHorizontal: 2,
                }}
              >
                <Text style={{ fontSize: 24, marginBottom: 4 }}>{mood.emoji}</Text>
                <Text style={{
                  fontSize: 11,
                  color: selectedMood === mood.value ? theme.colors.primary : theme.colors.textSecondary,
                  textAlign: 'center',
                  fontWeight: selectedMood === mood.value ? '600' : '400',
                }}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            placeholder="How was your day? (optional)"
            placeholderTextColor={theme.colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            onBlur={handleNotesUpdate}
            multiline
            style={{
              backgroundColor: theme.colors.inputBackground,
              borderRadius: 12,
              padding: 12,
              color: theme.colors.text,
              fontSize: 16,
              minHeight: 80,
              textAlignVertical: 'top',
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          />
        </View>
      )}
    </View>
  );
}