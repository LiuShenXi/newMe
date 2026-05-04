import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import {
  PrototypeButton,
  PrototypeEyebrow,
  PrototypeOnboardingPanel,
  PrototypeScreen,
  PrototypeTextarea,
  PrototypeTopActions,
} from '../../../shared/components';
import { colors, fontSizes, fontWeights, lineHeights, spacing } from '../../../shared/theme';
import { ManualAiSuggestions } from './ManualAiSuggestions';
import { useManualAiAssist } from '../hooks/useManualAiAssist';
import { useOnboarding } from '../hooks/useOnboarding';

type ManualInputKey = 'annual' | 'month' | 'quarter' | 'today' | 'week';

interface ManualStepScreenProps {
  continueLabel?: string;
  helper: string;
  inputKey: ManualInputKey;
  label: string;
  nextHref: string;
  placeholder: string;
  replace?: boolean;
  title: string;
}

export function ManualStepScreen({
  continueLabel = '继续',
  helper,
  inputKey,
  label,
  nextHref,
  placeholder,
  replace = false,
  title,
}: ManualStepScreenProps) {
  const onboarding = useOnboarding();
  const value = onboarding.getInput(inputKey);
  const aiAssist = useManualAiAssist(inputKey);

  function goNext() {
    if (replace) {
      router.replace(nextHref);
      return;
    }

    router.push(nextHref);
  }

  return (
    <PrototypeScreen contentStyle={styles.content}>
      <PrototypeTopActions onBack={() => router.back()} />
      <PrototypeOnboardingPanel>
        <PrototypeEyebrow tone="gold">Manual OKR</PrototypeEyebrow>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.copy}>可以留空继续，之后在计划页补齐。当前页面只处理这一层级。</Text>
      </PrototypeOnboardingPanel>

      <PrototypeOnboardingPanel style={styles.inputPanel}>
        <Text style={styles.label}>{label}</Text>
        <PrototypeTextarea
          accessibilityLabel={label}
          onChangeText={(next) => onboarding.setInput(inputKey, next)}
          placeholder={placeholder}
          style={styles.input}
          value={value}
        />
        <Text style={styles.helper}>{helper}</Text>
      </PrototypeOnboardingPanel>

      <ManualAiSuggestions
        error={aiAssist.error}
        onAccept={aiAssist.acceptSuggestion}
        suggestions={aiAssist.suggestions}
      />

      <View style={styles.actions}>
        <PrototypeButton disabled={aiAssist.isGenerating} onPress={aiAssist.generate} style={styles.actionButton} variant="secondary">
          {aiAssist.isGenerating ? '生成中...' : 'AI 辅助'}
        </PrototypeButton>
        <PrototypeButton onPress={goNext} style={styles.actionButton}>
          {continueLabel}
        </PrototypeButton>
      </View>
    </PrototypeScreen>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  content: {
    gap: 14,
  },
  copy: {
    color: '#CBD5E1',
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
  },
  helper: {
    color: '#94A3B8',
    fontSize: fontSizes.xs,
    lineHeight: 20,
  },
  input: {
    minHeight: 150,
  },
  inputPanel: {
    padding: 18,
  },
  label: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.sm,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: fontWeights.heavy,
    lineHeight: 32,
  },
});
