import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AddTodoInput } from '../../src/features/todo/components/AddTodoInput';
import { TodoList } from '../../src/features/todo/components/TodoList';
import { TodoItemModel, useTodos } from '../../src/features/todo/hooks/useTodos';
import {
  PrototypeActionRow,
  PrototypeButton,
  PrototypeEditSheet,
  PrototypeModalCard,
  PrototypeModalLayer,
  PrototypeScreen,
  PrototypeTextarea,
} from '../../src/shared/components';
import { colors, fontSizes, fontWeights, lineHeights, prototypeGlassBlur, prototypeGlassShadow, radii, spacing } from '../../src/shared/theme';
import { usePrototypeStore } from '../../src/stores/prototype.store';

export default function TodoScreen() {
  const params = useLocalSearchParams<{ week?: string }>();
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
  const markListViewed = usePrototypeStore((state) => state.markListViewed);

  useFocusEffect(
    useCallback(() => {
      markListViewed();
    }, [markListViewed]),
  );

  useEffect(() => {
    if (typeof params.week === 'string' && params.week) {
      setWeekVisible(true);
    }
  }, [params.week]);

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
      <PrototypeScreen activeTab="todo" contentStyle={styles.content}>
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
              <Text style={styles.title}>4 月 26 日</Text>
              <Text style={styles.subtitle}>已完成 {completedCount} / {totalCount}</Text>
            </View>
            <PrototypeButton
              accessibilityLabel="打开本周概览"
              onPress={() => setWeekVisible(true)}
              variant="pill"
            >
              本周
            </PrototypeButton>
          </View>

          <TodoList onDelete={deleteTodo} onEdit={openEdit} onToggle={toggleTodo} todos={todos} />
          <AddTodoInput onAdd={addTodo} />
        </View>
      </PrototypeScreen>

      {weekVisible ? (
        <PrototypeModalLayer onBackdropPress={() => setWeekVisible(false)}>
          <PrototypeModalCard style={styles.weekPanel}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.eyebrow}>week overview</Text>
                <Text style={styles.modalTitle}>{params.week ? `${params.week} · 本周 7 天概览` : '本周 7 天概览'}</Text>
              </View>
              <PrototypeButton onPress={() => setWeekVisible(false)} variant="pill">
                关闭
              </PrototypeButton>
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
          </PrototypeModalCard>
        </PrototypeModalLayer>
      ) : null}

      {editingTodo ? (
        <PrototypeModalLayer kind="sheet" onBackdropPress={() => setEditingTodo(null)}>
          <PrototypeEditSheet>
            <Text style={styles.sheetTitle}>调整这件小事</Text>
            <Text style={styles.modalCopy}>只改今天要执行的表述，不影响本周重点。</Text>
            <PrototypeTextarea
              accessibilityLabel="编辑待办内容"
              onChangeText={setEditDraft}
              value={editDraft}
            />
            <PrototypeActionRow>
              <PrototypeButton onPress={saveEdit} style={styles.sheetAction}>
                保存
              </PrototypeButton>
              <PrototypeButton onPress={() => setEditingTodo(null)} style={styles.sheetAction} variant="secondary">
                取消
              </PrototypeButton>
            </PrototypeActionRow>
          </PrototypeEditSheet>
        </PrototypeModalLayer>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...prototypeGlassBlur,
    ...prototypeGlassShadow,
    backgroundColor: 'rgba(255, 255, 255, 0.045)',
    borderColor: 'rgba(167, 243, 208, 0.10)',
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
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
    paddingTop: spacing[1],
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
  modalCopy: {
    color: colors.textTertiary,
    fontSize: fontSizes.xs,
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
  root: {
    flex: 1,
  },
  sheetAction: {
    flex: 1,
  },
  sheetTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: fontWeights.bold,
    lineHeight: 24,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    marginTop: spacing[1],
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: fontWeights.bold,
    lineHeight: 22,
  },
  weekList: {
    gap: spacing[2],
    paddingTop: spacing[4],
  },
  weekPanel: {
    maxWidth: 360,
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
