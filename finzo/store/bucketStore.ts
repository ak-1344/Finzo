import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Bucket, MonthPreset } from '../types';
import { asyncStorageAdapter } from '../lib/storage';
import { generateId } from '../lib/utils';

/** Hardcoded unallocated bucket ID */
export const UNALLOCATED_BUCKET_ID = 'unallocated';

/** @deprecated Use UNALLOCATED_BUCKET_ID. Kept for migration from older data. */
export const OVERFLOW_BUCKET_ID = 'overflow';

/** Preset color palette for new buckets */
export const BUCKET_COLORS = [
  '#1A56DB', // primary blue
  '#16A34A', // green
  '#DC2626', // red
  '#D97706', // amber
  '#7C3AED', // violet
  '#0891B2', // cyan
  '#DB2777', // pink
  '#059669', // emerald
] as const;

/** Preset icons — category initials for clean UI */
export const BUCKET_ICONS = [
  'F', 'T', 'S', 'B', 'H', 'E', 'M', 'G',
  'R', 'U', 'I', 'P', 'W', 'L', 'D', 'C',
] as const;

interface BucketStore {
  buckets: Bucket[];
  monthPreset: MonthPreset | null;
  lastResetMonth: string | null; // 'YYYY-MM' of last month reset

  // Bucket CRUD
  addBucket: (data: Pick<Bucket, 'name' | 'icon' | 'color' | 'allocatedAmount'>) => Bucket;
  updateBucket: (id: string, update: Partial<Bucket>) => void;
  deleteBucket: (id: string) => void; // soft-delete, move allocation to unallocated
  spendFromBucket: (bucketId: string, amount: number) => void;
  refundToBucket: (bucketId: string, amount: number) => void;

  // Manual add/remove money
  addMoneyToBucket: (bucketId: string, amount: number) => void;
  removeMoneyFromBucket: (bucketId: string, amount: number) => void;

  // Unallocated bucket
  ensureUnallocatedBucket: () => void;

  // Allocation
  reallocate: (bucketId: string, newAmount: number) => void;

  // Month preset
  savePreset: (autoApply: boolean) => void;
  applyPreset: () => void;
  toggleAutoApply: (value: boolean) => void;

  // Month reset
  resetMonth: () => void;

  // Derived
  getActiveBuckets: () => Bucket[];
  getUnallocatedBucket: () => Bucket | undefined;
  getBucketById: (id: string) => Bucket | undefined;
  getTotalAllocated: () => number;
}

