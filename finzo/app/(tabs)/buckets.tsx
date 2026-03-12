import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useBuckets } from '../../hooks/useBuckets';
import { useMonthReset } from '../../hooks/useMonthReset';
import { Bucket } from '../../types';
import { formatRupees } from '../../lib/utils';

export default function BucketsScreen() {
  const router = useRouter();
  const {
    userBuckets,
    overflowBucket,
    totalAllocated,
    totalSpent,
    unallocated,
    totalBalance,
    totalAllocatedFormatted,
    totalSpentFormatted,
    unallocatedFormatted,
    getRemaining,
    getUsagePercent,
    getHealthColor,
    getHealthLabel,
    deleteBucket,
    savePreset,
    monthPreset,
    toggleAutoApply,
    resetMonth,
  } = useBuckets();

  // Trigger month-reset check on this screen
  useMonthReset();

  const [showPresetModal, setShowPresetModal] = useState(false);

  const handleDelete = (bucket: Bucket) => {
    Alert.alert(
      'Delete Bucket',
      `Delete "${bucket.name}"? Remaining balance will move to Overflow.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteBucket(bucket.id),
        },
      ]
    );
  };

  const handleSavePreset = () => {
    savePreset(monthPreset?.autoApply ?? false);
    Alert.alert('Preset Saved', 'Your current allocation has been saved as a monthly preset.');
  };

  const handleResetMonth = () => {
    Alert.alert(
      'Reset Month',
      'This will zero all spending, move remaining balances to Overflow, and re-apply your preset (if auto-apply is on).',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => resetMonth(),
        },
      ]
    );
  };

  const renderBucketCard = ({ item }: { item: Bucket }) => {
    const remaining = getRemaining(item);
    const usagePercent = getUsagePercent(item);
    const healthColor = getHealthColor(item);
    const health = getHealthLabel(item);

    return (
      <TouchableOpacity
        onPress={() =>
          router.push(`/edit-bucket?id=${item.id}`)
        }
        onLongPress={() => !item.isOverflow && handleDelete(item)}
        className="bg-card rounded-2xl p-4 mb-3 border border-gray-100"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: item.color + '20' }}
            >
              <Text className="text-xl">{item.icon}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-text-primary text-sm font-semibold">
                {item.name}
                {item.isOverflow && (
                  <Text className="text-text-muted text-xs"> (auto)</Text>
                )}
              </Text>
              <Text className="text-text-muted text-xs">
                {formatRupees(item.spentAmount)} spent of {formatRupees(item.allocatedAmount)}
              </Text>
            </View>
          </View>
          <View className="items-end">
            <Text
              className="text-sm font-bold"
              style={{ color: healthColor }}
            >
              {formatRupees(remaining)}
            </Text>
            <Text className="text-text-muted text-[10px]">remaining</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <View
            className="h-full rounded-full"
            style={{
              width: `${Math.min(usagePercent, 100)}%`,
              backgroundColor: healthColor,
            }}
          />
        </View>

        {/* Warning badge */}
        {health === 'critical' && item.allocatedAmount > 0 && (
          <View className="flex-row items-center mt-2">
            <Text className="text-danger text-[10px] font-medium">
              ⚠️ {usagePercent >= 100 ? 'Over budget!' : 'Low balance'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Combine user buckets + overflow for display
  const displayBuckets = [...userBuckets, ...(overflowBucket ? [overflowBucket] : [])];

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
        <Text className="text-text-primary text-xl font-bold">Buckets</Text>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={handleSavePreset}
            className="bg-primary/10 px-3 py-1.5 rounded-lg"
          >
            <Text className="text-primary text-xs font-medium">💾 Preset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleResetMonth}
            className="bg-warning/10 px-3 py-1.5 rounded-lg"
          >
            <Text className="text-warning text-xs font-medium">🔄 Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={displayBuckets}
        keyExtractor={(item) => item.id}
        renderItem={renderBucketCard}
        contentContainerClassName="px-5 pb-24"
        ListHeaderComponent={() => (
          <>
            {/* Balance Summary Card */}
            <View
              className="bg-card rounded-2xl p-5 mb-4 border border-gray-100"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View className="flex-row justify-between mb-3">
                <View>
                  <Text className="text-text-muted text-xs mb-1">Total Balance</Text>
                  <Text className="text-text-primary text-xl font-bold">
                    {formatRupees(totalBalance)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-text-muted text-xs mb-1">Unallocated</Text>
                  <Text className="text-warning text-xl font-bold">
                    {unallocatedFormatted}
                  </Text>
                </View>
              </View>

              <View className="h-px bg-gray-100 my-2" />

              <View className="flex-row justify-between">
                <View>
                  <Text className="text-text-muted text-xs mb-0.5">Allocated</Text>
                  <Text className="text-primary text-sm font-semibold">
                    {totalAllocatedFormatted}
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-text-muted text-xs mb-0.5">Spent</Text>
                  <Text className="text-danger text-sm font-semibold">
                    {totalSpentFormatted}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-text-muted text-xs mb-0.5">Buckets</Text>
                  <Text className="text-text-primary text-sm font-semibold">
                    {userBuckets.length}
                  </Text>
                </View>
              </View>
            </View>

            {/* Auto-apply toggle */}
            {monthPreset && (
              <TouchableOpacity
                onPress={() => toggleAutoApply(!monthPreset.autoApply)}
                className={`flex-row items-center justify-between bg-card rounded-xl px-4 py-3 mb-4 border ${
                  monthPreset.autoApply ? 'border-primary' : 'border-gray-200'
                }`}
              >
                <View className="flex-row items-center">
                  <Text className="text-sm mr-2">
                    {monthPreset.autoApply ? '🟢' : '⚪'}
                  </Text>
                  <Text className="text-text-primary text-sm font-medium">
                    Auto-apply preset on 1st of month
                  </Text>
                </View>
                <Text className="text-text-muted text-xs">
                  {monthPreset.autoApply ? 'ON' : 'OFF'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Section title */}
            {displayBuckets.length > 0 && (
              <Text className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">
                Your Buckets
              </Text>
            )}
          </>
        )}
        ListEmptyComponent={() => (
          <View className="items-center py-12">
            <Text className="text-4xl mb-3">🪣</Text>
            <Text className="text-text-primary text-lg font-semibold mb-1">
              No Buckets Yet
            </Text>
            <Text className="text-text-secondary text-sm text-center px-8 mb-4">
              Create buckets to split your balance into categories like Food, Bills, Shopping.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/add-bucket')}
              className="bg-primary px-6 py-3 rounded-xl"
            >
              <Text className="text-white text-sm font-bold">+ Create First Bucket</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Floating Add Button */}
      {displayBuckets.length > 0 && (
        <TouchableOpacity
          onPress={() => router.push('/add-bucket')}
          className="absolute bottom-6 right-5 bg-primary w-14 h-14 rounded-full items-center justify-center"
          style={{
            shadowColor: '#1A56DB',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Text className="text-white text-2xl font-light">+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
