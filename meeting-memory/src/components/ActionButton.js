import { Pressable, Text } from "react-native";

const variants = {
  primary: {
    bg: "#1C6FBA",
    bgPressed: "#155A96",
    text: "#FFFFFF",
  },
  secondary: {
    bg: "#DCE9F4",
    bgPressed: "#C5DDEF",
    text: "#1C6FBA",
  },
  destructive: {
    bg: "#FADDE1",
    bgPressed: "#F5C6CD",
    text: "#C45A6A",
  },
  ghost: {
    bg: "transparent",
    bgPressed: "#EDF4FB",
    text: "#3D6B9E",
  },
  accent: {
    bg: "#2BA5B5",
    bgPressed: "#229199",
    text: "#FFFFFF",
  },
};

export default function ActionButton({
  title,
  onPress,
  variant = "primary",
  size = "md",
  icon,
  style,
  disabled,
}) {
  const v = variants[variant] || variants.primary;

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 14, fontSize: 13, borderRadius: 12 },
    md: { paddingVertical: 12, paddingHorizontal: 20, fontSize: 15, borderRadius: 16 },
    lg: { paddingVertical: 16, paddingHorizontal: 28, fontSize: 17, borderRadius: 20 },
  };
  const s = sizeStyles[size] || sizeStyles.md;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? v.bgPressed : v.bg,
          paddingVertical: s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
          borderRadius: s.borderRadius,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {!!icon && (
        <Text style={{ fontSize: s.fontSize + 2 }}>{icon}</Text>
      )}
      <Text style={{ color: v.text, fontSize: s.fontSize, fontWeight: "700" }}>
        {title}
      </Text>
    </Pressable>
  );
}
