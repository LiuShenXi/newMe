import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import {
  CreateTodoRequest,
  Source,
  TodoDto,
  UpdateTodoRequest,
} from '@newme/shared';
import { Source as PrismaSource } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface TodosServiceOptions {
  now?: () => Date;
}

@Injectable()
export class TodosService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly options?: TodosServiceOptions,
  ) {}

  async getTodayTodos(userId: string, date: string): Promise<TodoDto[]> {
    const todos = await this.prisma.todo.findMany({
      where: {
        userId,
        date: this.parseDate(date),
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
    });

    return todos.map((todo) => this.toTodoDto(todo));
  }

  async createTodo(
    userId: string,
    request: CreateTodoRequest,
  ): Promise<TodoDto> {
    const todo = await this.prisma.todo.create({
      data: {
        userId,
        title: request.title.trim(),
        date: this.parseDate(request.date),
        estimatedMinutes: request.estimatedMinutes,
        sourceFocusId: request.sourceFocusId,
        source: PrismaSource.MANUAL,
      },
    });

    return this.toTodoDto(todo);
  }

  async updateTodo(
    userId: string,
    todoId: string,
    request: UpdateTodoRequest,
  ): Promise<TodoDto> {
    const data = {
      ...(request.title !== undefined ? { title: request.title.trim() } : {}),
      ...(request.completed !== undefined ? { completed: request.completed } : {}),
      ...(request.estimatedMinutes !== undefined
        ? { estimatedMinutes: request.estimatedMinutes }
        : {}),
      userEdited: true,
    };
    const result = await this.prisma.todo.updateMany({
      where: { id: todoId, userId, deletedAt: null },
      data,
    });

    if (result.count === 0) {
      throw new NotFoundException('任务不存在或已删除');
    }

    const todo = await this.prisma.todo.findFirstOrThrow({
      where: { id: todoId, userId },
    });

    return this.toTodoDto(todo);
  }

  async deleteTodo(userId: string, todoId: string) {
    const result = await this.prisma.todo.updateMany({
      where: { id: todoId, userId, deletedAt: null },
      data: { deletedAt: this.options?.now?.() ?? new Date() },
    });

    if (result.count === 0) {
      throw new NotFoundException('任务不存在或已删除');
    }

    return { success: true };
  }

  private parseDate(date: string) {
    return new Date(`${date}T00:00:00.000Z`);
  }

  private toTodoDto(todo: {
    id: string;
    title: string;
    date: Date;
    completed: boolean;
    estimatedMinutes: number | null;
    sourceFocusId: string | null;
    source: string;
    userEdited: boolean;
  }): TodoDto {
    return {
      id: todo.id,
      title: todo.title,
      date: todo.date.toISOString().slice(0, 10),
      completed: todo.completed,
      estimatedMinutes: todo.estimatedMinutes,
      sourceFocusId: todo.sourceFocusId,
      source: todo.source.toLowerCase() as Source,
      userEdited: todo.userEdited,
    };
  }
}
