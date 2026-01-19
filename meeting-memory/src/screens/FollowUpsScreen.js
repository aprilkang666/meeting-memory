import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

export default function FollowUpsScreen() {
  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "600" }}>Follow Ups</Text>

      <Pressable onPress={() => router.back()}>
        <Text style={{ color: "blue" }}>Back</Text>
      </Pressable>
    </View>
  );
}
