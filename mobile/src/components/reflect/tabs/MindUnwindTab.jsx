import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Save } from "lucide-react-native";
import { useThemeStore } from "@/utils/theme";

export const MindUnwindTab = ({
  journalContent,
  setJournalContent,
  handleSaveJournal,
  saveJournalMutation,
  selectedMood,
  moodNotes,
  setMoodNotes,
  moodOptions,
  handleMoodSelect,
}) => {
  const { currentTheme: colors } = useThemeStore();

  return (
    <View style={{ padding: 20 }}>
      {/* How are you feeling section */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: colors.text,
              marginBottom: 4,
            }}
          >
            How are you feeling?
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.text,
              opacity: 0.8,
              marginTop: 8,
            }}
          >
            Select the emoji that best represents your mood today.
          </Text>
        </View>

        {/* Mood Selection */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          {moodOptions.map((mood) => (
            <TouchableOpacity
              key={mood.value}
              onPress={() => handleMoodSelect(mood)}
              style={{
                alignItems: "center",
                padding: 12,
                borderRadius: 12,
                backgroundColor:
                  selectedMood?.value === mood.value
                    ? colors.primary
                    : colors.accent,
                flex: 1,
                marginHorizontal: 4,
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: 4 }}>
                {mood.emoji}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color:
                    selectedMood?.value === mood.value
                      ? colors.surface
                      : colors.text,
                  textAlign: "center",
                }}
              >
                {mood.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mood Notes */}
        {selectedMood && (
          <TextInput
            value={moodNotes}
            onChangeText={setMoodNotes}
            placeholder="What's contributing to this feeling? (optional)"
            placeholderTextColor={colors.text + "60"}
            multiline
            style={{
              borderWidth: 1,
              borderColor: colors.accent,
              borderRadius: 8,
              padding: 16,
              marginBottom: 20,
              minHeight: 80,
              fontSize: 16,
              textAlignVertical: "top",
              color: colors.text,
            }}
          />
        )}
      </View>

      {/* Journal Section */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: colors.text,
              marginBottom: 4,
            }}
          >
            Mind Unwind
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.text,
              opacity: 0.7,
              fontStyle: "italic",
            }}
          >
            Open Journal
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.text,
              opacity: 0.8,
              marginTop: 8,
            }}
          >
            A no-rules writing space for whatever's on your mind. Document your
            wins, process challenges, capture ideas — it's your private corner
            to reflect and release.
          </Text>
        </View>

        <TextInput
          value={journalContent}
          onChangeText={setJournalContent}
          placeholder="Write freely about your day...

What's on your mind? What happened today? What are you thinking about?

This is your space to process thoughts, celebrate wins, work through challenges, or capture ideas that come to you."
          placeholderTextColor={colors.text + "60"}
          multiline
          style={{
            borderWidth: 1,
            borderColor: colors.accent,
            borderRadius: 8,
            padding: 16,
            marginBottom: 20,
            minHeight: 250,
            fontSize: 16,
            textAlignVertical: "top",
            color: colors.text,
          }}
        />

        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            onPress={() => setJournalContent("")}
            style={{
              flex: 1,
              backgroundColor: colors.accent,
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.text, fontWeight: "600" }}>Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSaveJournal}
            disabled={saveJournalMutation.isLoading}
            style={{
              flex: 2,
              backgroundColor: colors.primary,
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Save size={16} color={colors.surface} />
            <Text
              style={{
                color: colors.surface,
                fontWeight: "600",
                marginLeft: 8,
              }}
            >
              {saveJournalMutation.isLoading ? "Saving..." : "Save Entry"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
