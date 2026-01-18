import { Text, View } from '@/components/Themed';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  ImageBackground,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';

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
  const [groupName, setGroupName] = useState('');
  const router = useRouter();

  useEffect(() => {
    setCode(generateCode());
  }, []);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(code);
    Alert.alert('Copied! 🎉', 'Group code copied to clipboard.');
  };

  const goToGroup = () => {
  router.push('/(tabs)');
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

          {/* Group name field */}
          <Text style={styles.label}>Create Group</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter group name..."
            placeholderTextColor="rgba(19,19,19,0.45)"
            value={groupName}
            onChangeText={setGroupName}
          />

          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{code}</Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleCopy}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Copy Code</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={goToGroup}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Go To Group Page</Text>
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

  /* UPDATED label — bigger + centered */
  label: {
    fontSize: 35,
    fontWeight: '700',
    color: '#131313',
    textAlign: 'center',
    marginBottom: 12,
  },

  /* UPDATED input — more rounded + smaller height */
input: {
  alignSelf: 'center',
  width: '85%',      // ← increased horizontal length
  height: 44,
  borderRadius: 100,
  borderWidth: 1,
  borderColor: 'rgba(19,19,19,0.12)',
  paddingHorizontal: 16,
  backgroundColor: 'rgba(255, 255, 255, 0.55)',
  marginBottom: 16,
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowOffset: { width: 0, height: 3 },
  shadowRadius: 5,
  elevation: 2,
},
  codeBox: {
    alignSelf: 'center',
    paddingVertical: 24,
    paddingHorizontal: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(83, 212, 216, 0.35)',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },

  codeText: {
    color: '#131313',
    fontSize: 36,
    letterSpacing: 8,
    fontWeight: '700',
  },

  primaryButton: {
    height: 52,
    borderRadius: 100,
    backgroundColor: 'rgba(120, 120, 128, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },

  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#131313',
  },

  secondaryButton: {
    height: 52,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },

  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#131313',
  },
});
