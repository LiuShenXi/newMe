import { useEffect, useMemo, useRef, useState } from 'react';

export interface WeeklyFocusProgress {
  id: string;
  note: string;
  title: string;
  value: number;
}

const demoFocuses: WeeklyFocusProgress[] = [
  { id: 'focus-1', note: '前端结构已完成', title: '完成能量页交互原型', value: 68 },
  { id: 'focus-2', note: '清单数据已整理', title: '验证今日清单和提醒流程', value: 46 },
  { id: 'focus-3', note: '保留最低行动线', title: '保持 3 次运动和 2 次阅读', value: 58 },
];

export function useEnergy() {
  const [charging, setCharging] = useState(false);
  const [energyValue, setEnergyValue] = useState(72);
  const [hasViewedTodos, setHasViewedTodos] = useState(false);
  const [reminderVisible, setReminderVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const weekEnergy = useMemo(() => {
    const focusAverage = demoFocuses.reduce((sum, item) => sum + item.value, 0) / demoFocuses.length;
    return Math.round((focusAverage + energyValue) / 2);
  }, [energyValue]);

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  function setTodayEnergy(nextValue: number) {
    setEnergyValue(Math.max(0, Math.min(100, Math.round(nextValue))));
  }

  function requestConfirm() {
    if (!hasViewedTodos) {
      setReminderVisible(true);
      return;
    }

    confirmEnergy();
  }

  function confirmEnergy() {
    setReminderVisible(false);
    setHasViewedTodos(true);
    setCharging(true);
    setToastVisible(true);

    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current = [
      setTimeout(() => setCharging(false), 1400),
      setTimeout(() => setToastVisible(false), 1800),
    ];
  }

  return {
    charging,
    confirmEnergy,
    energyValue,
    focuses: demoFocuses,
    reminderVisible,
    requestConfirm,
    setReminderVisible,
    setTodayEnergy,
    toastVisible,
    weekEnergy,
  };
}
