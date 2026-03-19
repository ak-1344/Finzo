// All money amounts are stored in paise (multiply by 100) to prevent float errors.
// Display in rupees by dividing by 100.

export interface Transaction {
  id: string;
  type: 'in' | 'out';
  /** Amount in paise (₹1 = 100 paise) */
  amount: number;
  label: string;
  bucketId: string | null;
  partyId: string | null;
  timestamp: number; // Unix timestamp ms
  paymentMethod: 'cash' | 'upi' | 'manual';
  confirmed: boolean;
  isDeleted: boolean; // soft-delete
}

export interface Bucket {
  id: string;
  name: string;
  icon: string;
  color: string;
  /** Amount allocated in paise */
  allocatedAmount: number;
  /** Amount spent in paise */
  spentAmount: number;
  /** @deprecated Use isUnallocated instead. Kept for backward compatibility migration. */
  isOverflow: boolean;
  /** Whether this is the system Unallocated bucket (cannot be deleted) */
  isUnallocated: boolean;
  isDeleted: boolean; // soft-delete
  createdAt: number;
}

export interface Party {
  id: string;
  name: string;
  type: 'customer' | 'supplier';
  /** Positive = they owe you, Negative = you owe them. In paise. */
  balance: number;
  createdAt: number;
  isDeleted: boolean;
}

export interface PartyTransaction {
  id: string;
  partyId: string;
  type: 'give' | 'get';
  /** Amount in paise */
  amount: number;
  note: string;
  timestamp: number;
  isSettlement: boolean;
  isDeleted: boolean;
  /** ID of the matching cashbook entry (for TM0 account-sheet linking) */
  linkedCashbookTxId?: string;
}

export interface MonthPreset {
  id: string;
  buckets: { bucketId: string; amount: number }[];
  totalAllocated: number;
  autoApply: boolean;
}

export interface Reminder {
  id: string;
  message: string;
  linkedPartyId: string | null;
  triggerAt: number;
  recurring: 'none' | 'weekly' | 'monthly';
  isActive: boolean;
  isDeleted: boolean;
  notificationId?: string; // expo-notifications identifier
  createdAt: number;
}

export interface PendingPayment {
  id: string;
  upiId: string;
  payeeName: string;
  /** Amount in paise */
  amount: number;
  label: string;
  bucketId: string | null;
  partyId: string | null;
  upiApp: string;
  startedAt: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}
