import { Text, View } from '@/components/Themed';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';

function generateCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let out = '';
  for (let i = 0; i < 5; i++) {
    const idx = Math.floor(Math.random() * letters.length);
    out += letters[idx];
  }
  return out;
}

export default function CreateGroupScreen() {
  const [code, setCode] = useState('');
  const router = useRouter();

  useEffect(() => {
    setCode(generateCode());
  }, []);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(code);
    Alert.alert('Copied', 'Group code copied to clipboard.');
  };

  const goToGroup = () => {
    router.push(`/group/${code}`);
  };

  return (
    <View style={styles.container}>

      <Pressable style={styles.backButton} onPress={() => router.replace('/connect-page')}>
        <Text style={styles.backButtonText}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Create Group</Text>
      <Text style={styles.subtitle}>Share this code so others can join:</Text>

      <View style={styles.codeBox}>
        <Text style={styles.codeText}>{code}</Text>
      </View>

      <Pressable style={styles.primaryButton} onPress={handleCopy}>
        <Text style={styles.primaryButtonText}>Copy Code</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={goToGroup}>
        <Text style={styles.secondaryButtonText}>Go To Group Page</Text>
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
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: '#ccc',
    marginBottom: 24,
    textAlign: 'center',
  },
  codeBox: {
    alignSelf: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: '#222',
    marginBottom: 24,
  },
  codeText: {
    color: '#fff',
    fontSize: 28,
    letterSpacing: 6,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#955bf2ff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#955bf2ff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#955bf2ff',
    fontSize: 18,
    fontWeight: '600',
  },
});
