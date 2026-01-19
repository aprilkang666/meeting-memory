import { View, Text, Pressable, Alert } from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import * as Linking from "expo-linking";
import { loadContacts, updateContact, deleteContact } from "../storage/contacts";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export default function ContactDetailScreen() {
  const { id } = useLocalSearchParams();
  const [contact, setContact] = useState(null);

  // Reload when the screen is focused (so it always reflects latest storage)
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const all = await loadContacts();
        const found = all.find((c) => c.id === id);
        setContact(found || null);
      })();
    }, [id])
  );

  const followUpLabel = useMemo(() => {
    if (!contact?.followUpDate) return "None";
    const t = todayStr();
    if (contact.followUpDate < t) return `${contact.followUpDate} (Overdue)`;
    if (contact.followUpDate === t) return `${contact.followUpDate} (Today)`;
    return `${contact.followUpDate} (Upcoming)`;
  }, [contact]);

  async function setFollowUp(dateStrOrNull) {
    if (!contact) return;
    const updated = { ...contact, followUpDate: dateStrOrNull };
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
          await deleteContact(contact.id);
          router.back();
        },
      },
    ]);
  }

  if (!contact) {
    return (
      <View style={{ flex: 1, padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Contact not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: "blue" }}>Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "800" }}>{contact.name}</Text>

      {!!contact.howMet && (
        <View style={{ gap: 4 }}>
          <Text style={{ fontWeight: "700" }}>How we met</Text>
          <Text>{contact.howMet}</Text>
        </View>
      )}

      <View style={{ gap: 4 }}>
        <Text style={{ fontWeight: "700" }}>Notes</Text>
        <Text>{contact.notes}</Text>
      </View>

      <View style={{ gap: 6 }}>
        <Text style={{ fontWeight: "700" }}>Follow-up</Text>
        <Text style={{ opacity: 0.75 }}>{followUpLabel}</Text>

        <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
          <Pressable onPress={() => setFollowUp(daysFromNow(1))}>
            <Text style={{ color: "blue" }}>Tomorrow</Text>
          </Pressable>
          <Pressable onPress={() => setFollowUp(daysFromNow(3))}>
            <Text style={{ color: "blue" }}>+3 days</Text>
          </Pressable>
          <Pressable onPress={() => setFollowUp(daysFromNow(7))}>
            <Text style={{ color: "blue" }}>+7 days</Text>
          </Pressable>
          <Pressable onPress={() => setFollowUp(null)}>
            <Text style={{ color: "red" }}>Clear</Text>
          </Pressable>
        </View>
      </View>

      {!!contact.linkedinUrl && (
        <Pressable onPress={() => Linking.openURL(contact.linkedinUrl)}>
          <Text style={{ color: "blue" }}>Open LinkedIn</Text>
        </Pressable>
      )}

      <View style={{ flexDirection: "row", gap: 16, marginTop: 8 }}>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: "blue" }}>Back</Text>
        </Pressable>

        <Pressable onPress={onDelete}>
          <Text style={{ color: "red" }}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}
