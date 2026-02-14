import { useState } from "react";
import { Pressable, Text, View } from "react-native";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toDateStr(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function CalendarPicker({ selected, onSelect }) {
  const now = new Date();
  const todayStr = toDateStr(now.getFullYear(), now.getMonth(), now.getDate());

  const initial = selected ? new Date(selected + "T00:00:00") : now;
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prev() {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  }

  function next() {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <View style={{ gap: 8 }}>
      {/* Month nav */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Pressable onPress={prev} hitSlop={10} style={{ padding: 6 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#1C6FBA" }}>‹</Text>
        </Pressable>
        <Text style={{ fontSize: 15, fontWeight: "700", color: "#1A3A5C" }}>
          {MONTHS[month]} {year}
        </Text>
        <Pressable onPress={next} hitSlop={10} style={{ padding: 6 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#1C6FBA" }}>›</Text>
        </Pressable>
      </View>

      {/* Day headers */}
      <View style={{ flexDirection: "row" }}>
        {DAYS.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: "center", paddingVertical: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#9BBDD6" }}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Date grid */}
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {cells.map((day, i) => {
          if (day === null) {
            return <View key={`e${i}`} style={{ width: "14.28%", height: 38 }} />;
          }
          const dateStr = toDateStr(year, month, day);
          const isSelected = dateStr === selected;
          const isToday = dateStr === todayStr;
          const isPast = dateStr < todayStr;

          return (
            <Pressable
              key={dateStr}
              onPress={() => onSelect(dateStr)}
              style={{
                width: "14.28%",
                height: 38,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isSelected ? "#1C6FBA" : "transparent",
                  borderWidth: isToday && !isSelected ? 1.5 : 0,
                  borderColor: "#1C6FBA",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: isSelected || isToday ? "700" : "400",
                    color: isSelected ? "#FFFFFF" : isPast ? "#C5DDEF" : "#1A3A5C",
                  }}
                >
                  {day}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
