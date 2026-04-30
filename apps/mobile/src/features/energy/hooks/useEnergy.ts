import type { EnergyEntryDto, WeeklyEnergyDto } from '@newme/shared';
import { useEffect, useRef, useState } from 'react';

import { apiFetch } from '../../../shared/api/client';
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

const demoWeekEnergyValues = [72, 84, 66, 88, 78, 0, 0];
const todayDate = '2026-04-26';
const currentWeekId = '2026-W17';

function getDemoWeekEnergy() {
  const recorded = demoWeekEnergyValues.filter(Boolean);
  return Math.round(recorded.reduce((sum, value) => sum + value, 0) / recorded.length);
}

export function useEnergy() {
  const [charging, setCharging] = useState(false);
  const [energyValue, setEnergyValue] = useState(82);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reminderVisible, setReminderVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [weekEnergy, setWeekEnergy] = useState(getDemoWeekEnergy);
  const markListViewed = usePrototypeStore((state) => state.markListViewed);
  const viewedList = usePrototypeStore((state) => state.viewedList);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadWeeklyEnergy() {
      try {
        const weeklyEnergy = await apiFetch<WeeklyEnergyDto>(`/energy/weeks/${currentWeekId}`);

        if (!cancelled) {
          if (typeof weeklyEnergy.average === 'number') {
            setWeekEnergy(Math.round(weeklyEnergy.average));
          }
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : '能量加载失败，已显示本地示例');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadWeeklyEnergy();

    return () => {
      cancelled = true;
    };
  }, []);

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
    apiFetch<EnergyEntryDto>(`/energy/days/${todayDate}`, {
      body: {
        hasViewedTodos: true,
        score: energyValue,
      },
      method: 'PUT',
    })
      .then(() => setError(null))
      .catch((recordError: unknown) => {
        setError(recordError instanceof Error ? recordError.message : '能量确认失败，已保留本地反馈');
      });

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
    error,
    focuses: demoFocuses,
    loading,
    reminderVisible,
    requestConfirm,
    setReminderVisible,
    setTodayEnergy,
    toastVisible,
    weekEnergy,
  };
}
