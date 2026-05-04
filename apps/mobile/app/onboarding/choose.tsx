import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrototypeScreen } from '../../src/shared/components';
import { colors, fontSizes, fontWeights, lineHeights, prototype, spacing } from '../../src/shared/theme';
import { useOnboarding } from '../../src/features/onboarding/hooks/useOnboarding';

type PathTone = 'deep' | 'manual' | 'quick';

const paths: Array<{
  description: string;
  icon: string;
  path: 'deep' | 'manual' | 'quick';
  route: string;
  title: string;
  tone: PathTone;
}> = [
  {
    description: '从五年后的自己，倒推出今年、季度、首月和今天。',
    icon: '✓',
    path: 'deep',
    route: '/onboarding/vision',
    title: '体验深度愿景规划',
    tone: 'deep',
  },
  {
    description: '只输入这一季度最想推进的一件事，让 AI 拆成本周行动。',
    icon: '→',
    path: 'quick',
    route: '/onboarding/quick',
    title: '先快速规划这个季度',
    tone: 'quick',
  },
  {
    description: '年、季、月、周、日逐层填写；空着点下一步就行。',
    icon: '■',
    path: 'manual',
    route: '/onboarding/manual/annual',
    title: '手动创建 OKR',
    tone: 'manual',
  },
];

export default function OnboardingChooseScreen() {
  const { setPath } = useOnboarding();

  return (
    <PrototypeScreen contentStyle={styles.content}>
      <View style={styles.pathHero}>
        <View pointerEvents="none" style={styles.heroHalo} />
        <Text style={styles.ribbon}>New year map</Text>
        <Text style={styles.title}>你想怎样开始今年？</Text>
        <Text style={styles.copy}>可以从五年愿景倒推，也可以快速拆这个季度；如果你只想自己安排，也有完整手动 OKR 路径。</Text>
      </View>

      <View style={styles.optionList}>
        {paths.map((item) => (
          <Pressable
            accessibilityRole="button"
            key={item.path}
            onPress={() => {
              setPath(item.path);
              router.push(item.route);
            }}
            style={({ pressed }) => [
              styles.option,
              styles[`${item.tone}Option`],
              pressed ? styles.pressed : null,
            ]}
          >
            <Text style={styles.pathIcon}>{item.icon}</Text>
            <View style={styles.pathBody}>
              <Text style={styles.optionTitle}>{item.title}</Text>
              <Text style={styles.optionCopy}>{item.description}</Text>
            </View>
            <Text style={styles.pathArrow}>›</Text>
          </Pressable>
        ))}
      </View>
    </PrototypeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingTop: 10,
  },
  copy: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 23,
    marginTop: 10,
    maxWidth: 260,
  },
  deepOption: {
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, .07), 34px -34px 82px rgba(103, 232, 249, .08)',
  },
  heroHalo: {
    backgroundColor: 'rgba(207, 250, 254, 0.08)',
    borderColor: 'rgba(207, 250, 254, 0.10)',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    bottom: -68,
    height: 178,
    position: 'absolute',
    right: -56,
    width: 178,
  },
  manualOption: {
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, .07), 34px -34px 82px rgba(254, 240, 138, .08)',
  },
  option: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.045)',
    borderColor: 'rgba(255, 255, 255, 0.095)',
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, .07)',
    flexDirection: 'row',
    gap: 12,
    minHeight: 96,
    overflow: 'hidden',
    padding: 14,
  },
  optionCopy: {
    color: 'rgba(226, 232, 240, 0.70)',
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    marginTop: spacing[1],
  },
  optionList: {
    gap: 10,
  },
  optionTitle: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.heavy,
    lineHeight: lineHeights.md,
  },
  pathArrow: {
    color: colors.textSecondary,
    fontSize: 26,
    lineHeight: 28,
    paddingHorizontal: 2,
  },
  pathBody: {
    flex: 1,
  },
  pathHero: {
    backgroundColor: 'rgba(255, 255, 255, 0.055)',
    borderColor: 'rgba(167, 243, 208, 0.13)',
    borderRadius: 30,
    borderWidth: StyleSheet.hairlineWidth,
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, .10), 0 24px 70px rgba(0, 0, 0, .26)',
    overflow: 'hidden',
    padding: 20,
  },
  pathIcon: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: fontWeights.heavy,
    lineHeight: 28,
    textAlign: 'center',
    width: 42,
  },
  pressed: {
    borderColor: 'rgba(207, 250, 254, 0.22)',
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  quickOption: {
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, .07), 34px -34px 82px rgba(167, 243, 208, .08)',
  },
  ribbon: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(254, 240, 138, 0.14)',
    borderColor: 'rgba(254, 240, 138, 0.20)',
    borderRadius: prototype.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    color: '#FEF3C7',
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.heavy,
    lineHeight: lineHeights.xs,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: fontWeights.heavy,
    lineHeight: 28,
    marginTop: 8,
  },
});
