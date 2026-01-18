import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
const NUDGE_COOLDOWN_MS = __DEV__ ? 10 * 1000 : 5 * 60 * 1000;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ============ AUTH ============
export const signUp = async (
  email: string,
  password: string,
  username: string,
) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  // Create profile
  if (data.user) {
    await supabase.from("profiles").insert({
      id: data.user.id,
      username,
    });
  }
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// ============ GROUPS ============
export const createGroup = async (name: string, userId: string) => {
  const { data, error } = await supabase
    .from("groups")
    .insert({ name, created_by: userId })
    .select()
    .single();
  if (error) throw error;

  // Add creator as member
  await supabase.from("group_members").insert({
    group_id: data.id,
    user_id: userId,
  });
  return data;
};

export const joinGroup = async (inviteCode: string, userId: string) => {
  // Find group by invite code
  const { data: group, error } = await supabase
    .from("groups")
    .select()
    .eq("invite_code", inviteCode.toLowerCase())
    .single();
  if (error) throw new Error("Invalid invite code");

  // Add user to group
  await supabase.from("group_members").insert({
    group_id: group.id,
    user_id: userId,
  });
  return group;
};

export const getMyGroup = async (userId: string): Promise<any | null> => {
  const { data, error } = await supabase
    .from("group_members")
    .select("group_id, groups(*)")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data?.groups;
};

export const getMyGroups = async (userId: string) => {
  const { data, error } = await supabase
    .from("group_members")
    .select("group_id, joined_at, groups(*)")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });

  if (error) return [];
  return data;
};

export const getGroupMembers = async (groupId: string) => {
  const { data, error } = await supabase
    .from("group_members")
    .select("user_id, profiles(username, avatar_url)")
    .eq("group_id", groupId);
  if (error) throw error;
  return data;
};

export const leaveGroup = async (userId: string, groupId: string) => {
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("user_id", userId)
    .eq("group_id", groupId);

  if (error) throw error;
};

// ============ TASKS ============
export const getMyTasks = async (userId: string, groupId: string) => {
  const { data, error } = await supabase
    .from("tasks")
    .select()
    .eq("user_id", userId)
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export const getCompletedGroupTasks = async (groupId: string) => {
  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      *,
      profiles:user_id (username, avatar_url)
    `,
    )
    .eq("group_id", groupId)
    .eq("completed", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export const completeTask = async (
  taskId: string,
  completed: boolean,
  photoUrl?: string,
) => {
  const { error } = await supabase
    .from("tasks")
    .update({
      completed,
      photo_url: photoUrl,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("id", taskId);
  if (error) throw error;
};

export const createTasksForGroup = async (
  groupId: string,
  tasksByUser: Record<string, string[]>, // { odadid: ["task1", "task2"], ... }
) => {
  const tasks = Object.entries(tasksByUser).flatMap(([userId, descriptions]) =>
    descriptions.map((description) => ({
      group_id: groupId,
      user_id: userId,
      description,
    })),
  );
  const { error } = await supabase.from("tasks").insert(tasks);
  if (error) throw error;
};

// ============ MOOD ============
export const calculateGroupMood = async (groupId: string) => {
  const { data, error } = await supabase
    .from("tasks")
    .select("completed")
    .eq("group_id", groupId);
  if (error) throw error;
  if (!data || data.length === 0) return 50; // neutral if no tasks

  const completed = data.filter((t) => t.completed).length;
  const mood = Math.round((completed / data.length) * 100);

  // Update group mood
  await supabase
    .from("groups")
    .update({ creature_mood: mood })
    .eq("id", groupId);
  return mood;
};

export const recalculateGroupMood = async (groupId: string) => {
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("completed")
    .eq("group_id", groupId);

  if (error || !tasks || tasks.length === 0) return 50;

  const completed = tasks.filter((t) => t.completed).length;
  const mood = Math.round((completed / tasks.length) * 100);

  await supabase
    .from("groups")
    .update({ creature_mood: mood })
    .eq("id", groupId);

  return mood;
};

export const subscribeToGroup = (
  groupId: string,
  callback: (group: any) => void,
) => {
  return supabase
    .channel(`group-${groupId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "groups",
        filter: `id=eq.${groupId}`,
      },
      (payload) => callback(payload.new),
    )
    .subscribe();
};

