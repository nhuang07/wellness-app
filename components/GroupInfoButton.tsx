    import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type GroupInfoButtonProps = {
  inviteCode: string;
  groupTasks: any[];
  myTasks: any[];
};

export default function GroupInfoButton({
  inviteCode,
  groupTasks,
  myTasks,
}: GroupInfoButtonProps) {
  const [visible, setVisible] = useState(false);

  const groupCompleted =
    groupTasks?.filter((t) => t.completed).length ?? 0;
  const myCompleted =
    myTasks?.filter((t) => t.completed).length ?? 0;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(inviteCode);
    Alert.alert("Copied 🎉", "Group code copied to clipboard");
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
        <View style={styles.overlay}>
          <View style={styles.popup}>
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
          </View>
        </View>
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
});
