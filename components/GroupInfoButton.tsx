import { leaveGroup, supabase } from "@/lib/supabase";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type GroupInfoButtonProps = {
  inviteCode: string;
  groupTasks: any[];
  myTasks: any[];
  // optional callback so parent can refresh groups and side menu
  onLeftGroup?: () => void;
};

export default function GroupInfoButton({
  inviteCode,
  groupTasks,
  myTasks,
  onLeftGroup,
}: GroupInfoButtonProps) {
  const [visible, setVisible] = useState(false);

  const groupCompleted = groupTasks?.filter((t) => t.completed).length ?? 0;
  const myCompleted = myTasks?.filter((t) => t.completed).length ?? 0;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(inviteCode);
    Alert.alert("Copied 🎉", "Group code copied to clipboard");
  };

  const handleLeaveGroup = () => {
    Alert.alert("Leave group", "Are you sure you want to leave this group?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          try {
            console.log("Starting leave group...");

            const { data, error: userError } = await supabase.auth.getUser();
            console.log("User:", data?.user?.id, "Error:", userError);

            if (userError || !data.user) {
              Alert.alert("Error", "Could not get current user.");
              return;
            }
            const userId = data.user.id;

            console.log("Looking up group with code:", inviteCode);

            const { data: group, error: groupError } = await supabase
              .from("groups")
              .select("id")
              .eq("invite_code", inviteCode.toLowerCase())
              .single();

            console.log("Group:", group, "Error:", groupError);

            if (groupError || !group?.id) {
              Alert.alert(
                "Error",
                "Could not find this group in Supabase (invalid code).",
              );
              return;
            }

            const groupId = group.id;
            console.log(
              "Calling leaveGroup with userId:",
              userId,
              "groupId:",
              groupId,
            );

            await leaveGroup(userId, groupId);
            console.log("Left group successfully");

            setVisible(false);

            if (onLeftGroup) {
              onLeftGroup();
            } else {
              router.replace("/");
            }
          } catch (error: any) {
            console.log("Error:", error);
            Alert.alert("Error", error.message ?? "Failed to leave group");
          }
        },
      },
    ]);
  };

  return (
    <View>
      {/* Info Button */}
      <TouchableOpacity
        style={styles.infoButton}
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.infoText}>ℹ️</Text>
      </TouchableOpacity>

      {/* Popup */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        {/* Clickable dim background */}
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          {/* Popup (prevents closing when tapped) */}
          <Pressable style={styles.popup} onPress={(e) => e.stopPropagation()}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Group Info</Text>

            {/* Group Code */}
            <View style={styles.section}>
              <Text style={styles.label}>Group Code</Text>
              <TouchableOpacity
                style={styles.codeBox}
                onPress={handleCopy}
                activeOpacity={0.8}
              >
                <Text style={styles.codeText}>{inviteCode}</Text>
                <Text style={styles.copyHint}>Tap to copy</Text>
              </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.section}>
              <Text style={styles.label}>Stats</Text>
              <Text style={styles.stat}>
                • Group tasks completed:{" "}
                <Text style={styles.bold}>{groupCompleted}</Text>
              </Text>
              <Text style={styles.stat}>
                • Your tasks completed:{" "}
                <Text style={styles.bold}>{myCompleted}</Text>
              </Text>
            </View>

            {/* Leave Group */}
            <TouchableOpacity
              style={styles.leaveButton}
              onPress={handleLeaveGroup}
              activeOpacity={0.8}
            >
              <Text style={styles.leaveButtonText}>Leave Group</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    fontSize: 18,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  closeText: {
    fontSize: 18,
    color: "#666",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#131313",
    textAlign: "center",
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
  },
  codeBox: {
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "rgba(83, 212, 216, 0.35)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
  codeText: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 6,
    color: "#131313",
  },
  copyHint: {
    marginTop: 6,
    fontSize: 12,
    color: "#555",
  },
  stat: {
    fontSize: 14,
    color: "#131313",
    marginBottom: 6,
  },
  bold: {
    fontWeight: "700",
  },
  leaveButton: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#D00000",
    alignItems: "center",
  },
  leaveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
