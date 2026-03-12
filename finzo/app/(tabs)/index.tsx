import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBalance } from '../../hooks/useBalance';
import { useTransactions } from '../../hooks/useTransactions';
import { formatRupees, formatTime, getGreeting, getTodayString } from '../../lib/utils';

export default function HomeScreen() {
  const router = useRouter();
  const {
    balanceFormatted,
    balanceRupees,
    hasSetBalance,
    setBalanceFromRupees,
  } = useBalance();
  const { recentTransactions, todayIn, todayOut } = useTransactions();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [balanceInput, setBalanceInput] = useState('');

  const openEditBalance = () => {
    setBalanceInput(balanceRupees > 0 ? balanceRupees.toString() : '');
    setEditModalVisible(true);
  };

  const saveBalance = () => {
    const value = parseFloat(balanceInput);
    if (isNaN(value) || value < 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    setBalanceFromRupees(value);
    setEditModalVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-sm text-text-secondary">{getGreeting()}</Text>
          <Text className="text-xs text-text-muted mt-0.5">{getTodayString()}</Text>
        </View>

        {/* Balance Card */}
        <TouchableOpacity
          onPress={openEditBalance}
          activeOpacity={0.8}
          className="mx-4 bg-primary rounded-2xl p-5 mt-2"
        >
          <Text className="text-white/70 text-sm">Total Balance</Text>
          <Text className="text-white text-3xl font-bold mt-1">
            {hasSetBalance ? balanceFormatted : '₹ —'}
          </Text>
          <Text className="text-white/50 text-xs mt-2">
            Tap to {hasSetBalance ? 'update' : 'set'} balance
          </Text>

          {/* Today's summary */}
          {hasSetBalance && (
            <View className="flex-row mt-4 gap-4">
              <View className="flex-1 bg-white/10 rounded-xl p-3">
                <Text className="text-white/60 text-xs">Today In</Text>
                <Text className="text-green-300 text-base font-bold">
                  +{formatRupees(todayIn)}
                </Text>
              </View>
              <View className="flex-1 bg-white/10 rounded-xl p-3">
                <Text className="text-white/60 text-xs">Today Out</Text>
                <Text className="text-red-300 text-base font-bold">
                  -{formatRupees(todayOut)}
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Quick Actions */}
        <View className="px-4 mt-5">
          <Text className="text-text-primary text-base font-semibold mb-3">
            Quick Actions
          </Text>
          <View className="flex-row gap-3">
            <QuickAction
              emoji="📷"
              label="Scan QR"
              onPress={() => router.push('/payment/scan')}
            />
            <QuickAction
              emoji="📞"
              label="Pay"
              onPress={() => router.push('/payment/pay')}
            />
            <QuickAction
              emoji="➕"
              label="Add Entry"
              onPress={() => router.push('/add-entry')}
            />
            <QuickAction
              emoji="👤"
              label="Add Party"
              onPress={() => router.push('/add-party')}
            />
          </View>
        </View>

        {/* Recent Transactions */}
        <View className="px-4 mt-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-text-primary text-base font-semibold">
              Recent Transactions
            </Text>
            {recentTransactions.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/(tabs)/cashbook')}>
                <Text className="text-primary text-sm font-medium">View All</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentTransactions.length === 0 ? (
            <View className="bg-card rounded-xl p-8 items-center border border-gray-100">
              <Text className="text-3xl mb-2">📒</Text>
              <Text className="text-text-secondary text-sm text-center">
                No transactions yet.{'\n'}Tap "Add Entry" to get started!
              </Text>
            </View>
          ) : (
            <View className="bg-card rounded-xl border border-gray-100 overflow-hidden">
              {recentTransactions.map((tx, index) => (
                <TouchableOpacity
                  key={tx.id}
                  onPress={() => router.push(`/edit-entry?id=${tx.id}`)}
                  className={`flex-row items-center justify-between p-4 ${
                    index < recentTransactions.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <View className="flex-1 mr-3">
                    <Text className="text-text-primary text-sm font-medium">
                      {tx.label || 'Untitled'}
                    </Text>
                    <Text className="text-text-muted text-xs mt-0.5">
                      {formatTime(tx.timestamp)}
                    </Text>
                  </View>
                  <Text
                    className={`text-base font-bold ${
                      tx.type === 'in' ? 'text-success' : 'text-danger'
                    }`}
                  >
                    {tx.type === 'in' ? '+' : '-'}{formatRupees(tx.amount)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Edit Balance Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setEditModalVisible(false)}
          className="flex-1 bg-black/50 justify-center items-center px-6"
        >
          <TouchableOpacity
            activeOpacity={1}
            className="bg-card w-full rounded-2xl p-6"
          >
            <Text className="text-text-primary text-lg font-bold mb-1">
              {hasSetBalance ? 'Update Balance' : 'Set Your Balance'}
            </Text>
            <Text className="text-text-secondary text-sm mb-4">
              Enter your current total balance in rupees.
            </Text>

            <View className="flex-row items-center bg-background rounded-xl px-4 py-3 mb-4">
              <Text className="text-text-primary text-xl font-bold mr-2">₹</Text>
              <TextInput
                className="flex-1 text-xl font-bold text-text-primary"
                value={balanceInput}
                onChangeText={setBalanceInput}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                autoFocus
                selectTextOnFocus
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                className="flex-1 bg-background rounded-xl py-3 items-center"
              >
                <Text className="text-text-secondary font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveBalance}
                className="flex-1 bg-primary rounded-xl py-3 items-center"
              >
                <Text className="text-white font-semibold">Save</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function QuickAction({
  emoji,
  label,
  onPress,
}: {
  emoji: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 bg-card rounded-xl py-3 items-center border border-gray-100"
      activeOpacity={0.7}
    >
      <Text className="text-xl mb-1">{emoji}</Text>
      <Text className="text-text-secondary text-xs font-medium">{label}</Text>
    </TouchableOpacity>
  );
}
