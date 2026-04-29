import { ManualStepScreen } from '../../../src/features/onboarding/components/ManualStepScreen';

export default function ManualWeekScreen() {
  return (
    <ManualStepScreen
      helper="本周计划会直接成为能量页打分的参照物。"
      inputKey="week"
      label="本周计划"
      nextHref="/onboarding/manual/today"
      placeholder="例如：完成手动 OKR 冷启动；计划页展示暂未设置；保留 3 次运动。"
      title="04 / 本周计划"
    />
  );
}
