import { ManualStepScreen } from '../../../src/features/onboarding/components/ManualStepScreen';

export default function ManualTodayScreen() {
  return (
    <ManualStepScreen
      continueLabel="进入今日清单"
      helper="完成后进入同一套今日清单 / 能量记录闭环。"
      inputKey="today"
      label="今日清单"
      nextHref="/(tabs)/todo"
      placeholder="例如：梳理手动流程；补齐三入口视觉；截图检查计划页。"
      replace
      title="05 / 今日 ToDo"
    />
  );
}
