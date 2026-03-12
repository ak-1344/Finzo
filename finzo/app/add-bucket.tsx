import { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBuckets } from '../hooks/useBuckets';
import { BUCKET_COLORS, BUCKET_ICONS } from '../store/bucketStore';
import { rupeesToPaise, formatRupees } from '../lib/utils';

export default function AddBucketScreen() {
  const router = useRouter();
  const { addBucket, maxAllocatable, canAllocate, totalBalance } = useBuckets();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState(BUCKET_ICONS[0]);
  const [color, setColor] = useState(BUCKET_COLORS[0]);
  const [amount, setAmount] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for this bucket.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid allocation amount.');
      return;
    }

    const amountPaise = rupeesToPaise(numAmount);

    if (!canAllocate(amountPaise)) {
      Alert.alert(
        'Exceeds Balance',
        `You can allocate up to ${formatRupees(maxAllocatable)}. Your total balance is ${formatRupees(totalBalance)}.`,
        [{ text: 'OK' }]
      );
      return;
    }

    addBucket({
      name: name.trim(),
      icon,
      color,
      allocatedAmount: amountPaise,
    });

    router.back();
  };

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
          <Text className="text-text-primary text-lg font-bold">Add Bucket</Text>
          <View className="w-12" />
        </View>

        <ScrollView
          className="flex-1 px-5"
          contentContainerClassName="pb-8"
          keyboardShouldPersistTaps="handled"
        >
          {/* Bucket Name */}
          <Text className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 mt-2">
            Bucket Name
          </Text>
          <TextInput
            className="bg-card rounded-xl px-4 py-4 text-text-primary text-base border border-gray-200 mb-5"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Food, Shopping, Bills..."
            placeholderTextColor="#9CA3AF"
            autoFocus
          />

          {/* Allocated Amount */}
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
            Available to allocate: {formatRupees(maxAllocatable)}
          </Text>

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

          {/* Preview */}
          <Text className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">
            Preview
          </Text>
          <View
            className="bg-card rounded-2xl p-4 border border-gray-100"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: color + '20' }}
              >
                <Text className="text-xl">{icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-text-primary text-sm font-semibold">
                  {name || 'Bucket Name'}
                </Text>
                <Text className="text-text-muted text-xs">
                  ₹0 spent of {amount ? `₹${amount}` : '₹0'}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-success text-sm font-bold">
                  {amount ? `₹${amount}` : '₹0'}
                </Text>
                <Text className="text-text-muted text-[10px]">remaining</Text>
              </View>
            </View>
            <View className="h-2 rounded-full bg-gray-100 mt-3">
              <View
                className="h-full rounded-full"
                style={{ width: '0%', backgroundColor: color }}
              />
            </View>
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
            <Text className="text-white text-base font-bold">+ Create Bucket</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
