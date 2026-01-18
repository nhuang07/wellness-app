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
  // Start fully off-screen to the left
  const slideAnim = useRef(new Animated.Value(-TARGET_WIDTH)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true, // animating transform
    }).start();
  }, [slideAnim]);

  const animateOutThen = (cb?: () => void) => {
    Animated.timing(slideAnim, {
      toValue: -TARGET_WIDTH,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        cb?.();
      }
    });
  };

  const handleCloseOnly = () => {
    animateOutThen(onClose);
  };

  const handleSelectGroup = (groupId: string) => {
    animateOutThen(() => {
      onSelectGroup?.(groupId);
      onClose();
    });
  };

  const handleCreateGroup = () => {
    animateOutThen(() => {
      onCreateGroup();
      onClose();
    });
  };

  const handleJoinGroup = () => {
    animateOutThen(() => {
      onJoinGroup();
      onClose();
    });
  };

  const handleProfile = () => {
    animateOutThen(() => {
      onProfile();
      onClose();
    });
  };

  return (
    <View style={styles.overlay}>
      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawerContainer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <ImageBackground
          source={require('../assets/images/auth-bg-1.png')}
          style={styles.bgImage}
          resizeMode="cover"
        >
          <View style={styles.content}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseOnly}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Your Groups</Text>

            {/* Groups List */}
            <View style={styles.groupsList}>
              {groups.length === 0 ? (
                <Text style={styles.emptyText}>You’re not in any groups yet.</Text>
              ) : (
                groups.map((group, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.groupItem}
                    activeOpacity={0.8}
                    onPress={() => handleSelectGroup(group)}
                  >
                    <Text style={styles.groupText}>{group}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>

            {/* Create / Join Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.groupButton}
                onPress={handleCreateGroup}
                activeOpacity={0.8}
              >
                <Text style={styles.groupButtonText}>Create Group</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.groupButton}
                onPress={handleJoinGroup}
                activeOpacity={0.8}
              >
                <Text style={styles.groupButtonText}>Join Group</Text>
              </TouchableOpacity>
            </View>

            {/* Profile Button */}
            <TouchableOpacity
              style={styles.profileButton}
              onPress={handleProfile}
              activeOpacity={0.8}
            >
              <Text style={styles.profileButtonText}>Profile</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </Animated.View>

      {/* Dark overlay that closes drawer on tap */}
      <Pressable style={styles.backdrop} onPress={handleCloseOnly} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Full-screen overlay
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 999,
  },

  // Drawer fixed width & full height; solid bg so it never looks transparent
  drawerContainer: {
    width: TARGET_WIDTH,
    height: '100%',
    //backgroundColor: '#ffffff',
    overflow: 'hidden',
  },

  // Background image fills drawer
  bgImage: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },

  // Clickable dark area
  backdrop: {
    flex: 1,
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
