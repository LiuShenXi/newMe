import { Source } from '@newme/shared';
import { Source as PrismaSource } from '@prisma/client';
import { TodosService } from '../todos.service';

describe('TodosService', () => {
  const todoDate = new Date('2026-04-29T00:00:00.000Z');
  const updatedAt = new Date('2026-04-29T12:00:00.000Z');

  function createService() {
    const todo = {
      id: 'todo-1',
      title: '写 Todos 模块测试',
      date: todoDate,
      completed: false,
      estimatedMinutes: 30,
      sourceFocusId: null,
      source: PrismaSource.MANUAL,
      userEdited: false,
    };
    const prisma = {
      todo: {
        findMany: jest.fn().mockResolvedValue([todo]),
        create: jest.fn().mockResolvedValue(todo),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findFirstOrThrow: jest.fn().mockResolvedValue({
          ...todo,
          completed: true,
          userEdited: true,
        }),
      },
    };

    return {
      service: new TodosService(prisma as any, {
        now: () => updatedAt,
      }),
      prisma,
      todo,
    };
  }

  it('returns today todos for a user and date', async () => {
    const { service, prisma } = createService();

    await expect(
      service.getTodayTodos('user-1', '2026-04-29'),
    ).resolves.toEqual([
      {
        id: 'todo-1',
        title: '写 Todos 模块测试',
        date: '2026-04-29',
        completed: false,
        estimatedMinutes: 30,
        sourceFocusId: null,
        source: Source.MANUAL,
        userEdited: false,
      },
    ]);
    expect(prisma.todo.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        date: todoDate,
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
    });
  });

  it('creates a manual todo', async () => {
    const { service, prisma } = createService();

    await service.createTodo('user-1', {
      title: '写 Todos 模块测试',
      date: '2026-04-29',
      estimatedMinutes: 30,
    });

    expect(prisma.todo.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        title: '写 Todos 模块测试',
        date: todoDate,
        estimatedMinutes: 30,
        sourceFocusId: undefined,
        source: PrismaSource.MANUAL,
      },
    });
  });

  it('updates a todo and marks it user edited', async () => {
    const { service, prisma } = createService();

    await expect(
      service.updateTodo('user-1', 'todo-1', { completed: true }),
    ).resolves.toMatchObject({
      id: 'todo-1',
      completed: true,
      userEdited: true,
    });
    expect(prisma.todo.updateMany).toHaveBeenCalledWith({
      where: { id: 'todo-1', userId: 'user-1', deletedAt: null },
      data: { completed: true, userEdited: true },
    });
  });

  it('soft deletes a todo', async () => {
    const { service, prisma } = createService();

    await expect(service.deleteTodo('user-1', 'todo-1')).resolves.toEqual({
      success: true,
    });
    expect(prisma.todo.updateMany).toHaveBeenCalledWith({
      where: { id: 'todo-1', userId: 'user-1', deletedAt: null },
      data: { deletedAt: updatedAt },
    });
  });
});
