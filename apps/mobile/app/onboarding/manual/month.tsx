import { ManualStepScreen } from '../../../src/features/onboarding/components/ManualStepScreen';

export default function ManualMonthScreen() {
  return (
    <ManualStepScreen
      helper="只看最近一个月，避免计划拉得太远。"
      inputKey="month"
      label="本月目标"
      nextHref="/onboarding/manual/week"
      placeholder="例如：本月完成手动 OKR 链路、计划页补填入口和一次视觉检查。"
      title="03 / 本月目标"
    />
  );
}
