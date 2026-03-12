import { useEffect } from 'react';
import { useBucketStore } from '../store/bucketStore';
import { AppState, AppStateStatus } from 'react-native';

/**
 * Hook that checks on app foreground if month has changed,
 * and triggers a bucket reset if needed.
 *
 * Call this once in the root layout or home screen.
 */
export function useMonthReset() {
  const { lastResetMonth, monthPreset, resetMonth } = useBucketStore();

  useEffect(() => {
    const checkAndReset = () => {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      // If we've never reset, or it's a new month, trigger reset
      if (lastResetMonth && lastResetMonth !== currentMonth) {
        // Only auto-reset if preset exists with autoApply
        if (monthPreset?.autoApply) {
          resetMonth();
        }
      }
    };

    // Check on mount
    checkAndReset();

    // Check when app comes to foreground
    const subscription = AppState.addEventListener(
      'change',
      (state: AppStateStatus) => {
        if (state === 'active') {
          checkAndReset();
        }
      }
    );

    return () => subscription.remove();
  }, [lastResetMonth, monthPreset, resetMonth]);
}
