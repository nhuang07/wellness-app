import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TodoItemProps {
  text: string;
  done: boolean;
  onToggle: () => void;
}

export default function TodoItem({ text, done, onToggle }: TodoItemProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity style={styles.item} onPress={onToggle}>
      <View style={styles.row}>
        <View
          style={[
            styles.checkbox,
            { borderColor: themeColors.primaryButton },
            done && { backgroundColor: themeColors.primaryButton },
          ]}
        />
        <Text style={[styles.text, done && { textDecorationLine: 'line-through', color: themeColors.textDone }]}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 12,
  },
  text: {
    fontSize: 16,
  },
});
