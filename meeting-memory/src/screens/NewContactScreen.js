import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { addContact, makeId } from "../storage/contacts";

/*
  This screen exists for ONE purpose:
  capture context immediately after meeting someone.
*/
export default function NewContactScreen() {
  // Temporary memory while user types
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState(null);
  const [howMet, setHowMet] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");


  function daysFromNow(n) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    // store as YYYY-MM-DD for easy comparisons
    return d.toISOString().slice(0, 10);
  }

  async function onSave() {
    // Prevent useless contacts you’ll forget later
    if (!name.trim()) return Alert.alert("Missing name");
    if (!notes.trim()) return Alert.alert("Add a short note");

    // This object becomes one saved contact
    const contact = {
      id: makeId(),           // unique identifier
      name: name.trim(),
      notes: notes.trim(),
      howMet: howMet.trim(),
      linkedinUrl: linkedinUrl.trim(),
      followUpDate: followUpDate,
      status: "met",          // relationship state
      createdAt: new Date().toISOString(),
    };

    // Persist to phone storage
    await addContact(contact);

    // Return to Contacts screen
    router.back();
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 10 }}>
      <Text style={{ fontSize: 20, fontWeight: "600" }}>New Contact</Text>

      <Text>Name *</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, padding: 10 }}
      />

      <Text>Notes *</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        multiline
        style={{ borderWidth: 1, padding: 10, height: 100 }}
      />

      {/* FOLLOW-UP QUICK BUTTONS */}
      <Text style={{ marginTop: 10 }}>Follow-up</Text>

      <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
        <Pressable onPress={() => setFollowUpDate(daysFromNow(1))}>
          <Text style={{ color: "blue" }}>Tomorrow</Text>
        </Pressable>

        <Pressable onPress={() => setFollowUpDate(daysFromNow(3))}>
          <Text style={{ color: "blue" }}>+3 days</Text>
        </Pressable>

        <Pressable onPress={() => setFollowUpDate(daysFromNow(7))}>
          <Text style={{ color: "blue" }}>+7 days</Text>
        </Pressable>

        <Pressable onPress={() => setFollowUpDate(null)}>
          <Text style={{ color: "red" }}>Clear</Text>
        </Pressable>
      </View>

      {!!followUpDate && (
        <Text style={{ opacity: 0.7 }}>
          Follow-up set for: {followUpDate}
        </Text>
      )}
      <Text>How we met (optional)</Text>
      
      <TextInput
        value={howMet}
        onChangeText={setHowMet}
        placeholder="Conference, coffee chat, intro…"
        style={{ borderWidth: 1, borderRadius: 8, padding: 10 }}
      />

      <Text>LinkedIn URL (optional)</Text>
      <TextInput
        value={linkedinUrl}
        onChangeText={setLinkedinUrl}
        placeholder="https://linkedin.com/in/..."
        autoCapitalize="none"
        style={{ borderWidth: 1, borderRadius: 8, padding: 10 }}
      />


      <Pressable onPress={onSave}>
        <Text style={{ color: "blue" }}>Save</Text>
      </Pressable>
    </View>
  );
}
