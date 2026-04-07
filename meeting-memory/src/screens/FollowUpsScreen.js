import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { loadContacts, toggleFollowUpStatus, removeFollowUp } from "../storage/contacts";
import { scheduleFollowUpNotification, cancelFollowUpNotification } from "../utils/notifications";
import FollowUpEventRow from "../components/FollowUpEventRow";
import EmptyState from "../components/EmptyState";

const filters = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "resolved", label: "Resolved" },
];

const filterColors = {
  all: { active: "#1C6FBA" },
  open: { active: "#1C6FBA" },
  resolved: { active: "#2E7D4F" },
};

export default function FollowUpsScreen() {
  const [events, setEvents] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");

  async function loadEvents() {
    const contacts = await loadContacts();
    const flat = [];
    for (const c of contacts) {
      for (const fu of c.followUps || []) {
        flat.push({ ...fu, contactId: c.id, contactName: c.name });
      }
    }
    // Sort: open first by date ascending, then resolved by date ascending
    flat.sort((a, b) => {
      if (a.status !== b.status) return a.status === "open" ? -1 : 1;
      return a.date.localeCompare(b.date);
    });
    setEvents(flat);
  }

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [])
  );

  const filtered = useMemo(() => {
    if (activeFilter === "all") return events;
    return events.filter((e) => e.status === activeFilter);
  }, [events, activeFilter]);

  const counts = useMemo(() => {
    const c = { all: events.length, open: 0, resolved: 0 };
    for (const e of events) {
      if (e.status === "open") c.open++;
      else c.resolved++;
    }
    return c;
  }, [events]);

  async function handleToggle(event) {
    await toggleFollowUpStatus(event.contactId, event.id);
    if (event.status === "open") {
      await cancelFollowUpNotification(event.contactId, event.id);
    } else {
      await scheduleFollowUpNotification(event.contactId, event.id, event.contactName, event.date);
    }
    await loadEvents();
  }

  function handleLongPress(event) {
    Alert.alert("Delete follow-up?", `Remove follow-up for ${event.contactName}? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await cancelFollowUpNotification(event.contactId, event.id);
          await removeFollowUp(event.contactId, event.id);
          await loadEvents();
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
          paddingBottom: 20,
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: "800", color: "#FFFFFF" }}>
          Follow-ups
        </Text>
        {events.length > 0 && (
          <>
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
              {counts.open} open · {counts.resolved} resolved
            </Text>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
              Tap to view  ·  Hold to delete
            </Text>
          </>
        )}
      </View>

      {/* Filter chips */}
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          paddingHorizontal: 16,
          paddingVertical: 14,
        }}
      >
        {filters.map((f) => {
          const isActive = activeFilter === f.key;
          const color = filterColors[f.key].active;
          return (
            <Pressable
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: isActive ? color : "#FFFFFF",
                borderWidth: 1.5,
                borderColor: isActive ? color : "#C5DDEF",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: isActive ? "#FFFFFF" : color,
                }}
              >
                {f.label}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: isActive ? "rgba(255,255,255,0.7)" : "#9BBDD6",
                }}
              >
                {counts[f.key]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {events.length === 0 ? (
        <EmptyState
          icon="🎉"
          title="All caught up!"
          message="No follow-ups scheduled. Add a follow-up date when you create or edit a contact."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📭"
          title="None here"
          message={`No ${activeFilter} follow-ups right now.`}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <FollowUpEventRow
              contactName={item.contactName}
              followUp={item}
              onToggle={() => handleToggle(item)}
              onPress={() => router.push({ pathname: "/follow-up-detail", params: { contactId: item.contactId, followUpId: item.id } })}
              onLongPress={() => handleLongPress(item)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
