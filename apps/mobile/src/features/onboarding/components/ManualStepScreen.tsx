import { router } from 'expo-router';

import { Button } from '../../../shared/components';
import { ManualAiSuggestions } from './ManualAiSuggestions';
import { ManualInput } from './ManualInput';
import { OnboardingScreen } from './OnboardingScreen';
import { useManualAiAssist } from '../hooks/useManualAiAssist';
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
  const aiAssist = useManualAiAssist(inputKey);

  return (
    <OnboardingScreen eyebrow="Manual OKR" subtitle="可以留空继续，后续在计划页补全。" title={title}>
      <ManualInput
        helper={helper}
        label={label}
        onAiAssist={aiAssist.generate}
        onChangeText={(next) => onboarding.setInput(inputKey, next)}
        placeholder={placeholder}
        value={value}
      />
      <ManualAiSuggestions
        error={aiAssist.error}
        onAccept={aiAssist.acceptSuggestion}
        suggestions={aiAssist.suggestions}
      />
      <Button onPress={() => router.push(nextHref)}>继续</Button>
      <Button onPress={() => router.back()} variant="ghost">
        返回上一步
      </Button>
    </OnboardingScreen>
  );
}
