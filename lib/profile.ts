import * as ImagePicker from "expo-image-picker";
import { supabase } from "./supabase";

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
};

export const updateProfile = async (
  userId: string,
  updates: { username?: string; bio?: string; avatar_url?: string },
) => {
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);
  if (error) throw error;
};

export const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });
  if (result.canceled) return null;
  return result.assets[0].uri;
};

export const uploadAvatar = async (userId: string, uri: string) => {
  const ext = uri.split(".").pop() || "jpg";
  const fileName = `${userId}-${Date.now()}.${ext}`;

  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, arrayBuffer, {
      contentType: `image/${ext}`,
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
  await updateProfile(userId, { avatar_url: data.publicUrl });
  return data.publicUrl;
};

export const uploadTaskPhoto = async (taskId: string, uri: string) => {
  const ext = uri.split(".").pop() || "jpg";
  const fileName = `${taskId}-${Date.now()}.${ext}`;

  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error } = await supabase.storage
    .from("task-photos")
    .upload(fileName, arrayBuffer, { contentType: `image/${ext}` });

  if (error) throw error;

  const { data } = supabase.storage.from("task-photos").getPublicUrl(fileName);
  return data.publicUrl;
};
