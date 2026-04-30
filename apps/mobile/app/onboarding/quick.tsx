import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import type { ConfirmGenerationResponse, GenerationDto } from '@newme/shared';
import { AiScenario } from '@newme/shared';

import { Button } from '../../src/shared/components';
import { AiDraftView } from '../../src/features/onboarding/components/AiDraftView';
import { ManualInput } from '../../src/features/onboarding/components/ManualInput';
import { OnboardingScreen } from '../../src/features/onboarding/components/OnboardingScreen';
import { useOnboarding } from '../../src/features/onboarding/hooks/useOnboarding';
import { apiFetch, ApiError } from '../../src/shared/api/client';
import { colors, fontSizes, lineHeights } from '../../src/shared/theme';
import { usePlanningContext } from '../../src/shared/time/usePlanningContext';

interface QuickPlanOutput {
  todayTodos?: { title: string }[];
  weeklyFocuses?: { title: string }[];
}

export default function QuickPlanScreen() {
  const { currentQuarterId, currentWeekId, todayDate } = usePlanningContext();
  const onboarding = useOnboarding();
  const value = onboarding.getInput('quarterGoal');
  const draft = onboarding.aiDrafts.week;
  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const draftOutput = draft?.output as QuickPlanOutput | undefined;
  const draftItems = useMemo(() => {
    const focuses = draftOutput?.weeklyFocuses?.map((focus) => focus.title) ?? [];
    const todos = draftOutput?.todayTodos?.map((todo) => todo.title) ?? [];
    return [...focuses, ...todos];
  }, [draftOutput]);

  async function generateDraft() {
    if (!value.trim()) {
      setError('先写下这个季度最想推进的一件事');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const generation = await apiFetch<GenerationDto>('/ai/generations', {
        body: {
          input: {
            date: todayDate,
            goal: value.trim(),
            quarterId: currentQuarterId,
            weekId: currentWeekId,
          },
          scenario: AiScenario.QUICK_QUARTER_PLAN,
        },
      });
      onboarding.applyAiDraft('week', {
        id: generation.id,
        output: generation.outputJson ?? {},
        updatedAt: generation.createdAt,
      });
    } catch (nextError) {
      setError(toUserMessage(nextError, 'AI 生成暂时失败，请稍后再试'));
    } finally {
      setIsGenerating(false);
    }
  }

  async function confirmDraft() {
    if (!draft?.id) {
      await generateDraft();
      return;
    }

    setError(null);
    setIsConfirming(true);

    try {
      await apiFetch<ConfirmGenerationResponse>(`/ai/generations/${draft.id}/confirm`, {
        body: {
          contextVersion: 'quick-plan:v1',
          edits: {
            date: todayDate,
            goal: value.trim(),
            quarterId: currentQuarterId,
            weekId: currentWeekId,
          },
          generationId: draft.id,
          scenario: AiScenario.QUICK_QUARTER_PLAN,
          target: 'week_plan',
        },
      });
      router.replace('/(tabs)/energy');
    } catch (nextError) {
      setError(toUserMessage(nextError, '确认写入暂时失败，请稍后再试'));
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <OnboardingScreen
      eyebrow="Quick start"
      subtitle="只抓住这个季度最想推进的一件事，先换成本周能行动的节奏。"
      title="这个季度，你最想推进的一件事是什么？"
    >
      <ManualInput
        helper="后续 AI 会基于这段输入生成本周重点和今日清单建议。"
        label="季度目标"
        onChangeText={(next) => onboarding.setInput('quarterGoal', next)}
        placeholder="例如：完成个人成长 App 的第一个可用 MVP。"
        value={value}
      />
      {draftItems.length ? (
        <AiDraftView
          items={draftItems}
          title="AI 生成的本周行动"
        />
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {draft?.id ? (
        <Button loading={isConfirming} onPress={confirmDraft}>
          确认并进入能量页
        </Button>
      ) : (
        <Button disabled={!value.trim()} loading={isGenerating} onPress={generateDraft}>
          让 AI 帮我拆成这周行动
        </Button>
      )}
    </OnboardingScreen>
  );
}

function toUserMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

const styles = StyleSheet.create({
  error: {
    color: colors.danger,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
  },
});
