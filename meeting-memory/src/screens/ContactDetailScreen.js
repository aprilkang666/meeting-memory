import * as Linking from "expo-linking";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createFollowUpEvent, deleteContact, loadContacts, updateContact } from "../storage/contacts";
import ActionButton from "../components/ActionButton";
import ChipButton from "../components/ChipButton";
import FollowUpEventRow from "../components/FollowUpEventRow";
import { scheduleFollowUpNotification, cancelFollowUpNotification, cancelAllFollowUpsForContact } from "../utils/notifications";


const avatarColors = [
  "#5A9BD5", "#F2A6C4", "#5BC4D6", "#F5CA7B",
  "#6BC4A0", "#EB9E9E", "#7BA3C9", "#88B8E0",
  "#5CBFA3", "#E8B87E", "#8EA8D8", "#D9A0B4",
];
function getAvatarColor(name) {
  const code = (name || "?").charCodeAt(0);
  return avatarColors[code % avatarColors.length];
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const inputStyle = {
  borderWidth: 1.5,
  borderColor: "#C5DDEF",
  padding: 14,
  borderRadius: 16,
  fontSize: 15,
  color: "#1A3A5C",
  backgroundColor: "#FFFFFF",
};

export default function ContactDetailScreen() {
  const { id } = useLocalSearchParams();
  const [contact, setContact] = useState(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [draftNotes, setDraftNotes] = useState("");
  const [followUpNote, setFollowUpNote] = useState("");

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const all = await loadContacts();
        const found = all.find((c) => c.id === id);
        setContact(found || null);
      })();
    }, [id])
  );

  function startEditingNotes() {
    setDraftNotes(contact?.notes || "");
    setEditingNotes(true);
  }

  async function saveNotes() {
    if (!contact) return;
    const updated = { ...contact, notes: draftNotes.trim() };
    await updateContact(updated);
    setContact(updated);
    setEditingNotes(false);
  }

  async function addNewFollowUp(dateStr) {
    if (!contact) return;
    const fu = createFollowUpEvent(dateStr, followUpNote.trim());
    const updated = { ...contact, followUps: [...(contact.followUps || []), fu] };
    await updateContact(updated);
    await scheduleFollowUpNotification(contact.id, fu.id, contact.name, fu.date);
    setContact(updated);
    setFollowUpNote("");
  }

  async function toggleFollowUp(followUpId) {
    if (!contact) return;
    const updatedFollowUps = (contact.followUps || []).map((fu) => {
      if (fu.id !== followUpId) return fu;
      return { ...fu, status: fu.status === "open" ? "resolved" : "open" };
    });
    const updated = { ...contact, followUps: updatedFollowUps };
    await updateContact(updated);

    const toggledFu = updatedFollowUps.find((fu) => fu.id === followUpId);
    if (toggledFu.status === "resolved") {
      await cancelFollowUpNotification(contact.id, followUpId);
    } else {
      await scheduleFollowUpNotification(contact.id, followUpId, contact.name, toggledFu.date);
    }
    setContact(updated);
  }

  async function deleteFollowUp(followUpId) {
    if (!contact) return;
    await cancelFollowUpNotification(contact.id, followUpId);
    const updatedFollowUps = (contact.followUps || []).filter((fu) => fu.id !== followUpId);
    const updated = { ...contact, followUps: updatedFollowUps };
    await updateContact(updated);
    setContact(updated);
  }

  async function onDelete() {
    if (!contact) return;
    Alert.alert("Delete contact?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await cancelAllFollowUpsForContact(contact.id, contact.followUps);
          await deleteContact(contact.id);
          router.back();
        },
      },
    ]);
  }

  if (!contact) {
    return (
      <SafeAreaView style={{ flex: 1, padding: 20, backgroundColor: "#EDF4FB" }}>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#0F2B47" }}>
          Contact not found
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

  const sortedFollowUps = [...(contact.followUps || [])].sort((a, b) => {
    if (a.status !== b.status) return a.status === "open" ? -1 : 1;
    return a.date.localeCompare(b.date);
  });

  const initial = contact.name?.charAt(0)?.toUpperCase() || "?";
  const avatarBg = getAvatarColor(contact.name);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#EDF4FB" }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile header */}
        <View
          style={{
            backgroundColor: avatarBg,
            paddingTop: 20,
            paddingBottom: 40,
            paddingHorizontal: 20,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: "rgba(255,255,255,0.35)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "#FFF", fontSize: 32, fontWeight: "800" }}>
              {initial}
            </Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: "800", color: "#FFFFFF" }}>
            {contact.name}
          </Text>
          {!!contact.howMet && (
            <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>
              {contact.howMet}
            </Text>
          )}
        </View>

        <View style={{ padding: 20, gap: 14, marginTop: -16 }}>
          {/* Notes card */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 16,
              gap: 8,
              shadowColor: "#7BA3C9",
              shadowOpacity: 0.1,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ fontWeight: "700", fontSize: 14, color: "#1C6FBA" }}>Notes</Text>
              {!editingNotes && (
                <Pressable onPress={startEditingNotes} hitSlop={8}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#1C6FBA" }}>Edit</Text>
                </Pressable>
              )}
            </View>
            {editingNotes ? (
              <View style={{ gap: 10 }}>
                <TextInput
                  value={draftNotes}
                  onChangeText={setDraftNotes}
                  multiline
                  placeholder="What did you talk about?"
                  placeholderTextColor="#9BBDD6"
                  autoFocus
                  style={[inputStyle, { minHeight: 80, textAlignVertical: "top" }]}
                />
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <ActionButton title="Save" onPress={saveNotes} style={{ flex: 1 }} />
                  <ActionButton title="Cancel" variant="ghost" onPress={() => setEditingNotes(false)} style={{ flex: 1 }} />
                </View>
              </View>
            ) : (
              <Text style={{ fontSize: 15, color: "#1A3A5C", lineHeight: 22 }}>
                {contact.notes || "No notes"}
              </Text>
            )}
          </View>

          {/* Follow-ups card */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 16,
              gap: 10,
              shadowColor: "#7BA3C9",
              shadowOpacity: 0.1,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <Text style={{ fontWeight: "700", fontSize: 14, color: "#1C6FBA" }}>Follow-ups</Text>

            {/* Note input for new follow-up */}
            <TextInput
              value={followUpNote}
              onChangeText={setFollowUpNote}
              placeholder="Note for next follow-up (optional)"
              placeholderTextColor="#9BBDD6"
              style={[inputStyle, { fontSize: 14 }]}
            />

            {/* Quick-add chips */}
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              <ChipButton label="+1 day" onPress={() => addNewFollowUp(daysFromNow(1))} />
              <ChipButton label="+3 days" onPress={() => addNewFollowUp(daysFromNow(3))} />
              <ChipButton label="+7 days" onPress={() => addNewFollowUp(daysFromNow(7))} />
            </View>

            {/* Event list */}
            {sortedFollowUps.length === 0 ? (
              <Text style={{ fontSize: 13, color: "#9BBDD6" }}>No follow-ups scheduled</Text>
            ) : (
              sortedFollowUps.map((fu) => (
                <FollowUpEventRow
                  key={fu.id}
                  followUp={fu}
                  onToggle={() => toggleFollowUp(fu.id)}
                  onDelete={() => deleteFollowUp(fu.id)}
                  onPress={() => router.push({ pathname: "/follow-up-detail", params: { contactId: contact.id, followUpId: fu.id } })}
                />
              ))
            )}
          </View>

          {/* LinkedIn card */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 16,
              gap: 8,
              shadowColor: "#7BA3C9",
              shadowOpacity: 0.1,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <Text style={{ fontWeight: "700", fontSize: 14, color: "#1C6FBA" }}>LinkedIn</Text>
            {contact.linkedinUrl ? (
              <ActionButton
                title="Open LinkedIn"
                icon="🔗"
                variant="accent"
                onPress={() => Linking.openURL(contact.linkedinUrl)}
              />
            ) : (
              <Text style={{ fontSize: 14, color: "#9BBDD6" }}>No LinkedIn URL</Text>
            )}
          </View>

          {/* Bottom actions */}
          <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
            <ActionButton title="Back" variant="ghost" onPress={() => router.back()} style={{ flex: 1 }} />
            <ActionButton title="Delete" variant="destructive" onPress={onDelete} style={{ flex: 1 }} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
