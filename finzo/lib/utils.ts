/**
 * Format paise amount (integer) to display rupees string.
 * e.g. 150000 → "₹1,500.00" or 150000 → "₹1,500"
 */
export function formatRupees(paise: number, showDecimal = false): string {
  const rupees = paise / 100;
  if (showDecimal) {
    return `₹${rupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  // If there are paise, show them
  if (paise % 100 !== 0) {
    return `₹${rupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `₹${rupees.toLocaleString('en-IN')}`;
}

/**
 * Convert rupees (user input as number) to paise.
 * e.g., 1500.50 → 150050
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Convert paise to rupees (for input fields).
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/**
 * Generate a unique ID.
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Format a timestamp to a readable date string.
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a timestamp to time string.
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Get a greeting based on time of day.
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/**
 * Format today's date for display.
 */
export function getTodayString(): string {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Check if two timestamps are on the same day.
 */
export function isSameDay(ts1: number, ts2: number): boolean {
  const d1 = new Date(ts1);
  const d2 = new Date(ts2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Get date key for grouping (YYYY-MM-DD).
 */
export function getDateKey(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Format a date key (YYYY-MM-DD) to a readable label.
 */
export function formatDateKey(dateKey: string): string {
  const today = getDateKey(Date.now());
  const yesterday = getDateKey(Date.now() - 86400000);

  if (dateKey === today) return 'Today';
  if (dateKey === yesterday) return 'Yesterday';

  const date = new Date(dateKey + 'T00:00:00');
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
