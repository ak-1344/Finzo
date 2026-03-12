import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Transaction } from '../types';
import { asyncStorageAdapter } from '../lib/storage';
import { generateId } from '../lib/utils';

interface TransactionStore {
  transactions: Transaction[];

  addTransaction: (t: Omit<Transaction, 'id' | 'isDeleted'>) => Transaction;
  updateTransaction: (id: string, update: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void; // soft-delete
  getActiveTransactions: () => Transaction[];
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: (t) => {
        const newTransaction: Transaction = {
          ...t,
          id: generateId(),
          isDeleted: false,
        };
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));
        return newTransaction;
      },

      updateTransaction: (id, update) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...update } : t
          ),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, isDeleted: true } : t
          ),
        })),

      getActiveTransactions: () =>
        get().transactions.filter((t) => !t.isDeleted),
    }),
    {
      name: 'finzo-transactions',
      storage: createJSONStorage(() => asyncStorageAdapter),
    }
  )
);
