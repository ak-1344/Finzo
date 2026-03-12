import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Rect, Text as SvgText, G } from 'react-native-svg';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useReports, getPresetRanges, BucketSpend, DailyTrend } from '../hooks/useReports';
import { formatRupees } from '../lib/utils';

const screenWidth = Dimensions.get('window').width;

export default function ReportsScreen() {
  const router = useRouter();
  const presets = getPresetRanges();
  const [selectedPreset, setSelectedPreset] = useState(2); // "This Month" default

  const range = presets[selectedPreset];
  const {
    totalIn,
    totalOut,
    netFlow,
    transactionCount,
    bucketSpending,
    dailyTrend,
    topLabels,
    generateReportHTML,
  } = useReports(range);

  const handleExportPDF = async () => {
    try {
      const html = generateReportHTML();
      const { uri } = await Print.printToFileAsync({ html });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'FINZO Report',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Exported', `PDF saved to: ${uri}`);
      }
    } catch (error) {
      Alert.alert('Export Failed', 'Could not generate PDF. Please try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary text-base font-medium">← Back</Text>
        </TouchableOpacity>
        <Text className="text-text-primary text-lg font-bold">Reports</Text>
        <TouchableOpacity onPress={handleExportPDF}>
          <Text className="text-primary text-sm font-medium">📄 PDF</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Date Range Picker */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-4 pb-4"
        >
          {presets.map((preset, idx) => (
            <TouchableOpacity
              key={preset.label}
              onPress={() => setSelectedPreset(idx)}
              className={`px-4 py-2 rounded-full mr-2 border ${
                selectedPreset === idx
                  ? 'bg-primary border-primary'
                  : 'bg-card border-gray-200'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedPreset === idx ? 'text-white' : 'text-text-secondary'
                }`}
              >
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Summary Cards */}
        <View className="px-4 mb-4">
          <View className="flex-row gap-3">
            <View className="flex-1 bg-card rounded-xl p-4 border border-gray-100">
              <Text className="text-text-muted text-xs uppercase">Income</Text>
              <Text className="text-success text-lg font-bold mt-1">
                +{formatRupees(totalIn)}
              </Text>
            </View>
            <View className="flex-1 bg-card rounded-xl p-4 border border-gray-100">
              <Text className="text-text-muted text-xs uppercase">Expense</Text>
              <Text className="text-danger text-lg font-bold mt-1">
                -{formatRupees(totalOut)}
              </Text>
            </View>
          </View>
          <View className="flex-row gap-3 mt-3">
            <View className="flex-1 bg-card rounded-xl p-4 border border-gray-100">
              <Text className="text-text-muted text-xs uppercase">Net Flow</Text>
              <Text
                className={`text-lg font-bold mt-1 ${
                  netFlow >= 0 ? 'text-success' : 'text-danger'
                }`}
              >
                {netFlow >= 0 ? '+' : '-'}{formatRupees(Math.abs(netFlow))}
              </Text>
            </View>
            <View className="flex-1 bg-card rounded-xl p-4 border border-gray-100">
              <Text className="text-text-muted text-xs uppercase">Transactions</Text>
              <Text className="text-text-primary text-lg font-bold mt-1">
                {transactionCount}
              </Text>
            </View>
          </View>
        </View>

        {/* Pie Chart — Bucket-wise Spending */}
        {bucketSpending.length > 0 && (
          <View className="px-4 mb-4">
            <Text className="text-text-primary text-base font-semibold mb-3">
              Spending by Bucket
            </Text>
            <View className="bg-card rounded-xl p-4 border border-gray-100">
              <PieChart data={bucketSpending} />
              {/* Legend */}
              <View className="mt-4">
                {bucketSpending.map((b) => (
                  <View key={b.bucketId} className="flex-row items-center mb-2">
                    <View
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: b.bucketColor }}
                    />
                    <Text className="text-text-primary text-sm flex-1">
                      {b.bucketIcon} {b.bucketName}
                    </Text>
                    <Text className="text-text-secondary text-sm mr-2">
                      {b.percentage.toFixed(1)}%
                    </Text>
                    <Text className="text-text-primary text-sm font-medium">
                      {formatRupees(b.totalSpent)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Bar Chart — Daily Trend */}
        {dailyTrend.length > 0 && (
          <View className="px-4 mb-4">
            <Text className="text-text-primary text-base font-semibold mb-3">
              Daily Spending Trend
            </Text>
            <View className="bg-card rounded-xl p-4 border border-gray-100">
              <BarChart data={dailyTrend} />
            </View>
          </View>
        )}

        {/* Top 5 Expense Labels */}
        {topLabels.length > 0 && (
          <View className="px-4 mb-4">
            <Text className="text-text-primary text-base font-semibold mb-3">
              Top Expense Labels
            </Text>
            <View className="bg-card rounded-xl border border-gray-100 overflow-hidden">
              {topLabels.map((item, idx) => (
                <View
                  key={item.label}
                  className={`flex-row items-center justify-between p-4 ${
                    idx < topLabels.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <View className="flex-row items-center flex-1">
                    <Text className="text-text-muted text-sm w-6">{idx + 1}.</Text>
                    <Text className="text-text-primary text-sm font-medium capitalize">
                      {item.label}
                    </Text>
                    <Text className="text-text-muted text-xs ml-2">
                      ({item.count}x)
                    </Text>
                  </View>
                  <Text className="text-danger text-sm font-bold">
                    {formatRupees(item.totalAmount)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Empty state */}
        {transactionCount === 0 && (
          <View className="items-center justify-center pt-12 px-8">
            <Text className="text-4xl mb-3">📊</Text>
            <Text className="text-text-secondary text-sm text-center">
              No transactions in this period.{'\n'}Try a different date range.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Simple SVG Pie Chart component.
 */
function PieChart({ data }: { data: BucketSpend[] }) {
  const size = 180;
  const radius = 70;
  const cx = size / 2;
  const cy = size / 2;

  if (data.length === 0) return null;

  let startAngle = 0;
  const slices = data.map((item) => {
    const angle = (item.percentage / 100) * 360;
    const slice = { ...item, startAngle, angle };
    startAngle += angle;
    return slice;
  });

  return (
    <View className="items-center">
      <Svg width={size} height={size}>
        {slices.map((slice, i) => {
          if (slice.angle <= 0) return null;

          // For very small slices or single item
          if (slice.angle >= 359.99) {
            return (
              <Circle
                key={i}
                cx={cx}
                cy={cy}
                r={radius}
                fill={slice.bucketColor}
              />
            );
          }

          const startRad = ((slice.startAngle - 90) * Math.PI) / 180;
          const endRad = ((slice.startAngle + slice.angle - 90) * Math.PI) / 180;

          const x1 = cx + radius * Math.cos(startRad);
          const y1 = cy + radius * Math.sin(startRad);
          const x2 = cx + radius * Math.cos(endRad);
          const y2 = cy + radius * Math.sin(endRad);

          const largeArcFlag = slice.angle > 180 ? 1 : 0;

          const d = [
            `M ${cx} ${cy}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z',
          ].join(' ');

          return (
            <G key={i}>
              <Circle cx={0} cy={0} r={0} fill="none" />
              <Svg>
                <Circle
                  cx={cx}
                  cy={cy}
                  r={0}
                  fill="none"
                />
              </Svg>
              {/* Use path via d attribute on a custom element - simpler approach with arcs */}
            </G>
          );
        })}
        {/* Simpler approach: use stroke-dasharray circles */}
        {(() => {
          const circumference = 2 * Math.PI * radius;
          let offset = 0;
          return slices.map((slice, i) => {
            const dashLength = (slice.percentage / 100) * circumference;
            const el = (
              <Circle
                key={`ring-${i}`}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={slice.bucketColor}
                strokeWidth={radius}
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            );
            offset += dashLength;
            return el;
          });
        })()}
        {/* Center hole for donut effect */}
        <Circle cx={cx} cy={cy} r={35} fill="white" />
        <SvgText
          x={cx}
          y={cy + 5}
          textAnchor="middle"
          fontSize="12"
          fill="#6B7280"
        >
          Total
        </SvgText>
      </Svg>
    </View>
  );
}

/**
 * Simple SVG Bar Chart component.
 */
function BarChart({ data }: { data: DailyTrend[] }) {
  const chartWidth = screenWidth - 64; // accounting for padding
  const chartHeight = 160;
  const barPadding = 2;

  if (data.length === 0) return null;

  const maxAmount = Math.max(
    ...data.map((d) => Math.max(d.totalOut, d.totalIn)),
    1
  );

  // Show at most 30 bars to keep it readable
  const displayData = data.length > 30 ? data.slice(-30) : data;
  const barWidth = Math.max(
    (chartWidth - barPadding * displayData.length) / displayData.length,
    4
  );

  return (
    <View>
      <Svg width={chartWidth} height={chartHeight + 20}>
        {displayData.map((day, i) => {
          const x = i * (barWidth + barPadding);
          const outHeight = maxAmount > 0 ? (day.totalOut / maxAmount) * chartHeight : 0;
          const inHeight = maxAmount > 0 ? (day.totalIn / maxAmount) * chartHeight : 0;

          return (
            <G key={day.dateKey}>
              {/* Expense bar */}
              {outHeight > 0 && (
                <Rect
                  x={x}
                  y={chartHeight - outHeight}
                  width={barWidth}
                  height={outHeight}
                  rx={2}
                  fill="#DC2626"
                  opacity={0.7}
                />
              )}
              {/* Income bar (stacked or overlaid) */}
              {inHeight > 0 && (
                <Rect
                  x={x}
                  y={chartHeight - inHeight}
                  width={barWidth}
                  height={inHeight}
                  rx={2}
                  fill="#16A34A"
                  opacity={0.4}
                />
              )}
            </G>
          );
        })}
        {/* X-axis line */}
        <Rect x={0} y={chartHeight} width={chartWidth} height={1} fill="#E5E7EB" />
      </Svg>
      {/* Legend */}
      <View className="flex-row justify-center gap-4 mt-2">
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-sm bg-danger/70 mr-1" />
          <Text className="text-text-muted text-xs">Expense</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-sm bg-success/40 mr-1" />
          <Text className="text-text-muted text-xs">Income</Text>
        </View>
      </View>
    </View>
  );
}
