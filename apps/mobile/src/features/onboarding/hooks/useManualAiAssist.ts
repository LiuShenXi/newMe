import { useMemo, useState } from 'react';

import type { GenerationDto } from '@newme/shared';
import { AiScenario } from '@newme/shared';

import { apiFetch, ApiError, AI_REQUEST_TIMEOUT_MS } from '../../../shared/api/client';
import { usePlanningContext } from '../../../shared/time/usePlanningContext';
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
  const { currentQuarterId, currentWeekId, todayDate } = usePlanningContext();
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
            date: todayDate,
            level: aiLevelByInputKey[level],
            quarterId: currentQuarterId,
            weekId: currentWeekId,
          },
          scenario: AiScenario.MANUAL_LOCAL_ASSIST,
        },
        timeoutMs: AI_REQUEST_TIMEOUT_MS,
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
