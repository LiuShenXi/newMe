import type { TodoDto } from '@newme/shared';
import { useEffect, useMemo, useState } from 'react';

import { apiFetch } from '../../../shared/api/client';

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
const todayDate = '2026-04-26';

function mapTodoDto(todo: TodoDto): TodoItemModel {
  return {
    completed: todo.completed,
    id: todo.id,
    title: todo.title,
  };
}

export function useTodos() {
  const [todos, setTodos] = useState<TodoItemModel[]>(initialTodos);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadTodayTodos() {
      try {
        const remoteTodos = await apiFetch<TodoDto[]>(`/todos/today?date=${todayDate}`);

        if (!cancelled) {
          setTodos(remoteTodos.map(mapTodoDto));
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : '清单加载失败，已显示本地示例');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadTodayTodos();

    return () => {
      cancelled = true;
    };
  }, []);

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

  async function addTodo(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;

    const optimisticTodo: TodoItemModel = { completed: false, id: `todo-${Date.now()}`, title: trimmed };
    setTodos((current) => [...current, optimisticTodo]);

    try {
      const createdTodo = await apiFetch<TodoDto>('/todos', {
        body: {
          date: todayDate,
          title: trimmed,
        },
        method: 'POST',
      });

      setTodos((current) =>
        current.map((todo) => (todo.id === optimisticTodo.id ? mapTodoDto(createdTodo) : todo)),
      );
      setError(null);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : '任务新增失败，已保留本地草稿');
    }
  }

  function deleteTodo(id: string) {
    setTodos((current) => current.filter((todo) => todo.id !== id));
    apiFetch(`/todos/${id}`, { method: 'DELETE' }).catch((deleteError: unknown) => {
      setError(deleteError instanceof Error ? deleteError.message : '任务删除失败');
    });
  }

  function toggleTodo(id: string) {
    const nextTodo = todos.find((todo) => todo.id === id);
    const nextCompleted = nextTodo ? !nextTodo.completed : false;

    setTodos((current) =>
      current.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
    );

    apiFetch<TodoDto>(`/todos/${id}`, {
      body: { completed: nextCompleted },
      method: 'PATCH',
    })
      .then((updatedTodo) => {
        setTodos((current) => current.map((todo) => (todo.id === id ? mapTodoDto(updatedTodo) : todo)));
        setError(null);
      })
      .catch((updateError: unknown) => {
        setError(updateError instanceof Error ? updateError.message : '任务状态更新失败');
      });
  }

  async function updateTodo(id: string, title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTodos((current) => current.map((todo) => (todo.id === id ? { ...todo, title: trimmed } : todo)));

    try {
      const updatedTodo = await apiFetch<TodoDto>(`/todos/${id}`, {
        body: { title: trimmed },
        method: 'PATCH',
      });
      setTodos((current) => current.map((todo) => (todo.id === id ? mapTodoDto(updatedTodo) : todo)));
      setError(null);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : '任务编辑失败，已保留本地修改');
    }
  }

  return {
    addTodo,
    completedCount,
    deleteTodo,
    error,
    focusChips,
    loading,
    todos,
    toggleTodo,
    totalCount: todos.length,
    updateTodo,
    weekDays,
  };
}
