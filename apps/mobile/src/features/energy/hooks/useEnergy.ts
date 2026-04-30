import { useEffect, useMemo, useRef, useState } from 'react';

import { usePrototypeStore } from '../../../stores/prototype.store';

export interface WeeklyFocusProgress {
  id: string;
  note: string;
  title: string;
  value: number;
}

const demoFocuses: WeeklyFocusProgress[] = [
  { id: 'focus-1', note: '前端结构已完成', title: '完成能量页交互原型', value: 68 },
  { id: 'focus-2', note: '已完成 3 / 5', title: '晨跑 5 次', value: 60 },
  { id: 'focus-3', note: '第 2 章进行中', title: '读完两章社会学', value: 40 },
];

export function useEnergy() {
  const [charging, setCharging] = useState(false);
  const [energyValue, setEnergyValue] = useState(82);
  const [reminderVisible, setReminderVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const markListViewed = usePrototypeStore((state) => state.markListViewed);
  const viewedList = usePrototypeStore((state) => state.viewedList);
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
    if (!viewedList) {
      setReminderVisible(true);
      return;
    }

    confirmEnergy();
  }

  function confirmEnergy() {
    setReminderVisible(false);
    markListViewed();
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
