import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeStore } from "@/utils/theme";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { useReflectionData } from "../../hooks/useReflectionData";
import { ReflectHeader } from "@/components/reflect/ReflectHeader";
import { ReflectTabNavigator } from "@/components/reflect/ReflectTabNavigator";
import { PowerStatementsTab } from "@/components/reflect/tabs/PowerStatementsTab";
import { GratitudeTab } from "@/components/reflect/tabs/GratitudeTab";
import { MindUnwindTab } from "@/components/reflect/tabs/MindUnwindTab";
import {
  useFonts,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";

export default function ReflectMindfulness() {
  const insets = useSafeAreaInsets();
  const { currentTheme: colors } = useThemeStore();
  const [activeTab, setActiveTab] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false); // This can be used with a modal date picker later

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
  });

  const userId = "demo"; // Mock user ID

  const reflectionData = useReflectionData(userId);

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <PowerStatementsTab
            affirmationsData={reflectionData.affirmationsData}
            newAffirmation={reflectionData.newAffirmation}
            setNewAffirmation={reflectionData.setNewAffirmation}
            currentLibraryAffirmation={reflectionData.currentLibraryAffirmation}
            affirmationLibrary={reflectionData.affirmationLibrary}
            handleAddAffirmation={reflectionData.handleAddAffirmation}
            handleDeleteAffirmation={reflectionData.handleDeleteAffirmation}
            handleShuffleAffirmation={reflectionData.handleShuffleAffirmation}
            handleSelectAffirmation={reflectionData.handleSelectAffirmation}
            addAffirmationMutation={reflectionData.addAffirmationMutation}
          />
        );
      case 1:
        return (
          <GratitudeTab
            excitedAbout={reflectionData.excitedAbout}
            setExcitedAbout={reflectionData.setExcitedAbout}
            smallWin={reflectionData.smallWin}
            setSmallWin={reflectionData.setSmallWin}
            positivePerson={reflectionData.positivePerson}
            setPositivePerson={reflectionData.setPositivePerson}
            happyMoment={reflectionData.happyMoment}
            setHappyMoment={reflectionData.setHappyMoment}
            threeLittleThings={reflectionData.threeLittleThings}
            setThreeLittleThings={reflectionData.setThreeLittleThings}
            nightReflection={reflectionData.nightReflection}
            setNightReflection={reflectionData.setNightReflection}
            handleSaveGratitude={reflectionData.handleSaveGratitude}
            saveGratitudeMutation={reflectionData.saveGratitudeMutation}
          />
        );
      case 2:
        return (
          <MindUnwindTab
            journalContent={reflectionData.journalContent}
            setJournalContent={reflectionData.setJournalContent}
            handleSaveJournal={reflectionData.handleSaveJournal}
            saveJournalMutation={reflectionData.saveJournalMutation}
            selectedMood={reflectionData.selectedMood}
            moodNotes={reflectionData.moodNotes}
            setMoodNotes={reflectionData.setMoodNotes}
            moodOptions={reflectionData.moodOptions}
            handleMoodSelect={reflectionData.handleMoodSelect}
          />
        );
      default:
        return null;
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          paddingTop: insets.top,
        }}
      >
        <StatusBar style="dark" />

        <ReflectHeader
          selectedDate={reflectionData.selectedDate}
          setSelectedDate={reflectionData.setSelectedDate}
          onDatePickerPress={() => setShowDatePicker(true)}
        />

        <ReflectTabNavigator
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          {renderTabContent()}
        </ScrollView>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
