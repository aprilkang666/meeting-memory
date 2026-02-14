import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "mm_last_scanned_linkedin_url_v1";

export async function setLastScannedLinkedinUrl(url) {
  await AsyncStorage.setItem(KEY, url);
}

export async function getLastScannedLinkedinUrl() {
  return await AsyncStorage.getItem(KEY);
}

export async function clearLastScannedLinkedinUrl() {
  await AsyncStorage.removeItem(KEY);
}
