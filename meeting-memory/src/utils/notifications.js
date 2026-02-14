import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function makeNotificationId(contactId, followUpId) {
  return `${contactId}__${followUpId}`;
}

export async function requestNotificationPermissions() {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleFollowUpNotification(contactId, followUpId, contactName, followUpDate) {
  await cancelFollowUpNotification(contactId, followUpId);
  if (!followUpDate) return;

  const [year, month, day] = followUpDate.split("-").map(Number);
  const triggerDate = new Date(year, month - 1, day, 9, 0, 0);
  if (triggerDate <= new Date()) return;

  await Notifications.scheduleNotificationAsync({
    identifier: makeNotificationId(contactId, followUpId),
    content: {
      title: "Follow-up Reminder",
      body: `Time to follow up with ${contactName}!`,
      sound: true,
      data: { contactId, followUpId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
}

export async function cancelFollowUpNotification(contactId, followUpId) {
  await Notifications.cancelScheduledNotificationAsync(makeNotificationId(contactId, followUpId));
}

export async function cancelAllFollowUpsForContact(contactId, followUps) {
  for (const fu of followUps || []) {
    await cancelFollowUpNotification(contactId, fu.id);
  }
}
