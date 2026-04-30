import { StyleSheet, View } from 'react-native';

import { spacing } from '../../../shared/theme';
import { TodoItem } from './TodoItem';
import type { TodoItemModel } from '../hooks/useTodos';

interface TodoListProps {
  onDelete: (id: string) => void;
  onEdit: (todo: TodoItemModel) => void;
  onToggle: (id: string) => void;
  todos: TodoItemModel[];
}

export function TodoList({ onDelete, onEdit, onToggle, todos }: TodoListProps) {
  return (
    <View style={styles.list}>
      {todos.map((todo, index) => (
        <TodoItem
          index={index}
          key={todo.id}
          onDelete={onDelete}
          onEdit={onEdit}
          onToggle={onToggle}
          todo={todo}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing[3],
  },
});
