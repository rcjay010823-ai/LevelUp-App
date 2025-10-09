import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Save } from "lucide-react-native";
import { useThemeStore } from "@/utils/theme";

const PromptInput = ({ label, value, onChangeText, placeholder, colors, minHeight = 80 }) => (
  <>
    <Text style={{ fontSize: 14, fontWeight: "500", color: colors.text, opacity: 0.8, marginBottom: 8 }}>
      {label}
    </Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.text + "60"}
      multiline
      style={{
        borderWidth: 1,
        borderColor: colors.accent,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        minHeight: minHeight,
        fontSize: 16,
        textAlignVertical: "top",
        color: colors.text,
      }}
    />
  </>
);

export const GratitudeTab = ({
  excitedAbout, setExcitedAbout,
  smallWin, setSmallWin,
  positivePerson, setPositivePerson,
  happyMoment, setHappyMoment,
  threeLittleThings, setThreeLittleThings,
  nightReflection, setNightReflection,
  handleSaveGratitude,
  saveGratitudeMutation,
}) => {
  const { currentTheme: colors } = useThemeStore();

  return (
    <View style={{ padding: 20 }}>
      <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 20, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: 4 }}>
            Gratitude Boost
          </Text>
          <Text style={{ fontSize: 14, color: colors.text, opacity: 0.7, fontStyle: "italic" }}>
            Morning Kickstart
          </Text>
          <Text style={{ fontSize: 14, color: colors.text, opacity: 0.8, marginTop: 8 }}>
            Begin your morning by answering prompts designed to shift your focus
            toward the good and set a positive tone for the day.
          </Text>
        </View>

        <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 16 }}>
          Daily Prompts:
        </Text>
        
        <PromptInput colors={colors} label="What's one thing you're excited to experience today?" value={excitedAbout} onChangeText={setExcitedAbout} placeholder="Something that makes you look forward to today..." />
        <PromptInput colors={colors} label="Share a small win you'd love to celebrate later." value={smallWin} onChangeText={setSmallWin} placeholder="A small victory or accomplishment..." />
        <PromptInput colors={colors} label="Who's someone making a positive difference in your life right now?" value={positivePerson} onChangeText={setPositivePerson} placeholder="Think about someone who brings light to your life..." />
        <PromptInput colors={colors} label="Recall a recent moment that makes you smile when you think of it." value={happyMoment} onChangeText={setHappyMoment} placeholder="A moment that brings instant joy..." />
        <PromptInput colors={colors} label="Name three little things adding joy to your day." value={threeLittleThings} onChangeText={setThreeLittleThings} placeholder={"1. Morning coffee\n2. A good song\n3. Sunny weather"} minHeight={100} />

        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 8 }}>
            Mini Night Reflection
          </Text>
          <Text style={{ fontSize: 14, color: colors.text, opacity: 0.7, fontStyle: "italic", marginBottom: 8 }}>
            Evening Close-Out
          </Text>
          <PromptInput colors={colors} label="What's one thing that went better than expected today?" value={nightReflection} onChangeText={setNightReflection} placeholder="A pleasant surprise from today..." />
        </View>

        <TouchableOpacity onPress={handleSaveGratitude} disabled={saveGratitudeMutation.isLoading} style={{ backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 8, alignItems: "center", flexDirection: "row", justifyContent: "center" }}>
          <Save size={16} color={colors.surface} />
          <Text style={{ color: colors.surface, fontWeight: "600", marginLeft: 8 }}>
            {saveGratitudeMutation.isLoading ? "Saving..." : "Save Gratitude Boost"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
