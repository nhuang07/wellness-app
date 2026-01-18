import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

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

export const getMyGroup = async (userId: string) => {
  const { data, error } = await supabase
    .from("group_members")
    .select("group_id, groups(*)")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data.groups;
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

export const getAllGroupTasks = async (groupId: string) => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*, profiles(username)")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export const completeTask = async (taskId: string, completed: boolean) => {
  const { error } = await supabase
    .from("tasks")
    .update({ completed })
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
