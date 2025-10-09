import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  Dimensions,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { Plus, Trash2, ArrowLeft, Shuffle, Edit3 } from "lucide-react-native";
import useUpload from "@/utils/useUpload";
import useUser from "@/utils/auth/useUser";
import { useRequireAuth } from "@/utils/auth/useAuth";
import { useThemeStore } from "@/utils/theme";
import {
  useFonts,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";

const { width } = Dimensions.get("window");
const GRID_COLUMNS = 3;
const GRID_SPACING = 8;
const HORIZONTAL_PADDING = 16;
const TILE_SIZE =
  (width - HORIZONTAL_PADDING * 2 - GRID_SPACING * (GRID_COLUMNS - 1)) /
  GRID_COLUMNS;

export default function VisionBoard() {
  const insets = useSafeAreaInsets();
  const { currentTheme: colors } = useThemeStore();
  const queryClient = useQueryClient();
  const [upload, { loading: uploading }] = useUpload();
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [editingCaption, setEditingCaption] = useState(false);
  const [captionText, setCaptionText] = useState("");

  const { data: user, loading: userLoading } = useUser();

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
  });

  // Get user ID from auth
  const userId = user?.id;

  console.log("Vision Board - UserID:", userId);

  // Fetch vision photos
  const {
    data: photosData = { photos: [] },
    isLoading,
    error: photosError,
  } = useQuery({
    queryKey: ["vision-photos", userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      console.log(
        `Fetching photos for user ${userId} from: /api/vision-photos`,
      );

      const response = await fetch(`/api/vision-photos?userId=${userId}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Fetch photos failed:", response.status, errorText);
        throw new Error(`Failed to fetch photos: ${response.status}`);
      }

      const data = await response.json();
      console.log("Successfully fetched photos:", data);
      return data;
    },
    enabled: !!userId, // Only fetch if user is authenticated
    retry: 3,
  });

  // Add photo mutation
  const addPhotoMutation = useMutation({
    mutationFn: async ({ userId, imageUrl }) => {
      if (!imageUrl || !userId) {
        throw new Error("Image URL and User ID are required");
      }

      console.log("Adding photo with data:", { userId, imageUrl });

      const response = await fetch("/api/vision-photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, imageUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Add photo failed:", response.status, errorData);
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Photo added successfully:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vision-photos", userId] });
      Alert.alert("Success", "Photo added to your vision board!");
    },
    onError: (error) => {
      console.error("Add photo mutation error:", error);
      Alert.alert("Upload Error", error.message);
    },
  });

  // Delete photo mutation
  const deletePhotoMutation = useMutation({
    mutationFn: async ({ id, userId }) => {
      const response = await fetch(
        `/api/vision-photos?id=${id}&userId=${userId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to delete photo: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vision-photos", userId] });
      setShowFullScreen(false);
      setSelectedPhoto(null);
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  // Update caption mutation
  const updateCaptionMutation = useMutation({
    mutationFn: async ({ id, userId, caption }) => {
      const response = await fetch("/api/vision-photos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, userId, caption }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update caption: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vision-photos", userId] });
      setEditingCaption(false);
      setCaptionText("");
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const getTodaysQuote = () => {
    return "Create a life you're excited to wake up to";
  };

  const handleShuffle = useCallback(() => {
    if (photosData.photos.length === 0) return;
    const randomIndex = Math.floor(Math.random() * photosData.photos.length);
    const randomPhoto = photosData.photos[randomIndex];
    setSelectedPhoto(randomPhoto);
    setShowFullScreen(true);
  }, [photosData.photos]);

  const handleEditCaption = useCallback((photo) => {
    setCaptionText(photo.caption || "");
    setEditingCaption(true);
  }, []);

  const handleSaveCaption = useCallback(() => {
    if (selectedPhoto && userId) {
      updateCaptionMutation.mutate({
        id: selectedPhoto.id,
        userId,
        caption: captionText.trim(),
      });
    }
  }, [selectedPhoto, userId, captionText, updateCaptionMutation]);

  const handleAddPhoto = useCallback(async () => {
    try {
      if (!userId) {
        Alert.alert("Error", "Unable to determine user ID");
        return;
      }

      console.log("Starting photo upload for user:", userId);

      if (photosData.photos.length >= 15) {
        Alert.alert("Limit Reached", "You can upload up to 15 photos.");
        return;
      }

      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        console.log("Selected asset:", asset);

        const uploadResult = await upload({
          reactNativeAsset: asset,
        });

        console.log("Upload result:", uploadResult);

        if (uploadResult.error) {
          Alert.alert("Upload Error", uploadResult.error);
          return;
        }

        if (!uploadResult.url) {
          Alert.alert("Upload Error", "No image URL returned from upload");
          return;
        }

        console.log("Adding photo to database...");
        addPhotoMutation.mutate({ userId, imageUrl: uploadResult.url });
      }
    } catch (error) {
      console.error("Photo upload error:", error);
      Alert.alert("Upload Error", error.message || "Failed to upload photo");
    }
  }, [photosData.photos.length, userId, upload, addPhotoMutation]);

  const handlePhotoLongPress = useCallback(
    (photo) => {
      Alert.alert(
        "Photo Options",
        "What would you like to do with this photo?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deletePhotoMutation.mutate({ id: photo.id, userId }),
          },
        ],
      );
    },
    [userId, deletePhotoMutation],
  );

  const handlePhotoPress = useCallback((photo) => {
    setSelectedPhoto(photo);
    setShowFullScreen(true);
  }, []);

  const renderPhoto = ({ item, index }) => {
    const isInLastColumn = index % GRID_COLUMNS === GRID_COLUMNS - 1;
    const marginRight = isInLastColumn ? 0 : GRID_SPACING;

    return (
      <View
        style={{
          width: TILE_SIZE,
          marginRight: marginRight,
          marginBottom: GRID_SPACING,
        }}
      >
        <Pressable
          onPress={() => handlePhotoPress(item)}
          onLongPress={() => handlePhotoLongPress(item)}
          style={{
            width: TILE_SIZE,
            height: TILE_SIZE,
            borderRadius: 8,
            overflow: "hidden",
            backgroundColor: "#f8f9fa",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <Image
            source={{ uri: item.image_url }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={200}
          />
        </Pressable>
        {item.caption && (
          <Text
            style={{
              fontSize: 11,
              color: colors.text,
              opacity: 0.8,
              textAlign: "center",
              marginTop: 4,
              lineHeight: 14,
              fontWeight: "500",
            }}
            numberOfLines={2}
          >
            {item.caption}
          </Text>
        )}
      </View>
    );
  };

  const EmptyState = () => (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          color: colors.text,
          opacity: 0.7,
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        Add up to 15 photos that inspire you.
      </Text>
      <TouchableOpacity
        onPress={handleAddPhoto}
        disabled={uploading || !userId}
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
          flexDirection: "row",
          alignItems: "center",
          opacity: !userId ? 0.6 : 1,
        }}
      >
        <Plus size={20} color={colors.surface} />
        <Text
          style={{
            color: colors.surface,
            fontWeight: "600",
            marginLeft: 8,
          }}
        >
          {uploading ? "Uploading..." : "Add Photo"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
          paddingTop: insets.top,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 16 }}>Loading...</Text>
      </View>
    );
  }

  // Show error if there's a photos error
  if (photosError) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingHorizontal: 20,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 18,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Unable to load your vision board
        </Text>
        <Text
          style={{
            color: colors.text,
            opacity: 0.7,
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          {photosError.message || "Please check your connection and try again"}
        </Text>
        <TouchableOpacity
          onPress={() => {
            console.log("Retrying photos fetch...");
            queryClient.invalidateQueries({
              queryKey: ["vision-photos", userId],
            });
          }}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: colors.surface, fontWeight: "600" }}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // At this point, user should be authenticated (handled by app entry point)
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top,
      }}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          backgroundColor: colors.surface,
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.accent,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: colors.text,
            fontFamily: "PlayfairDisplay_700Bold",
          }}
        >
          My Vision Board
        </Text>
      </View>

      {/* Motivational Quote */}
      <View
        style={{
          backgroundColor: colors.primary + "10",
          marginHorizontal: 16,
          marginBottom: 16,
          borderRadius: 12,
          padding: 16,
          borderLeftWidth: 4,
          borderLeftColor: colors.primary,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: colors.text,
            fontStyle: "italic",
            textAlign: "center",
            lineHeight: 22,
            fontWeight: "500",
          }}
        >
          "{getTodaysQuote()}"
        </Text>
      </View>

      {/* Header Card */}
      <View
        style={{
          backgroundColor: colors.surface,
          margin: 16,
          borderRadius: 12,
          padding: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 4,
                fontFamily: "PlayfairDisplay_700Bold",
              }}
            >
              My Vision Board
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.text,
                opacity: 0.7,
              }}
            >
              {photosData.photos.length}/15 photos
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            {photosData.photos.length > 0 && (
              <TouchableOpacity
                onPress={handleShuffle}
                style={{
                  backgroundColor: colors.accent,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Shuffle size={16} color={colors.primary} />
                <Text
                  style={{
                    color: colors.primary,
                    fontWeight: "600",
                    marginLeft: 6,
                    fontSize: 14,
                  }}
                >
                  Shuffle
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleAddPhoto}
              disabled={uploading || photosData.photos.length >= 15}
              style={{
                backgroundColor:
                  uploading || photosData.photos.length >= 15
                    ? colors.accent
                    : colors.primary,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Plus size={16} color={colors.surface} />
              <Text
                style={{
                  color: colors.surface,
                  fontWeight: "600",
                  marginLeft: 6,
                  fontSize: 14,
                }}
              >
                {uploading ? "Uploading..." : "Add Photo"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Photo Grid */}
      {photosData.photos.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={photosData.photos}
          renderItem={renderPhoto}
          numColumns={GRID_COLUMNS}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{
            paddingHorizontal: HORIZONTAL_PADDING,
            paddingBottom: insets.bottom + 20,
          }}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Full Screen Photo Modal */}
      <Modal
        visible={showFullScreen}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFullScreen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              position: "absolute",
              top: insets.top + 20,
              left: 20,
              right: 20,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              zIndex: 1,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setShowFullScreen(false);
                setEditingCaption(false);
                setCaptionText("");
              }}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: 20,
                padding: 8,
              }}
            >
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  if (selectedPhoto) {
                    handleEditCaption(selectedPhoto);
                  }
                }}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: 20,
                  padding: 8,
                }}
              >
                <Edit3 size={24} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (selectedPhoto && userId) {
                    Alert.alert(
                      "Delete Photo",
                      "Are you sure you want to delete this photo?",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () =>
                            deletePhotoMutation.mutate({
                              id: selectedPhoto.id,
                              userId,
                            }),
                        },
                      ],
                    );
                  }
                }}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: 20,
                  padding: 8,
                }}
              >
                <Trash2 size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {selectedPhoto && (
            <View style={{ alignItems: "center" }}>
              <Image
                source={{ uri: selectedPhoto.image_url }}
                style={{
                  width: width - 40,
                  height: width - 40,
                  borderRadius: 12,
                }}
                contentFit="contain"
                transition={200}
              />

              {selectedPhoto.caption && !editingCaption && (
                <View
                  style={{
                    position: "absolute",
                    bottom: 20,
                    left: 20,
                    right: 20,
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    borderRadius: 8,
                    padding: 12,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 16,
                      textAlign: "center",
                      fontWeight: "500",
                    }}
                  >
                    {selectedPhoto.caption}
                  </Text>
                </View>
              )}
            </View>
          )}

          {editingCaption && (
            <View
              style={{
                position: "absolute",
                bottom: insets.bottom + 40,
                left: 20,
                right: 20,
                backgroundColor: "rgba(0, 0, 0, 0.9)",
                borderRadius: 12,
                padding: 20,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "600",
                  marginBottom: 12,
                  textAlign: "center",
                }}
              >
                Edit Caption
              </Text>
              <TextInput
                value={captionText}
                onChangeText={setCaptionText}
                placeholder="Add a caption (e.g., Dream Car, Paris Trip)"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 8,
                  padding: 12,
                  color: "#fff",
                  fontSize: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.3)",
                }}
                multiline
                maxLength={50}
                autoFocus
              />
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  onPress={() => {
                    setEditingCaption(false);
                    setCaptionText("");
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: 8,
                    padding: 12,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "600",
                      fontSize: 16,
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveCaption}
                  disabled={updateCaptionMutation.isLoading}
                  style={{
                    flex: 1,
                    backgroundColor: colors.primary,
                    borderRadius: 8,
                    padding: 12,
                    alignItems: "center",
                    opacity: updateCaptionMutation.isLoading ? 0.6 : 1,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "600",
                      fontSize: 16,
                    }}
                  >
                    {updateCaptionMutation.isLoading ? "Saving..." : "Save"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}
