import { Text, View } from "react-native";
import ActionButton from "./ActionButton";

export default function EmptyState({ icon, title, message, actionLabel, onAction }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        gap: 14,
      }}
    >
      {!!icon && (
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: "#DCE9F4",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 4,
          }}
        >
          <Text style={{ fontSize: 36 }}>{icon}</Text>
        </View>
      )}
      <Text style={{ fontSize: 20, fontWeight: "800", color: "#0F2B47", textAlign: "center" }}>
        {title}
      </Text>
      {!!message && (
        <Text style={{ fontSize: 14, color: "#3D6B9E", textAlign: "center", lineHeight: 22 }}>
          {message}
        </Text>
      )}
      {!!actionLabel && !!onAction && (
        <ActionButton
          title={actionLabel}
          onPress={onAction}
          style={{ marginTop: 8 }}
        />
      )}
    </View>
  );
}
