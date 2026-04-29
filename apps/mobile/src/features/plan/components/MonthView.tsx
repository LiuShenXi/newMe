import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fontWeights, lineHeights, radii, spacing } from '../../../shared/theme';
import type { MonthWeek } from '../hooks/usePlan';

interface MonthViewProps {
  weeks: MonthWeek[];
}

export function MonthView({ weeks }: MonthViewProps) {
  return (
    <View style={styles.list}>
      <View style={styles.intro}>
        <View>
          <Text style={styles.eyebrow}>April · 4 weeks</Text>
          <Text style={styles.introTitle}>本周先能执行，月目标可以后补</Text>
        </View>
        <Text style={styles.aiPill}>局部 AI</Text>
      </View>
      {weeks.map((week) => (
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
  aiPill: {
    backgroundColor: 'rgba(0, 229, 160, 0.12)',
    borderRadius: radii.pill,
    color: '#A7F3D0',
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.xs,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  currentWeek: {
    borderColor: 'rgba(0, 229, 160, 0.34)',
  },
  eyebrow: {
    color: colors.primary,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.heavy,
    lineHeight: lineHeights.xs,
  },
  intro: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.055)',
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
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
    backgroundColor: 'rgba(255, 255, 255, 0.045)',
    borderColor: colors.border,
    borderRadius: radii.md,
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
