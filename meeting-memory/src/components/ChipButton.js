import { Pressable, Text } from "react-native";

export default function ChipButton({ label, onPress, selected, color }) {
  const isActive = !!selected;
  const accentColor = color || "#1C6FBA";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: isActive ? accentColor : pressed ? "#EDF4FB" : "#FFFFFF",
        borderWidth: 1.5,
        borderColor: isActive ? accentColor : "#C5DDEF",
      })}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: "700",
          color: isActive ? "#FFFFFF" : "#1C6FBA",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
