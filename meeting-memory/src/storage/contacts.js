import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_V1 = "mm_contacts_v1";
const KEY_V2 = "mm_contacts_v2";

export function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createFollowUpEvent(date, note = "") {
  return { id: makeId(), date, status: "open", note };
}

export function normalizeLinkedinUrl(url) {
  if (!url) return "";
  try {
    const u = new URL(url);
    return u.origin.toLowerCase() + u.pathname.toLowerCase().replace(/\/+$/, "");
  } catch {
    return url.trim().toLowerCase().replace(/\/+$/, "");
  }
}

/* Load contacts with automatic v1 → v2 migration */
export async function loadContacts() {
  const v2 = await AsyncStorage.getItem(KEY_V2);
  if (v2) return JSON.parse(v2);

  // Migrate from v1
  const v1 = await AsyncStorage.getItem(KEY_V1);
  if (!v1) return [];

  const oldContacts = JSON.parse(v1);
  const migrated = oldContacts.map((c) => {
    const followUps = [];
    if (c.followUpDate) {
      followUps.push({ id: makeId(), date: c.followUpDate, status: "open", note: "" });
    }
    const { followUpDate, ...rest } = c;
    return { ...rest, followUps };
  });

  await AsyncStorage.setItem(KEY_V2, JSON.stringify(migrated));
  return migrated;
}

export async function saveContacts(contacts) {
  await AsyncStorage.setItem(KEY_V2, JSON.stringify(contacts));
}

/* Add contact with LinkedIn dedup check */
export async function addContact(contact) {
  const contacts = await loadContacts();

  if (contact.linkedinUrl) {
    const normalized = normalizeLinkedinUrl(contact.linkedinUrl);
    const existing = contacts.find((c) => normalizeLinkedinUrl(c.linkedinUrl) === normalized);
    if (existing) {
      return { duplicate: true, existingContact: existing, contacts };
    }
  }

  if (!contact.followUps) contact.followUps = [];
  const updated = [contact, ...contacts];
  await saveContacts(updated);
  return { duplicate: false, contacts: updated };
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

/* Follow-up event helpers */
export async function addFollowUpToContact(contactId, followUpEvent) {
  const contacts = await loadContacts();
  const updated = contacts.map((c) => {
    if (c.id !== contactId) return c;
    return { ...c, followUps: [...(c.followUps || []), followUpEvent] };
  });
  await saveContacts(updated);
  return updated;
}

export async function toggleFollowUpStatus(contactId, followUpId) {
  const contacts = await loadContacts();
  const updated = contacts.map((c) => {
    if (c.id !== contactId) return c;
    return {
      ...c,
      followUps: (c.followUps || []).map((fu) =>
        fu.id === followUpId ? { ...fu, status: fu.status === "open" ? "resolved" : "open" } : fu
      ),
    };
  });
  await saveContacts(updated);
  return updated;
}

export async function updateFollowUpNote(contactId, followUpId, note) {
  const contacts = await loadContacts();
  const updated = contacts.map((c) => {
    if (c.id !== contactId) return c;
    return {
      ...c,
      followUps: (c.followUps || []).map((fu) =>
        fu.id === followUpId ? { ...fu, note } : fu
      ),
    };
  });
  await saveContacts(updated);
  return updated;
}

export async function updateFollowUpDate(contactId, followUpId, date) {
  const contacts = await loadContacts();
  const updated = contacts.map((c) => {
    if (c.id !== contactId) return c;
    return {
      ...c,
      followUps: (c.followUps || []).map((fu) =>
        fu.id === followUpId ? { ...fu, date } : fu
      ),
    };
  });
  await saveContacts(updated);
  return updated;
}

export async function removeFollowUp(contactId, followUpId) {
  const contacts = await loadContacts();
  const updated = contacts.map((c) => {
    if (c.id !== contactId) return c;
    return { ...c, followUps: (c.followUps || []).filter((fu) => fu.id !== followUpId) };
  });
  await saveContacts(updated);
  return updated;
}
