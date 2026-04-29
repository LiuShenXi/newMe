import { z } from 'zod';

export const weeklyFocusOutputSchema = z.object({
  title: z.string().min(1).max(100),
  reason: z.string().max(200),
});

export const todoOutputSchema = z.object({
  title: z.string().min(1).max(100),
  estimatedMinutes: z.number().int().min(5).max(480),
  sourceFocusTitle: z.string().optional(),
});

export const quickPlanOutputSchema = z.object({
  goalType: z.enum(['result', 'project', 'habit']),
  weeklyFocuses: z.array(weeklyFocusOutputSchema).min(3).max(5),
  todayTodos: z.array(todoOutputSchema).min(1).max(10),
});

export const annualOkrOutputSchema = z.object({
  objectives: z.array(z.object({
    title: z.string().min(1).max(100),
    keyResults: z.array(z.string().min(1).max(200)).min(1).max(5),
  })).min(1).max(5),
});

export const quarterOkrOutputSchema = z.object({
  quarters: z.array(z.object({
    quarter: z.number().int().min(1).max(4),
    goals: z.array(z.object({
      title: z.string().min(1).max(100),
      goalType: z.enum(['result', 'project', 'habit']),
    })).min(1).max(5),
  })).length(4),
});

export const fourWeekCommitmentsOutputSchema = z.object({
  weeks: z.array(z.object({
    weekNumber: z.number().int().min(1).max(4),
    focuses: z.array(weeklyFocusOutputSchema).min(3).max(5),
  })).min(1).max(4),
});

export const weeklyFocusToTodosOutputSchema = z.object({
  days: z.array(z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    todos: z.array(todoOutputSchema).min(0).max(10),
  })).min(1).max(7),
});

export const replanFutureWeeksOutputSchema = z.object({
  reason: z.string().min(1).max(300),
  weeks: z.array(z.object({
    weekNumber: z.number().int().min(1).max(4),
    focuses: z.array(weeklyFocusOutputSchema).min(3).max(5),
  })).min(1).max(4),
});

export const localAssistOutputSchema = z.object({
  suggestions: z.array(z.object({
    title: z.string().min(1).max(100),
    reason: z.string().max(200).optional(),
  })).min(1).max(10),
});
