import { router } from 'expo-router';

import { Button } from '../../src/shared/components';
import { AiDraftView } from '../../src/features/onboarding/components/AiDraftView';
import { ManualInput } from '../../src/features/onboarding/components/ManualInput';
import { OnboardingScreen } from '../../src/features/onboarding/components/OnboardingScreen';
import { useOnboarding } from '../../src/features/onboarding/hooks/useOnboarding';

export default function QuickPlanScreen() {
  const onboarding = useOnboarding();
  const value = onboarding.getInput('quarterGoal');

  return (
    <OnboardingScreen
      eyebrow="Quick start"
      subtitle="只抓住这个季度最想推进的一件事，先换成本周能行动的节奏。"
      title="这个季度，你最想推进的一件事是什么？"
    >
      <ManualInput
        helper="后续 AI 会基于这段输入生成本周重点和今日清单建议。"
        label="季度目标"
        onChangeText={(next) => onboarding.setInput('quarterGoal', next)}
        placeholder="例如：完成个人成长 App 的第一个可用 MVP。"
        value={value}
      />
      {value ? (
        <AiDraftView
          items={['本周先跑通一个可执行计划', '把今日清单保持在能完成的密度', '周末完成一次果实结算']}
          title="AI 草案占位"
        />
      ) : null}
      <Button onPress={() => router.replace('/(tabs)/energy')}>进入能量页</Button>
    </OnboardingScreen>
  );
}
