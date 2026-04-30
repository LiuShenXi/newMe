import { useMemo, useState } from 'react';

import type { GenerationDto } from '@newme/shared';
import { AiScenario } from '@newme/shared';

import { apiFetch, ApiError } from '../../../shared/api/client';
import { useOnboarding } from './useOnboarding';

type ManualLevel = 'annual' | 'month' | 'quarter' | 'today' | 'week';

interface ManualSuggestion {
  reason?: string;
  title: string;
}

interface ManualAssistOutput {
  suggestions?: ManualSuggestion[];
}

const aiLevelByInputKey: Record<ManualLevel, 'annual' | 'day' | 'month' | 'quarter' | 'week'> = {
  annual: 'annual',
  month: 'month',
  quarter: 'quarter',
  today: 'day',
  week: 'week',
};

export function useManualAiAssist(level: ManualLevel) {
  const onboarding = useOnboarding();
  const draft = onboarding.aiDrafts[level];
  const value = onboarding.getInput(level);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const suggestions = useMemo(() => {
    const output = draft?.output as ManualAssistOutput | undefined;
    return output?.suggestions?.filter((suggestion) => suggestion.title.trim()) ?? [];
  }, [draft]);

  async function generate() {
    setError(null);
    setIsGenerating(true);

    try {
      const generation = await apiFetch<GenerationDto>('/ai/generations', {
        body: {
          input: {
            context: {
              annual: onboarding.getInput('annual'),
              month: onboarding.getInput('month'),
              quarter: onboarding.getInput('quarter'),
              today: onboarding.getInput('today'),
              week: onboarding.getInput('week'),
            },
            currentLevel: level,
            currentValue: value.trim(),
            date: todayDate(),
            level: aiLevelByInputKey[level],
            quarterId: currentQuarterId(),
            weekId: currentWeekId(),
          },
          scenario: AiScenario.MANUAL_LOCAL_ASSIST,
        },
      });

      onboarding.applyAiDraft(level, {
        id: generation.id,
        output: generation.outputJson ?? {},
        updatedAt: generation.createdAt,
      });
    } catch (nextError) {
      setError(toUserMessage(nextError, 'AI 辅助暂时失败，请稍后再试'));
    } finally {
      setIsGenerating(false);
    }
  }

  function acceptSuggestion(suggestion: ManualSuggestion) {
    onboarding.setInput(level, suggestion.title);
  }

  return {
    acceptSuggestion,
    error,
    generate,
    isGenerating,
    suggestions,
  };
}

function toUserMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function currentQuarterId() {
  const now = new Date();
  return `${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`;
}

function currentWeekId() {
  const date = new Date();
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  utc.setUTCDate(utc.getUTCDate() + 4 - (utc.getUTCDay() || 7));
  const weekYear = utc.getUTCFullYear();
  const yearStart = new Date(Date.UTC(weekYear, 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${weekYear}-W${String(week).padStart(2, '0')}`;
}
