import { Pressable, Text, View } from "react-native";

function getEarliestOpenFollowUp(followUps) {
  if (!followUps || followUps.length === 0) return null;
  const open = followUps.filter((fu) => fu.status === "open");
  if (open.length === 0) return null;
  open.sort((a, b) => a.date.localeCompare(b.date));
  return open[0];
}

function getUrgencyColor(dateStr) {
  if (!dateStr) return null;
  const today = new Date().toISOString().slice(0, 10);
  if (dateStr < today) return { bg: "#FADDE1", text: "#C45A6A" }; // overdue
  if (dateStr === today) return { bg: "#FFF0D4", text: "#B8860B" }; // today
  return { bg: "#DCE9F4", text: "#1C6FBA" }; // upcoming
}

// Trypan Blue avatar colors
const avatarColors = [
  "#5A9BD5", "#F2A6C4", "#5BC4D6", "#F5CA7B",
  "#6BC4A0", "#EB9E9E", "#7BA3C9", "#88B8E0",
  "#5CBFA3", "#E8B87E", "#8EA8D8", "#D9A0B4",
];

function getAvatarColor(name) {
  const code = (name || "?").charCodeAt(0);
  return avatarColors[code % avatarColors.length];
}

export default function ContactRow({ contact, onPress, onLongPress }) {
  const initial = contact.name?.charAt(0)?.toUpperCase() || "?";
  const avatarBg = getAvatarColor(contact.name);

  const openCount = (contact.followUps || []).filter((fu) => fu.status === "open").length;
  const earliest = getEarliestOpenFollowUp(contact.followUps);
  const urgency = getUrgencyColor(earliest?.date);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        backgroundColor: pressed ? "#EDF4FB" : "#FFFFFF",
        borderRadius: 18,
        marginBottom: 10,
        shadowColor: "#7BA3C9",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 2,
      })}
    >
      {/* Avatar */}
      <View
        style={{
          width: 46,
          height: 46,
          borderRadius: 23,
          backgroundColor: avatarBg,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Text style={{ color: "#FFF", fontSize: 19, fontWeight: "800" }}>
          {initial}
        </Text>
      </View>

      {/* Info */}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#1A3A5C" }}>
          {contact.name}
        </Text>
        {!!contact.notes && (
          <Text
            numberOfLines={1}
            style={{ fontSize: 13, color: "#3D6B9E" }}
          >
            {contact.notes}
          </Text>
        )}
        {!!contact.howMet && (
          <Text style={{ fontSize: 12, color: "#9BBDD6" }}>
            {contact.howMet}
          </Text>
        )}
      </View>

      {/* Open follow-up count badge */}
      {openCount > 0 && urgency && (
        <View
          style={{
            backgroundColor: urgency.bg,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
            marginLeft: 8,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: urgency.text,
            }}
          >
            {openCount} open
          </Text>
        </View>
      )}

      {/* Chevron */}
      <Text style={{ color: "#C5DDEF", fontSize: 20, marginLeft: 6, fontWeight: "600" }}>›</Text>
    </Pressable>
  );
}
