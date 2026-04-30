import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrototypeButton } from '../../../shared/components';
import { colors, fontSizes, fontWeights, lineHeights, prototypeGlassBlur, prototypeGlassShadow, radii, spacing } from '../../../shared/theme';
import type { MonthWeek, PlanSource } from '../hooks/usePlan';

interface MonthViewProps {
  planSource: PlanSource;
  weeks: MonthWeek[];
}

export function MonthView({ planSource, weeks }: MonthViewProps) {
  const [coachOpen, setCoachOpen] = useState(false);
  const [feedback, setFeedback] = useState('这周工作会比较忙，保留晨跑，阅读任务拆小一点。');
  const [localWeeks, setLocalWeeks] = useState(weeks);
  const [planning, setPlanning] = useState(false);
  const [rounds, setRounds] = useState(0);
  const isAiSource = planSource === 'ai';

  function submitFeedback() {
    if (rounds >= 3 || planning) return;
    setPlanning(true);
    setTimeout(() => {
      setLocalWeeks((current) =>
        current.map((week) =>
          week.week === 'W17'
            ? {
                ...week,
                items: [
                  '把任务密度从 4 件降到 3 件，先保证能完成',
                  '保留晨跑作为稳定能量来源，不再新增运动任务',
                  '阅读任务改成每天 15 分钟，优先完成第 2 章',
                ],
                title: '根据反馈重排 AI 任务',
              }
            : week,
        ),
      );
      setRounds((current) => current + 1);
      setPlanning(false);
      setCoachOpen(false);
    }, 600);
  }

  return (
    <View style={styles.list}>
      <View style={styles.intro}>
        <View>
          <Text style={styles.eyebrow}>April · 4 weeks</Text>
          <Text style={styles.introTitle}>{isAiSource ? '只规划最近一个月，避免计划过远失效' : '本周先能执行，月目标可以后补'}</Text>
        </View>
        <PrototypeButton onPress={() => setCoachOpen(true)} variant="replan">
          {isAiSource ? (planning ? '生成中' : 'AI 重规划') : '局部 AI'}
        </PrototypeButton>
        {coachOpen ? (
          <View style={styles.coachPanel}>
            <Text style={styles.coachCopy}>告诉 AI 这周哪里变了，它会只改后续计划。第 {rounds + 1} / 3 轮</Text>
            <TextInput
              multiline
              onChangeText={setFeedback}
              placeholder="例如：这周工作会比较忙，运动保留，阅读降到每天 15 分钟"
              placeholderTextColor="#64748B"
              style={styles.coachInput}
              value={feedback}
            />
            <View style={styles.coachActions}>
              <Pressable accessibilityRole="button" onPress={submitFeedback} style={styles.coachPrimary}>
                <Text style={styles.coachPrimaryText}>{planning ? '生成中' : '生成新版本'}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => setCoachOpen(false)} style={styles.coachSecondary}>
                <Text style={styles.coachSecondaryText}>取消</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
      {localWeeks.map((week) => (
        <View key={week.id} style={[styles.weekCard, week.state === '当前周' ? styles.currentWeek : null]}>
          <View style={styles.weekHeader}>
            <Text style={styles.weekTitle}>
              {week.week} · {week.title}
            </Text>
            <Text style={styles.weekState}>
              {week.state === '当前周' ? `当前周 · ${week.score ?? 0}%` : week.score ? `${week.score}%` : week.state}
            </Text>
          </View>
          <View style={styles.tasks}>
            {week.items.map((item, index) => (
              <View key={item} style={styles.task}>
                <Text style={styles.taskIndex}>{index + 1}</Text>
                <Text style={styles.taskText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  coachActions: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[3],
  },
  coachCopy: {
    color: '#CBD5E1',
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.sm,
  },
  coachInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing[3],
    minHeight: 82,
    padding: spacing[3],
    textAlignVertical: 'top',
  },
  coachPanel: {
    backgroundColor: 'rgba(45, 31, 4, 0.18)',
    borderColor: 'rgba(254, 240, 138, 0.14)',
    borderRadius: radii.item,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: spacing[4],
    padding: spacing[3],
    width: '100%',
  },
  coachPrimary: {
    alignItems: 'center',
    backgroundColor: 'rgba(207, 250, 254, 0.12)',
    borderRadius: 12,
    flex: 1,
    minHeight: 38,
    justifyContent: 'center',
  },
  coachPrimaryText: {
    color: '#ECFEFF',
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
  },
  coachSecondary: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    flex: 1,
    minHeight: 38,
    justifyContent: 'center',
  },
  coachSecondaryText: {
    color: '#CBD5E1',
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
  },
  currentWeek: {
    borderColor: 'rgba(207, 250, 254, 0.30)',
    backgroundColor: 'rgba(207, 250, 254, 0.08)',
  },
  eyebrow: {
    color: 'rgba(209, 250, 229, 0.50)',
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.heavy,
    lineHeight: lineHeights.xs,
  },
  intro: {
    ...prototypeGlassBlur,
    ...prototypeGlassShadow,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.045)',
    borderColor: 'rgba(254, 240, 138, 0.14)',
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: spacing[4],
  },
  introTitle: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.md,
    marginTop: spacing[1],
  },
  list: {
    gap: spacing[3],
  },
  task: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing[2],
  },
  taskIndex: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radii.pill,
    color: colors.textSecondary,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    height: 22,
    lineHeight: 22,
    overflow: 'hidden',
    textAlign: 'center',
    width: 22,
  },
  taskText: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.sm,
  },
  tasks: {
    gap: spacing[2],
  },
  weekCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.035)',
    borderColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing[3],
    padding: spacing[4],
  },
  weekHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekState: {
    color: '#CFFAFE',
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
  },
  weekTitle: {
    color: colors.text,
    flex: 1,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.sm,
  },
});
