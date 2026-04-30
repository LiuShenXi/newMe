import { useMemo, useState } from 'react';

export interface TodoItemModel {
  completed: boolean;
  id: string;
  title: string;
}

export interface WeekDayTodos {
  day: string;
  isToday: boolean;
  todos: TodoItemModel[];
}

const initialTodos: TodoItemModel[] = [
  { completed: true, id: 'todo-1', title: '整理本周 3 个重点承诺' },
  { completed: true, id: 'todo-2', title: '完成能量球动效第一版' },
  { completed: false, id: 'todo-3', title: '跑步 30 分钟' },
  { completed: false, id: 'todo-4', title: '睡前阅读 20 分钟' },
];

const focusChips = ['完成能量', '晨跑 5 次', '读完两章'];

export function useTodos() {
  const [todos, setTodos] = useState<TodoItemModel[]>(initialTodos);

  const completedCount = useMemo(() => todos.filter((todo) => todo.completed).length, [todos]);

  const weekDays = useMemo<WeekDayTodos[]>(
    () => [
      {
        day: '周一',
        isToday: false,
        todos: [
          { completed: true, id: 'mon-1', title: '整理本周 3 个重点承诺' },
          { completed: true, id: 'mon-2', title: '完成能量球动效第一版' },
        ],
      },
      {
        day: '周二',
        isToday: false,
        todos: [{ completed: true, id: 'tue-1', title: '补充打分前清单提醒' }],
      },
      {
        day: '周三',
        isToday: false,
        todos: [
          { completed: true, id: 'wed-1', title: '测试能量滑条拖动手感' },
          { completed: true, id: 'wed-2', title: '跑步 30 分钟' },
          { completed: false, id: 'wed-3', title: '记录一次产品反思' },
          { completed: false, id: 'wed-4', title: '睡前阅读 20 分钟' },
        ],
      },
      {
        day: '周四',
        isToday: false,
        todos: [{ completed: false, id: 'thu-1', title: '完善本周概览弹窗' }],
      },
      {
        day: '周五',
        isToday: false,
        todos: [{ completed: false, id: 'fri-1', title: '回看本周能量记录' }],
      },
      { day: '周六', isToday: false, todos: [] },
      { day: '周日', isToday: true, todos },
    ],
    [todos],
  );

  function addTodo(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTodos((current) => [...current, { completed: false, id: `todo-${Date.now()}`, title: trimmed }]);
  }

  function deleteTodo(id: string) {
    setTodos((current) => current.filter((todo) => todo.id !== id));
  }

  function toggleTodo(id: string) {
    setTodos((current) =>
      current.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
    );
  }

  function updateTodo(id: string, title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTodos((current) => current.map((todo) => (todo.id === id ? { ...todo, title: trimmed } : todo)));
  }

  return {
    addTodo,
    completedCount,
    deleteTodo,
    focusChips,
    todos,
    toggleTodo,
    totalCount: todos.length,
    updateTodo,
    weekDays,
  };
}
