import { View, Text, Pressable, FlatList } from "react-native";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { router } from "expo-router";
import { loadContacts } from "../storage/contacts";


/*
  This screen is the "memory dashboard".
*/
export default function ContactsScreen() {
  const [contacts, setContacts] = useState([]);

  /*
    useFocusEffect runs every time this screen becomes visible.
    This ensures the list refreshes after adding a contact.
  */
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const data = await loadContacts();
        setContacts(data);
      })();
    }, [])
  );

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "600" }}>Contacts</Text>

      <Pressable onPress={() => router.push("/new-contact")}>
        <Text style={{ color: "blue" }}>+ Add New</Text>
      </Pressable>
      <Pressable onPress={() => router.push("/follow-ups")}>
        <Text style={{ color: "blue" }}>Follow Ups</Text>
      </Pressable>


      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/contact/${item.id}`)}>
            <View style={{ borderWidth: 1, padding: 12 }}>
              <Text style={{ fontWeight: "600" }}>{item.name}</Text>
              <Text numberOfLines={2}>{item.notes}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
