import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { addContact, addFollowUpToContact, createFollowUpEvent, makeId } from "../storage/contacts";
import { extractNameFromLinkedInUrl } from "../utils/linkedin";
import ActionButton from "../components/ActionButton";
import ChipButton from "../components/ChipButton";
import { scheduleFollowUpNotification } from "../utils/notifications";


export default function NewContactScreen() {
  const params = useLocalSearchParams();
  const linkedinUrlParam = params.linkedinUrl ? String(params.linkedinUrl) : "";

  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [followUps, setFollowUps] = useState([]);
  const [howMet, setHowMet] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [followUpNote, setFollowUpNote] = useState("");

  useFocusEffect(
    useCallback(() => {
      setName("");
      setNotes("");
      setFollowUps([]);
      setHowMet("");
      setLinkedinUrl("");
      setFollowUpNote("");

      if (linkedinUrlParam) {
        setLinkedinUrl(linkedinUrlParam);
        const parsed = extractNameFromLinkedInUrl(linkedinUrlParam);
        if (parsed) setName(parsed);
      }
    }, [linkedinUrlParam])
  );

  const inputStyle = {
    borderWidth: 1.5,
    borderColor: "#C5DDEF",
    padding: 14,
    borderRadius: 16,
    fontSize: 15,
    color: "#1A3A5C",
    backgroundColor: "#FFFFFF",
  };

  function daysFromNow(n) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  }

  function addFollowUp(dateStr) {
    if (followUps.some((fu) => fu.date === dateStr)) return;
    setFollowUps((prev) => [...prev, createFollowUpEvent(dateStr, followUpNote.trim())]);
    setFollowUpNote("");
  }

  function removeFollowUp(id) {
    setFollowUps((prev) => prev.filter((fu) => fu.id !== id));
  }

  function formatDate(dateStr) {
    const [y, m, d] = dateStr.split("-");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
  }

  async function onSave() {
    if (!name.trim()) return Alert.alert("Missing name");
    if (!notes.trim()) return Alert.alert("Add a short note");

    const contact = {
      id: makeId(),
      name: name.trim(),
      notes: notes.trim(),
      howMet: howMet.trim(),
      linkedinUrl: linkedinUrl.trim(),
      followUps: followUps,
      status: "met",
      createdAt: new Date().toISOString(),
    };

    const result = await addContact(contact);

    if (result.duplicate) {
      Alert.alert(
        "Contact already exists",
        `${result.existingContact.name} already has this LinkedIn URL. Add follow-ups to the existing contact?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Add Follow-ups",
            onPress: async () => {
              for (const fu of followUps) {
                await addFollowUpToContact(result.existingContact.id, fu);
                await scheduleFollowUpNotification(
                  result.existingContact.id, fu.id, result.existingContact.name, fu.date
                );
              }
              router.replace("/");
            },
          },
        ]
      );
      return;
    }

    for (const fu of contact.followUps) {
      await scheduleFollowUpNotification(contact.id, fu.id, contact.name, fu.date);
    }
    router.replace("/");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#EDF4FB" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 24, fontWeight: "800", color: "#0F2B47" }}>
            New Contact
          </Text>
          <ActionButton
            title="Cancel"
            variant="ghost"
            size="sm"
            onPress={() => router.replace("/")}
          />
        </View>

        {/* Scan LinkedIn QR button */}
        <ActionButton
          title="Scan LinkedIn QR Code"
          variant="accent"
          onPress={() => router.push("/scan-linkedin")}
        />

        {/* Name */}
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#1C6FBA" }}>Name *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            placeholderTextColor="#9BBDD6"
            style={inputStyle}
          />
        </View>

        {/* Profile Notes */}
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#1C6FBA" }}>Profile Notes *</Text>
          <Text style={{ fontSize: 12, color: "#9BBDD6" }}>Saved to the contact profile</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="What did you talk about? What should you remember?"
            placeholderTextColor="#9BBDD6"
            style={[inputStyle, { height: 100, textAlignVertical: "top" }]}
          />
        </View>

        {/* Follow-ups */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#1C6FBA" }}>Follow-ups</Text>
          <Text style={{ fontSize: 12, color: "#9BBDD6" }}>Creates a task in the Follow-ups tab</Text>
          <TextInput
            value={followUpNote}
            onChangeText={setFollowUpNote}
            placeholder="Follow-up notes (optional)"
            placeholderTextColor="#9BBDD6"
            style={[inputStyle, { fontSize: 14 }]}
          />
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <ChipButton label="+1 day" onPress={() => addFollowUp(daysFromNow(1))} />
            <ChipButton label="+3 days" onPress={() => addFollowUp(daysFromNow(3))} />
            <ChipButton label="+7 days" onPress={() => addFollowUp(daysFromNow(7))} />
          </View>
          {followUps.length > 0 && (
            <View style={{ gap: 6, marginTop: 4 }}>
              {followUps.map((fu) => (
                <View
                  key={fu.id}
                  style={{
                    backgroundColor: "#DCE9F4",
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 12,
                    gap: 4,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ flex: 1, fontSize: 13, fontWeight: "600", color: "#1C6FBA" }}>
                      {formatDate(fu.date)}
                    </Text>
                    <Pressable onPress={() => removeFollowUp(fu.id)} hitSlop={8}>
                      <Text style={{ color: "#C45A6A", fontSize: 16, fontWeight: "700" }}>×</Text>
                    </Pressable>
                  </View>
                  {!!fu.note && (
                    <Text style={{ fontSize: 12, color: "#5A7A9B" }}>{fu.note}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* How we met */}
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#1C6FBA" }}>
            How we met (optional)
          </Text>
          <TextInput
            value={howMet}
            onChangeText={setHowMet}
            placeholder="Conference, coffee chat, intro..."
            placeholderTextColor="#9BBDD6"
            style={inputStyle}
          />
        </View>

        {/* LinkedIn URL */}
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#1C6FBA" }}>
            LinkedIn URL (optional)
          </Text>
          <TextInput
            value={linkedinUrl}
            onChangeText={setLinkedinUrl}
            placeholder="https://linkedin.com/in/..."
            placeholderTextColor="#9BBDD6"
            autoCapitalize="none"
            keyboardType="url"
            style={inputStyle}
          />
        </View>

        {/* Save button */}
        <ActionButton
          title="Save Contact"
          onPress={onSave}
          style={{ marginTop: 4 }}
        />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
