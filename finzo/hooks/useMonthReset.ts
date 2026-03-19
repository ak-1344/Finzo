import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useBucketStore } from '../store/bucketStore';

/**
 * Hook to auto-reset buckets on month change.
 * Checks on mount and whenever app comes to foreground.
 */
export function useMonthReset() {
  const { lastResetMonth, monthPreset, resetMonth } = useBucketStore();
  const hasChecked = useRef(false);

  const checkAndReset = () => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    if (lastResetMonth !== currentMonth && monthPreset?.autoApply) {
      resetMonth();
    }
  };

  // Check on mount
  useEffect(() => {
    if (!hasChecked.current) {
      checkAndReset();
      hasChecked.current = true;
    }
  }, []);

  // Check on app foreground
  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        checkAndReset();
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [lastResetMonth, monthPreset]);
}
