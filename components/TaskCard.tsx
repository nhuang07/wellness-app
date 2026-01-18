import { pickImageWithChoice, supabase, uploadTaskPhoto } from "@/lib/supabase";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TaskCardProps {
  task: {
    id: string;
    description: string;
    completed: boolean;
    photo_url?: string;
    completed_at?: string;
  };
  onComplete: () => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

export default function TaskCard({
  task,
  onComplete,
  selectable,
  selected,
  onSelect,
}: TaskCardProps) {
  const [uploading, setUploading] = useState(false);

  const handleCompleteWithPhoto = async () => {
    try {
      const uri = await pickImageWithChoice();
      if (!uri) return;

      setUploading(true);
      const photoUrl = await uploadTaskPhoto(task.id, uri);

      const { error } = await supabase
        .from("tasks")
        .update({
          completed: true,
          photo_url: photoUrl,
          completed_at: new Date().toISOString(),
        })
        .eq("id", task.id);

      if (error) throw error;
      onComplete();
    } catch (error) {
      console.log("Error completing task:", error);
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Selectable mode (for choosing AI tasks)
  if (selectable) {
    return (
      <TouchableOpacity
        style={[styles.card, selected && styles.cardSelected]}
        onPress={onSelect}
      >
        <View style={styles.checkbox}>{selected && <Text>✓</Text>}</View>
        <Text style={styles.description}>{task.description}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.card, task.completed && styles.cardCompleted]}>
      <View style={styles.content}>
        <Text
          style={[
            styles.description,
            task.completed && styles.descriptionCompleted,
          ]}
        >
          {task.description}
        </Text>

        {task.completed && task.completed_at && (
          <Text style={styles.completedDate}>
            Completed {formatDate(task.completed_at)}
          </Text>
        )}

        {task.completed && task.photo_url && (
          <Image source={{ uri: task.photo_url }} style={styles.proofPhoto} />
        )}
      </View>

      {!task.completed && (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleCompleteWithPhoto}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.completeButtonText}>📷 Done</Text>
          )}
        </TouchableOpacity>
      )}

      {task.completed && (
        <View style={styles.checkmark}>
          <Text>✅</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  cardCompleted: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderColor: "rgba(16, 185, 129, 0.5)",
  },
  cardSelected: {
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    borderColor: "#6366F1",
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: "#131313",
  },
  descriptionCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.7,
  },
  completedDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  proofPhoto: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginTop: 12,
  },
  completeButton: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  completeButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  checkmark: {
    marginLeft: 12,
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
});
