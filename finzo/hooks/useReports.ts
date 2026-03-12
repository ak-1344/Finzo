import { useMemo } from 'react';
import { useTransactionStore } from '../store/transactionStore';
import { useBucketStore } from '../store/bucketStore';
import { Transaction } from '../types';
import { getDateKey, formatRupees } from '../lib/utils';

export interface DateRange {
  start: number; // timestamp
  end: number;   // timestamp
}

export interface BucketSpend {
  bucketId: string;
  bucketName: string;
  bucketIcon: string;
  bucketColor: string;
  totalSpent: number; // paise
  percentage: number;
}

export interface DailyTrend {
  dateKey: string; // YYYY-MM-DD
  totalIn: number;
  totalOut: number;
}

export interface TopLabel {
  label: string;
  count: number;
  totalAmount: number; // paise
}

export interface ReportData {
  totalIn: number;
  totalOut: number;
  netFlow: number;
  transactionCount: number;
  bucketSpending: BucketSpend[];
  dailyTrend: DailyTrend[];
  topLabels: TopLabel[];
}

/**
 * Get preset date ranges.
 */
export function getPresetRanges() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = todayStart + 86400000 - 1;

  // This week (Monday start)
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset).getTime();

  // This month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  // Last 30 days
  const last30 = todayStart - 29 * 86400000;

  // Last 90 days
  const last90 = todayStart - 89 * 86400000;

  return [
    { label: 'Today', start: todayStart, end: todayEnd },
    { label: 'This Week', start: weekStart, end: todayEnd },
    { label: 'This Month', start: monthStart, end: todayEnd },
    { label: 'Last 30 Days', start: last30, end: todayEnd },
    { label: 'Last 90 Days', start: last90, end: todayEnd },
  ];
}

/**
 * Hook for generating report data from transactions.
 */
