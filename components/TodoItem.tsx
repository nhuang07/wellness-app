import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TodoItemProps {
  text: string;
  done: boolean;
  onToggle: () => void;
}

export default function TodoItem({ text, done, onToggle }: TodoItemProps) {
  return (
    <TouchableOpacity 
      style={[styles.item, done && styles.itemDone]} 
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.checkbox,
            done && styles.checkboxDone,
          ]}
        >
          {done && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={[
          styles.text, 
          done && styles.textDone
        ]}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },

  itemDone: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    opacity: 0.8,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: '#131313',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },

  checkboxDone: {
    backgroundColor: 'rgba(83, 212, 216, 0.8)',
    borderColor: '#131313',
  },

  checkmark: {
    color: '#131313',
    fontSize: 16,
    fontWeight: 'bold',
  },

  text: {
    fontSize: 16,
    color: '#131313',
    flex: 1,
  },

  textDone: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
});