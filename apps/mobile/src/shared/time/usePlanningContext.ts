import { useMemo } from 'react';

import { useAuthStore } from '../../stores/auth.store';
import { getPlanningContext } from './planning-context';

export function usePlanningContext() {
  const user = useAuthStore((state) => state.user);
  const currentQuarterId = user?.currentQuarterId;
  const currentWeekId = user?.currentWeekId;

  return useMemo(
    () => getPlanningContext(currentQuarterId && currentWeekId ? { currentQuarterId, currentWeekId } : null),
    [currentQuarterId, currentWeekId],
  );
}
