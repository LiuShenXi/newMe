import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fontWeights, lineHeights, radii, spacing } from '../../../shared/theme';
import type { TodoItemModel } from '../hooks/useTodos';

interface TodoItemProps {
  index: number;
  onDelete: (id: string) => void;
  onEdit: (todo: TodoItemModel) => void;
  onToggle: (id: string) => void;
  todo: TodoItemModel;
}

export function TodoItem({ index, onDelete, onEdit, onToggle, todo }: TodoItemProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [open, setOpen] = useState(false);
  const startX = useRef(0);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: () => {
          startX.current = open ? -78 : 0;
        },
        onPanResponderMove: (_, gesture) => {
          translateX.setValue(Math.max(-86, Math.min(0, startX.current + gesture.dx)));
        },
        onPanResponderRelease: (_, gesture) => {
          const shouldOpen = startX.current + gesture.dx < -42;
          setOpen(shouldOpen);
          Animated.spring(translateX, {
            tension: 110,
            friction: 14,
            toValue: shouldOpen ? -78 : 0,
            useNativeDriver: true,
          }).start();
        },
      }),
    [open, translateX],
  );

  function toggle() {
    if (open) {
      setOpen(false);
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      return;
    }
    onToggle(todo.id);
  }

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`删除 ${todo.title}`}
        onPress={() => onDelete(todo.id)}
        style={styles.deleteReveal}
      >
        <Ionicons color="#FFF1F2" name="trash-outline" size={22} />
      </Pressable>
      <Animated.View style={[styles.surface, { transform: [{ translateX }] }]} {...panResponder.panHandlers}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`切换 ${todo.title}`}
          onPress={toggle}
          style={styles.main}
        >
          <View style={[styles.mark, todo.completed ? styles.markDone : null]}>
            <Text style={[styles.markText, todo.completed ? styles.markDoneText : null]}>
              {todo.completed ? '✓' : index + 1}
            </Text>
          </View>
          <Text numberOfLines={2} style={[styles.title, todo.completed ? styles.titleDone : null]}>
            {todo.title}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`编辑 ${todo.title}`}
          onPress={() => onEdit(todo)}
          style={styles.iconButton}
        >
          <Ionicons color="rgba(236, 254, 255, 0.72)" name="create-outline" size={18} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  deleteReveal: {
    alignItems: 'center',
    backgroundColor: '#9F1239',
    borderRadius: radii.item,
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
    width: 78,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(207, 250, 254, 0.10)',
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  main: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing[3],
    minWidth: 0,
  },
  mark: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderColor: 'rgba(100, 116, 139, 0.50)',
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  markDone: {
    backgroundColor: 'rgba(207, 250, 254, 0.20)',
    borderColor: 'rgba(207, 250, 254, 0.40)',
  },
  markDoneText: {
    color: '#ECFEFF',
  },
  markText: {
    color: colors.textSecondary,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.xs,
  },
  row: {
    backgroundColor: 'transparent',
    borderRadius: radii.item,
    overflow: 'hidden',
    position: 'relative',
  },
  surface: {
    alignItems: 'center',
    backgroundColor: 'rgba(3, 9, 10, 0.98)',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: radii.item,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing[2],
    padding: spacing[3],
  },
  title: {
    color: colors.text,
    flex: 1,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.sm,
    minWidth: 0,
  },
  titleDone: {
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
});
