import { Pressable, Text, View } from "react-native";

const statusConfig = {
  open: { bg: "#DCE9F4", text: "#1C6FBA", label: "Open" },
  resolved: { bg: "#D4EDDA", text: "#2E7D4F", label: "Resolved" },
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
}

export default function FollowUpEventRow({
  contactName,
  followUp,
  onToggle,
  onDelete,
  onPress,
  onLongPress,
}) {
  const s = statusConfig[followUp.status] || statusConfig.open;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        backgroundColor: pressed ? "#EDF4FB" : "#FFFFFF",
        borderRadius: 14,
        marginBottom: 8,
        shadowColor: "#7BA3C9",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 4,
        elevation: 1,
        gap: 10,
      })}
    >
      {/* Toggle circle */}
      <Pressable onPress={onToggle} hitSlop={8}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: followUp.status === "resolved" ? "#2E7D4F" : "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: followUp.status === "resolved" ? "#2E7D4F" : "#1C6FBA",
          }}
        >
          {followUp.status === "resolved" && (
            <Text style={{ color: "#FFF", fontSize: 14, fontWeight: "800" }}>✓</Text>
          )}
        </View>
      </Pressable>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {!!contactName && (
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#1A3A5C" }}>
            {contactName}
          </Text>
        )}
        <Text style={{ fontSize: 13, color: "#3D6B9E", marginTop: contactName ? 2 : 0 }}>
          {formatDate(followUp.date)}
        </Text>
        {!!followUp.note && (
          <Text
            numberOfLines={2}
            style={{ fontSize: 13, color: "#5A7A9B", marginTop: 3, lineHeight: 18 }}
          >
            {followUp.note}
          </Text>
        )}
      </View>

      {/* Status badge */}
      <View
        style={{
          backgroundColor: s.bg,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 12,
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: "700", color: s.text }}>
          {s.label}
        </Text>
      </View>

      {/* Delete button */}
      {!!onDelete && (
        <Pressable onPress={onDelete} hitSlop={8}>
          <Text style={{ color: "#C45A6A", fontSize: 18, fontWeight: "700" }}>×</Text>
        </Pressable>
      )}
    </Pressable>
  );
}
