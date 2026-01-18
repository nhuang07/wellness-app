import {
  getProfile,
  pickImage,
  updateProfile,
  uploadAvatar,
} from "@/lib/profile";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [stats, setStats] = useState({
    tasksThisWeek: 0,
    tasksAllTime: 0,
  });
  const [avatarKey, setAvatarKey] = useState(0);

  const [team, setTeam] = useState<{
    name: string;
    invite_code: string;
  } | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("1. User:", user?.id);
      if (!user) return;

      setUserId(user.id);

      const profile = await getProfile(user.id);
      console.log("2. Profile:", profile);

      setUsername(profile.username || "");
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatar_url);
      setStats({
        tasksThisWeek: profile.tasks_completed_week || 0,
        tasksAllTime: profile.tasks_completed_total || 0,
      });
    } catch (error) {
      console.log("ERROR loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await updateProfile(userId, { username, bio });
      setIsEditing(false);
      Alert.alert("Saved!", "Your profile has been updated.");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarPress = async () => {
    if (!userId) return;

    try {
      const uri = await pickImage();
      if (!uri) return;

      setSaving(true);
      const url = await uploadAvatar(userId, uri);
      setAvatarUrl(url);
      setAvatarKey((prev) => prev + 1);
    } catch (error: any) {
      console.log("Avatar error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/auth");
  };

  if (loading) {
    return (
      <ImageBackground
        source={require("../assets/images/auth-bg-1.png")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#131313" />
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../assets/images/auth-bg-1.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleAvatarPress}
          >
            <Image
              key={avatarKey}
              source={{
                uri: avatarUrl
                  ? `${avatarUrl}?v=${avatarKey}`
                  : "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
              }}
              style={styles.avatar}
            />
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>📷</Text>
            </View>
          </TouchableOpacity>

          {isEditing ? (
            <TextInput
              style={styles.usernameInput}
              value={username}
              onChangeText={setUsername}
              autoFocus
              placeholderTextColor="rgba(19,19,19,0.5)"
            />
          ) : (
            <Text style={styles.username}>{username}</Text>
          )}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.tasksThisWeek}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.tasksAllTime}</Text>
            <Text style={styles.statLabel}>All Time</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio</Text>
          {isEditing ? (
            <TextInput
              style={styles.bioInput}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              placeholder="Tell us about yourself..."
              placeholderTextColor="rgba(19,19,19,0.5)"
            />
          ) : (
            <View style={styles.bioContainer}>
              <Text style={styles.bioText}>
                {bio || "No bio yet. Tap edit to add one!"}
              </Text>
            </View>
          )}
        </View>

        {team && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Team</Text>
            <View style={styles.teamCard}>
              <Text style={styles.teamName}>🏠 {team.name}</Text>
              <Text style={styles.teamCode}>Invite code: {team.invite_code}</Text>
            </View>
          </View>
        )}

        {isEditing ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setIsEditing(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color="#131313" />
              ) : (
                <Text style={styles.buttonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={() => setIsEditing(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  header: {
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 24,
    backgroundColor: "transparent",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  editBadgeText: {
    fontSize: 14,
  },
  username: {
    fontSize: 28,
    fontWeight: "700",
    color: "#131313",
  },
  usernameInput: {
    fontSize: 28,
    fontWeight: "700",
    color: "#131313",
    borderBottomWidth: 2,
    borderBottomColor: "rgba(19,19,19,0.3)",
    paddingBottom: 4,
    minWidth: 150,
    textAlign: "center",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginHorizontal: 24,
    marginTop: 16,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "700",
    color: "#131313",
  },
  statLabel: {
    fontSize: 14,
    color: "#131313",
    marginTop: 4,
    opacity: 0.7,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#131313",
    marginBottom: 12,
    opacity: 0.8,
  },
  bioContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  bioText: {
    fontSize: 16,
    color: "#131313",
    lineHeight: 24,
  },
  bioInput: {
    fontSize: 16,
    color: "#131313",
    lineHeight: 24,
    backgroundColor: "rgba(255, 255, 255, 0.55)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
    minHeight: 120,
    textAlignVertical: "top",
  },
  teamCard: {
    backgroundColor: "rgba(83, 212, 216, 0.35)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  teamName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#131313",
    marginBottom: 4,
  },
  teamCode: {
    fontSize: 14,
    color: "#131313",
    opacity: 0.8,
  },
  buttonRow: {
    flexDirection: "row",
    marginHorizontal: 24,
    marginTop: 32,
    gap: 12,
  },
  button: {
    flex: 1,
    height: 52,
    backgroundColor: "rgba(120, 120, 128, 0.16)",
    marginHorizontal: 24,
    marginTop: 32,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  saveButton: {
    backgroundColor: "rgba(120, 120, 128, 0.16)",
    marginHorizontal: 0,
    marginTop: 0,
  },
  cancelButton: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 0,
    marginTop: 0,
  },
  buttonText: {
    color: "#131313",
    fontSize: 18,
    fontWeight: "600",
  },
  cancelButtonText: {
    color: "#131313",
    fontSize: 18,
    fontWeight: "600",
  },
  logoutButton: {
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 40,
    height: 52,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  logoutText: {
    color: "#131313",
    fontSize: 18,
    fontWeight: "600",
    opacity: 0.8,
  },
});
