import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBuckets } from '../hooks/useBuckets';
import { BUCKET_COLORS, BUCKET_ICONS, OVERFLOW_BUCKET_ID } from '../store/bucketStore';
import { rupeesToPaise, paiseToRupees, formatRupees } from '../lib/utils';

export default function EditBucketScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getBucketById,
    updateBucket,
    deleteBucket,
    totalAllocated,
    totalBalance,
    getUsagePercent,
    getRemaining,
    getHealthColor,
  } = useBuckets();

  const bucket = id ? getBucketById(id) : undefined;
  const isOverflow = bucket?.isOverflow ?? false;

  const [name, setName] = useState(bucket?.name ?? '');
  const [icon, setIcon] = useState(bucket?.icon ?? BUCKET_ICONS[0]);
  const [color, setColor] = useState(bucket?.color ?? BUCKET_COLORS[0]);
  const [amount, setAmount] = useState(
    bucket ? String(paiseToRupees(bucket.allocatedAmount)) : ''
  );

  useEffect(() => {
    if (!bucket) {
      Alert.alert('Not Found', 'Bucket not found.');
      router.back();
    }
  }, [bucket]);

  if (!bucket) return null;

  // Max this bucket can be: (total balance - other allocations) = current allocation + unallocated
  const otherAllocated = totalAllocated - (isOverflow ? 0 : bucket.allocatedAmount);
  const maxForThisBucket = Math.max(0, totalBalance - otherAllocated);

  const handleSave = () => {
    if (isOverflow) {
      // Overflow only allows name/icon/color edit, not allocation
      updateBucket(bucket.id, { name, icon, color });
      router.back();
      return;
    }

    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for this bucket.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid allocation amount.');
      return;
    }

    const amountPaise = rupeesToPaise(numAmount);

    if (amountPaise > maxForThisBucket) {
      Alert.alert(
        'Exceeds Balance',
        `Maximum allocation for this bucket is ${formatRupees(maxForThisBucket)}.`
      );
      return;
    }

    updateBucket(bucket.id, {
      name: name.trim(),
      icon,
      color,
      allocatedAmount: amountPaise,
    });

    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Bucket',
      `Delete "${bucket.name}"? Remaining balance will move to Overflow.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteBucket(bucket.id);
            router.back();
          },
        },
      ]
    );
  };

  const usagePercent = getUsagePercent(bucket);
  const remaining = getRemaining(bucket);
  const healthColor = getHealthColor(bucket);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary text-base font-medium">← Back</Text>
          </TouchableOpacity>
          <Text className="text-text-primary text-lg font-bold">Edit Bucket</Text>
          {!isOverflow ? (
            <TouchableOpacity onPress={handleDelete}>
              <Text className="text-danger text-sm font-medium">Delete</Text>
            </TouchableOpacity>
          ) : (
            <View className="w-12" />
          )}
        </View>

        <ScrollView
          className="flex-1 px-5"
          contentContainerClassName="pb-8"
          keyboardShouldPersistTaps="handled"
        >
          {/* Current Status */}
          <View
            className="bg-card rounded-2xl p-4 mb-5 border border-gray-100"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View className="flex-row justify-between mb-2">
              <View>
                <Text className="text-text-muted text-xs">Spent</Text>
                <Text className="text-danger text-base font-bold">
                  {formatRupees(bucket.spentAmount)}
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-text-muted text-xs">Remaining</Text>
                <Text className="text-base font-bold" style={{ color: healthColor }}>
                  {formatRupees(remaining)}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-text-muted text-xs">Used</Text>
                <Text className="text-text-primary text-base font-bold">
                  {usagePercent}%
                </Text>
              </View>
            </View>
            <View className="h-2 rounded-full bg-gray-100">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(usagePercent, 100)}%`,
                  backgroundColor: healthColor,
                }}
              />
            </View>
          </View>

          {/* Bucket Name */}
          <Text className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">
            Bucket Name
          </Text>
          <TextInput
            className="bg-card rounded-xl px-4 py-4 text-text-primary text-base border border-gray-200 mb-5"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Food, Shopping, Bills..."
            placeholderTextColor="#9CA3AF"
          />

          {/* Allocated Amount (not for overflow) */}
          {!isOverflow && (
            <>
              <Text className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">
                Monthly Allocation
              </Text>
              <View className="flex-row items-center bg-card rounded-xl px-4 py-3 border border-gray-200 mb-2">
                <Text className="text-text-primary text-2xl font-bold mr-2">₹</Text>
                <TextInput
                  className="flex-1 text-2xl font-bold text-text-primary"
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
              </View>
              <Text className="text-text-muted text-xs mb-5">
                Max for this bucket: {formatRupees(maxForThisBucket)}
              </Text>
            </>
          )}

          {isOverflow && (
            <View className="bg-primary/5 rounded-xl p-4 mb-5 border border-primary/20">
              <Text className="text-primary text-xs font-medium">
                ℹ️ Overflow collects leftover from monthly resets and deleted buckets. Its allocation adjusts automatically.
              </Text>
            </View>
          )}

          {/* Icon Selection */}
          <Text className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">
            Icon
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-5">
            {BUCKET_ICONS.map((ic) => (
              <TouchableOpacity
                key={ic}
                onPress={() => setIcon(ic)}
                className={`w-11 h-11 rounded-xl items-center justify-center border ${
                  icon === ic
                    ? 'bg-primary/10 border-primary'
                    : 'bg-card border-gray-200'
                }`}
              >
                <Text className="text-xl">{ic}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Color Selection */}
          <Text className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">
            Color
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {BUCKET_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                className={`w-11 h-11 rounded-full items-center justify-center border-2 ${
                  color === c ? 'border-text-primary' : 'border-transparent'
                }`}
              >
                <View
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: c }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Save Button */}
        <View className="px-5 pb-4">
          <TouchableOpacity
            onPress={handleSave}
            className="bg-primary py-4 rounded-2xl items-center"
            style={{
              shadowColor: '#1A56DB',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text className="text-white text-base font-bold">Save Changes</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
