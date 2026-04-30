import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { GlassCard, PrototypeScreen } from '../../src/shared/components/PrototypeShell';
import { colors, fontSizes, fontWeights, lineHeights, radii, spacing } from '../../src/shared/theme';
import { usePrototypeStore } from '../../src/stores/prototype.store';

const weekRecords = [
  { day: '一', value: 72 },
  { day: '二', value: 84 },
  { day: '三', value: 66 },
  { day: '四', value: 88 },
  { day: '五', value: 78 },
  { day: '六', value: 0 },
  { day: '日', value: 82 },
];

const focusItems = [
  { title: '完成能量页交互原型', value: 68 },
  { title: '晨跑 5 次', value: 60 },
  { title: '读完两章社会学', value: 40 },
];

export default function SettlementScreen() {
  const [score, setScore] = useState(78);
  const [confirmed, setConfirmed] = useState(false);
  const addFruit = usePrototypeStore((state) => state.addFruit);
  const suggestedScore = useMemo(() => {
    const recorded = weekRecords.filter((record) => record.value > 0);
    return Math.round(recorded.reduce((sum, record) => sum + record.value, 0) / recorded.length);
  }, []);

  const displayScore = confirmed ? score : suggestedScore;

  return (
    <PrototypeScreen contentStyle={styles.content}>
      <GlassCard style={styles.heroCard}>
        <Text style={styles.heroCopy}>这一周辛苦了，{'\n'}我们一起看看这周的收获吧。</Text>
        <View style={[styles.fruit, confirmed ? styles.fruitBorn : null]}>
          <Text style={styles.fruitText}>{displayScore}%</Text>
        </View>
      </GlassCard>

      <GlassCard style={styles.barsCard}>
        <View style={styles.bars}>
          {weekRecords.map((record) => (
            <View key={record.day} style={styles.barColumn}>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { height: `${Math.max(record.value, 8)}%`, opacity: record.value ? 1 : 0.2 }]} />
              </View>
              <Text style={styles.barDay}>{record.day}</Text>
            </View>
          ))}
        </View>
      </GlassCard>

      <GlassCard style={styles.resultCard}>
        <View style={styles.resultRow}>
          <Text style={styles.sectionTitle}>本周重点推进</Text>
          <Text style={styles.resultValue}>回顾</Text>
        </View>
        <View style={styles.focusList}>
          {focusItems.map((item) => (
            <View key={item.title} style={styles.focusRow}>
              <Text style={styles.focusTitle}>{item.title}</Text>
              <Text style={styles.focusValue}>{item.value}%</Text>
            </View>
          ))}
        </View>
      </GlassCard>

      <GlassCard style={styles.resultCard}>
        <View style={styles.resultRow}>
          <Text style={styles.sectionTitle}>最终周结果</Text>
          <Text style={styles.scoreLabel}>{score}%</Text>
        </View>
        <View style={styles.scoreRail}>
          <Pressable accessibilityRole="adjustable" onPress={() => setScore((current) => (current >= 100 ? 0 : current + 5))} style={styles.scoreFillWrap}>
            <View style={[styles.scoreFill, { width: `${score}%` }]} />
          </Pressable>
        </View>
        <TextInput
          multiline
          placeholder="这一周有什么值得树记住？"
          placeholderTextColor="#64748B"
          style={styles.note}
          defaultValue="这一周虽然有几次节奏被打断，但关键推进没有断线。"
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setConfirmed(true);
            addFruit({
              date: '2026-04-26',
              focuses: focusItems.map((item) => item.title),
              note: '这一周的努力已经被树记住了。',
              reflection: '这一周虽然有几次节奏被打断，但关键推进没有断线。',
              score,
              size: 18 + Math.round(score / 18),
              week: '第 17 周',
              x: 205,
              y: 108,
            });
            setTimeout(() => router.replace('/tree'), 900);
          }}
          style={styles.settleButton}
        >
          <Text style={styles.settleButtonText}>{confirmed ? '果实已生成' : '确认并生成果实'}</Text>
        </Pressable>
      </GlassCard>
    </PrototypeScreen>
  );
}

const styles = StyleSheet.create({
  barColumn: {
    alignItems: 'center',
    flex: 1,
    gap: spacing[2],
  },
  barDay: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 14,
  },
  barFill: {
    backgroundColor: 'rgba(101, 255, 226, 0.78)',
    borderRadius: radii.pill,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  barTrack: {
    backgroundColor: 'rgba(255, 255, 255, 0.055)',
    borderRadius: radii.pill,
    height: 112,
    overflow: 'hidden',
    width: '100%',
  },
  bars: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing[3],
    height: 144,
  },
  barsCard: {
    padding: spacing[4],
  },
  content: {
    gap: 16,
  },
  focusList: {
    gap: spacing[2],
    marginTop: spacing[3],
  },
  focusRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
    borderRadius: 14,
    flexDirection: 'row',
    gap: spacing[3],
    justifyContent: 'space-between',
    padding: spacing[3],
  },
  focusTitle: {
    color: '#CBD5E1',
    flex: 1,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
  },
  focusValue: {
    color: '#FEF3C7',
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
  },
  fruit: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#D8AE46',
    borderColor: 'rgba(254, 243, 199, 0.50)',
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    height: 112,
    justifyContent: 'center',
    marginTop: spacing[5],
    shadowColor: '#E1C063',
    shadowOpacity: 0.35,
    shadowRadius: 60,
    width: 112,
  },
  fruitBorn: {
    transform: [{ scale: 1.04 }],
  },
  fruitText: {
    color: '#221909',
    fontSize: 30,
    fontWeight: fontWeights.regular,
    lineHeight: 36,
  },
  heroCard: {
    alignItems: 'center',
    padding: spacing[5],
  },
  heroCopy: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    lineHeight: 24,
    textAlign: 'center',
  },
  note: {
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 21,
    marginTop: spacing[3],
    minHeight: 82,
    padding: spacing[3],
    textAlignVertical: 'top',
  },
  resultCard: {
    padding: spacing[4],
  },
  resultRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultValue: {
    color: '#CFFAFE',
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
  },
  scoreFill: {
    backgroundColor: '#FACC15',
    borderRadius: radii.pill,
    height: '100%',
  },
  scoreFillWrap: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: radii.pill,
    height: 8,
    marginTop: spacing[4],
    overflow: 'hidden',
  },
  scoreLabel: {
    color: '#CFFAFE',
    fontSize: 18,
    lineHeight: 24,
  },
  scoreRail: {
    width: '100%',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.sm,
  },
  settleButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(254, 243, 199, 0.15)',
    borderRadius: radii.control,
    justifyContent: 'center',
    marginTop: spacing[4],
    minHeight: 44,
  },
  settleButtonText: {
    color: '#FFFBEB',
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.sm,
  },
});
