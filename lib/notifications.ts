import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { supabase } from "./supabase";

// Handle notifications when app is in foreground
Notifications.setNotificationHandler({
  handleNotification:
    async (): Promise<Notifications.NotificationBehavior> => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
});

export async function registerForPushNotifications(userId: string) {
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device");
    return null;
  }

  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Permission not granted for push notifications");
      return null;
    }

    const token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: "75c471b1-06c7-4b24-81b7-e1ab0ef3128a",
      })
    ).data;

    await supabase
      .from("profiles")
      .update({ push_token: token })
      .eq("id", userId);

    return token;
  } catch (error) {
    console.log("Push notification setup failed:", error);
    return null;
  }
}
