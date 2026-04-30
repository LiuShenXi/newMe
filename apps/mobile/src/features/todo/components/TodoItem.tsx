import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`切换 ${todo.title}`}
        onPress={() => onToggle(todo.id)}
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
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`删除 ${todo.title}`}
        onPress={() => onDelete(todo.id)}
        style={[styles.iconButton, styles.deleteButton]}
      >
        <Ionicons color="#FCA5A5" name="trash-outline" size={18} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  deleteButton: {
    backgroundColor: 'rgba(248, 113, 113, 0.10)',
    borderColor: 'rgba(248, 113, 113, 0.16)',
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  main: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing[3],
    minHeight: 52,
  },
  mark: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  markDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  markDoneText: {
    color: colors.background,
  },
  markText: {
    color: colors.textSecondary,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.xs,
  },
  row: {
    alignItems: 'center',
    backgroundColor: 'rgba(3, 16, 13, 0.44)',
    borderColor: 'rgba(207, 250, 254, 0.11)',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing[2],
    padding: spacing[2],
  },
  title: {
    color: colors.text,
    flex: 1,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.sm,
  },
  titleDone: {
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
});
