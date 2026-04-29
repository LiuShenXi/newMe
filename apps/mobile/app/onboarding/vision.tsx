import { router } from 'expo-router';

import { Button } from '../../src/shared/components';
import { AiDraftView } from '../../src/features/onboarding/components/AiDraftView';
import { ManualInput } from '../../src/features/onboarding/components/ManualInput';
import { OnboardingScreen } from '../../src/features/onboarding/components/OnboardingScreen';
import { useOnboarding } from '../../src/features/onboarding/hooks/useOnboarding';

export default function VisionPlanScreen() {
  const onboarding = useOnboarding();
  const value = onboarding.getInput('vision');

  return (
    <OnboardingScreen
      eyebrow="Deep vision"
      subtitle="先写五年后的自己，后续再倒推出今年、季度、首月和今天。"
      title="五年后，你希望自己在哪里？"
    >
      <ManualInput
        helper="返回不会清空内容；重新生成只会更新当前层级。"
        label="五年愿景"
        onChangeText={(next) => onboarding.setInput('vision', next)}
        placeholder="例如：我有稳定的产品节奏、健康的身体和可持续的创作系统。"
        value={value}
      />
      {value ? (
        <AiDraftView
          items={['年度 OKR 草案将在这里呈现', '季度 OKR 会继续承接年度目标', '首月 4 周承诺只看最近一个月']}
          title="深度规划草案占位"
        />
      ) : null}
      <Button onPress={() => router.replace('/(tabs)/energy')}>先进入今日能量</Button>
    </OnboardingScreen>
  );
}
