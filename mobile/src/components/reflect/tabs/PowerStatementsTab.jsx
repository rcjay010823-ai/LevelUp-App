import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Plus, Trash2, Shuffle } from "lucide-react-native";
import { useThemeStore } from "@/utils/theme";

export const PowerStatementsTab = ({
  affirmationsData,
  newAffirmation,
  setNewAffirmation,
  currentLibraryAffirmation,
  affirmationLibrary,
  handleAddAffirmation,
  handleDeleteAffirmation,
  handleShuffleAffirmation,
  handleSelectAffirmation,
  addAffirmationMutation,
}) => {
  const { currentTheme: colors } = useThemeStore();

  return (
    <View style={{ padding: 20 }}>
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
            Power Statements
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.text,
              opacity: 0.7,
              fontStyle: "italic",
            }}
          >
            Affirmations
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.text,
              opacity: 0.8,
              marginTop: 8,
            }}
          >
            Choose from our curated library of 10 uplifting affirmations that
            you can shuffle through anytime — or create your own personal
            statements for a tailored boost.
          </Text>
        </View>

        <View
          style={{
            backgroundColor: colors.primary + "20",
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <Text
              style={{ fontSize: 16, fontWeight: "600", color: colors.text }}
            >
              Library Affirmation
            </Text>
            <TouchableOpacity
              onPress={handleShuffleAffirmation}
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Shuffle size={16} color={colors.surface} />
              <Text
                style={{
                  color: colors.surface,
                  fontWeight: "600",
                  marginLeft: 6,
                  fontSize: 14,
                }}
              >
                Shuffle
              </Text>
            </TouchableOpacity>
          </View>
          <Text
            style={{
              fontSize: 16,
              color: colors.text,
              lineHeight: 24,
              textAlign: "center",
              fontStyle: "italic",
              marginBottom: 16,
            }}
          >
            "{affirmationLibrary[currentLibraryAffirmation]}"
          </Text>
          <TouchableOpacity
            onPress={() =>
              handleSelectAffirmation(
                affirmationLibrary[currentLibraryAffirmation],
                "library",
              )
            }
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 8,
              alignItems: "center",
              alignSelf: "center",
            }}
          >
            <Text
              style={{ color: colors.surface, fontWeight: "600", fontSize: 16 }}
            >
              Select This Statement
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: colors.text,
            marginBottom: 16,
          }}
        >
          Create Your Own
        </Text>
        <View style={{ flexDirection: "row", marginBottom: 20, gap: 12 }}>
          <TextInput
            value={newAffirmation}
            onChangeText={setNewAffirmation}
            placeholder="Write your personal affirmation..."
            placeholderTextColor={colors.text + "60"}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: colors.accent,
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              color: colors.text,
            }}
          />
          <TouchableOpacity
            onPress={handleAddAffirmation}
            disabled={
              addAffirmationMutation.isLoading || !newAffirmation.trim()
            }
            style={{
              backgroundColor: newAffirmation.trim()
                ? colors.primary
                : colors.accent,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Plus size={20} color={colors.surface} />
          </TouchableOpacity>
        </View>

        {affirmationsData.affirmations.length === 0 ? (
          <Text
            style={{
              fontSize: 14,
              color: colors.text,
              opacity: 0.7,
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            Add your first personal affirmation for today
          </Text>
        ) : (
          <View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: colors.text,
                opacity: 0.8,
                marginBottom: 12,
              }}
            >
              Your Personal Affirmations:
            </Text>
            {affirmationsData.affirmations.map((affirmation) => (
              <View
                key={affirmation.id}
                style={{
                  backgroundColor: colors.primary + "20",
                  borderRadius: 8,
                  marginBottom: 8,
                  padding: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: colors.text,
                    marginBottom: 12,
                    lineHeight: 22,
                  }}
                >
                  {affirmation.text}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() =>
                      handleSelectAffirmation(affirmation.text, "custom")
                    }
                    style={{
                      backgroundColor: colors.primary,
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: 6,
                      flex: 1,
                      marginRight: 8,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: colors.surface,
                        fontWeight: "600",
                        fontSize: 14,
                      }}
                    >
                      Select
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteAffirmation(affirmation.id)}
                    style={{ padding: 8 }}
                  >
                    <Trash2 size={16} color="#dc3545" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};
