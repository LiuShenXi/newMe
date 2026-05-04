import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { AiConfirmationTarget, ConfirmGenerationResponse, GenerationDto } from '@newme/shared';
import { AiScenario } from '@newme/shared';

import {
  PrototypeButton,
  PrototypeEyebrow,
  PrototypeOnboardingPanel,
  PrototypeScreen,
  PrototypeTextarea,
  PrototypeTopActions,
} from '../../src/shared/components';
import { useOnboarding } from '../../src/features/onboarding/hooks/useOnboarding';
import { apiFetch, ApiError } from '../../src/shared/api/client';
import { colors, fontSizes, fontWeights, lineHeights, spacing } from '../../src/shared/theme';
import { usePlanningContext } from '../../src/shared/time/usePlanningContext';

type VisionStage = 'input' | 'accepted' | 'annual' | 'quarter' | 'weeks';

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
  const { currentQuarterId, currentWeekId, year } = usePlanningContext();
  const onboarding = useOnboarding();
  const value = onboarding.getInput('vision');
  const annualDraft = onboarding.aiDrafts.annual;
  const quarterDraft = onboarding.aiDrafts.quarter;
  const weekDraft = onboarding.aiDrafts.week;
  const [stage, setStage] = useState<VisionStage>(weekDraft?.id ? 'weeks' : quarterDraft?.id ? 'quarter' : annualDraft?.id ? 'annual' : 'input');
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const annualOutput = annualDraft?.output as AnnualOkrOutput | undefined;
  const quarterOutput = quarterDraft?.output as QuarterOkrOutput | undefined;
  const weekOutput = weekDraft?.output as FourWeekCommitmentsOutput | undefined;
  const annualItems = useMemo(() => formatAnnualItems(annualOutput), [annualOutput]);
  const quarterItems = useMemo(() => formatQuarterItems(quarterOutput), [quarterOutput]);
  const weekItems = useMemo(() => formatWeekItems(weekOutput), [weekOutput]);
  const [annualEdits, setAnnualEdits] = useState<string[]>(annualItems);
  const [quarterEdits, setQuarterEdits] = useState<string[]>(quarterItems);
  const [weekEdits, setWeekEdits] = useState<string[]>(weekItems);

  useEffect(() => {
    setAnnualEdits(annualItems);
  }, [annualItems]);

  useEffect(() => {
    setQuarterEdits(quarterItems);
  }, [quarterItems]);

  useEffect(() => {
    setWeekEdits(weekItems);
  }, [weekItems]);

  async function generateAnnualDraft() {
    if (!value.trim()) {
      setError('先写下五年后的自己');
      return false;
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
      setStage('annual');
      return true;
    } catch (nextError) {
      setError(toUserMessage(nextError, '年度 OKR 生成暂时失败，请稍后再试'));
      return false;
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
      const editedAnnualOkr = buildAnnualOutput(annualEdits);

      await confirmDraft(annualDraft.id, AiScenario.VISION_TO_ANNUAL_OKR, 'annual_objective', {
        annualOkr: editedAnnualOkr,
        vision: value.trim(),
        year,
      });
      const generation = await apiFetch<GenerationDto>('/ai/generations', {
        body: {
          input: {
            annualOkr: editedAnnualOkr,
            quarterId: currentQuarterId,
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
      setStage('quarter');
    } catch (nextError) {
      setError(toUserMessage(nextError, '年度 OKR 确认暂时失败，请稍后再试'));
    } finally {
      setBusyAction(null);
    }
  }

  async function regenerateQuarterDraft() {
    if (!annualDraft?.id) {
      setError('请先确认年度 OKR');
      return;
    }

    setError(null);
    setBusyAction('generate-quarter');

    try {
      const editedAnnualOkr = buildAnnualOutput(annualEdits);
      const generation = await apiFetch<GenerationDto>('/ai/generations', {
        body: {
          input: {
            annualOkr: editedAnnualOkr,
            quarterId: currentQuarterId,
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
      setStage('quarter');
    } catch (nextError) {
      setError(toUserMessage(nextError, '季度 OKR 重新生成暂时失败，请稍后再试'));
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
      const editedQuarterOkr = buildQuarterOutput(quarterEdits, quarterOutput);

      await confirmDraft(quarterDraft.id, AiScenario.ANNUAL_TO_QUARTER_OKR, 'quarter_goals', {
        quarterId: currentQuarterId,
        quarterOkr: editedQuarterOkr,
        year,
      });
      const generation = await apiFetch<GenerationDto>('/ai/generations', {
        body: {
          input: {
            quarterId: currentQuarterId,
            quarterOkr: editedQuarterOkr,
            startWeekId: currentWeekId,
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
      setStage('weeks');
    } catch (nextError) {
      setError(toUserMessage(nextError, '季度 OKR 确认暂时失败，请稍后再试'));
    } finally {
      setBusyAction(null);
    }
  }

  async function regenerateWeekDraft() {
    if (!quarterDraft?.id) {
      setError('请先确认季度 OKR');
      return;
    }

    setError(null);
    setBusyAction('generate-weeks');

    try {
      const editedQuarterOkr = buildQuarterOutput(quarterEdits, quarterOutput);
      const generation = await apiFetch<GenerationDto>('/ai/generations', {
        body: {
          input: {
            quarterId: currentQuarterId,
            quarterOkr: editedQuarterOkr,
            startWeekId: currentWeekId,
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
      setStage('weeks');
    } catch (nextError) {
      setError(toUserMessage(nextError, '四周承诺重新生成暂时失败，请稍后再试'));
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
      const editedWeekCommitments = buildWeekOutput(weekEdits, weekOutput);

      await confirmDraft(
        weekDraft.id,
        AiScenario.QUARTER_TO_FOUR_WEEK_COMMITMENTS,
        'week_plan',
        {
          quarterId: currentQuarterId,
          startWeekId: currentWeekId,
          weeks: editedWeekCommitments,
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

  function regenerateCurrentStage() {
    if (stage === 'annual') {
      void generateAnnualDraft();
      return;
    }

    if (stage === 'quarter') {
      void regenerateQuarterDraft();
      return;
    }

    if (stage === 'weeks') {
      void regenerateWeekDraft();
    }
  }

  return (
    <PrototypeScreen contentStyle={styles.content}>
      <PrototypeTopActions
        onBack={() => {
          if (stage === 'input') {
            router.replace('/onboarding/choose');
            return;
          }

          setStage(stage === 'accepted' ? 'input' : stage === 'annual' ? 'accepted' : stage === 'quarter' ? 'annual' : 'quarter');
        }}
        onRegenerate={stage === 'annual' || stage === 'quarter' || stage === 'weeks' ? regenerateCurrentStage : undefined}
      />

      {stage === 'input' ? (
        <>
          <PrototypeOnboardingPanel>
            <PrototypeEyebrow>five-year vision</PrototypeEyebrow>
            <Text style={styles.question}>五年后，你希望自己成为一个什么样的人？</Text>
            <PrototypeTextarea
              accessibilityLabel="五年愿景"
              onChangeText={(next) => onboarding.setInput('vision', next)}
              placeholder="可以很具体，也可以很模糊。比如：身体强健，有稳定创造力，靠自己的作品获得自由"
              style={styles.visionInput}
              value={value}
            />
            <Text style={styles.hint}>这里先不进入 App 常驻展示，只作为今年规划的方向感。</Text>
          </PrototypeOnboardingPanel>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrototypeButton disabled={!value.trim()} onPress={() => setStage('accepted')}>
            继续
          </PrototypeButton>
          <PrototypeButton onPress={() => router.replace('/onboarding/quick')} variant="ghost">
            先快速规划这个季度
          </PrototypeButton>
        </>
      ) : null}

      {stage === 'accepted' ? (
        <>
          <PrototypeOnboardingPanel style={styles.acceptedPanel}>
            <Text style={styles.check}>✓</Text>
            <PrototypeEyebrow>vision accepted</PrototypeEyebrow>
            <Text style={styles.acceptedTitle}>我记住了。</Text>
            <Text style={styles.acceptedCopy}>接下来只处理今年这一层，不会把季度、四周和今天全部堆在同一页。</Text>
          </PrototypeOnboardingPanel>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrototypeButton disabled={busyAction === 'generate-annual'} onPress={() => void generateAnnualDraft()}>
            {busyAction === 'generate-annual' ? '正在整理...' : '整理今年 OKR'}
          </PrototypeButton>
        </>
      ) : null}

      {stage === 'annual' ? (
        <>
          <DraftPanel
            eyebrow="annual okr"
            emptyText={busyAction === 'generate-annual' ? '正在整理年度草案...' : '还没有年度草案'}
            items={annualEdits}
            labelPrefix="年度方向"
            onChangeItem={(index, nextValue) => setAnnualEdits((current) => replaceAt(current, index, nextValue))}
            title="年度 OKR"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrototypeButton disabled={busyAction === 'confirm-annual'} onPress={confirmAnnualAndGenerateQuarter}>
            {busyAction === 'confirm-annual' ? '正在生成季度 OKR...' : '确认年度 OKR'}
          </PrototypeButton>
        </>
      ) : null}

      {stage === 'quarter' ? (
        <>
          <DraftPanel
            eyebrow="quarter okr"
            emptyText={busyAction === 'confirm-annual' || busyAction === 'generate-quarter' ? '正在生成季度草案...' : '还没有季度草案'}
            items={quarterEdits}
            labelPrefix="季度方向"
            onChangeItem={(index, nextValue) => setQuarterEdits((current) => replaceAt(current, index, nextValue))}
            title="季度 OKR"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrototypeButton disabled={busyAction === 'confirm-quarter'} onPress={confirmQuarterAndGenerateWeeks}>
            {busyAction === 'confirm-quarter' ? '正在生成四周承诺...' : '确认季度 OKR，继续生成四周承诺'}
          </PrototypeButton>
        </>
      ) : null}

      {stage === 'weeks' ? (
        <>
          <DraftPanel
            eyebrow="four-week promise"
            emptyText={busyAction === 'confirm-quarter' || busyAction === 'generate-weeks' ? '正在生成四周承诺...' : '还没有四周承诺'}
            items={weekEdits}
            labelPrefix="第"
            onChangeItem={(index, nextValue) => setWeekEdits((current) => replaceAt(current, index, nextValue))}
            title="首月 4 周承诺"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrototypeButton disabled={busyAction === 'confirm-weeks'} onPress={confirmWeeksAndEnterEnergy}>
            {busyAction === 'confirm-weeks' ? '正在写入计划...' : '确认 4 周承诺，生成天计划'}
          </PrototypeButton>
        </>
      ) : null}
    </PrototypeScreen>
  );
}

function DraftPanel({
  eyebrow,
  emptyText,
  items,
  labelPrefix,
  onChangeItem,
  title,
}: {
  eyebrow: string;
  emptyText: string;
  items: string[];
  labelPrefix: string;
  onChangeItem: (index: number, value: string) => void;
  title: string;
}) {
  return (
    <PrototypeOnboardingPanel>
      <PrototypeEyebrow>{eyebrow}</PrototypeEyebrow>
      <Text style={styles.draftTitle}>{title}</Text>
      <View style={styles.draftList}>
        {items.length ? (
          items.map((item, index) => (
            <View key={index} style={styles.reviewItem}>
              <View style={styles.reviewLabelRow}>
                <Text style={styles.reviewLabel}>{formatReviewLabel(labelPrefix, index)}</Text>
                <Text style={styles.editableBadge}>可修改</Text>
              </View>
              <PrototypeTextarea
                accessibilityLabel={`${formatReviewLabel(labelPrefix, index)} 可修改`}
                onChangeText={(nextValue) => onChangeItem(index, nextValue)}
                style={styles.reviewTextarea}
                value={item}
              />
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>{emptyText}</Text>
        )}
      </View>
    </PrototypeOnboardingPanel>
  );
}

function formatAnnualItems(output?: AnnualOkrOutput) {
  return (
    output?.objectives?.map((objective) =>
      [objective.title, ...(objective.keyResults?.map((keyResult) => `KR：${keyResult}`) ?? [])].join('\n'),
    ) ?? []
  );
}

function formatQuarterItems(output?: QuarterOkrOutput) {
  return (
    output?.quarters?.map((quarter) =>
      (quarter.goals?.map((goal) => `${goal.title}`).filter(Boolean) ?? []).join('\n'),
    ) ?? []
  );
}

function formatWeekItems(output?: FourWeekCommitmentsOutput) {
  return (
    output?.weeks?.map((week) =>
      (week.focuses?.map((focus) => focus.title).filter(Boolean) ?? []).join('\n'),
    ) ?? []
  );
}

function buildAnnualOutput(items: string[]): AnnualOkrOutput {
  return {
    objectives: items.map((item) => {
      const [title = '', ...keyResults] = splitDraftLines(item);
      return {
        keyResults: (keyResults.length ? keyResults : [title]).map((keyResult) => keyResult.replace(/^KR[:：]\s*/, '')),
        title,
      };
    }).filter((objective) => objective.title.trim()),
  };
}

function buildQuarterOutput(items: string[], original?: QuarterOkrOutput): QuarterOkrOutput {
  return {
    quarters: items.map((item, index) => {
      const originalQuarter = original?.quarters?.[index];
      const lines = splitDraftLines(item);
      return {
        quarter: originalQuarter?.quarter ?? index + 1,
        goals: lines.map((line, goalIndex) => ({
          goalType: originalQuarter?.goals?.[goalIndex]?.goalType ?? 'project',
          title: line,
        })),
      };
    }).filter((quarter) => quarter.goals.length),
  };
}

function buildWeekOutput(items: string[], original?: FourWeekCommitmentsOutput): FourWeekCommitmentsOutput {
  return {
    weeks: items.map((item, index) => {
      const originalWeek = original?.weeks?.[index];
      const lines = splitDraftLines(item);
      return {
        focuses: lines.map((line, focusIndex) => ({
          reason: originalWeek?.focuses?.[focusIndex]?.reason ?? '用户确认',
          title: line,
        })),
        weekNumber: originalWeek?.weekNumber ?? index + 1,
      };
    }).filter((week) => week.focuses.length),
  };
}

function splitDraftLines(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function replaceAt(items: string[], index: number, value: string) {
  return items.map((item, itemIndex) => (itemIndex === index ? value : item));
}

function formatReviewLabel(prefix: string, index: number) {
  return prefix === '第' ? `第 ${index + 1} 周` : `${prefix} ${index + 1}`;
}

function toUserMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

const styles = StyleSheet.create({
  acceptedCopy: {
    color: '#CBD5E1',
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    textAlign: 'center',
  },
  acceptedPanel: {
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
  acceptedTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: fontWeights.heavy,
    lineHeight: 32,
  },
  check: {
    color: '#A7F3D0',
    fontSize: 44,
    fontWeight: fontWeights.heavy,
    lineHeight: 50,
  },
  content: {
    gap: 12,
  },
  draftIndex: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 999,
    color: '#CFFAFE',
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    height: 22,
    lineHeight: 22,
    overflow: 'hidden',
    textAlign: 'center',
    width: 22,
  },
  draftItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing[2],
  },
  draftList: {
    gap: spacing[3],
  },
  draftText: {
    color: '#CBD5E1',
    flex: 1,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
  },
  draftTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: fontWeights.heavy,
    lineHeight: 28,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
  },
  error: {
    color: colors.danger,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
  },
  editableBadge: {
    color: '#CFFAFE',
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.xs,
  },
  hint: {
    color: '#94A3B8',
    fontSize: fontSizes.xs,
    lineHeight: 20,
  },
  question: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: fontWeights.heavy,
    lineHeight: 30,
  },
  reviewItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.14)',
    borderColor: 'rgba(255, 255, 255, 0.075)',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing[2],
    padding: spacing[3],
  },
  reviewLabel: {
    color: '#CFFAFE',
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.xs,
  },
  reviewLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewTextarea: {
    borderRadius: 14,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    minHeight: 70,
    padding: 12,
  },
  visionInput: {
    minHeight: 158,
  },
});
