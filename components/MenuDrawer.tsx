import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const TARGET_WIDTH = SCREEN_WIDTH * 0.7;

interface MenuDrawerProps {
  groups: string[];
  onClose: () => void;
  onProfile: () => void;
  onCreateGroup: () => void;
  onJoinGroup: () => void;
  onSelectGroup?: (groupId: string) => void;
}

export default function MenuDrawer({
  groups,
  onClose,
  onProfile,
  onCreateGroup,
  onJoinGroup,
  onSelectGroup,
}: MenuDrawerProps) {
  const slideAnim = useRef(new Animated.Value(-TARGET_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in from left
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animateOut = (callback?: () => void) => {
    // Slide out to left
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -TARGET_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      callback?.();
    });
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Backdrop with fade */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: fadeAnim,
          },
        ]}
        pointerEvents="auto"
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={() => animateOut()} />
      </Animated.View>

      {/* Drawer sliding from left */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
        pointerEvents="auto"
      >
        <ImageBackground
          source={require('../assets/images/auth-bg-1.png')}
          style={styles.bgImage}
          resizeMode="cover"
        >
          <View style={styles.content}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => animateOut()}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Your Groups</Text>

            <View style={styles.groupsList}>
              {groups.length === 0 ? (
                <Text style={styles.emptyText}>You're not in any groups yet.</Text>
              ) : (
                groups.map((group, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.groupItem}
                    activeOpacity={0.8}
                    onPress={() => animateOut(() => onSelectGroup?.(group))}
                  >
                    <Text style={styles.groupText}>{group}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.groupButton}
                onPress={() => animateOut(onCreateGroup)}
                activeOpacity={0.8}
              >
                <Text style={styles.groupButtonText}>Create Group</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.groupButton}
                onPress={() => animateOut(onJoinGroup)}
                activeOpacity={0.8}
              >
                <Text style={styles.groupButtonText}>Join Group</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => animateOut(onProfile)}
              activeOpacity={0.8}
            >
              <Text style={styles.profileButtonText}>Profile</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },

  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: TARGET_WIDTH,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  bgImage: {
    flex: 1,
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
    zIndex: 10,
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

  emptyText: {
    fontSize: 14,
    color: '#444',
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