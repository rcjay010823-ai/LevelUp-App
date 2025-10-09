import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { 
  Plus, 
  Target, 
  Calendar,
  ChevronRight,
  ArrowLeft,
  Save,
  ChevronDown
} from 'lucide-react-native';
import KeyboardAvoidingAnimatedView from '@/components/KeyboardAvoidingAnimatedView';

export default function YearlyGoalsPage() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  
  // Form state
  const [goalTitle, setGoalTitle] = useState('');
  const [goalNotes, setGoalNotes] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState('');

  // Mock user ID - in real app this would come from auth context
  const userId = 'demo-user-123';

  // Generate year options (current year ± 2)
  const yearOptions = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [
      currentYear - 2,
      currentYear - 1,
      currentYear,
      currentYear + 1,
      currentYear + 2
    ];
  }, []);

  // Fetch yearly goals
  const { data: goalsData = { goals: [] } } = useQuery({
    queryKey: ['yearly-goals', userId, selectedYear],
    queryFn: async () => {
      const response = await fetch(`/api/yearly-goals?userId=${userId}&year=${selectedYear}`);
      if (!response.ok) throw new Error('Failed to fetch yearly goals');
      return response.json();
    },
  });

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (goalData) => {
      const response = await fetch('/api/yearly-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData),
      });
      if (!response.ok) throw new Error('Failed to create goal');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['yearly-goals', userId, selectedYear] });
      setShowAddModal(false);
      resetForm();
      Alert.alert('Success', 'Goal created!');
    },
    onError: () => Alert.alert('Error', 'Failed to create goal'),
  });

  const resetForm = () => {
    setGoalTitle('');
    setGoalNotes('');
    setGoalTargetDate('');
  };

  const handleAddGoal = useCallback(() => {
    resetForm();
    setShowAddModal(true);
  }, []);

  const handleSaveGoal = useCallback(() => {
    if (!goalTitle.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    createGoalMutation.mutate({
      userId,
      title: goalTitle.trim(),
      notes: goalNotes.trim(),
      targetDate: goalTargetDate || null,
      year: selectedYear,
    });
  }, [goalTitle, goalNotes, goalTargetDate, selectedYear, userId, createGoalMutation]);

  const handleGoalPress = useCallback((goal) => {
    router.push(`/yearly-goals/${goal.id}`);
  }, []);

  const renderProgressBar = (progress) => (
    <View style={{
      height: 6,
      backgroundColor: '#e9ecef',
      borderRadius: 3,
      overflow: 'hidden',
      marginTop: 8,
    }}>
      <View style={{
        height: '100%',
        backgroundColor: progress > 0 ? '#28a745' : '#dee2e6',
        width: `${Math.round(progress * 100)}%`,
        borderRadius: 3,
      }} />
    </View>
  );

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <View style={{ 
        flex: 1, 
        backgroundColor: '#f8f9fa',
        paddingTop: insets.top 
      }}>
        <StatusBar style="dark" />
        
        {/* Header */}
        <View style={{
          backgroundColor: '#fff',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#e9ecef',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginRight: 16 }}
            >
              <ArrowLeft size={24} color="#212529" />
            </TouchableOpacity>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#212529' }}>
              Goals
            </Text>
          </View>
          
          {/* Year Picker */}
          <TouchableOpacity
            onPress={() => setShowYearPicker(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#f8f9fa',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#212529' }}>
              {selectedYear}
            </Text>
            <ChevronDown size={16} color="#6c757d" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ 
            paddingBottom: insets.bottom + 100,
            paddingTop: 20
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Goals List */}
          {goalsData.goals.length === 0 ? (
            <View style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 40,
              paddingVertical: 60,
            }}>
              <View style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: '#e3f2fd',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}>
                <Target size={48} color="#2196f3" />
              </View>
              <Text style={{
                fontSize: 20,
                fontWeight: '600',
                color: '#212529',
                marginBottom: 8,
                textAlign: 'center',
              }}>
                Create Your First Goal
              </Text>
              <Text style={{
                fontSize: 16,
                color: '#6c757d',
                textAlign: 'center',
                marginBottom: 32,
                lineHeight: 24,
              }}>
                Set meaningful yearly goals and break them down into actionable steps.
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#adb5bd',
                textAlign: 'center',
                fontStyle: 'italic',
              }}>
                Example: "Grow TikTok following to 100k"
              </Text>
            </View>
          ) : (
            <View style={{ paddingHorizontal: 16 }}>
              {goalsData.goals.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  onPress={() => handleGoalPress(goal)}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: '#212529',
                        marginBottom: 4,
                      }}>
                        {goal.title}
                      </Text>
                      
                      {goal.notes && (
                        <Text style={{
                          fontSize: 14,
                          color: '#6c757d',
                          marginBottom: 8,
                          lineHeight: 20,
                        }}>
                          {goal.notes}
                        </Text>
                      )}
                      
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Text style={{ fontSize: 12, color: '#6c757d' }}>
                          Progress: {goal.completedSubGoalsCount || 0} of {goal.subGoalsCount || 0} steps
                        </Text>
                        {goal.target_date && (
                          <>
                            <Text style={{ fontSize: 12, color: '#6c757d', marginHorizontal: 8 }}>•</Text>
                            <Calendar size={12} color="#6c757d" />
                            <Text style={{ fontSize: 12, color: '#6c757d', marginLeft: 4 }}>
                              {new Date(goal.target_date).toLocaleDateString()}
                            </Text>
                          </>
                        )}
                      </View>
                      
                      {renderProgressBar(goal.progress || 0)}
                    </View>
                    
                    <ChevronRight size={20} color="#6c757d" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Floating Add Button */}
        <TouchableOpacity
          onPress={handleAddGoal}
          style={{
            position: 'absolute',
            bottom: insets.bottom + 20,
            right: 20,
            backgroundColor: '#007bff',
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>

        {/* Year Picker Modal */}
        <Modal visible={showYearPicker} transparent animationType="slide">
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}>
            <View style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              paddingBottom: insets.bottom + 20,
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 20,
                color: '#212529',
                textAlign: 'center',
              }}>
                Select Year
              </Text>

              {yearOptions.map((year) => (
                <TouchableOpacity
                  key={year}
                  onPress={() => {
                    setSelectedYear(year);
                    setShowYearPicker(false);
                  }}
                  style={{
                    paddingVertical: 16,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                    backgroundColor: year === selectedYear ? '#e3f2fd' : 'transparent',
                    marginBottom: 8,
                  }}
                >
                  <Text style={{
                    fontSize: 16,
                    fontWeight: year === selectedYear ? '600' : '400',
                    color: year === selectedYear ? '#2196f3' : '#212529',
                    textAlign: 'center',
                  }}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={() => setShowYearPicker(false)}
                style={{
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: '#6c757d',
                  alignItems: 'center',
                  marginTop: 12,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Add Goal Modal */}
        <Modal visible={showAddModal} transparent animationType="slide">
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}>
            <View style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              paddingBottom: insets.bottom + 20,
              maxHeight: '80%',
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 20,
                color: '#212529',
              }}>
                Add New Goal
              </Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                <TextInput
                  value={goalTitle}
                  onChangeText={setGoalTitle}
                  placeholder="Goal title (e.g., Grow TikTok to 100k followers)"
                  style={{
                    borderWidth: 1,
                    borderColor: '#dee2e6',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16,
                    fontSize: 16,
                  }}
                />

                <TextInput
                  value={goalNotes}
                  onChangeText={setGoalNotes}
                  placeholder="Notes (optional)"
                  multiline
                  numberOfLines={3}
                  style={{
                    borderWidth: 1,
                    borderColor: '#dee2e6',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16,
                    fontSize: 16,
                    textAlignVertical: 'top',
                  }}
                />

                <TextInput
                  value={goalTargetDate}
                  onChangeText={setGoalTargetDate}
                  placeholder="Target date (YYYY-MM-DD) - optional"
                  style={{
                    borderWidth: 1,
                    borderColor: '#dee2e6',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 20,
                    fontSize: 16,
                  }}
                />
              </ScrollView>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor: '#6c757d',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSaveGoal}
                  disabled={!goalTitle.trim()}
                  style={{
                    flex: 2,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor: goalTitle.trim() ? '#007bff' : '#dee2e6',
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}
                >
                  <Save size={16} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 8 }}>
                    Create Goal
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}