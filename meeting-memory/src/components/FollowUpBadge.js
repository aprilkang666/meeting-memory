import { Text, View } from "react-native";

const config = {
  overdue: { bg: "#FADDE1", text: "#C45A6A", dot: "#E8889A", label: "Overdue" },
  today: { bg: "#FFF0D4", text: "#B8860B", dot: "#E8C36A", label: "Today" },
  upcoming: { bg: "#DCE9F4", text: "#1C6FBA", dot: "#5A9BD5", label: "Upcoming" },
  none: { bg: "#EDF4FB", text: "#7BA3C9", dot: "#C5DDEF", label: "No follow-up" },
};

export function getFollowUpStatus(dateStr) {
  if (!dateStr) return "none";
  const today = new Date().toISOString().slice(0, 10);
  if (dateStr < today) return "overdue";
  if (dateStr === today) return "today";
  return "upcoming";
}

export default function FollowUpBadge({ date, showDate }) {
  const status = getFollowUpStatus(date);
  const c = config[status];

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: c.bg,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: "flex-start",
        gap: 6,
      }}
    >
      <View
        style={{
          width: 7,
          height: 7,
          borderRadius: 4,
          backgroundColor: c.dot,
        }}
      />
      <Text style={{ fontSize: 13, fontWeight: "700", color: c.text }}>
        {c.label}
        {showDate && date ? ` · ${date}` : ""}
      </Text>
    </View>
  );
}
