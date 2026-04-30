import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AddTodoInput } from '../../src/features/todo/components/AddTodoInput';
import { TodoList } from '../../src/features/todo/components/TodoList';
import { TodoItemModel, useTodos } from '../../src/features/todo/hooks/useTodos';
import { PrototypeScreen } from '../../src/shared/components/PrototypeShell';
import { colors, fontSizes, fontWeights, lineHeights, radii, spacing } from '../../src/shared/theme';

export default function TodoScreen() {
  const {
    addTodo,
    completedCount,
    deleteTodo,
    focusChips,
    todos,
    toggleTodo,
    totalCount,
    updateTodo,
    weekDays,
  } = useTodos();
  const [editingTodo, setEditingTodo] = useState<TodoItemModel | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [weekVisible, setWeekVisible] = useState(false);

  function openEdit(todo: TodoItemModel) {
    setEditingTodo(todo);
    setEditDraft(todo.title);
  }

  function saveEdit() {
    if (!editingTodo) return;
    updateTodo(editingTodo.id, editDraft);
    setEditingTodo(null);
    setEditDraft('');
  }

  return (
    <View style={styles.root}>
      <PrototypeScreen contentStyle={styles.content}>
        <View style={styles.chipRow}>
          {focusChips.map((chip) => (
            <Text key={chip} style={styles.chip}>
              {chip}
            </Text>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>今日清单</Text>
              <Text style={styles.subtitle}>已完成 {completedCount} / {totalCount}</Text>
            </View>
            <Pressable
              accessibilityLabel="打开本周概览"
              accessibilityRole="button"
              onPress={() => setWeekVisible(true)}
              style={styles.weekButton}
            >
              <Text style={styles.weekButtonText}>本周</Text>
            </Pressable>
          </View>

          <TodoList onDelete={deleteTodo} onEdit={openEdit} onToggle={toggleTodo} todos={todos} />
          <AddTodoInput onAdd={addTodo} />
        </View>
      </PrototypeScreen>

      {weekVisible ? (
        <View style={styles.modalBackdrop}>
          <View style={styles.weekPanel}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.eyebrow}>week overview</Text>
                <Text style={styles.modalTitle}>本周 7 天概览</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={() => setWeekVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeText}>关闭</Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.weekList}>
              {weekDays.map((day) => {
                const dayDone = day.todos.filter((todo) => todo.completed).length;
                return (
                  <View key={day.day} style={[styles.dayCard, day.isToday ? styles.dayCardToday : null]}>
                    <View style={styles.dayHeader}>
                      <Text style={styles.dayTitle}>{day.day}</Text>
                      <Text style={styles.daySummary}>清单 {dayDone}/{day.todos.length}</Text>
                    </View>
                    {day.todos.length ? (
                      day.todos.map((todo, index) => (
                        <View key={todo.id} style={styles.weekTodo}>
                          <Text style={[styles.weekTodoIndex, todo.completed ? styles.weekTodoDone : null]}>
                            {todo.completed ? '✓' : index + 1}
                          </Text>
                          <Text style={[styles.weekTodoText, todo.completed ? styles.weekTodoTextDone : null]}>
                            {todo.title}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.emptyDay}>暂未安排</Text>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      ) : null}

      {editingTodo ? (
        <View style={styles.modalBackdrop}>
          <View style={styles.editPanel}>
            <Text style={styles.modalTitle}>编辑今日待办</Text>
            <Text style={styles.modalCopy}>只改今天要执行的表述，不影响本周重点。</Text>
            <TextInput
              accessibilityLabel="编辑待办内容"
              onChangeText={setEditDraft}
              style={styles.editInput}
              value={editDraft}
            />
            <View style={styles.editActions}>
              <Pressable accessibilityRole="button" onPress={() => setEditingTodo(null)} style={styles.secondaryButton}>
                <Text style={styles.secondaryLabel}>取消</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={saveEdit} style={styles.primaryButton}>
                <Text style={styles.primaryLabel}>保存</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(18, 36, 31, 0.72)',
    borderColor: 'rgba(207, 250, 254, 0.15)',
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing[3],
    padding: spacing[4],
  },
  chip: {
    backgroundColor: 'rgba(0, 229, 160, 0.10)',
    borderColor: 'rgba(0, 229, 160, 0.16)',
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    color: '#A7F3D0',
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.xs,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  closeButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  closeText: {
    color: colors.text,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
  },
  content: {
    gap: 16,
  },
  dayCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.045)',
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing[2],
    padding: spacing[3],
  },
  dayCardToday: {
    borderColor: 'rgba(0, 229, 160, 0.34)',
  },
  dayHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  daySummary: {
    color: colors.textTertiary,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
  },
  dayTitle: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.sm,
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[4],
  },
  editInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.24)',
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    color: colors.text,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    minHeight: 48,
    paddingHorizontal: spacing[3],
  },
  editPanel: {
    backgroundColor: '#101827',
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: 360,
    padding: spacing[5],
    width: '100%',
  },
  emptyDay: {
    color: colors.textTertiary,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.heavy,
    lineHeight: lineHeights.xs,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    padding: spacing[5],
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 20,
  },
  modalCopy: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    marginBottom: spacing[3],
    marginTop: spacing[1],
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalTitle: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.lg,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  primaryLabel: {
    color: colors.background,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.sm,
  },
  root: {
    flex: 1,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  secondaryLabel: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    marginTop: spacing[1],
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.heavy,
    lineHeight: lineHeights.xl,
  },
  weekButton: {
    backgroundColor: 'rgba(207, 250, 254, 0.10)',
    borderColor: 'rgba(207, 250, 254, 0.16)',
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  weekButtonText: {
    color: '#ECFEFF',
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.xs,
  },
  weekList: {
    gap: spacing[2],
    paddingTop: spacing[4],
  },
  weekPanel: {
    backgroundColor: '#101827',
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: 360,
    padding: spacing[5],
    shadowColor: '#000000',
    shadowOpacity: 0.34,
    shadowRadius: 24,
    width: '100%',
  },
  weekTodo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[2],
  },
  weekTodoDone: {
    backgroundColor: colors.primary,
    color: colors.background,
  },
  weekTodoIndex: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radii.pill,
    color: colors.textSecondary,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    height: 22,
    lineHeight: 22,
    overflow: 'hidden',
    textAlign: 'center',
    width: 22,
  },
  weekTodoText: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
  },
  weekTodoTextDone: {
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
});
