import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ConfirmGenerationResponse, GenerationDto } from '@newme/shared';
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
import { apiFetch, ApiError, AI_REQUEST_TIMEOUT_MS } from '../../src/shared/api/client';
import { colors, fontSizes, fontWeights, lineHeights, spacing } from '../../src/shared/theme';
import { usePlanningContext } from '../../src/shared/time/usePlanningContext';

interface QuickPlanOutput {
  todayTodos?: { title: string }[];
  weeklyFocuses?: { note?: string; title: string }[];
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
  const [stage, setStage] = useState<'input' | 'review'>(draft?.id ? 'review' : 'input');
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
        timeoutMs: AI_REQUEST_TIMEOUT_MS,
      });
      onboarding.applyAiDraft('week', {
        id: generation.id,
        output: generation.outputJson ?? {},
        updatedAt: generation.createdAt,
      });
      setStage('review');
    } catch (nextError) {
      setError(toUserMessage(nextError, 'AI 生成暂时失败，请稍后再试'));
    } finally {
      setIsGenerating(false);
    }
  }

  async function confirmDraft(nextHref: '/(tabs)/energy' | '/(tabs)/todo' = '/(tabs)/energy') {
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
      router.replace(nextHref);
    } catch (nextError) {
      setError(toUserMessage(nextError, '确认写入暂时失败，请稍后再试'));
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <PrototypeScreen contentStyle={styles.content}>
      <PrototypeTopActions
        onBack={() => router.replace('/onboarding/choose')}
        onRegenerate={stage === 'review' ? generateDraft : undefined}
        regenerateLabel="重新生成当前层级"
      />

      {stage === 'input' ? (
        <>
          <PrototypeOnboardingPanel>
            <Text style={styles.question}>这个季度，你最想推进的一件事是什么？</Text>
            <PrototypeTextarea
              accessibilityLabel="季度目标"
              onChangeText={(next) => onboarding.setInput('quarterGoal', next)}
              placeholder="例如：开发一款 App，上架到应用商店"
              style={styles.goalInput}
              value={value}
            />
            <Text style={styles.hint}>先用一件事跑通完整闭环，之后再补充其他方向。</Text>
          </PrototypeOnboardingPanel>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrototypeButton disabled={!value.trim() || isGenerating} onPress={generateDraft}>
            {isGenerating ? '正在拆成本周行动...' : '让 AI 帮我拆成这周行动'}
          </PrototypeButton>
          {isGenerating ? <View style={styles.loadingTrack}><View style={styles.loadingBar} /></View> : null}
        </>
      ) : (
        <>
          <PrototypeOnboardingPanel>
            <PrototypeEyebrow>weekly focus</PrototypeEyebrow>
            <Text style={styles.reviewTitle}>本周先推进这 3 件事</Text>
            <View style={styles.focusList}>
              {(draftOutput?.weeklyFocuses ?? []).slice(0, 3).map((focus, index) => (
                <View key={`${focus.title}-${index}`} style={styles.focusCard}>
                  <Text style={styles.focusTitle}>{index + 1}. {focus.title}</Text>
                  {focus.note ? <Text style={styles.focusNote}>{focus.note}</Text> : null}
                </View>
              ))}
            </View>
          </PrototypeOnboardingPanel>

          <PrototypeOnboardingPanel style={styles.todayPanel}>
            <View style={styles.cardHead}>
              <Text style={styles.todayTitle}>今日清单建议</Text>
              <Text style={styles.badge}>可修改</Text>
            </View>
            <View style={styles.suggestionList}>
              {(draftOutput?.todayTodos ?? []).slice(0, 3).map((todo, index) => (
                <View key={`${todo.title}-${index}`} style={styles.suggestionItem}>
                  <Text style={styles.suggestionIndex}>{index + 1}</Text>
                  <Text style={styles.suggestionText}>{todo.title}</Text>
                </View>
              ))}
            </View>
          </PrototypeOnboardingPanel>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            <PrototypeButton disabled={isConfirming} onPress={() => void confirmDraft('/(tabs)/todo')}>
              先看今日清单
            </PrototypeButton>
            <PrototypeButton disabled={isConfirming} onPress={() => void confirmDraft('/(tabs)/energy')} variant="ghost">
              进入能量页
            </PrototypeButton>
          </View>
        </>
      )}
    </PrototypeScreen>
  );
}

function toUserMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

const styles = StyleSheet.create({
  actions: {
    gap: 12,
  },
  badge: {
    backgroundColor: 'rgba(254, 240, 138, 0.12)',
    borderRadius: 999,
    color: '#FEF3C7',
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.xs,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cardHead: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  content: {
    gap: 14,
  },
  error: {
    color: colors.danger,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
  },
  focusCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    borderColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing[3],
  },
  focusList: {
    gap: spacing[3],
  },
  focusNote: {
    color: 'rgba(203, 213, 225, 0.72)',
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.sm,
    marginTop: 4,
  },
  focusTitle: {
    color: '#F8FAFC',
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.sm,
  },
  goalInput: {
    minHeight: 160,
  },
  hint: {
    color: '#94A3B8',
    fontSize: fontSizes.xs,
    lineHeight: 20,
  },
  loadingBar: {
    backgroundColor: '#CFFAFE',
    borderRadius: 999,
    height: '100%',
    width: '66%',
  },
  loadingTrack: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 999,
    height: 6,
    overflow: 'hidden',
  },
  question: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: fontWeights.heavy,
    lineHeight: 30,
  },
  reviewTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: fontWeights.bold,
    lineHeight: 24,
    marginTop: -6,
  },
  suggestionIndex: {
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
  suggestionItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing[2],
  },
  suggestionList: {
    gap: spacing[2],
  },
  suggestionText: {
    color: '#CBD5E1',
    flex: 1,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
  },
  todayPanel: {
    padding: 16,
  },
  todayTitle: {
    color: '#FFFFFF',
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.md,
  },
});
