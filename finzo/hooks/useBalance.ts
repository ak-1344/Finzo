import { useBalanceStore } from '../store/balanceStore';
import { formatRupees, paiseToRupees, rupeesToPaise } from '../lib/utils';

/**
 * Hook to access the user's balance.
 * TM0: Balance is read-only from user-facing code.
 * It can only change via Cashbook entries or Payment confirmations.
 * addToBalance/subtractFromBalance are still exposed for internal use by hooks.
 */
export function useBalance() {
  const { balance, hasSetBalance, setBalance, addToBalance, subtractFromBalance } =
    useBalanceStore();

  return {
    /** Balance in paise */
    balancePaise: balance,
    /** Balance in rupees (for display in inputs) */
    balanceRupees: paiseToRupees(balance),
    /** Formatted balance string e.g. "₹1,500" */
    balanceFormatted: formatRupees(balance),
    /** Whether user has set balance at least once */
    hasSetBalance,
    /** Set balance from rupees (user input) — used for initial onboarding only */
    setBalanceFromRupees: (rupees: number) => setBalance(rupeesToPaise(rupees)),
    /** Set balance directly in paise — used for initial onboarding only */
    setBalancePaise: setBalance,
    /** Add paise to balance (internal use by useTransactions) */
    addToBalance,
    /** Subtract paise from balance (internal use by useTransactions) */
    subtractFromBalance,
  };
}
