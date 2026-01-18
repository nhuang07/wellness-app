import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

export default function TabOneScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect With Friends</Text>

      <Pressable
        style={styles.button}
        onPress={() => router.push('/join-group')}
      >
        <Text style={styles.buttonText}>Join Group</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => router.push('/create-group')}
      >
        <Text style={styles.buttonText}>Create Group</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010', // solid background
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 40,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#955bf2ff',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
