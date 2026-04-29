import { Source } from '../enums';

export interface TodoDto {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  estimatedMinutes: number | null;
  sourceFocusId: string | null;
  source: Source;
  userEdited: boolean;
}

export interface CreateTodoRequest {
  title: string;
  date: string;
  estimatedMinutes?: number;
  sourceFocusId?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  completed?: boolean;
  estimatedMinutes?: number;
}
