import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PendingPayment } from '../types';
import { asyncStorageAdapter } from '../lib/storage';
import { generateId } from '../lib/utils';

interface PaymentStore {
  pendingPayment: PendingPayment | null;

  startPayment: (data: Omit<PendingPayment, 'id' | 'startedAt' | 'status'>) => PendingPayment;
  confirmPayment: () => PendingPayment | null;
  cancelPayment: () => void;
  clearPending: () => void;
  getPendingPayment: () => PendingPayment | null;
}

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set, get) => ({
      pendingPayment: null,

      startPayment: (data) => {
        const payment: PendingPayment = {
          ...data,
          id: generateId(),
          startedAt: Date.now(),
          status: 'pending',
        };
        set({ pendingPayment: payment });
        return payment;
      },

      confirmPayment: () => {
        const { pendingPayment } = get();
        if (!pendingPayment) return null;
        const confirmed = { ...pendingPayment, status: 'confirmed' as const };
        set({ pendingPayment: null });
        return confirmed;
      },

      cancelPayment: () => {
        set({ pendingPayment: null });
      },

      clearPending: () => {
        set({ pendingPayment: null });
      },

      getPendingPayment: () => get().pendingPayment,
    }),
    {
      name: 'finzo-payments',
      storage: createJSONStorage(() => asyncStorageAdapter),
    }
  )
);
