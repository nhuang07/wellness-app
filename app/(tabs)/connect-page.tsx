import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';

export default function TabOneScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('../../assets/images/auth-bg-1.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Connect With Friends</Text>
          <Text style={styles.subtitle}>
            Join an existing group or create your own
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/join-group')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Join Group</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/create-group')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Create Group</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  content: {
    backgroundColor: 'transparent',
    width: '100%',
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
    marginBottom: 24,
  },

  button: {
    width: '100%',
    height: 52,
    borderRadius: 100,
    backgroundColor: 'rgba(120, 120, 128, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },

  buttonText: {
    color: '#131313',
    fontSize: 18,
    fontWeight: '600',
  },
});