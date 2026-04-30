import { router } from 'expo-router';

import { Button } from '../../../src/shared/components';
import { ManualAiSuggestions } from '../../../src/features/onboarding/components/ManualAiSuggestions';
import { ManualInput } from '../../../src/features/onboarding/components/ManualInput';
import { OnboardingScreen } from '../../../src/features/onboarding/components/OnboardingScreen';
import { useManualAiAssist } from '../../../src/features/onboarding/hooks/useManualAiAssist';
import { useOnboarding } from '../../../src/features/onboarding/hooks/useOnboarding';

export default function ManualTodayScreen() {
  const onboarding = useOnboarding();
  const value = onboarding.getInput('today');
  const aiAssist = useManualAiAssist('today');

  return (
    <OnboardingScreen
      eyebrow="Manual OKR"
      subtitle="可以只填今天。即使前面的目标都空着，清单和能量记录也能直接开始。"
      title="05 / 今日 ToDo"
    >
      <ManualInput
        helper="完成后进入同一套今日清单 / 能量记录闭环。"
        label="今日清单"
        onAiAssist={aiAssist.generate}
        onChangeText={(next) => onboarding.setInput('today', next)}
        placeholder="例如：梳理手动流程；补齐三入口视觉；截图检查计划页。"
        value={value}
      />
      <ManualAiSuggestions
        error={aiAssist.error}
        onAccept={aiAssist.acceptSuggestion}
        suggestions={aiAssist.suggestions}
      />
      <Button onPress={() => router.replace('/(tabs)/todo')}>进入今日清单</Button>
      <Button onPress={() => router.back()} variant="ghost">
        返回上一步
      </Button>
    </OnboardingScreen>
  );
}
