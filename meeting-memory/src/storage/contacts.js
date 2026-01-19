import AsyncStorage from "@react-native-async-storage/async-storage";

/*
  KEY = where all contacts are stored inside the phone.
  Versioning lets you change structure later without breaking old users.
*/
const KEY = "mm_contacts_v1";

/*
  Reads contacts from the phone.
  JSON → JavaScript array
*/
export async function loadContacts() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

/*
  Writes the full contacts list back to storage.
*/
export async function saveContacts(contacts) {
  await AsyncStorage.setItem(KEY, JSON.stringify(contacts));
}

/*
  Creates a unique ID so each contact can be opened and edited.
*/
export function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/*
  Adds one new contact to the top of the list.
*/
export async function addContact(contact) {
  const contacts = await loadContacts();
  const updated = [contact, ...contacts];
  await saveContacts(updated);
  return updated;
}

export async function updateContact(updatedContact) {
  const contacts = await loadContacts();
  const updated = contacts.map((c) => (c.id === updatedContact.id ? updatedContact : c));
  await saveContacts(updated);
  return updated;
}

export async function deleteContact(id) {
  const contacts = await loadContacts();
  const updated = contacts.filter((c) => c.id !== id);
  await saveContacts(updated);
  return updated;
}
