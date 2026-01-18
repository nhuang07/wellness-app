// app/group-home.tsx
import GroupInfoButton from "@/components/GroupInfoButton";
import MenuDrawer from "@/components/MenuDrawer";
import TaskCard from "@/components/TaskCard";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";

import { generateTasksForUser } from "@/lib/gemini";
import {
  canNudgeUser,
  getCompletedGroupTasks,
  getGroupMembers,
  getMyGroup,
  getMyGroups,
  getMyTasks,
  getProfile,
  getUncompletedGroupTasks,
  sendNudge,
  subscribeToGroup,
  subscribeToGroupMembers,
  subscribeToGroupTasks,
  supabase,
} from "@/lib/supabase";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
const NWTaskComplete = require("@/assets/task_complete.gif");

// Pet images
const NWHappy = require("@/assets/images/NWhappy.png");
const NWNeutral = require("@/assets/images/NWneutral.png");
const NWSad = require("@/assets/images/NWsad.png");

export default function GroupHomeScreen() {
  const params = useLocalSearchParams();
  const passedGroupId = params.groupId as string | undefined;
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
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [nudgeLoading, setNudgeLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"mine" | "pending" | "all">(
    "mine",
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [tasksLoaded, setTasksLoaded] = useState(false);

  const bounceAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Profile modal
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [trackedDecay, setTrackedDecay] = useState(0);
  const [trackedBoost, setTrackedBoost] = useState(0);

  // Pet mood
  const [petMood, setPetMood] = useState<number>(100);

  const trackedBoostRef = useRef(trackedBoost);
  const [uncompletedTasks, setUncompletedTasks] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    trackedBoostRef.current = trackedBoost;
  }, [trackedBoost]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrackedDecay((prev) => {
        if (prev < trackedBoostRef.current + 100) {
          return prev + 10;
        }
        return prev;
      });
    }, 5000);

    return () => clearInterval(interval);
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
    const groupChannel = subscribeToGroup(group.id, (updatedGroup) => {
      setGroup((prev: any) => ({ ...prev, ...updatedGroup }));
    });

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(membersChannel);
      supabase.removeChannel(groupChannel);
    };
  }, [group?.id]);

  // Initialize decay based on group creation time
  useEffect(() => {
    if (!group?.created_at) return;
    if (!tasksLoaded) return;
    if (initialized) return;

    const secondsElapsed =
      (Date.now() - new Date(group.created_at).getTime()) / 1000;
    const initialDecay = Math.floor(secondsElapsed / 5) * 10;
    const initialBoost = allTasks.length * 20;

    // Always start with boost 100 ahead of decay for 100% mood
    let cappedDecay = initialDecay;
    let cappedBoost = initialDecay + 100;

    // But if actual boost from tasks is higher, use that
    if (initialBoost > cappedBoost) {
      cappedBoost = initialBoost;
      // And cap decay relative to it
      if (cappedDecay > cappedBoost + 100) {
        cappedDecay = cappedBoost + 100;
      }
    }

    console.log(
      "Final - decay:",
      cappedDecay,
      "boost:",
      cappedBoost,
      "mood:",
      Math.round(50 + (cappedBoost - cappedDecay) / 2),
    );

    setTrackedDecay(cappedDecay);
    setTrackedBoost(cappedBoost);
    setInitialized(true);
  }, [group?.created_at, tasksLoaded, initialized, allTasks.length]);

  useEffect(() => {
    if (!initialized) return;

    const newBoost = allTasks.length * 20 + 100;
    const cappedBoost = Math.min(newBoost, trackedDecay + 100);
    setTrackedBoost(cappedBoost);
  }, [allTasks.length, initialized, trackedDecay]);

  // Calculate mood from tracked values
  useEffect(() => {
    if (!initialized) return;

    const difference = trackedBoost - trackedDecay;
    const mood = Math.round(50 + difference / 2);
    setPetMood(Math.max(0, Math.min(100, mood)));
  }, [trackedBoost, trackedDecay, initialized]);

  /*
  const startPetMoodDecay = () => {
    if (petIntervalRef.current) clearInterval(petIntervalRef.current);
    petIntervalRef.current = setInterval(() => {
      setPetMood((prev) => {
        const newMood = Math.max(prev - 10, 0);
        return newMood;
      });
    }, 10000);
  };
  */

  const loadAllGroups = async (uid?: string) => {
    const currentUserId = uid || userId;
    if (!currentUserId) return;

    setGroupsLoading(true);
    try {
      const userGroups = await getMyGroups(currentUserId);
      const groups = userGroups.map((g: any) => g.groups).filter(Boolean);
      setAllGroups(groups);
    } catch (error) {
      console.log("Error loading groups:", error);
    } finally {
      setGroupsLoading(false);
    }
  };

  const handleNudge = async () => {
    if (!userId || !selectedMember?.user_id || !group?.id) return;

    setNudgeLoading(true);
    try {
      const { canNudge, secondsLeft } = await canNudgeUser(
        userId,
        selectedMember.user_id,
        group.id,
      );

      if (!canNudge) {
        Alert.alert("Cooldown", `Wait ${secondsLeft}s before nudging again`);
        return;
      }

      await sendNudge(userId, selectedMember.user_id, group.id);
      Alert.alert(
        "Nudged! 👉",
        `You nudged ${selectedMember.fullProfile?.username || "them"}!`,
      );
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setNudgeLoading(false);
    }
  };

  // Switch groups
  const handleSelectGroup = (selectedGroup: any) => {
    setGroup(selectedGroup);
    if (userId && selectedGroup?.id) {
      loadTasks(userId, selectedGroup.id);
      loadMembers(selectedGroup.id);
    }
    setMenuOpen(false);
  };

  // Load initial data
  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      await loadAllGroups(user.id);

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

    // Only show INCOMPLETE tasks in "My Tasks"
    const incompleteTasks = myTasks.filter((task) => !task.completed);
    setTasks(incompleteTasks);

    const groupTasks = await getCompletedGroupTasks(currentGroupId);
    setAllTasks(groupTasks);
    setTasksLoaded(true);

    const uncompleted = await getUncompletedGroupTasks(currentGroupId);
    setUncompletedTasks(uncompleted);
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
      setSelectedTasks(tasks);
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

  // Task completion increases mood
  const handleTaskComplete = async () => {
    await loadTasks();
  };

  const openMemberProfile = async (member: any) => {
    try {
      const profile = await getProfile(member.user_id);

      // Count tasks completed in this group (allTasks is already completed tasks)
      const groupTasksCompleted = allTasks.filter(
        (t) => t.user_id === member.user_id,
      ).length;

      // Count all tasks completed ever (across all groups)
      const { count: totalCompleted } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("user_id", member.user_id)
        .eq("completed", true);

      setSelectedMember({
        ...member,
        fullProfile: {
          ...profile,
          tasks_completed_group: groupTasksCompleted,
          tasks_completed_total: totalCompleted || 0,
        },
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
    if (petMood > 50) return NWHappy;
    if (petMood > 10) return NWNeutral;
    return NWSad;
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

  const happyWiggle = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const neutralBob = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: -10,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const sadShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const taskCompleteAnimation = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: -30,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.bounce,
        useNativeDriver: true,
      }),
    ]).start();
    happyWiggle();
  };

  return (
    <ImageBackground
      source={require("@/assets/images/auth-bg-1.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Menu Drawer */}
        {menuOpen && (
          <MenuDrawer
            groups={allGroups}
            currentGroupId={group?.id}
            loading={groupsLoading}
            onClose={() => setMenuOpen(false)}
            onProfile={goToProfile}
            onCreateGroup={() => router.push("/create-group")}
            onJoinGroup={() => router.push("/join-group")}
            onSelectGroup={handleSelectGroup}
          />
        )}

        {/* Profile Modal */}
        <Modal
          visible={profileModalVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setProfileModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={StyleSheet.absoluteFillObject}
              onPress={() => setProfileModalVisible(false)}
            />
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
                        {selectedMember.fullProfile?.tasks_completed_group || 0}
                      </Text>
                      <Text style={styles.statLabel}>This Group</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statNumber}>
                        {selectedMember.fullProfile?.tasks_completed_total || 0}
                      </Text>
                      <Text style={styles.statLabel}>All Time</Text>
                    </View>
                  </View>
                  {selectedMember?.user_id !== userId && (
                    <TouchableOpacity
                      style={styles.nudgeButton}
                      onPress={handleNudge}
                      disabled={nudgeLoading}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.nudgeButtonText}>
                        {nudgeLoading ? "Nudging..." : "👉 Nudge"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Task Selection Modal */}
        <Modal
          visible={showTaskSelection}
          animationType="fade"
          transparent
          onRequestClose={() => setShowTaskSelection(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.taskSelectionModal}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowTaskSelection(false);
                  setGeneratedTasks([]);
                  setSelectedTasks([]);
                }}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>

              <Text style={styles.modalTitle}>Select Your Tasks</Text>
              <Text style={styles.modalSubtitle}>Tap to select/deselect</Text>

              <ScrollView style={{ maxHeight: 300 }}>
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
                      {selectedTasks.includes(task) && (
                        <Text style={{ color: "#6366F1" }}>✓</Text>
                      )}
                    </View>
                    <Text style={styles.selectableTaskText}>{task}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

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

        {/* Main ScrollView */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                onPress={() => router.push("/home")}
                style={styles.homeButton}
              >
                <Text style={styles.homeButtonText}>🏠</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setMenuOpen(true)}
                style={styles.menuButton}
              >
                <Text style={styles.menuButtonText}>☰</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.headerTitle}>{group?.name || "My Pet"}</Text>

            <GroupInfoButton
              inviteCode={group?.invite_code || "------"}
              groupTasks={allTasks}
              myTasks={tasks}
              onLeftGroup={async () => {
                // Reload groups to see what's left
                const userGroups = await getMyGroups(userId!);
                const groups = userGroups
                  .map((g: any) => g.groups)
                  .filter(Boolean);
                if (groups.length > 0) {
                  // Switch to first remaining group
                  setGroup(groups[0]);
                  setAllGroups(groups);
                  await loadTasks(userId!, groups[0].id);
                  await loadMembers(groups[0].id);
                } else {
                  // No groups left, go to connect page
                  router.replace("/connect-page");
                }
              }}
            />
          </View>

          {/* Mascot */}
          <View style={styles.mascotContainer}>
            <TouchableOpacity
              onPress={() => {
                if (petMood > 50) happyWiggle();
                else if (petMood > 10) neutralBob();
                else sadShake();
              }}
              activeOpacity={0.9}
            >
              <Animated.Image
                source={getCreatureImage()}
                style={[
                  styles.mascot,
                  {
                    transform: [
                      { translateX: shakeAnim },
                      { translateY: bounceAnim },
                    ],
                  },
                ]}
              />
            </TouchableOpacity>

            {/* Mood Bar */}
            <View style={styles.moodBarContainer}>
              <View style={styles.moodBarBackground}>
                <View style={[styles.moodBarFill, { width: `${petMood}%` }]} />
                <View style={[styles.moodIndicator, { left: `${petMood}%` }]}>
                  <Image
                    source={getCreatureImage()}
                    style={styles.moodIndicatorImage}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Group Members */}
          <View style={styles.membersContainer}>
            <Text style={styles.sectionTitle}>Members ({members.length})</Text>
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

          {/* AI Task Generation */}
          <View style={styles.aiGenerateContainer}>
            <TouchableOpacity
              onPress={() => {
                if (prompt.trim()) handleGenerateTasks();
              }}
              style={styles.aiGenerateButton}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator color="#6366F1" />
              ) : (
                <>
                  <Text style={styles.aiGenerateIcon}>
                    <Image
                      source={require("@/assets/images/gemini.png")}
                      style={{ width: 30, height: 30 }}
                    />
                  </Text>
                  <TextInput
                    value={prompt}
                    onChangeText={setPrompt}
                    placeholder="Need help setting some goals?"
                    placeholderTextColor="rgba(19, 19, 19, 0.5)"
                    style={styles.aiGenerateInput}
                  />
                  <Text style={styles.aiGenerateArrow}>→</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

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
                My Tasks ({tasks.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "pending" && styles.activeTab]}
              onPress={() => setActiveTab("pending")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "pending" && styles.activeTabText,
                ]}
              >
                To Do ({uncompletedTasks.length})
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
                Completed ({allTasks.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Task List */}
          <View style={styles.todoContainer}>
            {activeTab === "mine" &&
              tasks.map((item) => (
                <View key={item.id}>
                  <TaskCard
                    task={{
                      id: item.id,
                      description: item.description,
                      completed: item.completed,
                      photo_url: item.photo_url,
                      completed_at: item.completed_at,
                    }}
                    onComplete={handleTaskComplete}
                  />
                </View>
              ))}

            {activeTab === "pending" &&
              uncompletedTasks.map((item) => (
                <View key={item.id}>
                  <Text style={styles.taskOwner}>
                    {item.profiles?.username || "Unknown"}
                  </Text>
                  <View style={styles.pendingTaskCard}>
                    <Text style={styles.pendingTaskText}>
                      {item.description}
                    </Text>
                    <Text style={styles.pendingTaskDate}>
                      Created{" "}
                      {new Date(item.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </View>
                </View>
              ))}

            {activeTab === "all" &&
              allTasks.map((item) => (
                <View key={item.id}>
                  <Text style={styles.taskOwner}>
                    {item.profiles?.username || "Unknown"}
                  </Text>
                  <TaskCard
                    task={{
                      id: item.id,
                      description: item.description,
                      completed: item.completed,
                      photo_url: item.photo_url,
                      completed_at: item.completed_at,
                    }}
                    onComplete={handleTaskComplete}
                  />
                </View>
              ))}

            {activeTab === "mine" && tasks.length === 0 && (
              <Text style={styles.emptyText}>
                No tasks yet. Tell us what's on your mind!
              </Text>
            )}

            {activeTab === "pending" && uncompletedTasks.length === 0 && (
              <Text style={styles.emptyText}>
                🎉 Everyone's done! Great work team!
              </Text>
            )}

            {activeTab === "all" && allTasks.length === 0 && (
              <Text style={styles.emptyText}>No completed tasks yet.</Text>
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
    justifyContent: "space-between",
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
    backgroundColor: "rgba(83, 138, 216, 0.35)",
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
    borderColor: "rgba(222, 222, 222, 0.47)",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  taskSelectionModal: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    paddingTop: 48,
    width: "100%",
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
    backgroundColor: "#6366f1",
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
    borderColor: "rgba(222, 222, 222, 0.47)",
  },
  addCustomButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
  },
  addCustomButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
  },
  aiGenerateContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  aiGenerateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: "rgba(99, 102, 241, 0.3)",
  },
  aiGenerateIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  aiGenerateInput: {
    flex: 1,
    color: "#131313",
    fontSize: 16,
  },
  aiGenerateArrow: {
    fontSize: 20,
    color: "#6366F1",
    fontWeight: "600",
  },
  nudgeButton: {
    marginTop: 16,
    backgroundColor: "#6366F1",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  nudgeButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
  pendingTaskCard: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#6365f160",
    borderLeftWidth: 4,
    borderLeftColor: "#6366F1",
  },
  pendingTaskText: {
    fontSize: 16,
    color: "#131313",
    fontWeight: "500",
  },
  pendingTaskDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 6,
  },
  moodBarContainer: {
    width: "80%",
    marginTop: 16,
    alignItems: "center",
  },
  moodBarBackground: {
    width: "100%",
    height: 12,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 6,
    overflow: "visible",
    position: "relative",
  },
  moodBarFill: {
    height: "100%",
    backgroundColor: "#6366F1",
    borderRadius: 6,
  },
  moodIndicator: {
    position: "absolute",
    top: -14,
    marginLeft: -20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  moodIndicatorImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#fff",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  homeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  homeButtonText: {
    fontSize: 20,
  },
});
