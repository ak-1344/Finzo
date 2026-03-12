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
import { useTransactions } from '../hooks/useTransactions';
import { useTransactionStore } from '../store/transactionStore';
import { rupeesToPaise, paiseToRupees } from '../lib/utils';

export default function EditEntryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { editEntry, removeEntry } = useTransactions();
  const transactions = useTransactionStore((s) => s.transactions);

  const transaction = transactions.find((t) => t.id === id && !t.isDeleted);

  const [type, setType] = useState<'in' | 'out'>('out');
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'manual'>('cash');

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(paiseToRupees(transaction.amount).toString());
      setLabel(transaction.label);
      setPaymentMethod(transaction.paymentMethod);
    }
  }, [transaction]);

  if (!transaction) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-text-secondary text-base">Entry not found.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary text-base font-medium">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }

    if (!label.trim()) {
      Alert.alert('Missing Label', 'Please add a label for this entry.');
      return;
    }

    editEntry(id!, {
      type,
      amount: rupeesToPaise(numAmount),
      label: label.trim(),
      paymentMethod,
    });

    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      `Are you sure you want to delete "${label || 'Untitled'}"? This will reverse its effect on your balance.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeEntry(id!);
            router.back();
          },
        },
      ]
    );
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
          <Text className="text-text-primary text-lg font-bold">Edit Entry</Text>
          <TouchableOpacity onPress={handleDelete}>
            <Text className="text-danger text-sm font-medium">Delete</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 px-5"
          contentContainerClassName="pb-8"
          keyboardShouldPersistTaps="handled"
        >
          {/* IN / OUT Toggle */}
          <View className="flex-row bg-card rounded-xl overflow-hidden border border-gray-200 mb-6 mt-2">
            <TouchableOpacity
              onPress={() => setType('in')}
              className={`flex-1 py-4 items-center ${
                type === 'in' ? 'bg-success' : 'bg-card'
              }`}
            >
              <Text
                className={`text-base font-bold ${
                  type === 'in' ? 'text-white' : 'text-text-secondary'
                }`}
              >
                ↓ Money In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setType('out')}
              className={`flex-1 py-4 items-center ${
                type === 'out' ? 'bg-danger' : 'bg-card'
              }`}
            >
              <Text
                className={`text-base font-bold ${
                  type === 'out' ? 'text-white' : 'text-text-secondary'
                }`}
              >
                ↑ Money Out
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <Text className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">
            Amount
          </Text>
          <View className="flex-row items-center bg-card rounded-xl px-4 py-3 border border-gray-200 mb-5">
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

          {/* Label Input */}
          <Text className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">
            Label / Description
          </Text>
          <TextInput
            className="bg-card rounded-xl px-4 py-4 text-text-primary text-base border border-gray-200 mb-5"
            value={label}
            onChangeText={setLabel}
            placeholder="e.g. Groceries, Salary, Auto..."
            placeholderTextColor="#9CA3AF"
          />

          {/* Payment Method */}
          <Text className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">
            Payment Method
          </Text>
          <View className="flex-row gap-2 mb-6">
            {(
              [
                { key: 'cash', label: '💵 Cash' },
                { key: 'upi', label: '📱 UPI' },
                { key: 'manual', label: '📝 Other' },
              ] as { key: 'cash' | 'upi' | 'manual'; label: string }[]
            ).map((method) => (
              <TouchableOpacity
                key={method.key}
                onPress={() => setPaymentMethod(method.key)}
                className={`flex-1 py-3 rounded-xl items-center border ${
                  paymentMethod === method.key
                    ? 'bg-primary/10 border-primary'
                    : 'bg-card border-gray-200'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    paymentMethod === method.key
                      ? 'text-primary'
                      : 'text-text-secondary'
                  }`}
                >
                  {method.label}
                </Text>
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
