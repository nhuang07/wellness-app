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
  };
  onComplete: () => void;
}

export default function TaskCard({ task, onComplete }: TaskCardProps) {
  const [uploading, setUploading] = useState(false);

  const handleCompleteWithPhoto = async () => {
    try {
      const uri = await pickImageWithChoice();
      if (!uri) return;

      setUploading(true);
      const photoUrl = await uploadTaskPhoto(task.id, uri);

      const { error } = await supabase
        .from("tasks")
        .update({ completed: true, photo_url: photoUrl })
        .eq("id", task.id);

      if (error) throw error;
      onComplete();
    } catch (error) {
      console.log("Error completing task:", error);
    } finally {
      setUploading(false);
    }
  };

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
});
