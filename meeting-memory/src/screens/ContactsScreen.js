import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, AppState, FlatList, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { deleteContact, loadContacts } from "../storage/contacts";
import { clearLastScannedLinkedinUrl, getLastScannedLinkedinUrl } from "../storage/scan";
import { cancelAllFollowUpsForContact } from "../utils/notifications";
import ContactRow from "../components/ContactRow";
import EmptyState from "../components/EmptyState";


export default function ContactsScreen() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const appState = useRef(AppState.currentState);

  const filtered = useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.trim().toLowerCase();
    return contacts.filter((c) => c.name?.toLowerCase().includes(q));
  }, [contacts, search]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", async (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === "active") {
        const url = await getLastScannedLinkedinUrl();
        if (url) {
          router.push({ pathname: "/new-contact", params: { linkedinUrl: url } });
          await clearLastScannedLinkedinUrl();
        }
      }
      appState.current = nextState;
    });

    return () => sub.remove();
  }, []);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const data = await loadContacts();
        setContacts(data);
      })();
    }, [])
  );

  function handleLongPress(contact) {
    Alert.alert(contact.name, "What would you like to do?", [
      {
        text: "Edit",
        onPress: () => router.push(`/contact/${contact.id}`),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  function handleDeletePress(contact) {
    Alert.alert("Delete contact?", `Remove ${contact.name}? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await cancelAllFollowUpsForContact(contact.id, contact.followUps);
          await deleteContact(contact.id);
          setContacts((prev) => prev.filter((c) => c.id !== contact.id));
        },
      },
    ]);
  }


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#EDF4FB" }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: "#1C6FBA",
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 24,
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: "800", color: "#FFFFFF" }}>
          Contacts
        </Text>
        {contacts.length > 0 && (
          <>
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
              {contacts.length} connection{contacts.length !== 1 ? "s" : ""}
            </Text>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
              Tap to view  ·  Hold to edit
            </Text>
          </>
        )}
      </View>

      {contacts.length === 0 ? (
        <EmptyState
          icon="👋"
          title="No contacts yet"
          message="Meet someone new? Tap 'Add New' in the tab bar or scan a LinkedIn QR code to get started."
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          ListHeaderComponent={
            <View style={{ paddingTop: 12, paddingBottom: 8 }}>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search by name..."
                placeholderTextColor="#9BBDD6"
                style={{
                  borderWidth: 1.5,
                  borderColor: "#C5DDEF",
                  padding: 12,
                  borderRadius: 16,
                  fontSize: 15,
                  color: "#1A3A5C",
                  backgroundColor: "#FFFFFF",
                }}
              />
            </View>
          }
          renderItem={({ item }) => (
            <ContactRow
              contact={item}
              onPress={() => router.push(`/contact/${item.id}`)}
              onLongPress={() => handleLongPress(item)}
            />
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: "#9BBDD6", marginTop: 20, fontSize: 14 }}>
              No contacts match "{search}"
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
