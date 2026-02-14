import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { loadContacts, toggleFollowUpStatus, updateFollowUpDate, updateFollowUpNote, removeFollowUp } from "../storage/contacts";
import { scheduleFollowUpNotification, cancelFollowUpNotification } from "../utils/notifications";
import ActionButton from "../components/ActionButton";
import CalendarPicker from "../components/CalendarPicker";
import ChipButton from "../components/ChipButton";

const avatarColors = [
  "#5A9BD5", "#F2A6C4", "#5BC4D6", "#F5CA7B",
  "#6BC4A0", "#EB9E9E", "#7BA3C9", "#88B8E0",
  "#5CBFA3", "#E8B87E", "#8EA8D8", "#D9A0B4",
];

function getAvatarColor(name) {
  const code = (name || "?").charCodeAt(0);
  return avatarColors[code % avatarColors.length];
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
}

export default function FollowUpDetailScreen() {
  const { contactId, followUpId } = useLocalSearchParams();
  const [contact, setContact] = useState(null);
  const [followUp, setFollowUp] = useState(null);
  const [editingNote, setEditingNote] = useState(false);
  const [draftNote, setDraftNote] = useState("");
  const [editingDate, setEditingDate] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  async function load() {
    const all = await loadContacts();
    const found = all.find((c) => c.id === contactId);
    if (found) {
      setContact(found);
      const fu = (found.followUps || []).find((f) => f.id === followUpId);
      setFollowUp(fu || null);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
      setEditingNote(false);
    }, [contactId, followUpId])
  );

  async function handleToggle() {
    if (!contact || !followUp) return;
    await toggleFollowUpStatus(contact.id, followUp.id);
    if (followUp.status === "open") {
      await cancelFollowUpNotification(contact.id, followUp.id);
    } else {
      await scheduleFollowUpNotification(contact.id, followUp.id, contact.name, followUp.date);
    }
    await load();
  }

  function startEditingNote() {
    setDraftNote(followUp?.note || "");
    setEditingNote(true);
  }

  async function saveNote() {
    if (!contact || !followUp) return;
    await updateFollowUpNote(contact.id, followUp.id, draftNote.trim());
    setEditingNote(false);
    await load();
  }

  function daysFromNow(n) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  }

  async function changeDate(newDate) {
    if (!contact || !followUp) return;
    await updateFollowUpDate(contact.id, followUp.id, newDate);
    if (followUp.status === "open") {
      await cancelFollowUpNotification(contact.id, followUp.id);
      await scheduleFollowUpNotification(contact.id, followUp.id, contact.name, newDate);
    }
    setEditingDate(false);
    setShowCalendar(false);
    await load();
  }

  if (!contact || !followUp) {
    return (
      <SafeAreaView style={{ flex: 1, padding: 20, backgroundColor: "#EDF4FB" }}>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#0F2B47" }}>
          Follow-up not found
        </Text>
        <ActionButton
          title="Back"
          variant="ghost"
          onPress={() => router.back()}
          style={{ marginTop: 12, alignSelf: "flex-start" }}
        />
      </SafeAreaView>
    );
  }

  const initial = contact.name?.charAt(0)?.toUpperCase() || "?";
  const avatarBg = getAvatarColor(contact.name);
  const isResolved = followUp.status === "resolved";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#EDF4FB" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View
          style={{
            backgroundColor: avatarBg,
            paddingTop: 20,
            paddingBottom: 32,
            paddingHorizontal: 20,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: "rgba(255,255,255,0.35)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
            }}
          >
            <Text style={{ color: "#FFF", fontSize: 24, fontWeight: "800" }}>
              {initial}
            </Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#FFFFFF" }}>
            {contact.name}
          </Text>
        </View>

        <View style={{ padding: 20, gap: 16, marginTop: -12 }}>
          {/* Follow-up detail card */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 20,
              gap: 16,
              shadowColor: "#7BA3C9",
              shadowOpacity: 0.1,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            {/* Date */}
            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontWeight: "700", fontSize: 13, color: "#9BBDD6" }}>Date</Text>
                {!editingDate && (
                  <Pressable onPress={() => setEditingDate(true)} hitSlop={8}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#1C6FBA" }}>Edit</Text>
                  </Pressable>
                )}
              </View>
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#1A3A5C" }}>
                {formatDate(followUp.date)}
              </Text>
              {editingDate && (
                <View style={{ gap: 10, marginTop: 4 }}>
                  <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                    <ChipButton label="+1 day" onPress={() => changeDate(daysFromNow(1))} />
                    <ChipButton label="+3 days" onPress={() => changeDate(daysFromNow(3))} />
                    <ChipButton label="+7 days" onPress={() => changeDate(daysFromNow(7))} />
                    <ChipButton label="+14 days" onPress={() => changeDate(daysFromNow(14))} />
                  </View>
                  {showCalendar ? (
                    <CalendarPicker
                      selected={followUp.date}
                      onSelect={changeDate}
                    />
                  ) : (
                    <Pressable onPress={() => setShowCalendar(true)} hitSlop={8}>
                      <Text style={{ fontSize: 13, fontWeight: "700", color: "#1C6FBA" }}>Pick from calendar</Text>
                    </Pressable>
                  )}
                  <Pressable onPress={() => { setEditingDate(false); setShowCalendar(false); }} hitSlop={8}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#9BBDD6" }}>Cancel</Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Status */}
            <View style={{ gap: 4 }}>
              <Text style={{ fontWeight: "700", fontSize: 13, color: "#9BBDD6" }}>Status</Text>
              <Pressable onPress={handleToggle} style={{ flexDirection: "row", alignItems: "center", gap: 10, alignSelf: "flex-start" }}>
                <View
                  style={{
                    width: 40,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: isResolved ? "#2E7D4F" : "#C5DDEF",
                    justifyContent: "center",
                    paddingHorizontal: 3,
                  }}
                >
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      backgroundColor: "#FFFFFF",
                      alignSelf: isResolved ? "flex-end" : "flex-start",
                    }}
                  />
                </View>
                <Text style={{ fontSize: 14, fontWeight: "700", color: isResolved ? "#2E7D4F" : "#1C6FBA" }}>
                  {isResolved ? "Resolved" : "Open"}
                </Text>
              </Pressable>
            </View>

            {/* Follow-up Notes */}
            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontWeight: "700", fontSize: 13, color: "#9BBDD6" }}>Follow-up Notes</Text>
                {!editingNote && (
                  <Pressable onPress={startEditingNote} hitSlop={8}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#1C6FBA" }}>Edit</Text>
                  </Pressable>
                )}
              </View>
              {editingNote ? (
                <View style={{ gap: 10 }}>
                  <TextInput
                    value={draftNote}
                    onChangeText={setDraftNote}
                    multiline
                    placeholder="Add follow-up notes..."
                    placeholderTextColor="#9BBDD6"
                    autoFocus
                    style={{
                      borderWidth: 1.5,
                      borderColor: "#C5DDEF",
                      padding: 14,
                      borderRadius: 16,
                      fontSize: 15,
                      color: "#1A3A5C",
                      backgroundColor: "#FFFFFF",
                      minHeight: 80,
                      textAlignVertical: "top",
                    }}
                  />
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <ActionButton title="Save" onPress={saveNote} style={{ flex: 1 }} />
                    <ActionButton title="Cancel" variant="ghost" onPress={() => setEditingNote(false)} style={{ flex: 1 }} />
                  </View>
                </View>
              ) : (
                <Text style={{ fontSize: 15, color: "#1A3A5C", lineHeight: 22 }}>
                  {followUp.note || "No follow-up notes"}
                </Text>
              )}
            </View>
          </View>

          {/* Actions */}
          <ActionButton
            title="View Contact Profile"
            variant="accent"
            onPress={() => router.push(`/contact/${contact.id}`)}
          />

          <ActionButton
            title="Delete"
            variant="destructive"
            onPress={() => {
              Alert.alert("Delete follow-up?", "This cannot be undone.", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: async () => {
                    await cancelFollowUpNotification(contact.id, followUp.id);
                    await removeFollowUp(contact.id, followUp.id);
                    router.replace("/follow-ups");
                  },
                },
              ]);
            }}
          />

          <ActionButton
            title="Back"
            variant="ghost"
            onPress={() => router.replace("/follow-ups")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
