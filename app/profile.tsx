import {
  getProfile,
  pickImage,
  updateProfile,
  uploadAvatar,
} from "@/lib/profile";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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

  // Team info
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
      console.log("3. Username:", profile.username);
      console.log("4. Bio:", profile.bio);
      console.log("5. Avatar:", profile.avatar_url);

      setUsername(profile.username || "");
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatar_url);
      setStats({
        tasksThisWeek: profile.tasks_completed_week || 0,
        tasksAllTime: profile.tasks_completed_total || 0,
      });

      // ... rest of function
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
      setAvatarKey((prev) => prev + 1); // <-- add this
    } catch (error: any) {
      console.log("Avatar error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Routing will be handled by _layout.tsx auth listener
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
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
            numberOfLines={3}
            placeholder="Tell us about yourself..."
            placeholderTextColor="#999"
          />
        ) : (
          <Text style={styles.bioText}>
            {bio || "No bio yet. Tap edit to add one!"}
          </Text>
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
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.buttonText}>
              {saving ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={() => setIsEditing(true)}
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: "#6366F1",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  editBadgeText: {
    fontSize: 14,
  },
  username: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  usernameInput: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    borderBottomWidth: 2,
    borderBottomColor: "#fff",
    paddingBottom: 4,
    minWidth: 150,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginTop: -20,
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E293B",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bioText: {
    fontSize: 16,
    color: "#1E293B",
    lineHeight: 24,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
  },
  bioInput: {
    fontSize: 16,
    color: "#1E293B",
    lineHeight: 24,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#6366F1",
    minHeight: 100,
    textAlignVertical: "top",
  },
  teamCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
  },
  teamName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  teamCode: {
    fontSize: 14,
    color: "#64748B",
  },
  buttonRow: {
    flexDirection: "row",
    marginHorizontal: 24,
    marginTop: 32,
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: "#6366F1",
    marginHorizontal: 24,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveButton: {
    backgroundColor: "#10B981",
    marginHorizontal: 0,
    marginTop: 0,
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginHorizontal: 0,
    marginTop: 0,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButtonText: {
    color: "#64748B",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 40,
    paddingVertical: 16,
  },
  logoutText: {
    color: "#EF4444",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
