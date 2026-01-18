import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Pressable,
    StyleSheet,
    TextInput,
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
    <View style={styles.container}>
      
      <Pressable style={styles.backButton} onPress={() => router.replace('/connect-page')}>
        <Text style={styles.backButtonText}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Join Group</Text>

      <Text style={styles.label}>Enter 5-letter code:</Text>

      <TextInput
        style={styles.input}
        value={code}
        onChangeText={(text) => setCode(text)}
        autoCapitalize="characters"
        maxLength={5}
        placeholder="ABCDE"
        placeholderTextColor="#888"
      />

      <Pressable style={styles.joinButton} onPress={handleJoin}>
        <Text style={styles.joinButtonText}>Join</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
    padding: 24,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 24,
    padding: 6,
  },
  backButtonText: {
    color: '#955bf2ff',
    fontSize: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 18,
    letterSpacing: 3,
    marginBottom: 16,
  },
  joinButton: {
    backgroundColor: '#955bf2ff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
