import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  return (
    <ImageBackground
      source={require('../assets/images/auth-bg-1.png')}
      style={styles.drawer}
      resizeMode="cover"
    >
      <View style={styles.content}>
        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Your Groups</Text>

        {/* Groups List */}
        <View style={styles.groupsList}>
          {groups.map((group, index) => (
            <View key={index} style={styles.groupItem}>
              <Text style={styles.groupText}>{group}</Text>
            </View>
          ))}
        </View>

        {/* Create / Join Group Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.groupButton}
            onPress={onCreateGroup}
            activeOpacity={0.8}
          >
            <Text style={styles.groupButtonText}>Create Group</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.groupButton}
            onPress={onJoinGroup}
            activeOpacity={0.8}
          >
            <Text style={styles.groupButtonText}>Join Group</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Button */}
        <TouchableOpacity
          style={styles.profileButton}
          onPress={onProfile}
          activeOpacity={0.8}
        >
          <Text style={styles.profileButtonText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  drawer: {
    flex: 1,
    width: '80%',
  },

  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },

  closeButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeButtonText: {
    fontSize: 20,
    color: '#131313',
    fontWeight: 'bold',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#131313',
    marginBottom: 24,
  },

  groupsList: {
    flex: 1,
    gap: 12,
  },

  groupItem: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },

  groupText: {
    fontSize: 16,
    color: '#131313',
    fontWeight: '600',
  },

  actionsContainer: {
    gap: 12,
    marginBottom: 16,
  },

  groupButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(120, 120, 128, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },

  groupButtonText: {
    color: '#131313',
    fontWeight: '600',
    fontSize: 16,
  },

  profileButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(83, 212, 216, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },

  profileButtonText: {
    color: '#131313',
    fontWeight: '700',
    fontSize: 16,
  },
});