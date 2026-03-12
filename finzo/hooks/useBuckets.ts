import { useMemo, useEffect } from 'react';
import {
  useBucketStore,
  OVERFLOW_BUCKET_ID,
} from '../store/bucketStore';
import { useBalanceStore } from '../store/balanceStore';
import { Bucket } from '../types';
import { formatRupees, paiseToRupees } from '../lib/utils';

/**
 * Hook for bucket (envelope budgeting) operations with derived data.
 */
export function useBuckets() {
  const {
    buckets,
    monthPreset,
    lastResetMonth,
    addBucket,
    updateBucket,
    deleteBucket,
    spendFromBucket,
    refundToBucket,
    reallocate,
    ensureOverflowBucket,
    savePreset,
    applyPreset,
    toggleAutoApply,
    resetMonth,
    getBucketById,
  } = useBucketStore();

  const { balance: totalBalance } = useBalanceStore();

  // Ensure overflow bucket always exists
  useEffect(() => {
    ensureOverflowBucket();
  }, []);

  /** All active (non-deleted) buckets */
  const activeBuckets = useMemo(
    () => buckets.filter((b) => !b.isDeleted),
    [buckets]
  );

  /** User-created buckets only (no overflow) */
  const userBuckets = useMemo(
    () => activeBuckets.filter((b) => !b.isOverflow),
    [activeBuckets]
  );

  /** Overflow bucket */
  const overflowBucket = useMemo(
    () => activeBuckets.find((b) => b.isOverflow),
    [activeBuckets]
  );

  /** Total amount allocated across all user buckets (paise) */
  const totalAllocated = useMemo(
    () => userBuckets.reduce((sum, b) => sum + b.allocatedAmount, 0),
    [userBuckets]
  );

  /** Total spent across all user buckets (paise) */
  const totalSpent = useMemo(
    () => userBuckets.reduce((sum, b) => sum + b.spentAmount, 0),
    [userBuckets]
  );

  /** Unallocated amount = total balance - total allocated (paise) */
  const unallocated = useMemo(
    () => Math.max(0, totalBalance - totalAllocated - (overflowBucket?.allocatedAmount ?? 0)),
    [totalBalance, totalAllocated, overflowBucket]
  );

  /** Get remaining budget for a bucket (paise) */
  const getRemaining = (bucket: Bucket): number =>
    Math.max(0, bucket.allocatedAmount - bucket.spentAmount);

  /** Get usage percentage (0-100) */
  const getUsagePercent = (bucket: Bucket): number => {
    if (bucket.allocatedAmount === 0) return 0;
    return Math.min(100, Math.round((bucket.spentAmount / bucket.allocatedAmount) * 100));
  };

  /** Get health status color based on usage */
  const getHealthColor = (bucket: Bucket): string => {
    const percent = getUsagePercent(bucket);
    if (percent < 50) return '#16A34A'; // green
    if (percent < 80) return '#D97706'; // yellow/amber
    return '#DC2626'; // red
  };

  /** Get health status label */
  const getHealthLabel = (bucket: Bucket): 'healthy' | 'warning' | 'critical' => {
    const percent = getUsagePercent(bucket);
    if (percent < 50) return 'healthy';
    if (percent < 80) return 'warning';
    return 'critical';
  };

  /** Low-bucket buckets (> 80% used) */
  const lowBuckets = useMemo(
    () => userBuckets.filter((b) => getUsagePercent(b) >= 80 && b.allocatedAmount > 0),
    [userBuckets]
  );

  /** Check if allocation exceeds balance */
  const canAllocate = (additionalAmount: number): boolean => {
    return totalAllocated + additionalAmount + (overflowBucket?.allocatedAmount ?? 0) <= totalBalance;
  };

  /** Max allocatable for a new/edited bucket */
  const maxAllocatable = useMemo(
    () => Math.max(0, totalBalance - totalAllocated - (overflowBucket?.allocatedAmount ?? 0)),
    [totalBalance, totalAllocated, overflowBucket]
  );

  /** Formatted values */
  const totalAllocatedFormatted = formatRupees(totalAllocated);
  const totalSpentFormatted = formatRupees(totalSpent);
  const unallocatedFormatted = formatRupees(unallocated);

  return {
    // Data
    activeBuckets,
    userBuckets,
    overflowBucket,
    totalAllocated,
    totalSpent,
    unallocated,
    maxAllocatable,
    lowBuckets,
    monthPreset,
    lastResetMonth,
    totalBalance,

    // Formatted
    totalAllocatedFormatted,
    totalSpentFormatted,
    unallocatedFormatted,

    // Helpers
    getRemaining,
    getUsagePercent,
    getHealthColor,
    getHealthLabel,
    canAllocate,
    getBucketById,

    // Actions
    addBucket,
    updateBucket,
    deleteBucket,
    spendFromBucket,
    refundToBucket,
    reallocate,
    savePreset,
    applyPreset,
    toggleAutoApply,
    resetMonth,
  };
}
