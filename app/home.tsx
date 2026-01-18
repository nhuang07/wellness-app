import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getMyGroups, supabase } from "@/lib/supabase";

export default function HomeScreen() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth");
        return;
      }
      setUserId(user.id);

      const userGroups = await getMyGroups(user.id);
      const groupsList = userGroups.map((g: any) => g.groups).filter(Boolean);
      setGroups(groupsList);
    } catch (error) {
      console.log("Error loading groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupPress = (group: any) => {
    // Navigate to group-home (your existing tabs-index)
    router.push({
      pathname: "/tabs-index",
      params: { groupId: group.id },
    });
  };

  const getCreatureMoodImage = (mood: number) => {
    if (mood > 50) return require("@/assets/images/NWhappy.png");
    if (mood > 10) return require("@/assets/images/NWneutral.png");
    return require("@/assets/images/NWsad.png");
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("@/assets/images/auth-bg-1.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Groups</Text>
          <Text style={styles.headerSubtitle}>
            {groups.length === 0
              ? "Create or join a group to get started"
              : `${groups.length} ${groups.length === 1 ? "group" : "groups"}`}
          </Text>
        </View>

        {/* Groups List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {groups.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏠</Text>
              <Text style={styles.emptyTitle}>No Groups Yet</Text>
              <Text style={styles.emptyText}>
                Create your first group or join an existing one to start
                tracking tasks together!
              </Text>
            </View>
          ) : (
            groups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={styles.groupCard}
                onPress={() => handleGroupPress(group)}
                activeOpacity={0.7}
              >
                <View style={styles.groupCardLeft}>
                  <Image
                    source={getCreatureMoodImage(group.creature_mood ?? 50)}
                    style={styles.groupCreature}
                  />
                </View>
                <View style={styles.groupCardCenter}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupCode}>
                    Code: {group.invite_code?.toUpperCase()}
                  </Text>
                  <View style={styles.moodBarSmall}>
                    <View
                      style={[
                        styles.moodBarFillSmall,
                        { width: `${group.creature_mood ?? 50}%` },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.groupCardRight}>
                  <Text style={styles.arrowIcon}>→</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push("/create-group")}
          >
            <Text style={styles.navButtonIcon}>➕</Text>
            <Text style={styles.navButtonText}>Create Group</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push("/join-group")}
          >
            <Text style={styles.navButtonIcon}>🔗</Text>
            <Text style={styles.navButtonText}>Join Group</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push("/profile")}
          >
            <Text style={styles.navButtonIcon}>👤</Text>
            <Text style={styles.navButtonText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: "700",
    color: "#131313",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(19, 19, 19, 0.6)",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#131313",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "rgba(19, 19, 19, 0.6)",
    textAlign: "center",
    lineHeight: 24,
  },
  groupCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(99, 102, 241, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupCardLeft: {
    marginRight: 16,
  },
  groupCreature: {
    width: 60,
    height: 60,
  },
  groupCardCenter: {
    flex: 1,
  },
  groupName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#131313",
    marginBottom: 4,
  },
  groupCode: {
    fontSize: 12,
    color: "#6366F1",
    fontWeight: "600",
    marginBottom: 8,
  },
  moodBarSmall: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  moodBarFillSmall: {
    height: "100%",
    backgroundColor: "#6366F1",
    borderRadius: 3,
  },
  groupCardRight: {
    marginLeft: 12,
  },
  arrowIcon: {
    fontSize: 24,
    color: "#6366F1",
  },
  bottomNav: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(99, 102, 241, 0.2)",
    gap: 12,
  },
  navButton: {
    flex: 1,
    backgroundColor: "#6366F1",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});