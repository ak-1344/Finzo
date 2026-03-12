import { useMemo } from 'react';
import { useTransactionStore } from '../store/transactionStore';
import { useBalanceStore } from '../store/balanceStore';
import { Transaction } from '../types';
import { getDateKey, rupeesToPaise } from '../lib/utils';

/**
 * Hook to manage transactions with CRUD operations.
 * Handles balance updates on add/edit/delete.
 */
export function useTransactions() {
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactionStore();
  const { addToBalance, subtractFromBalance } = useBalanceStore();

  /** All non-deleted transactions, sorted newest first */
  const activeTransactions = useMemo(
    () =>
      transactions
        .filter((t) => !t.isDeleted)
        .sort((a, b) => b.timestamp - a.timestamp),
    [transactions]
  );

  /** Today's transactions */
  const todayTransactions = useMemo(() => {
    const todayKey = getDateKey(Date.now());
    return activeTransactions.filter(
      (t) => getDateKey(t.timestamp) === todayKey
    );
  }, [activeTransactions]);

  /** Recent 5 transactions */
  const recentTransactions = useMemo(
    () => activeTransactions.slice(0, 5),
    [activeTransactions]
  );

  /** Group transactions by date key */
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    for (const t of activeTransactions) {
      const key = getDateKey(t.timestamp);
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    }
    // Return sorted date keys (newest first)
    const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    return sortedKeys.map((key) => ({
      dateKey: key,
      transactions: groups[key],
    }));
  }, [activeTransactions]);

  /** Today's total in (paise) */
  const todayIn = useMemo(
    () =>
      todayTransactions
        .filter((t) => t.type === 'in')
        .reduce((sum, t) => sum + t.amount, 0),
    [todayTransactions]
  );

  /** Today's total out (paise) */
  const todayOut = useMemo(
    () =>
      todayTransactions
        .filter((t) => t.type === 'out')
        .reduce((sum, t) => sum + t.amount, 0),
    [todayTransactions]
  );

  /**
   * Add a new transaction and update balance accordingly.
   */
  const addEntry = (
    entry: Omit<Transaction, 'id' | 'isDeleted' | 'confirmed'> & {
      confirmed?: boolean;
    }
  ) => {
    const newTx = addTransaction({
      ...entry,
      confirmed: entry.confirmed ?? true,
    });

    // Update balance
    if (entry.type === 'in') {
      addToBalance(entry.amount);
    } else {
      subtractFromBalance(entry.amount);
    }

    return newTx;
  };

  /**
   * Delete a transaction (soft-delete) and reverse its balance effect.
   */
  const removeEntry = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx || tx.isDeleted) return;

    deleteTransaction(id);

    // Reverse balance effect
    if (tx.type === 'in') {
      subtractFromBalance(tx.amount);
    } else {
      addToBalance(tx.amount);
    }
  };

  /**
   * Update a transaction. If amount or type changed, recalculate balance.
   */
  const editEntry = (id: string, update: Partial<Transaction>) => {
    const oldTx = transactions.find((t) => t.id === id);
    if (!oldTx || oldTx.isDeleted) return;

    // Reverse old balance effect
    if (oldTx.type === 'in') {
      subtractFromBalance(oldTx.amount);
    } else {
      addToBalance(oldTx.amount);
    }

    // Apply update
    const newType = update.type ?? oldTx.type;
    const newAmount = update.amount ?? oldTx.amount;

    updateTransaction(id, update);

    // Apply new balance effect
    if (newType === 'in') {
      addToBalance(newAmount);
    } else {
      subtractFromBalance(newAmount);
    }
  };

  return {
    activeTransactions,
    todayTransactions,
    recentTransactions,
    groupedByDate,
    todayIn,
    todayOut,
    addEntry,
    removeEntry,
    editEntry,
  };
}
