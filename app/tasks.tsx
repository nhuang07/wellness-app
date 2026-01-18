import TaskCard from "@/components/TaskCard";
import {
    getCompletedGroupTasks,
    getGroupMembers,
    getMyGroup,
    getMyTasks,
    getProfile,
    subscribeToGroupMembers,
    subscribeToGroupTasks,
    supabase,
} from "@/lib/supabase";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    ImageBackground,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function TasksScreen() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [group, setGroup] = useState<any>(null);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"mine" | "all">("mine");

  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    if (!group?.id) return;

    const tasksChannel = subscribeToGroupTasks(group.id, () => {
      loadTasks();
    });

    const membersChannel = subscribeToGroupMembers(group.id, () => {
      loadMembers();
    });

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(membersChannel);
    };
  }, [group?.id]);

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const myGroup = await getMyGroup(user.id);
      setGroup(myGroup);

      if (myGroup) {
        await loadTasks(user.id, (myGroup as any).id);
        await loadMembers((myGroup as any).id);
      }
    } catch (error) {
      console.log("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async (uid?: string, gid?: string) => {
    const currentUserId = uid || userId;
    const currentGroupId = gid || group?.id;
    if (!currentUserId || !currentGroupId) return;

    const mine = await getMyTasks(currentUserId, currentGroupId);
    setMyTasks(mine);

    const all = await getCompletedGroupTasks(currentGroupId);
    setAllTasks(all);
  };

  const loadMembers = async (gid?: string) => {
    const currentGroupId = gid || group?.id;
    if (!currentGroupId) return;

    const groupMembers = await getGroupMembers(currentGroupId);
    setMembers(groupMembers);
  };

  const openMemberProfile = async (member: any) => {
    try {
      const profile = await getProfile(member.user_id);
      setSelectedMember({
        ...member,
        fullProfile: profile,
      });
      setProfileModalVisible(true);
    } catch (error) {
      console.log("Error loading profile:", error);
    }
  };

  const handleTaskComplete = () => {
    loadTasks();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../assets/images/auth-bg-1.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tasks</Text>
        </View>

        {/* Members Row */}
        <View style={styles.membersSection}>
          <Text style={styles.sectionTitle}>Team</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {members.map((member) => (
              <TouchableOpacity
                key={member.user_id}
                style={styles.memberAvatar}
                onPress={() => openMemberProfile(member)}
              >
                <Image
                  source={{
                    uri:
                      member.profiles?.avatar_url ||
                      "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
                  }}
                  style={styles.avatarImage}
                />
                <Text style={styles.memberName} numberOfLines={1}>
                  {member.profiles?.username || "User"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "mine" && styles.activeTab]}
            onPress={() => setActiveTab("mine")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "mine" && styles.activeTabText,
              ]}
            >
              My Tasks ({myTasks.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "all" && styles.activeTab]}
            onPress={() => setActiveTab("all")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "all" && styles.activeTabText,
              ]}
            >
              All Tasks ({allTasks.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Task List */}
        <FlatList
          data={activeTab === "mine" ? myTasks : allTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.taskList}
          renderItem={({ item }) => (
            <View>
              {activeTab === "all" && (
                <Text style={styles.taskOwner}>
                  {item.profiles?.username || "Unknown"}
                </Text>
              )}
              <TaskCard
                task={{
                  id: item.id,
                  description: item.description,
                  completed: item.completed,
                  photo_url: item.photo_url,
                }}
                onComplete={handleTaskComplete}
              />
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {activeTab === "mine"
                ? "No tasks yet. Go generate some!"
                : "No team tasks yet."}
            </Text>
          }
        />

        {/* Profile Modal */}
        <Modal
          visible={profileModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setProfileModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setProfileModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>

              {selectedMember && (
                <>
                  <Image
                    source={{
                      uri:
                        selectedMember.fullProfile?.avatar_url ||
                        "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
                    }}
                    style={styles.modalAvatar}
                  />
                  <Text style={styles.modalName}>
                    {selectedMember.fullProfile?.username || "User"}
                  </Text>
                  <Text style={styles.modalBio}>
                    {selectedMember.fullProfile?.bio || "No bio yet"}
                  </Text>

                  <View style={styles.modalStats}>
                    <View style={styles.statBox}>
                      <Text style={styles.statNumber}>
                        {selectedMember.fullProfile?.tasks_completed_week || 0}
                      </Text>
                      <Text style={styles.statLabel}>This Week</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statNumber}>
                        {selectedMember.fullProfile?.tasks_completed_total || 0}
                      </Text>
                      <Text style={styles.statLabel}>All Time</Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
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
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#131313",
  },
  membersSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#131313",
    marginBottom: 12,
  },
  memberAvatar: {
    alignItems: "center",
    marginRight: 16,
    width: 60,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#fff",
  },
  memberName: {
    fontSize: 12,
    color: "#131313",
    marginTop: 4,
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  activeTab: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  tabText: {
    textAlign: "center",
    fontWeight: "600",
    color: "#131313",
  },
  activeTabText: {
    color: "#fff",
  },
  taskList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  taskOwner: {
    fontSize: 12,
    color: "#6366F1",
    fontWeight: "600",
    marginBottom: 4,
    marginLeft: 4,
  },
  emptyText: {
    textAlign: "center",
    color: "rgba(19, 19, 19, 0.5)",
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    width: "85%",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  closeButtonText: {
    fontSize: 20,
    color: "#666",
  },
  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  modalName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#131313",
    marginBottom: 8,
  },
  modalBio: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  modalStats: {
    flexDirection: "row",
    gap: 32,
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#131313",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
});