export const subscribeToGroupTasks = (
  groupId: string,
  onUpdate: () => void,
) => {
  return supabase
    .channel(`group-tasks-${groupId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "tasks",
        filter: `group_id=eq.${groupId}`,
      },
      onUpdate,
    )
    .subscribe();
};

export const subscribeToGroupMembers = (
  groupId: string,
  onUpdate: () => void,
) => {
  return supabase
    .channel(`group-members-${groupId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "group_members",
        filter: `group_id=eq.${groupId}`,
      },
      onUpdate,
    )
    .subscribe();
};

export const pickImage = async (useCamera: boolean = false) => {
  // Ask which source
  if (useCamera) {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Camera permission required");
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return null;
    return result.assets[0].uri;
  } else {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return null;
    return result.assets[0].uri;
  }
};

export const pickImageWithChoice = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    Alert.alert("Add Photo", "How would you like to add your proof?", [
      {
        text: "Take Photo",
        onPress: async () => {
          const uri = await pickImage(true);
          resolve(uri);
        },
      },
      {
        text: "Choose from Library",
        onPress: async () => {
          const uri = await pickImage(false);
          resolve(uri);
        },
      },
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => resolve(null),
      },
    ]);
  });
};

export const uploadTaskPhoto = async (taskId: string, uri: string) => {
  const ext = uri.split(".").pop() || "jpg";
  const fileName = `${taskId}-${Date.now()}.${ext}`;

  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from("task-photos")
    .upload(fileName, arrayBuffer, {
      contentType: `image/${ext}`,
      upsert: true,
    });

  if (uploadError) {
    console.log("Upload error:", uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage.from("task-photos").getPublicUrl(fileName);
  return data.publicUrl;
};

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
};

export const canNudgeUser = async (
  senderId: string,
  receiverId: string,
  groupId: string,
) => {
  const { data } = await supabase
    .from("nudges")
    .select("created_at")
    .eq("sender_id", senderId)
    .eq("receiver_id", receiverId)
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!data) return { canNudge: true, secondsLeft: 0 };

  const timeSince = Date.now() - new Date(data.created_at).getTime();
  const canNudge = timeSince > NUDGE_COOLDOWN_MS;
  const secondsLeft = canNudge
    ? 0
    : Math.ceil((NUDGE_COOLDOWN_MS - timeSince) / 1000);

  return { canNudge, secondsLeft };
};

export const sendNudge = async (
  senderId: string,
  receiverId: string,
  groupId: string,
) => {
  // Record the nudge
  const { error } = await supabase.from("nudges").insert({
    sender_id: senderId,
    receiver_id: receiverId,
    group_id: groupId,
  });

  if (error) throw error;

  // Get receiver's push token and sender's name
  const { data: receiver } = await supabase
    .from("profiles")
    .select("push_token")
    .eq("id", receiverId)
    .single();

  const { data: sender } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", senderId)
    .single();

  if (receiver?.push_token) {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: receiver.push_token,
        title: "You got nudged! 👉",
        body: `${sender?.username || "Someone"} nudged you! Do your tasks!`,
        sound: "default",
      }),
    });
  }
};

export const updateGroupMood = async (groupId: string, newMood: number) => {
  const { error } = await supabase
    .from("groups")
    .update({ creature_mood: newMood })
    .eq("id", groupId);
  if (error) throw error;
};

export const getUncompletedGroupTasks = async (groupId: string) => {
  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      *,
      profiles:user_id (username, avatar_url)
    `,
    )
    .eq("group_id", groupId)
    .eq("completed", false)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};
