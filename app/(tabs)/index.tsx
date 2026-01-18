import MenuDrawer from '@/components/MenuDrawer';
import TodoItem from '@/components/TodoItem';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function TabOneScreen() {
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
    <ImageBackground
      source={require('../../assets/images/auth-bg-1.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.container}>
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
            <TouchableOpacity 
              style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }}
              onPress={() => setMenuOpen(false)}
            />
          </View>
        </Modal>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => setMenuOpen(true)}
            style={styles.menuButton}
          >
            <Text style={styles.menuButtonText}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Pet</Text>
        </View>

        {/* Mascot Image */}
        <View style={styles.mascotContainer}>
          <View style={styles.mascotBox}>
            <Image
              source={{ uri: 'https://png.pngtree.com/png-vector/20231017/ourmid/pngtree-cute-cartoon-happy-dog-png-file-png-image_10201723.png' }}
              style={styles.mascot}
            />
          </View>
        </View>

        {/* Todo List */}
        <View style={styles.todoContainer}>
          <Text style={styles.sectionTitle}>My Tasks</Text>
          
          <View style={styles.addTaskContainer}>
            <TextInput
              value={newTask}
              onChangeText={setNewTask}
              placeholder="Add a task..."
              placeholderTextColor="rgba(19, 19, 19, 0.5)"
              style={styles.input}
            />
            <TouchableOpacity 
              onPress={addTask} 
              style={styles.addButton}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>Add</Text>
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
            style={styles.taskList}
          />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: 'transparent',
  },

  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },

  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  menuButtonText: {
    fontSize: 24,
    color: '#131313',
  },

  headerTitle: { 
    fontSize: 28,
    fontWeight: '700',
    color: '#131313',
  },

  mascotContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },

  mascotBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },

  mascot: { 
    width: 150, 
    height: 150,
  },

  todoContainer: { 
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#131313',
    marginBottom: 16,
  },

  addTaskContainer: { 
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },

  input: { 
    flex: 1,
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: 'rgba(83, 212, 216, 0.35)',
    color: '#131313',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },

  addButton: { 
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(120, 120, 128, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },

  addButtonText: {
    color: '#131313',
    fontSize: 16,
    fontWeight: '600',
  },

  taskList: {
    flex: 1,
  },
});