export const useBucketStore = create<BucketStore>()(
  persist(
    (set, get) => ({
      buckets: [],
      monthPreset: null,
      lastResetMonth: null,

      ensureUnallocatedBucket: () => {
        const { buckets } = get();

        // Migration: rename old 'overflow' bucket to 'unallocated'
        const oldOverflow = buckets.find((b) => b.id === OVERFLOW_BUCKET_ID);
        if (oldOverflow) {
          set({
            buckets: buckets.map((b) =>
              b.id === OVERFLOW_BUCKET_ID
                ? {
                    ...b,
                    id: UNALLOCATED_BUCKET_ID,
                    name: 'Unallocated',
                    icon: '—',
                    isOverflow: false,
                    isUnallocated: true,
                  }
                : b
            ),
          });
          return;
        }

        const exists = buckets.find((b) => b.id === UNALLOCATED_BUCKET_ID);
        if (!exists) {
          set({
            buckets: [
              ...buckets,
              {
                id: UNALLOCATED_BUCKET_ID,
                name: 'Unallocated',
                icon: '—',
                color: '#6B7280',
                allocatedAmount: 0,
                spentAmount: 0,
                isOverflow: false,
                isUnallocated: true,
                isDeleted: false,
                createdAt: Date.now(),
              },
            ],
          });
        }
      },

      addBucket: (data) => {
        // Ensure unallocated exists before adding
        get().ensureUnallocatedBucket();

        const newBucket: Bucket = {
          id: generateId(),
          name: data.name,
          icon: data.icon,
          color: data.color,
          allocatedAmount: data.allocatedAmount,
          spentAmount: 0,
          isOverflow: false,
          isUnallocated: false,
          isDeleted: false,
          createdAt: Date.now(),
        };

        set({ buckets: [...get().buckets, newBucket] });
        return newBucket;
      },

      updateBucket: (id, update) => {
        set({
          buckets: get().buckets.map((b) =>
            b.id === id ? { ...b, ...update } : b
          ),
        });
      },

      deleteBucket: (id) => {
        if (id === UNALLOCATED_BUCKET_ID) return; // Cannot delete unallocated

        const { buckets } = get();
        const bucket = buckets.find((b) => b.id === id);
        if (!bucket) return;

        // Move remaining allocation to unallocated
        const remaining = bucket.allocatedAmount - bucket.spentAmount;

        set({
          buckets: buckets.map((b) => {
            if (b.id === id) return { ...b, isDeleted: true };
            if (b.id === UNALLOCATED_BUCKET_ID && remaining > 0) {
              return { ...b, allocatedAmount: b.allocatedAmount + remaining };
            }
            return b;
          }),
        });
      },

      spendFromBucket: (bucketId, amount) => {
        set({
          buckets: get().buckets.map((b) =>
            b.id === bucketId
              ? { ...b, spentAmount: b.spentAmount + amount }
              : b
          ),
        });
      },

      refundToBucket: (bucketId, amount) => {
        set({
          buckets: get().buckets.map((b) =>
            b.id === bucketId
              ? { ...b, spentAmount: Math.max(0, b.spentAmount - amount) }
              : b
          ),
        });
      },

      addMoneyToBucket: (bucketId, amount) => {
        if (bucketId === UNALLOCATED_BUCKET_ID) return; // Unallocated auto-adjusts
        set({
          buckets: get().buckets.map((b) =>
            b.id === bucketId
              ? { ...b, allocatedAmount: b.allocatedAmount + amount }
              : b
          ),
        });
      },

      removeMoneyFromBucket: (bucketId, amount) => {
        if (bucketId === UNALLOCATED_BUCKET_ID) return; // Unallocated auto-adjusts
        set({
          buckets: get().buckets.map((b) =>
            b.id === bucketId
              ? { ...b, allocatedAmount: Math.max(0, b.allocatedAmount - amount) }
              : b
          ),
        });
      },

      reallocate: (bucketId, newAmount) => {
        if (bucketId === UNALLOCATED_BUCKET_ID) return; // Unallocated auto-calculated

        set({
          buckets: get().buckets.map((b) =>
            b.id === bucketId ? { ...b, allocatedAmount: newAmount } : b
          ),
        });
      },

      savePreset: (autoApply) => {
        const activeBuckets = get().getActiveBuckets().filter((b) => !b.isUnallocated);
        const preset: MonthPreset = {
          id: 'default',
          buckets: activeBuckets.map((b) => ({
            bucketId: b.id,
            amount: b.allocatedAmount,
          })),
          totalAllocated: activeBuckets.reduce(
            (sum, b) => sum + b.allocatedAmount,
            0
          ),
          autoApply,
        };
        set({ monthPreset: preset });
      },

      applyPreset: () => {
        const { monthPreset, buckets } = get();
        if (!monthPreset) return;

        set({
          buckets: buckets.map((b) => {
            if (b.isUnallocated || b.isDeleted) return b;
            const presetEntry = monthPreset.buckets.find(
              (p) => p.bucketId === b.id
            );
            if (presetEntry) {
              return {
                ...b,
                allocatedAmount: presetEntry.amount,
                spentAmount: 0,
              };
            }
            return b;
          }),
        });
      },

      toggleAutoApply: (value) => {
        const { monthPreset } = get();
        if (monthPreset) {
          set({ monthPreset: { ...monthPreset, autoApply: value } });
        }
      },

      resetMonth: () => {
        const { buckets } = get();

        // Calculate total leftover across all non-unallocated buckets
        let totalLeftover = 0;
        const resetBuckets = buckets.map((b) => {
          if (b.isDeleted) return b;
          if (b.isUnallocated) return b; // Handle unallocated separately

          const remaining = Math.max(0, b.allocatedAmount - b.spentAmount);
          totalLeftover += remaining;

          // Reset spent to 0 for the new month
          return { ...b, spentAmount: 0 };
        });

        // Add leftover to unallocated bucket
        const finalBuckets = resetBuckets.map((b) => {
          if (b.id === UNALLOCATED_BUCKET_ID) {
            const unallocatedLeftover = Math.max(
              0,
              b.allocatedAmount - b.spentAmount
            );
            return {
              ...b,
              allocatedAmount: unallocatedLeftover + totalLeftover,
              spentAmount: 0,
            };
          }
          return b;
        });

        const now = new Date();
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        set({
          buckets: finalBuckets,
          lastResetMonth: monthKey,
        });

        // If preset has auto-apply, reapply allocations
        const { monthPreset } = get();
        if (monthPreset?.autoApply) {
          get().applyPreset();
        }
      },

      getActiveBuckets: () => {
        return get().buckets.filter((b) => !b.isDeleted);
      },

      getUnallocatedBucket: () => {
        return get().buckets.find((b) => b.id === UNALLOCATED_BUCKET_ID);
      },

      getBucketById: (id) => {
        return get().buckets.find((b) => b.id === id && !b.isDeleted);
      },

      getTotalAllocated: () => {
        return get()
          .getActiveBuckets()
          .reduce((sum, b) => sum + b.allocatedAmount, 0);
      },
    }),
    {
      name: 'finzo-bucket-store',
      storage: createJSONStorage(() => asyncStorageAdapter),
    }
  )
);
