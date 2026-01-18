import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface MenuDrawerProps {
  groups: string[];
  onClose: () => void;
  onProfile: () => void;
  onCreateGroup: () => void;
  onJoinGroup: () => void;
}

export default function MenuDrawer({
  groups,
  onClose,
  onProfile,
  onCreateGroup,
  onJoinGroup,
}: MenuDrawerProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.drawer, { backgroundColor: themeColors.background }]}>
      <Text style={[styles.title, { color: themeColors.text }]}>Your Groups</Text>

      {groups.map((group, index) => (
        <Text key={index} style={[styles.group, { color: themeColors.text }]}>
          {group}
        </Text>
      ))}

      {/* Create / Join Group Buttons */}
      <TouchableOpacity
        style={[styles.groupButton, { backgroundColor: themeColors.primaryButton }]}
        onPress={onCreateGroup}
      >
        <Text style={styles.groupButtonText}>Create Group</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.groupButton, { backgroundColor: themeColors.primaryButton }]}
        onPress={onJoinGroup}
      >
        <Text style={styles.groupButtonText}>Join Group</Text>
      </TouchableOpacity>

      {/* Profile Button */}
      <TouchableOpacity
        style={[styles.profileButton, { backgroundColor: themeColors.primaryButton }]}
        onPress={onProfile}
      >
        <Text style={styles.profileButtonText}>Profile</Text>
      </TouchableOpacity>

      {/* Close Menu */}
      <TouchableOpacity
        style={[styles.closeButton, { backgroundColor: themeColors.closeButtonBackground }]}
        onPress={onClose}
      >
        <Text style={{ color: 'white' }}>Close Menu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    flex: 1,
    padding: 20,
    width: '70%', // keep menu left-side
    position: 'relative',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  group: {
    fontSize: 16,
    marginBottom: 12,
  },
  groupButton: {
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  groupButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  profileButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    padding: 10,
    borderRadius: 8,
  },
  profileButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 8,
    borderRadius: 6,
  },
});
