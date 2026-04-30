import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import type { AiConfirmationTarget, ConfirmGenerationResponse, GenerationDto } from '@newme/shared';
import { AiScenario } from '@newme/shared';

import { Button } from '../../src/shared/components';
import { AiDraftView } from '../../src/features/onboarding/components/AiDraftView';
import { ManualInput } from '../../src/features/onboarding/components/ManualInput';
import { OnboardingScreen } from '../../src/features/onboarding/components/OnboardingScreen';
import { useOnboarding } from '../../src/features/onboarding/hooks/useOnboarding';
import { apiFetch, ApiError } from '../../src/shared/api/client';
import { colors, fontSizes, lineHeights } from '../../src/shared/theme';

interface AnnualOkrOutput {
  objectives?: { title: string; keyResults?: string[] }[];
}

interface QuarterOkrOutput {
  quarters?: { quarter: number; goals?: { title: string; goalType?: string }[] }[];
}

interface FourWeekCommitmentsOutput {
  weeks?: { weekNumber: number; focuses?: { title: string; reason?: string }[] }[];
}

export default function VisionPlanScreen() {
  const onboarding = useOnboarding();
  const value = onboarding.getInput('vision');
  const annualDraft = onboarding.aiDrafts.annual;
  const quarterDraft = onboarding.aiDrafts.quarter;
  const weekDraft = onboarding.aiDrafts.week;
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const year = new Date().getFullYear();
  const annualOutput = annualDraft?.output as AnnualOkrOutput | undefined;
  const quarterOutput = quarterDraft?.output as QuarterOkrOutput | undefined;
  const weekOutput = weekDraft?.output as FourWeekCommitmentsOutput | undefined;
  const annualItems = useMemo(() => formatAnnualItems(annualOutput), [annualOutput]);
  const quarterItems = useMemo(() => formatQuarterItems(quarterOutput), [quarterOutput]);
  const weekItems = useMemo(() => formatWeekItems(weekOutput), [weekOutput]);

  async function generateAnnualDraft() {
    if (!value.trim()) {
      setError('先写下五年后的自己');
      return;
    }

    setError(null);
    setBusyAction('generate-annual');

    try {
      const generation = await apiFetch<GenerationDto>('/ai/generations', {
        body: {
          input: {
            vision: value.trim(),
            year,
          },
          scenario: AiScenario.VISION_TO_ANNUAL_OKR,
        },
      });
      onboarding.applyAiDraft('annual', {
        id: generation.id,
        output: generation.outputJson ?? {},
        updatedAt: generation.createdAt,
      });
    } catch (nextError) {
      setError(toUserMessage(nextError, '年度 OKR 生成暂时失败，请稍后再试'));
    } finally {
      setBusyAction(null);
    }
  }

  async function confirmAnnualAndGenerateQuarter() {
    if (!annualDraft?.id) {
      await generateAnnualDraft();
      return;
    }

    setError(null);
    setBusyAction('confirm-annual');

    try {
      await confirmDraft(annualDraft.id, AiScenario.VISION_TO_ANNUAL_OKR, 'annual_objective', {
        vision: value.trim(),
        year,
      });
      const generation = await apiFetch<GenerationDto>('/ai/generations', {
        body: {
          input: {
            annualOkr: annualDraft.output,
            quarterId: currentQuarterId(),
            vision: value.trim(),
            year,
          },
          scenario: AiScenario.ANNUAL_TO_QUARTER_OKR,
        },
      });
      onboarding.applyAiDraft('quarter', {
        id: generation.id,
        output: generation.outputJson ?? {},
        updatedAt: generation.createdAt,
      });
    } catch (nextError) {
      setError(toUserMessage(nextError, '年度 OKR 确认暂时失败，请稍后再试'));
    } finally {
      setBusyAction(null);
    }
  }

  async function confirmQuarterAndGenerateWeeks() {
    if (!quarterDraft?.id) {
      setError('请先确认年度 OKR 并生成季度 OKR');
      return;
    }

    setError(null);
    setBusyAction('confirm-quarter');

    try {
      await confirmDraft(quarterDraft.id, AiScenario.ANNUAL_TO_QUARTER_OKR, 'quarter_goals', {
        quarterId: currentQuarterId(),
        quarterOkr: quarterDraft.output,
        year,
      });
      const generation = await apiFetch<GenerationDto>('/ai/generations', {
        body: {
          input: {
            quarterId: currentQuarterId(),
            quarterOkr: quarterDraft.output,
            startWeekId: currentWeekId(),
            year,
          },
          scenario: AiScenario.QUARTER_TO_FOUR_WEEK_COMMITMENTS,
        },
      });
      onboarding.applyAiDraft('week', {
        id: generation.id,
        output: generation.outputJson ?? {},
        updatedAt: generation.createdAt,
      });
    } catch (nextError) {
      setError(toUserMessage(nextError, '季度 OKR 确认暂时失败，请稍后再试'));
    } finally {
      setBusyAction(null);
    }
  }

  async function confirmWeeksAndEnterEnergy() {
    if (!weekDraft?.id) {
      setError('请先生成首月 4 周承诺');
      return;
    }

    setError(null);
    setBusyAction('confirm-weeks');

    try {
      await confirmDraft(
        weekDraft.id,
        AiScenario.QUARTER_TO_FOUR_WEEK_COMMITMENTS,
        'week_plan',
        {
          quarterId: currentQuarterId(),
          startWeekId: currentWeekId(),
          weeks: weekDraft.output,
          year,
        },
      );
      router.replace('/(tabs)/energy');
    } catch (nextError) {
      setError(toUserMessage(nextError, '四周承诺确认暂时失败，请稍后再试'));
    } finally {
      setBusyAction(null);
    }
  }

  async function confirmDraft(
    generationId: string,
    scenario: AiScenario,
    target: AiConfirmationTarget,
    edits: Record<string, unknown>,
  ) {
    await apiFetch<ConfirmGenerationResponse>(`/ai/generations/${generationId}/confirm`, {
      body: {
        contextVersion: `${scenario}:mobile-v1`,
        edits,
        generationId,
        scenario,
        target,
      },
    });
  }

  return (
    <OnboardingScreen
      eyebrow="Deep vision"
      subtitle="先写五年后的自己，后续再倒推出今年、季度、首月和今天。"
      title="五年后，你希望自己在哪里？"
    >
      <ManualInput
        helper="返回不会清空内容；重新生成只会更新当前层级。"
        label="五年愿景"
        onChangeText={(next) => onboarding.setInput('vision', next)}
        placeholder="例如：我有稳定的产品节奏、健康的身体和可持续的创作系统。"
        value={value}
      />
      {annualItems.length ? (
        <AiDraftView
          items={annualItems}
          title="年度 OKR 草案"
        />
      ) : value ? (
        <AiDraftView
          items={['愿景不是压力，只是方向', 'AI 会先产出今年的目标草案', '你确认后再继续拆解季度和四周承诺']}
          title="深度规划会这样展开"
        />
      ) : null}
      {quarterItems.length ? (
        <AiDraftView
          items={quarterItems}
          title="季度 OKR 草案"
        />
      ) : null}
      {weekItems.length ? (
        <AiDraftView
          items={weekItems}
          title="首月 4 周承诺"
        />
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!annualDraft?.id ? (
        <Button
          disabled={!value.trim()}
          loading={busyAction === 'generate-annual'}
          onPress={generateAnnualDraft}
        >
          生成年度 OKR
        </Button>
      ) : !quarterDraft?.id ? (
        <Button
          loading={busyAction === 'confirm-annual'}
          onPress={confirmAnnualAndGenerateQuarter}
        >
          确认年度 OKR，继续生成季度 OKR
        </Button>
      ) : !weekDraft?.id ? (
        <Button
          loading={busyAction === 'confirm-quarter'}
          onPress={confirmQuarterAndGenerateWeeks}
        >
          确认季度 OKR，继续生成四周承诺
        </Button>
      ) : (
        <Button
          loading={busyAction === 'confirm-weeks'}
          onPress={confirmWeeksAndEnterEnergy}
        >
          确认四周承诺并进入能量页
        </Button>
      )}
    </OnboardingScreen>
  );
}

function formatAnnualItems(output?: AnnualOkrOutput) {
  return (
    output?.objectives?.flatMap((objective) => [
      objective.title,
      ...(objective.keyResults?.map((keyResult) => `KR：${keyResult}`) ?? []),
    ]) ?? []
  );
}

function formatQuarterItems(output?: QuarterOkrOutput) {
  return (
    output?.quarters?.flatMap((quarter) =>
      quarter.goals?.map((goal) => `Q${quarter.quarter}：${goal.title}`) ?? [],
    ) ?? []
  );
}

function formatWeekItems(output?: FourWeekCommitmentsOutput) {
  return (
    output?.weeks?.flatMap((week) =>
      week.focuses?.map((focus) => `第 ${week.weekNumber} 周：${focus.title}`) ?? [],
    ) ?? []
  );
}

function toUserMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
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

const styles = StyleSheet.create({
  error: {
    color: colors.danger,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
  },
});
