import { signIn, signUp } from "@/lib/supabase";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !username)) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        // Existing user - go to main tab
        router.replace("/");
      } else {
        await signUp(email, password, username);
        // New user - go to connect page
        router.replace("/connect-page");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/auth-bg.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {isLogin ? "Welcome!" : "Create Account"}
          </Text>
          <Text style={styles.subtitle}>
            {isLogin
              ? "Sign in to continue"
              : "Join us and start connecting"}
          </Text>
        </View>

        {/* FORM */}
        <View style={styles.form}>
          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="rgba(19, 19, 19, 0.5)"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="rgba(19, 19, 19, 0.5)"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="rgba(19, 19, 19, 0.5)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.primaryButton, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              {loading
                ? "Please wait..."
                : isLogin
                ? "Sign In"
                : "Create Account"}
            </Text>
          </TouchableOpacity>

          {/* TOGGLE */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.footerLink}>
                {isLogin ? " Sign up" : " Sign in"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  header: {
    alignItems: "center",
    marginBottom: 32,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#131313",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: "#131313",
    opacity: 0.8,
  },

  form: {
    gap: 12,
  },

  input: {
    height: 52,
    borderRadius: 100,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: "rgba(83, 212, 216, 0.35)",
    color: "#131313",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },

  primaryButton: {
    height: 52,
    borderRadius: 100,
    backgroundColor: "rgba(120, 120, 128, 0.16)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },

  primaryButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#131313",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },

  footerText: {
    fontSize: 15,
    color: "#131313",
    opacity: 0.8,
  },

  footerLink: {
    fontSize: 15,
    fontWeight: "700",
    color: "#131313",
  },
});