export function useReports(range: DateRange) {
  const transactions = useTransactionStore((s) => s.transactions);
  const buckets = useBucketStore((s) => s.buckets);

  const reportData = useMemo((): ReportData => {
    // Filter active transactions within date range
    const filtered = transactions.filter(
      (t) =>
        !t.isDeleted &&
        t.timestamp >= range.start &&
        t.timestamp <= range.end
    );

    // Totals
    const totalIn = filtered
      .filter((t) => t.type === 'in')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalOut = filtered
      .filter((t) => t.type === 'out')
      .reduce((sum, t) => sum + t.amount, 0);

    // Bucket-wise spending
    const bucketMap: Record<string, number> = {};
    let uncategorized = 0;

    for (const t of filtered.filter((t) => t.type === 'out')) {
      if (t.bucketId) {
        bucketMap[t.bucketId] = (bucketMap[t.bucketId] || 0) + t.amount;
      } else {
        uncategorized += t.amount;
      }
    }

    const bucketSpending: BucketSpend[] = [];
    for (const [bucketId, amount] of Object.entries(bucketMap)) {
      const bucket = buckets.find((b) => b.id === bucketId);
      bucketSpending.push({
        bucketId,
        bucketName: bucket?.name ?? 'Unknown',
        bucketIcon: bucket?.icon ?? '❓',
        bucketColor: bucket?.color ?? '#6B7280',
        totalSpent: amount,
        percentage: totalOut > 0 ? (amount / totalOut) * 100 : 0,
      });
    }

    if (uncategorized > 0) {
      bucketSpending.push({
        bucketId: 'uncategorized',
        bucketName: 'Uncategorized',
        bucketIcon: '🏷️',
        bucketColor: '#9CA3AF',
        totalSpent: uncategorized,
        percentage: totalOut > 0 ? (uncategorized / totalOut) * 100 : 0,
      });
    }

    // Sort by total spent descending
    bucketSpending.sort((a, b) => b.totalSpent - a.totalSpent);

    // Daily trend
    const dailyMap: Record<string, { totalIn: number; totalOut: number }> = {};

    // Initialize all days in range
    let cursor = new Date(range.start);
    const endDate = new Date(range.end);
    while (cursor <= endDate) {
      const key = getDateKey(cursor.getTime());
      dailyMap[key] = { totalIn: 0, totalOut: 0 };
      cursor.setDate(cursor.getDate() + 1);
    }

    for (const t of filtered) {
      const key = getDateKey(t.timestamp);
      if (!dailyMap[key]) dailyMap[key] = { totalIn: 0, totalOut: 0 };
      if (t.type === 'in') {
        dailyMap[key].totalIn += t.amount;
      } else {
        dailyMap[key].totalOut += t.amount;
      }
    }

    const dailyTrend: DailyTrend[] = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, data]) => ({
        dateKey,
        ...data,
      }));

    // Top 5 expense labels
    const labelMap: Record<string, { count: number; total: number }> = {};
    for (const t of filtered.filter((t) => t.type === 'out')) {
      const key = t.label.toLowerCase().trim();
      if (!key) continue;
      if (!labelMap[key]) labelMap[key] = { count: 0, total: 0 };
      labelMap[key].count++;
      labelMap[key].total += t.amount;
    }

    const topLabels: TopLabel[] = Object.entries(labelMap)
      .map(([label, data]) => ({
        label,
        count: data.count,
        totalAmount: data.total,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);

    return {
      totalIn,
      totalOut,
      netFlow: totalIn - totalOut,
      transactionCount: filtered.length,
      bucketSpending,
      dailyTrend,
      topLabels,
    };
  }, [transactions, buckets, range.start, range.end]);

  /**
   * Generate HTML for PDF export.
   */
  const generateReportHTML = (): string => {
    const { totalIn, totalOut, netFlow, transactionCount, bucketSpending, topLabels } = reportData;
    const startDate = new Date(range.start).toLocaleDateString('en-IN');
    const endDate = new Date(range.end).toLocaleDateString('en-IN');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, sans-serif; padding: 24px; color: #111827; }
    h1 { color: #1A56DB; font-size: 24px; margin-bottom: 4px; }
    .subtitle { color: #6B7280; font-size: 14px; margin-bottom: 24px; }
    .summary { display: flex; gap: 16px; margin-bottom: 24px; }
    .card { flex: 1; background: #F9FAFB; border-radius: 12px; padding: 16px; }
    .card-label { color: #6B7280; font-size: 12px; text-transform: uppercase; }
    .card-value { font-size: 20px; font-weight: bold; margin-top: 4px; }
    .green { color: #16A34A; }
    .red { color: #DC2626; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { text-align: left; color: #6B7280; font-size: 12px; padding: 8px; border-bottom: 2px solid #E5E7EB; }
    td { padding: 8px; border-bottom: 1px solid #F3F4F6; font-size: 14px; }
    .section-title { font-size: 16px; font-weight: 600; margin-top: 24px; margin-bottom: 8px; }
  </style>
</head>
<body>
  <h1>FINZO Report</h1>
  <div class="subtitle">${startDate} — ${endDate} · ${transactionCount} transactions</div>

  <div class="summary">
    <div class="card">
      <div class="card-label">Total Income</div>
      <div class="card-value green">${formatRupees(totalIn)}</div>
    </div>
    <div class="card">
      <div class="card-label">Total Expense</div>
      <div class="card-value red">${formatRupees(totalOut)}</div>
    </div>
    <div class="card">
      <div class="card-label">Net Flow</div>
      <div class="card-value" style="color:${netFlow >= 0 ? '#16A34A' : '#DC2626'}">${formatRupees(Math.abs(netFlow))}</div>
    </div>
  </div>

  ${bucketSpending.length > 0 ? `
  <div class="section-title">Bucket-wise Spending</div>
  <table>
    <tr><th>Bucket</th><th>Amount</th><th>%</th></tr>
    ${bucketSpending.map((b) => `
    <tr>
      <td>${b.bucketIcon} ${b.bucketName}</td>
      <td>${formatRupees(b.totalSpent)}</td>
      <td>${b.percentage.toFixed(1)}%</td>
    </tr>`).join('')}
  </table>` : ''}

  ${topLabels.length > 0 ? `
  <div class="section-title">Top Expense Labels</div>
  <table>
    <tr><th>Label</th><th>Count</th><th>Total</th></tr>
    ${topLabels.map((l) => `
    <tr>
      <td>${l.label}</td>
      <td>${l.count}x</td>
      <td>${formatRupees(l.totalAmount)}</td>
    </tr>`).join('')}
  </table>` : ''}

  <div style="margin-top:32px;color:#9CA3AF;font-size:12px;text-align:center;">
    Generated by FINZO · ${new Date().toLocaleDateString('en-IN')}
  </div>
</body>
</html>`;
  };

  return {
    ...reportData,
    generateReportHTML,
  };
}
