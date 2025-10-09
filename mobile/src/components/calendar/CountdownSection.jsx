import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { Clock, Plus, Edit3, Trash2, Calendar } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeStore } from "../../utils/theme";
import { COLOR_OPTIONS } from "../../utils/calendarConstants";
import { format, differenceInDays, parseISO } from "date-fns";

const CountdownCard = ({ countdown, onEdit, onDelete }) => {
  const { currentTheme: colors } = useThemeStore();
  const targetDate = parseISO(countdown.target_date);
  const today = new Date();
  const daysLeft = differenceInDays(targetDate, today);

  const isPast = daysLeft < 0;
  const isToday = daysLeft === 0;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: countdown.color,
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
          alignItems: "flex-start",
        }}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            {countdown.emoji ? (
              <Text style={{ fontSize: 24, marginRight: 8 }}>
                {countdown.emoji}
              </Text>
            ) : null}
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: colors.text,
                flex: 1,
              }}
            >
              {countdown.title}
            </Text>
          </View>

          {countdown.description ? (
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                marginBottom: 8,
              }}
            >
              {countdown.description}
            </Text>
          ) : null}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Calendar size={14} color={colors.textSecondary} />
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                marginLeft: 6,
              }}
            >
              {format(targetDate, "EEEE, MMMM do, yyyy")}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: isPast
                ? "#FFE5E5"
                : isToday
                  ? "#E8F5E8"
                  : countdown.color + "20",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 12,
              alignSelf: "flex-start",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: isPast
                  ? "#DC3545"
                  : isToday
                    ? "#22C55E"
                    : countdown.color,
              }}
            >
              {isPast
                ? `${Math.abs(daysLeft)} days ago`
                : isToday
                  ? "Today! 🎉"
                  : `${daysLeft} days to go`}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => onEdit(countdown)}
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: colors.accent,
            }}
          >
            <Edit3 size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDelete(countdown)}
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: "#FFE5E5",
            }}
          >
            <Trash2 size={16} color="#DC3545" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const CountdownModal = ({ visible, onClose, onSubmit, editingCountdown }) => {
  const insets = useSafeAreaInsets();
  const { currentTheme: colors } = useThemeStore();

  const [title, setTitle] = useState(editingCountdown?.title || "");
  const [description, setDescription] = useState(
    editingCountdown?.description || "",
  );
  const [targetDate, setTargetDate] = useState(
    editingCountdown?.target_date
      ? format(parseISO(editingCountdown.target_date), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd"),
  );
  const [selectedEmoji, setSelectedEmoji] = useState(
    editingCountdown?.emoji || "",
  );
  const [selectedColor, setSelectedColor] = useState(
    editingCountdown?.color || COLOR_OPTIONS[0].value,
  );

  React.useEffect(() => {
    if (editingCountdown) {
      setTitle(editingCountdown.title);
      setDescription(editingCountdown.description || "");
      setTargetDate(
        format(parseISO(editingCountdown.target_date), "yyyy-MM-dd"),
      );
      setSelectedEmoji(editingCountdown.emoji || "");
      setSelectedColor(editingCountdown.color);
    } else {
      setTitle("");
      setDescription("");
      setTargetDate(format(new Date(), "yyyy-MM-dd"));
      setSelectedEmoji("");
      setSelectedColor(COLOR_OPTIONS[0].value);
    }
  }, [editingCountdown, visible]);

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    if (!targetDate) {
      Alert.alert("Error", "Please select a date");
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      target_date: targetDate,
      emoji: selectedEmoji.trim(),
      color: selectedColor,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setTargetDate(format(new Date(), "yyyy-MM-dd"));
    setSelectedEmoji("");
    setSelectedColor(COLOR_OPTIONS[0].value);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            paddingBottom: insets.bottom + 20,
            maxHeight: "90%",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: colors.text,
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            {editingCountdown ? "Edit Countdown" : "New Countdown"}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Title */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 8,
              }}
            >
              Title
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Summer Vacation"
              style={{
                borderWidth: 1,
                borderColor: colors.accent,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: colors.text,
                backgroundColor: colors.background,
                marginBottom: 16,
              }}
              placeholderTextColor={colors.textSecondary}
            />

            {/* Description */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 8,
              }}
            >
              Description (Optional)
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. Beach trip to Hawaii"
              multiline
              numberOfLines={3}
              style={{
                borderWidth: 1,
                borderColor: colors.accent,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: colors.text,
                backgroundColor: colors.background,
                marginBottom: 16,
                textAlignVertical: "top",
              }}
              placeholderTextColor={colors.textSecondary}
            />

            {/* Target Date */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 8,
              }}
            >
              Target Date
            </Text>
            <TextInput
              value={targetDate}
              onChangeText={setTargetDate}
              placeholder="YYYY-MM-DD"
              style={{
                borderWidth: 1,
                borderColor: colors.accent,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: colors.text,
                backgroundColor: colors.background,
                marginBottom: 16,
              }}
              placeholderTextColor={colors.textSecondary}
            />

            {/* Emoji Selection (Optional) */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 8,
              }}
            >
              Add Emoji (Optional)
            </Text>
            <TextInput
              value={selectedEmoji}
              onChangeText={setSelectedEmoji}
              placeholder="e.g. 🎉 (or leave blank)"
              style={{
                borderWidth: 1,
                borderColor: colors.accent,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: colors.text,
                backgroundColor: colors.background,
                marginBottom: 16,
              }}
              placeholderTextColor={colors.textSecondary}
              maxLength={4}
            />

            {/* Color Selection */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 8,
              }}
            >
              Choose a Color
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 24,
              }}
            >
              {COLOR_OPTIONS.map((color) => (
                <TouchableOpacity
                  key={color.value}
                  onPress={() => setSelectedColor(color.value)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: color.value,
                    borderWidth: selectedColor === color.value ? 3 : 0,
                    borderColor: colors.text,
                  }}
                />
              ))}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                paddingVertical: 16,
                borderRadius: 12,
                backgroundColor: colors.accent,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.textSecondary,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              style={{
                flex: 1,
                paddingVertical: 16,
                borderRadius: 12,
                backgroundColor: selectedColor,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#FFFFFF",
                }}
              >
                {editingCountdown ? "Update" : "Create"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function CountdownSection({
  countdowns,
  onAddCountdown,
  onEditCountdown,
  onDeleteCountdown,
}) {
  const { currentTheme: colors } = useThemeStore();
  const [showModal, setShowModal] = useState(false);
  const [editingCountdown, setEditingCountdown] = useState(null);

  const handleAddNew = () => {
    setEditingCountdown(null);
    setShowModal(true);
  };

  const handleEdit = (countdown) => {
    setEditingCountdown(countdown);
    setShowModal(true);
  };

  const handleDelete = (countdown) => {
    Alert.alert(
      "Delete Countdown",
      `Are you sure you want to delete "${countdown.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDeleteCountdown(countdown),
        },
      ],
    );
  };

  const handleSubmit = (countdownData) => {
    if (editingCountdown) {
      onEditCountdown({ ...countdownData, id: editingCountdown.id });
    } else {
      onAddCountdown(countdownData);
    }
    setShowModal(false);
    setEditingCountdown(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCountdown(null);
  };

  return (
    <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Clock size={20} color={colors.primary} />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: colors.text,
              marginLeft: 8,
            }}
          >
            Countdowns
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleAddNew}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Plus size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Countdown Cards */}
      {countdowns.length === 0 ? (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 20,
            alignItems: "center",
            borderStyle: "dashed",
            borderWidth: 2,
            borderColor: colors.accent,
          }}
        >
          <Clock size={48} color={colors.textSecondary} />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: colors.text,
              marginTop: 12,
              marginBottom: 4,
            }}
          >
            No countdowns yet
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Add countdowns for holidays, birthdays, or special events
          </Text>
          <TouchableOpacity
            onPress={handleAddNew}
            style={{
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: colors.primary,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontWeight: "600",
                fontSize: 14,
              }}
            >
              Add Your First Countdown
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        countdowns.map((countdown) => (
          <CountdownCard
            key={countdown.id}
            countdown={countdown}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))
      )}

      {/* Modal */}
      <CountdownModal
        visible={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingCountdown={editingCountdown}
      />
    </View>
  );
}
