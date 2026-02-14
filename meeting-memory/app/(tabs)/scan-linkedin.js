import { CameraView, useCameraPermissions } from "expo-camera";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { setLastScannedLinkedinUrl } from "../../src/storage/scan";
import ActionButton from "../../src/components/ActionButton";

function isLinkedInUrl(str) {
  try {
    const u = new URL(str);
    return u.hostname.toLowerCase().includes("linkedin.com");
  } catch {
    return false;
  }
}

export default function ScanLinkedInScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [foundUrl, setFoundUrl] = useState(null);
  const [notLinkedIn, setNotLinkedIn] = useState(false);

  if (!permission) return <View style={{ flex: 1, backgroundColor: "#EDF4FB" }} />;

  if (!permission.granted) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          padding: 24,
          gap: 16,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#EDF4FB",
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "#DCE9F4",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 4,
          }}
        >
          <Text style={{ fontSize: 40 }}>📷</Text>
        </View>
        <Text style={{ fontSize: 22, fontWeight: "800", color: "#0F2B47", textAlign: "center" }}>
          Camera permission needed
        </Text>
        <Text style={{ fontSize: 14, color: "#3D6B9E", textAlign: "center", lineHeight: 22 }}>
          We use the camera only to scan the LinkedIn QR code.
        </Text>

        <ActionButton
          title="Allow Camera"
          onPress={requestPermission}
          style={{ marginTop: 8 }}
        />
        <ActionButton
          title="Back"
          variant="ghost"
          onPress={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  async function handleQr(data) {
    if (scanned) return;
    setScanned(true);

    if (!isLinkedInUrl(data)) {
      setNotLinkedIn(true);
      return;
    }

    setFoundUrl(data);

    await setLastScannedLinkedinUrl(data);

    try {
      await Linking.openURL(data);
    } catch (e) {
      Alert.alert("Open failed", "Could not open the link.");
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={({ data }) => handleQr(data)}
      />

      {/* Bottom panel */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: 24,
          gap: 14,
        }}
      >
        {foundUrl ? (
          <>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "#7BCF92",
                }}
              />
              <Text style={{ fontWeight: "700", fontSize: 16, color: "#1A3A5C" }}>
                LinkedIn QR detected
              </Text>
            </View>
            <Text numberOfLines={1} style={{ fontSize: 13, color: "#5A9BD5" }}>
              {foundUrl}
            </Text>
            <ActionButton
              title="Scan Another"
              variant="secondary"
              onPress={() => {
                setFoundUrl(null);
                setScanned(false);
              }}
            />
            <ActionButton
              title="Use This & Go Back"
              onPress={() => {
                router.replace({ pathname: "/new-contact", params: { linkedinUrl: foundUrl } });
              }}
            />
          </>
        ) : notLinkedIn ? (
          <>
            <Text style={{ fontWeight: "700", fontSize: 16, color: "#C45A6A", textAlign: "center" }}>
              Not a LinkedIn QR code
            </Text>
            <Text style={{ fontSize: 14, color: "#3D6B9E", textAlign: "center" }}>
              This QR code doesn't look like a LinkedIn link.
            </Text>
            <ActionButton
              title="Try Again"
              variant="secondary"
              onPress={() => {
                setNotLinkedIn(false);
                setScanned(false);
              }}
            />
          </>
        ) : (
          <Text style={{ fontSize: 15, color: "#3D6B9E", textAlign: "center" }}>
            Point the camera at a LinkedIn QR code...
          </Text>
        )}

        <ActionButton
          title="Back"
          variant="ghost"
          onPress={() => router.replace("/new-contact")}
        />
      </View>
    </View>
  );
}
