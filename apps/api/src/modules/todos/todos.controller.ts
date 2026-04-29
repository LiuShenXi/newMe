import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { CreateTodoRequest, UpdateTodoRequest } from '@newme/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtUser } from '../auth/jwt.strategy';
import { TodosService } from './todos.service';

interface AuthenticatedRequest {
  user: JwtUser;
}

@UseGuards(JwtAuthGuard)
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get('today')
  getTodayTodos(
    @Req() request: AuthenticatedRequest,
    @Query('date') date?: string,
  ) {
    return this.todosService.getTodayTodos(
      request.user.userId,
      date ?? new Date().toISOString().slice(0, 10),
    );
  }

  @Post()
  createTodo(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateTodoRequest,
  ) {
    return this.todosService.createTodo(request.user.userId, body);
  }

  @Patch(':id')
  updateTodo(
    @Req() request: AuthenticatedRequest,
    @Param('id') todoId: string,
    @Body() body: UpdateTodoRequest,
  ) {
    return this.todosService.updateTodo(request.user.userId, todoId, body);
  }

  @Delete(':id')
  deleteTodo(
    @Req() request: AuthenticatedRequest,
    @Param('id') todoId: string,
  ) {
    return this.todosService.deleteTodo(request.user.userId, todoId);
  }
}
