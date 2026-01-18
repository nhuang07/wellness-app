// app/index.tsx
import { getMyGroup, supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndRoute = async () => {
      // 1) Check auth
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // Not logged in → go to auth screen
        router.replace("/auth");
        return;
      }

      // 2) Check if user has a group
      const group = await getMyGroup(session.user.id);

      if (group) {
        // User has a group → go to your main app screen
        // tabs-index.tsx is at app/tabs-index.tsx → route "/tabs-index"
        router.replace("/home");
      } else {
        // User has no group yet → go to connect page
        // make sure you have app/connect-page.tsx or app/connect-page/index.tsx
        router.replace("/connect-page");
      }

      setLoading(false);
    };

    checkAuthAndRoute();
  }, []);

  // Simple loading spinner while we decide where to send the user
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#6366F1" />
    </View>
  );
}