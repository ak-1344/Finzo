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
  Modal,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactions } from '../hooks/useTransactions';
import { useParties } from '../hooks/useParties';
import { rupeesToPaise, formatRupees } from '../lib/utils';
import { Transaction, Party } from '../types';

export default function AddEntryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ partyId?: string }>();
  const { addEntry } = useTransactions();
  const { activeParties, getParty } = useParties();

  // Pre-select party if navigated with partyId query param
  const initialParty = params.partyId ? getParty(params.partyId) : undefined;

  const [type, setType] = useState<'in' | 'out'>('out');
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'manual'>('cash');
  const [selectedParty, setSelectedParty] = useState<Party | null>(initialParty ?? null);
  const [showPartyPicker, setShowPartyPicker] = useState(false);

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

    addEntry({
      type,
      amount: rupeesToPaise(numAmount),
      label: label.trim(),
      bucketId: null,
      partyId: selectedParty?.id ?? null,
      timestamp: Date.now(),
      paymentMethod,
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
          <Text className="text-text-primary text-lg font-bold">Add Entry</Text>
          <View className="w-12" />
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
              autoFocus
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

          {/* Party Linking */}
          <Text className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">
            Link to Party (Optional)
          </Text>
          <TouchableOpacity
            onPress={() => setShowPartyPicker(true)}
            className={`bg-card rounded-xl px-4 py-4 border mb-5 flex-row items-center justify-between ${
              selectedParty ? 'border-primary' : 'border-gray-200'
            }`}
          >
            {selectedParty ? (
              <View className="flex-row items-center flex-1">
                <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3">
                  <Text className="text-primary text-sm font-bold">
                    {selectedParty.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-text-primary text-sm font-medium">{selectedParty.name}</Text>
                  <Text className="text-text-muted text-xs capitalize">{selectedParty.type}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedParty(null)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text className="text-danger text-xs font-medium">✕ Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text className="text-text-muted text-sm">
                {activeParties.length > 0 ? 'Tap to select a party...' : 'No parties yet — add one first'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Bucket placeholder */}
          <View className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-300 mb-5">
            <Text className="text-text-muted text-xs text-center">
              Bucket tagging → Milestone 3
            </Text>
          </View>
        </ScrollView>

        {/* Save Button (fixed at bottom) */}
        <View className="px-5 pb-4">
          <TouchableOpacity
            onPress={handleSave}
            className={`py-4 rounded-2xl items-center ${
              type === 'in' ? 'bg-success' : 'bg-danger'
            }`}
            style={{
              shadowColor: type === 'in' ? '#16A34A' : '#DC2626',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text className="text-white text-base font-bold">
              {type === 'in' ? '+ Add Income' : '- Add Expense'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Party Picker Modal */}
        <Modal
          visible={showPartyPicker}
          animationType="slide"
          transparent
          onRequestClose={() => setShowPartyPicker(false)}
        >
          <View className="flex-1 bg-black/40 justify-end">
            <View className="bg-background rounded-t-3xl max-h-[70%] pb-6">
              <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200">
                <Text className="text-text-primary text-lg font-bold">Select Party</Text>
                <TouchableOpacity onPress={() => setShowPartyPicker(false)}>
                  <Text className="text-primary text-base font-medium">Done</Text>
                </TouchableOpacity>
              </View>

              {activeParties.length === 0 ? (
                <View className="items-center py-10">
                  <Text className="text-4xl mb-3">👥</Text>
                  <Text className="text-text-muted text-sm">No parties yet</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowPartyPicker(false);
                      router.push('/add-party');
                    }}
                    className="mt-3 bg-primary/10 px-4 py-2 rounded-lg"
                  >
                    <Text className="text-primary text-sm font-medium">+ Add Party</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <FlatList
                  data={activeParties}
                  keyExtractor={(item) => item.id}
                  contentContainerClassName="px-5 py-2"
                  renderItem={({ item }) => {
                    const isSelected = selectedParty?.id === item.id;
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedParty(item);
                          setShowPartyPicker(false);
                        }}
                        className={`flex-row items-center py-3 px-3 rounded-xl mb-1 ${
                          isSelected ? 'bg-primary/10' : 'bg-card'
                        }`}
                      >
                        <View
                          className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                            item.type === 'customer' ? 'bg-success/10' : 'bg-danger/10'
                          }`}
                        >
                          <Text
                            className={`text-base font-bold ${
                              item.type === 'customer' ? 'text-success' : 'text-danger'
                            }`}
                          >
                            {item.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-text-primary text-sm font-medium">{item.name}</Text>
                          <Text className="text-text-muted text-xs capitalize">{item.type}</Text>
                        </View>
                        {item.balance !== 0 && (
                          <Text
                            className={`text-xs font-medium ${
                              item.balance > 0 ? 'text-success' : 'text-danger'
                            }`}
                          >
                            {formatRupees(Math.abs(item.balance))}
                          </Text>
                        )}
                        {isSelected && (
                          <Text className="text-primary text-lg ml-2">✓</Text>
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              )}
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
