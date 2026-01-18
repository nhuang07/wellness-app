import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ImageBackground,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';

export default function JoinGroupScreen() {
  const [code, setCode] = useState('');
  const router = useRouter();

  const handleJoin = () => {
    const trimmed = code.trim().toUpperCase();

    if (trimmed.length !== 5) {
      Alert.alert('Invalid code', 'Code must be exactly 5 letters.');
      return;
    }

    // Navigate to main group page
    router.push(`/group/${trimmed}`);
  };

  return (
    <ImageBackground
      source={require('../../assets/images/auth-bg-1.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/connect-page')}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Join Group</Text>
          <Text style={styles.subtitle}>Enter 5-letter code:</Text>

          <TextInput
            style={styles.input}
            value={code}
            onChangeText={(text) => setCode(text)}
            autoCapitalize="characters"
            maxLength={5}
            placeholder="XXXXX"
            placeholderTextColor="rgba(19, 19, 19, 0.24)"
          />

          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoin}
            activeOpacity={0.8}
          >
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 24,
    justifyContent: 'center',
  },

  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  backButtonText: {
    color: '#131313',
    fontSize: 16,
    fontWeight: '600',
  },

  content: {
    backgroundColor: 'transparent',
    gap: 16,
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#131313',
    marginBottom: 8,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 16,
    color: '#131313',
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 8,
  },

  input: {
    height: 52,
    backgroundColor: 'rgba(83, 212, 216, 0.35)',
    color: '#131313',
    borderRadius: 100,
    paddingHorizontal: 20,
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
    fontWeight: '700',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },

  joinButton: {
    height: 52,
    backgroundColor: 'rgba(120, 120, 128, 0.16)',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },

  joinButtonText: {
    color: '#131313',
    fontSize: 18,
    fontWeight: '600',
  },
});
