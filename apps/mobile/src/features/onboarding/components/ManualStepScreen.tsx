import { router } from 'expo-router';

import { Button } from '../../../shared/components';
import { ManualInput } from './ManualInput';
import { OnboardingScreen } from './OnboardingScreen';
import { useOnboarding } from '../hooks/useOnboarding';

type ManualInputKey = 'annual' | 'month' | 'quarter' | 'today' | 'week';

interface ManualStepScreenProps {
  helper: string;
  inputKey: ManualInputKey;
  label: string;
  nextHref: string;
  placeholder: string;
  title: string;
}

export function ManualStepScreen({
  helper,
  inputKey,
  label,
  nextHref,
  placeholder,
  title,
}: ManualStepScreenProps) {
  const onboarding = useOnboarding();
  const value = onboarding.getInput(inputKey);

  return (
    <OnboardingScreen eyebrow="Manual OKR" subtitle="可以留空继续，后续在计划页补全。" title={title}>
      <ManualInput
        helper={helper}
        label={label}
        onAiAssist={() =>
          onboarding.applyAiDraft(inputKey, {
            output: { suggestion: `${label} AI 辅助草案占位` },
            updatedAt: new Date().toISOString(),
          })
        }
        onChangeText={(next) => onboarding.setInput(inputKey, next)}
        placeholder={placeholder}
        value={value}
      />
      <Button onPress={() => router.push(nextHref)}>继续</Button>
      <Button onPress={() => router.back()} variant="ghost">
        返回上一步
      </Button>
    </OnboardingScreen>
  );
}
