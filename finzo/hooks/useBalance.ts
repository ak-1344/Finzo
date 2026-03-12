import { useBalanceStore } from '../store/balanceStore';
import { formatRupees, paiseToRupees, rupeesToPaise } from '../lib/utils';

/**
 * Hook to access and manage the user's manual balance.
 * All internal values are in paise. Display methods return formatted rupees.
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
    /** Set balance from rupees (user input) */
    setBalanceFromRupees: (rupees: number) => setBalance(rupeesToPaise(rupees)),
    /** Set balance directly in paise */
    setBalancePaise: setBalance,
    /** Add paise to balance */
    addToBalance,
    /** Subtract paise from balance */
    subtractFromBalance,
  };
}
