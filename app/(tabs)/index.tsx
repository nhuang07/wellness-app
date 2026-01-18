import MenuDrawer from '@/components/MenuDrawer';
import TodoItem from '@/components/TodoItem';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function TabOneScreen() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const [tasks, setTasks] = useState<{ id: string; text: string; done: boolean }[]>([]);
  const [newTask, setNewTask] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const groups = ['Study Buddies', 'Fitness Friends', 'Project Team'];

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), text: newTask, done: false }]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => (task.id === id ? { ...task, done: !task.done } : task)));
  };

  const goToProfile = () => {
    alert('Go to profile screen!');
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Menu Drawer */}
      <Modal visible={menuOpen} animationType="slide" transparent>
        <View style={{ flex: 1, flexDirection: 'row' }}>
            <MenuDrawer
                groups={groups}
                onClose={() => setMenuOpen(false)}
                onProfile={goToProfile}
                onCreateGroup={() => alert('Create Group pressed!')}
                onJoinGroup={() => alert('Join Group pressed!')}
            />
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuOpen(true)}>
          <Text style={[styles.menuButton, { color: themeColors.tint }]}>☰</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>My Pet</Text>
      </View>

      {/* Mascot Image */}
      <View style={{ backgroundColor: themeColors.mascotBackground, alignItems: 'center', padding: 10 }}>
        <Image
          source={{ uri: 'https://png.pngtree.com/png-vector/20231017/ourmid/pngtree-cute-cartoon-happy-dog-png-file-png-image_10201723.png' }}
          style={styles.mascot}
        />
      </View>

      {/* Todo List */}
      <View style={styles.todoContainer}>
        <Text style={{ color: 'black' }}> My Tasks </Text>
        <View style={styles.addTaskContainer}>
          <TextInput
            value={newTask}
            onChangeText={setNewTask}
            placeholder="Add a task..."
            placeholderTextColor={themeColors.textDone}
            style={[styles.input, { borderColor: themeColors.inputBorder, color: themeColors.text }]}
          />
          <TouchableOpacity onPress={addTask} style={[styles.addButton, { backgroundColor: themeColors.primaryButton }]}>
            <Text style={{ color: 'white' }}>Add</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={tasks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TodoItem
              text={item.text}
              done={item.done}
              onToggle={() => toggleTask(item.id)}
            />
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  menuButton: { fontSize: 24, marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  mascot: { width: 150, height: 150, marginVertical: 20 },
  todoContainer: { flex: 1, paddingHorizontal: 16 },
  addTaskContainer: { flexDirection: 'row', marginBottom: 16 },
  input: { flex: 1, borderWidth: 1, padding: 8, borderRadius: 8 },
  addButton: { padding: 10, borderRadius: 8, marginLeft: 8 },
});
