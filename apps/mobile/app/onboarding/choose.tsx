import { router } from 'expo-router';

import { PathCard } from '../../src/features/onboarding/components/PathCard';
import { OnboardingScreen } from '../../src/features/onboarding/components/OnboardingScreen';
import { useOnboarding } from '../../src/features/onboarding/hooks/useOnboarding';

export default function OnboardingChooseScreen() {
  const { setPath } = useOnboarding();

  return (
    <OnboardingScreen
      eyebrow="New year map"
      subtitle="可以从五年愿景倒推，也可以快速拆这个季度；如果你只想自己安排，也有完整手动 OKR 路径。"
      title="你想怎样开始今年？"
    >
      <PathCard
        description="从五年后的自己，倒推出今年、季度、首月和今天。"
        icon="sparkles"
        onPress={() => {
          setPath('deep');
          router.push('/onboarding/vision');
        }}
        title="体验深度愿景规划"
      />
      <PathCard
        description="只输入这一季度想推进的一件事，让 AI 拆成本周行动。"
        icon="flash-outline"
        onPress={() => {
          setPath('quick');
          router.push('/onboarding/quick');
        }}
        title="先快速规划这个季度"
      />
      <PathCard
        description="年、季、月、周、日逐层填写；空着点下一步就行。"
        icon="square-outline"
        onPress={() => {
          setPath('manual');
          router.push('/onboarding/manual/annual');
        }}
        title="手动创建 OKR"
      />
    </OnboardingScreen>
  );
}
