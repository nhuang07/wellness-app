// app/group-home.tsx
import MenuDrawer from "@/components/MenuDrawer";
import TaskCard from "@/components/TaskCard";

import { generateTasksForUser } from "@/lib/gemini";
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
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const NWHappy = require("@/assets/images/NWhappy.png");

export default function GroupHomeScreen() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [group, setGroup] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [members, setMembers] = useState<any[]>([]);

  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showTaskSelection, setShowTaskSelection] = useState(false);
  const [customTask, setCustomTask] = useState("");

  // Tab for my tasks vs all tasks
  const [activeTab, setActiveTab] = useState<"mine" | "all">("mine");

  // Profile modal
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const groups = ["Study Buddies", "Fitness Friends", "Project Team"];

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
      } else {
        router.replace("/connect-page");
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

    const myTasks = await getMyTasks(currentUserId, currentGroupId);
    setTasks(myTasks);

    const groupTasks = await getCompletedGroupTasks(currentGroupId);
    setAllTasks(groupTasks);
  };

  const loadMembers = async (gid?: string) => {
    const currentGroupId = gid || group?.id;
    if (!currentGroupId) return;

    const groupMembers = await getGroupMembers(currentGroupId);
    setMembers(groupMembers);
  };

  const handleGenerateTasks = async () => {
    if (!prompt.trim() || !userId || !group) return;

    setGenerating(true);
    try {
      const tasks = await generateTasksForUser(prompt);
      setGeneratedTasks(tasks);
      setSelectedTasks(tasks); // Select all by default
      setShowTaskSelection(true);
      setPrompt("");
    } catch (error) {
      console.log("Error generating tasks:", error);
    } finally {
      setGenerating(false);
    }
  };

  const toggleTaskSelection = (task: string) => {
    if (selectedTasks.includes(task)) {
      setSelectedTasks(selectedTasks.filter((t) => t !== task));
    } else {
      setSelectedTasks([...selectedTasks, task]);
    }
  };

  const confirmSelectedTasks = async () => {
    if (selectedTasks.length === 0) return;

    try {
      const tasksToInsert = selectedTasks.map((description) => ({
        group_id: group.id,
        user_id: userId,
        description,
        completed: false,
      }));

      const { error } = await supabase.from("tasks").insert(tasksToInsert);
      if (error) throw error;

      await loadTasks();
      setShowTaskSelection(false);
      setGeneratedTasks([]);
      setSelectedTasks([]);
    } catch (error) {
      console.log("Error saving tasks:", error);
    }
  };

  const addCustomTask = async () => {
    if (!customTask.trim() || !userId || !group) return;

    try {
      const { error } = await supabase.from("tasks").insert({
        group_id: group.id,
        user_id: userId,
        description: customTask.trim(),
        completed: false,
      });

      if (error) throw error;
      await loadTasks();
      setCustomTask("");
    } catch (error) {
      console.log("Error adding custom task:", error);
    }
  };

  const handleTaskComplete = async () => {
    await loadTasks();
    // Recalculate mood after task completion
    const completed = allTasks.filter((t) => t.completed).length + 1;
    const total = allTasks.length;
    const newMood = Math.round((completed / total) * 100);

    await supabase
      .from("groups")
      .update({ creature_mood: newMood })
      .eq("id", group.id);

    setGroup({ ...group, creature_mood: newMood });
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

  const goToProfile = () => {
    router.push("/profile");
  };

  const getCreatureImage = () => {
    return NWHappy;
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" />
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
        {/* Menu Drawer */}
        <Modal visible={menuOpen} animationType="slide" transparent>
          <View style={{ flex: 1, flexDirection: "row" }}>
            <MenuDrawer
              groups={groups}
              onClose={() => setMenuOpen(false)}
              onProfile={goToProfile}
              onCreateGroup={() => router.push("/create-group")}
              onJoinGroup={() => router.push("/join-group")}
            />
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }}
              onPress={() => setMenuOpen(false)}
            />
          </View>
        </Modal>

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

        {/* Task Selection Modal */}
        <Modal
          visible={showTaskSelection}
          animationType="slide"
          transparent
          onRequestClose={() => setShowTaskSelection(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.taskSelectionModal}>
              <Text style={styles.modalTitle}>Select Your Tasks</Text>
              <Text style={styles.modalSubtitle}>Tap to select/deselect</Text>

              {generatedTasks.map((task, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.selectableTask,
                    selectedTasks.includes(task) &&
                      styles.selectableTaskSelected,
                  ]}
                  onPress={() => toggleTaskSelection(task)}
                >
                  <View style={styles.checkbox}>
                    {selectedTasks.includes(task) && <Text>✓</Text>}
                  </View>
                  <Text style={styles.selectableTaskText}>{task}</Text>
                </TouchableOpacity>
              ))}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowTaskSelection(false);
                    setGeneratedTasks([]);
                    setSelectedTasks([]);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={confirmSelectedTasks}
                >
                  <Text style={styles.confirmButtonText}>
                    Add {selectedTasks.length} Tasks
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => setMenuOpen(true)}
              style={styles.menuButton}
            >
              <Text style={styles.menuButtonText}>☰</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{group?.name || "My Pet"}</Text>
          </View>

          {/* Mascot Image */}
          <View style={styles.mascotContainer}>
            <Image source={getCreatureImage()} style={styles.mascot} />
            <Text style={styles.moodText}>
              Mood: {group?.creature_mood || 50}%
            </Text>
          </View>

          {/* Group Members */}
          <View style={styles.membersContainer}>
            <Text style={styles.sectionTitle}>Team ({members.length})</Text>
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

          {/* Task Generation */}
          {tasks.length === 0 && (
            <View style={styles.promptContainer}>
              <Text style={styles.promptLabel}>
                What's on your mind? What do you want to improve?
              </Text>
              <TextInput
                value={prompt}
                onChangeText={setPrompt}
                placeholder="I've been stressed about..."
                placeholderTextColor="rgba(19, 19, 19, 0.5)"
                style={styles.promptInput}
                multiline
              />
              <TouchableOpacity
                onPress={handleGenerateTasks}
                style={styles.generateButton}
                disabled={generating}
              >
                {generating ? (
                  <ActivityIndicator color="#131313" />
                ) : (
                  <Text style={styles.generateButtonText}>
                    Generate My Tasks
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Tab Switcher */}
          {tasks.length > 0 && (
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
                  My Tasks ({tasks.length})
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
          )}

          {/* Generate More Tasks Button */}
          {tasks.length > 0 && (
            <View style={styles.generateMoreContainer}>
              <TextInput
                value={prompt}
                onChangeText={setPrompt}
                placeholder="What else is on your mind?"
                placeholderTextColor="rgba(19, 19, 19, 0.5)"
                style={styles.generateMoreInput}
              />
              <TouchableOpacity
                onPress={handleGenerateTasks}
                style={styles.generateMoreButton}
                disabled={generating}
              >
                {generating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.generateMoreButtonText}>+ Add Tasks</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Custom Task Input */}
          <View style={styles.customTaskContainer}>
            <TextInput
              value={customTask}
              onChangeText={setCustomTask}
              placeholder="Add your own task..."
              placeholderTextColor="rgba(19, 19, 19, 0.5)"
              style={styles.customTaskInput}
            />
            <TouchableOpacity
              onPress={addCustomTask}
              style={styles.addCustomButton}
              disabled={!customTask.trim()}
            >
              <Text style={styles.addCustomButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Task List */}
          <View style={styles.todoContainer}>
            {(activeTab === "mine" ? tasks : allTasks).map((item) => (
              <View key={item.id}>
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
            ))}
            {(activeTab === "mine" ? tasks : allTasks).length === 0 && (
              <Text style={styles.emptyText}>
                {activeTab === "mine"
                  ? "No tasks yet. Tell us what's on your mind!"
                  : "No team tasks yet."}
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuButtonText: {
    fontSize: 24,
    color: "#131313",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#131313",
  },
  mascotContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  mascot: {
    width: 275,
    height: 275,
  },
  moodText: {
    color: "#131313",
    marginTop: 8,
    fontSize: 16,
  },
  membersContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
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
  membersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  memberChip: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  memberChipText: {
    color: "#fff",
  },
  promptContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  promptLabel: {
    color: "#131313",
    marginBottom: 8,
  },
  promptInput: {
    backgroundColor: "rgba(83, 212, 216, 0.35)",
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    color: "#131313",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  generateButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(120, 120, 128, 0.16)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  generateButtonText: {
    color: "#131313",
    fontWeight: "600",
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
  todoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#131313",
    marginBottom: 12,
  },
  taskOwner: {
    fontSize: 12,
    color: "#6366F1",
    fontWeight: "600",
    marginBottom: 4,
    marginLeft: 4,
  },
  taskList: {
    flex: 1,
  },
  emptyText: {
    color: "rgba(19, 19, 19, 0.5)",
    textAlign: "center",
  },
  // Modal styles
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
  generateMoreContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  generateMoreInput: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#131313",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  generateMoreButton: {
    backgroundColor: "#6366F1",
    borderRadius: 24,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  generateMoreButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  taskSelectionModal: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#131313",
    textAlign: "center",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  selectableTask: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectableTaskSelected: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderColor: "#6366F1",
  },
  selectableTaskText: {
    flex: 1,
    fontSize: 16,
    color: "#131313",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#6366F1",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
  },
  cancelButtonText: {
    textAlign: "center",
    fontWeight: "600",
    color: "#666",
  },
  confirmButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#6366F1",
  },
  confirmButtonText: {
    textAlign: "center",
    fontWeight: "600",
    color: "#fff",
  },
  customTaskContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  customTaskInput: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#131313",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  addCustomButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  addCustomButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
  },
});
