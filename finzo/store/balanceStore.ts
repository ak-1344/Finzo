import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorageAdapter } from '../lib/storage';

interface BalanceStore {
  /** Total balance in paise */
  balance: number;
  /** Whether balance has been set at least once (onboarding) */
  hasSetBalance: boolean;
  setBalance: (paise: number) => void;
  addToBalance: (paise: number) => void;
  subtractFromBalance: (paise: number) => void;
}

export const useBalanceStore = create<BalanceStore>()(
  persist(
    (set) => ({
      balance: 0,
      hasSetBalance: false,

      setBalance: (paise: number) =>
        set({ balance: paise, hasSetBalance: true }),

      addToBalance: (paise: number) =>
        set((state) => ({ balance: state.balance + paise })),

      subtractFromBalance: (paise: number) =>
        set((state) => ({ balance: state.balance - paise })),
    }),
    {
      name: 'finzo-balance',
      storage: createJSONStorage(() => asyncStorageAdapter),
    }
  )
);
