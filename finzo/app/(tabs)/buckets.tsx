import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useBuckets } from '../../hooks/useBuckets';
import { useMonthReset } from '../../hooks/useMonthReset';
import { Bucket } from '../../types';
import { formatRupees, rupeesToPaise } from '../../lib/utils';

export default function BucketsScreen() {
  const router = useRouter();
  const {
    userBuckets,
    unallocatedBucket,
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
    addMoneyToBucket,
    removeMoneyFromBucket,
  } = useBuckets();

  // Trigger month-reset check on this screen
  useMonthReset();

  // Add/Remove money modal state
  const [moneyModalVisible, setMoneyModalVisible] = useState(false);
  const [moneyModalType, setMoneyModalType] = useState<'add' | 'remove'>('add');
  const [moneyModalBucket, setMoneyModalBucket] = useState<Bucket | null>(null);
  const [moneyAmount, setMoneyAmount] = useState('');

  const handleDelete = (bucket: Bucket) => {
    Alert.alert(
      'Delete Bucket',
      `Delete "${bucket.name}"? Remaining balance will move to Unallocated.`,
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
      'This will zero all spending, move remaining balances to Unallocated, and re-apply your preset (if auto-apply is on).',
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

  const openMoneyModal = (bucket: Bucket, type: 'add' | 'remove') => {
    setMoneyModalBucket(bucket);
    setMoneyModalType(type);
    setMoneyAmount('');
    setMoneyModalVisible(true);
  };

  const handleMoneyAction = () => {
    const numAmount = parseFloat(moneyAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }
    if (!moneyModalBucket) return;

    const paise = rupeesToPaise(numAmount);

    if (moneyModalType === 'add') {
      addMoneyToBucket(moneyModalBucket.id, paise);
    } else {
      removeMoneyFromBucket(moneyModalBucket.id, paise);
    }

    setMoneyModalVisible(false);
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
        onLongPress={() => !item.isUnallocated && handleDelete(item)}
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
              <Text className="text-base font-bold" style={{ color: item.color }}>{item.icon}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-text-primary text-sm font-semibold">
                {item.name}
                {item.isUnallocated && (
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
              {usagePercent >= 100 ? 'Over budget!' : 'Low balance'}
            </Text>
          </View>
        )}

        {/* Add/Remove money buttons */}
        {!item.isUnallocated && (
          <View className="flex-row gap-2 mt-3">
            <TouchableOpacity
              onPress={() => openMoneyModal(item, 'add')}
              className="flex-1 bg-success/10 py-2 rounded-lg items-center"
            >
              <Text className="text-success text-xs font-semibold">+ Add</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => openMoneyModal(item, 'remove')}
              className="flex-1 bg-danger/10 py-2 rounded-lg items-center"
            >
              <Text className="text-danger text-xs font-semibold">− Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Combine user buckets + unallocated for display
  const displayBuckets = [...userBuckets, ...(unallocatedBucket ? [unallocatedBucket] : [])];

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
            <Text className="text-primary text-xs font-medium">Save Preset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleResetMonth}
            className="bg-warning/10 px-3 py-1.5 rounded-lg"
          >
            <Text className="text-warning text-xs font-medium">Reset Month</Text>
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
                  <View
                    className={`w-3 h-3 rounded-full mr-2 ${
                      monthPreset.autoApply ? 'bg-success' : 'bg-gray-300'
                    }`}
                  />
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

      {/* Add/Remove Money Modal */}
      <Modal
        visible={moneyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMoneyModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setMoneyModalVisible(false)}
          className="flex-1 bg-black/50 justify-center items-center px-6"
        >
          <TouchableOpacity
            activeOpacity={1}
            className="bg-card w-full rounded-2xl p-6"
          >
            <Text className="text-text-primary text-lg font-bold mb-1">
              {moneyModalType === 'add' ? 'Add Money' : 'Remove Money'}
            </Text>
            <Text className="text-text-secondary text-sm mb-4">
              {moneyModalType === 'add'
                ? `Add funds to "${moneyModalBucket?.name}" bucket`
                : `Remove funds from "${moneyModalBucket?.name}" bucket`}
            </Text>

            <View className="flex-row items-center bg-background rounded-xl px-4 py-3 mb-4">
              <Text className="text-text-primary text-xl font-bold mr-2">₹</Text>
              <TextInput
                className="flex-1 text-xl font-bold text-text-primary"
                value={moneyAmount}
                onChangeText={setMoneyAmount}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                autoFocus
                selectTextOnFocus
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setMoneyModalVisible(false)}
                className="flex-1 bg-background rounded-xl py-3 items-center"
              >
                <Text className="text-text-secondary font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleMoneyAction}
                className={`flex-1 rounded-xl py-3 items-center ${
                  moneyModalType === 'add' ? 'bg-success' : 'bg-danger'
                }`}
              >
                <Text className="text-white font-semibold">
                  {moneyModalType === 'add' ? 'Add' : 'Remove'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
