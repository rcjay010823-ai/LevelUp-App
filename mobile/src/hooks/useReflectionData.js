import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Alert } from "react-native";

// Curated affirmation library
const affirmationLibrary = [
  "I am building a life I'm excited to wake up to.",
  "My worth isn't defined by anyone else's opinion.",
  "I attract opportunities that align with my goals.",
  "I choose progress over perfection every day.",
  "I trust myself to make decisions that feel right for me.",
  "I deserve the love, respect, and kindness I give to others.",
  "I'm capable of handling whatever today brings.",
  "I am proud of how far I've come and excited for what's next.",
  "I radiate confidence, even on days I feel unsure.",
  "I'm creating space for joy, success, and meaningful connections.",
];

export const useReflectionData = (userId) => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Gratitude form state
  const [excitedAbout, setExcitedAbout] = useState("");
  const [smallWin, setSmallWin] = useState("");
  const [positivePerson, setPositivePerson] = useState("");
  const [happyMoment, setHappyMoment] = useState("");
  const [threeLittleThings, setThreeLittleThings] = useState("");
  const [nightReflection, setNightReflection] = useState("");

  // Journal form state
  const [journalContent, setJournalContent] = useState("");

  // Mood form state
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodNotes, setMoodNotes] = useState("");

  // Affirmation form state
  const [newAffirmation, setNewAffirmation] = useState("");
  const [currentLibraryAffirmation, setCurrentLibraryAffirmation] = useState(0);

  const selectedDateStr = useMemo(
    () => format(selectedDate, "yyyy-MM-dd"),
    [selectedDate],
  );

  // Mood options
  const moodOptions = [
    { value: 5, emoji: "😄", label: "Amazing" },
    { value: 4, emoji: "😊", label: "Good" },
    { value: 3, emoji: "😐", label: "Okay" },
    { value: 2, emoji: "😔", label: "Not Great" },
    { value: 1, emoji: "😞", label: "Tough" },
  ];

  // Fetch user settings
  const { data: userSettings } = useQuery({
    queryKey: ["userSettings", userId],
    queryFn: async () => {
      const response = await fetch(`/api/user-settings?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user settings");
      return response.json();
    },
  });

  // Timezone helpers
  const getDisplayTimezone = useCallback(() => {
    const timezone = userSettings?.settings?.user_timezone;
    if (!timezone || timezone === "device") {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return timezone;
  }, [userSettings]);

  const formatDateWithTimezone = useCallback(
    (date, formatStr) => {
      // For mobile, we'll use simpler formatting since date-fns-tz isn't available
      // This is a simplified approach - in a real app you might want a more robust solution
      try {
        if (formatStr === "h:mm a") {
          return new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            timeZone: getDisplayTimezone(),
          }).format(date);
        } else if (formatStr === "EEEE, MMMM d, yyyy") {
          return new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: getDisplayTimezone(),
          }).format(date);
        } else {
          // Fallback to regular format
          return format(date, formatStr);
        }
      } catch (error) {
        // Fallback to regular format if timezone is invalid
        return format(date, formatStr);
      }
    },
    [getDisplayTimezone],
  );

  // Data fetching
  const { data: gratitudeData } = useQuery({
    queryKey: ["gratitude", userId, selectedDateStr],
    queryFn: async () => {
      const response = await fetch(
        `/api/gratitude?userId=${userId}&date=${selectedDateStr}`,
      );
      if (!response.ok) throw new Error("Failed to fetch gratitude entry");
      return response.json();
    },
  });

  const { data: journalData } = useQuery({
    queryKey: ["journal", userId, selectedDateStr],
    queryFn: async () => {
      const response = await fetch(
        `/api/journal?userId=${userId}&date=${selectedDateStr}`,
      );
      if (!response.ok) throw new Error("Failed to fetch journal entry");
      return response.json();
    },
  });

  // Fetch mood data
  const { data: moodData } = useQuery({
    queryKey: ["mood", userId, selectedDateStr],
    queryFn: async () => {
      const response = await fetch(
        `/api/mood?userId=${userId}&date=${selectedDateStr}`,
      );
      if (!response.ok) throw new Error("Failed to fetch mood entry");
      return response.json();
    },
  });

  const { data: affirmationsData = { affirmations: [] } } = useQuery({
    queryKey: ["affirmations", userId, selectedDateStr],
    queryFn: async () => {
      const response = await fetch(
        `/api/affirmations?userId=${userId}&date=${selectedDateStr}`,
      );
      if (!response.ok) throw new Error("Failed to fetch affirmations");
      return response.json();
    },
  });

  // Update form state when data changes
  useEffect(() => {
    if (gratitudeData?.entry) {
      setExcitedAbout(gratitudeData.entry.looking_forward || "");
      setSmallWin(gratitudeData.entry.relationships_grateful_for || "");
      setPositivePerson(gratitudeData.entry.three_gratitudes || "");
      setHappyMoment("");
      setThreeLittleThings("");
      setNightReflection("");
    } else {
      setExcitedAbout("");
      setSmallWin("");
      setPositivePerson("");
      setHappyMoment("");
      setThreeLittleThings("");
      setNightReflection("");
    }
  }, [gratitudeData]);

  useEffect(() => {
    setJournalContent(journalData?.entry?.content || "");
  }, [journalData]);

  useEffect(() => {
    if (moodData?.entry) {
      setSelectedMood({
        value: moodData.entry.mood_value,
        emoji: moodData.entry.mood_emoji,
        label:
          moodOptions.find((m) => m.value === moodData.entry.mood_value)
            ?.label || "",
      });
      setMoodNotes(moodData.entry.notes || "");
    } else {
      setSelectedMood(null);
      setMoodNotes("");
    }
  }, [moodData]);

  // Mutations
  const saveGratitudeMutation = useMutation({
    mutationFn: (data) =>
      fetch("/api/gratitude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to save");
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["gratitude", userId, selectedDateStr],
      });
      Alert.alert("Success", "Gratitude entry saved!");
    },
    onError: () => Alert.alert("Error", "Failed to save gratitude entry"),
  });

  const saveJournalMutation = useMutation({
    mutationFn: (data) =>
      fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to save");
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["journal", userId, selectedDateStr],
      });
      Alert.alert("Success", "Journal entry saved!");
    },
    onError: () => Alert.alert("Error", "Failed to save journal entry"),
  });

  // Mood mutation
  const saveMoodMutation = useMutation({
    mutationFn: (data) =>
      fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to save");
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["mood", userId, selectedDateStr],
      });
      Alert.alert("Success", "Mood saved!");
    },
    onError: () => Alert.alert("Error", "Failed to save mood"),
  });

  const addAffirmationMutation = useMutation({
    mutationFn: (data) =>
      fetch("/api/affirmations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to add");
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["affirmations", userId, selectedDateStr],
      });
      setNewAffirmation("");
    },
    onError: () => Alert.alert("Error", "Failed to add affirmation"),
  });

  const deleteAffirmationMutation = useMutation({
    mutationFn: ({ id }) =>
      fetch(`/api/affirmations?id=${id}&userId=${userId}`, {
        method: "DELETE",
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to delete");
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["affirmations", userId, selectedDateStr],
      });
    },
    onError: () => Alert.alert("Error", "Failed to delete affirmation"),
  });

  const setActiveAffirmationMutation = useMutation({
    mutationFn: ({ text, source }) =>
      fetch("/api/user-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          activeAffirmationText: text,
          activeAffirmationSource: source,
        }),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to set");
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSettings", userId] });
      Alert.alert("Success", "Power Statement selected!");
    },
    onError: () => Alert.alert("Error", "Failed to set active affirmation"),
  });

  // Handlers
  const handleSaveGratitude = useCallback(() => {
    saveGratitudeMutation.mutate({
      userId,
      date: selectedDateStr,
      lookingForward: excitedAbout,
      relationshipsGratefulFor: smallWin,
      threeGratitudes: positivePerson,
    });
  }, [
    userId,
    selectedDateStr,
    excitedAbout,
    smallWin,
    positivePerson,
    saveGratitudeMutation,
  ]);

  const handleSaveJournal = useCallback(() => {
    saveMoodMutation.mutate({
      userId,
      date: selectedDateStr,
      moodValue: selectedMood?.value,
      moodEmoji: selectedMood?.emoji,
      notes: moodNotes,
    });

    saveJournalMutation.mutate({
      userId,
      date: selectedDateStr,
      content: journalContent,
    });
  }, [
    userId,
    selectedDateStr,
    journalContent,
    selectedMood,
    moodNotes,
    saveJournalMutation,
    saveMoodMutation,
  ]);

  const handleMoodSelect = useCallback((mood) => {
    setSelectedMood(mood);
  }, []);

  const handleAddAffirmation = useCallback(() => {
    if (newAffirmation.trim()) {
      addAffirmationMutation.mutate({
        userId,
        date: selectedDateStr,
        text: newAffirmation.trim(),
      });
    }
  }, [userId, selectedDateStr, newAffirmation, addAffirmationMutation]);

  const handleDeleteAffirmation = useCallback(
    (id) => {
      Alert.alert("Delete Affirmation", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteAffirmationMutation.mutate({ id }),
        },
      ]);
    },
    [deleteAffirmationMutation],
  );

  const handleSelectAffirmation = useCallback(
    (text, source) => {
      setActiveAffirmationMutation.mutate({ text, source });
    },
    [setActiveAffirmationMutation],
  );

  const handleShuffleAffirmation = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * affirmationLibrary.length);
    setCurrentLibraryAffirmation(randomIndex);
  }, []);

  return {
    selectedDate,
    setSelectedDate,
    userSettings,
    getDisplayTimezone,
    formatDateWithTimezone,

    // Gratitude
    excitedAbout,
    setExcitedAbout,
    smallWin,
    setSmallWin,
    positivePerson,
    setPositivePerson,
    happyMoment,
    setHappyMoment,
    threeLittleThings,
    setThreeLittleThings,
    nightReflection,
    setNightReflection,
    handleSaveGratitude,
    saveGratitudeMutation,

    // Journal
    journalContent,
    setJournalContent,
    handleSaveJournal,
    saveJournalMutation,

    // Mood
    selectedMood,
    setSelectedMood,
    moodNotes,
    setMoodNotes,
    moodOptions,
    moodData,
    handleMoodSelect,
    saveMoodMutation,

    // Affirmations
    affirmationsData,
    newAffirmation,
    setNewAffirmation,
    currentLibraryAffirmation,
    affirmationLibrary,
    handleAddAffirmation,
    handleDeleteAffirmation,
    handleSelectAffirmation,
    handleShuffleAffirmation,
    addAffirmationMutation,
  };
};
