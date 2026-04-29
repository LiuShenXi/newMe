import { ManualStepScreen } from '../../../src/features/onboarding/components/ManualStepScreen';

export default function ManualQuarterScreen() {
  return (
    <ManualStepScreen
      helper="如果年目标暂时为空，季度目标也可以独立存在。"
      inputKey="quarter"
      label="季度目标"
      nextHref="/onboarding/manual/month"
      placeholder="例如：这个季度完成冷启动、日常执行和周结算闭环。"
      title="02 / 当前季度目标"
    />
  );
}
