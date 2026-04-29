import { ManualStepScreen } from '../../../src/features/onboarding/components/ManualStepScreen';

export default function ManualAnnualScreen() {
  return (
    <ManualStepScreen
      helper="年目标可以很粗，只要能帮你判断今年想守住什么。"
      inputKey="annual"
      label="年目标"
      nextHref="/onboarding/manual/quarter"
      placeholder="例如：稳定做出 NewMe MVP，同时守住运动和阅读节奏。"
      title="01 / 年目标"
    />
  );
}
