import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
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
    hasSetBalance,
  } = useBalance();
  const { recentTransactions, todayIn, todayOut } = useTransactions();

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

        {/* Balance Card — Read-Only (TM0) */}
        <View
          className="mx-4 bg-primary rounded-2xl p-5 mt-2"
        >
          <Text className="text-white/70 text-sm">Total Balance</Text>
          <Text className="text-white text-3xl font-bold mt-1">
            {hasSetBalance ? balanceFormatted : '₹ —'}
          </Text>
          <Text className="text-white/50 text-xs mt-2">
            Updated via Cashbook & Payments
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
        </View>

        {/* Quick Actions */}
        <View className="px-4 mt-5">
          <Text className="text-text-primary text-base font-semibold mb-3">
            Quick Actions
          </Text>
          <View className="flex-row gap-3">
            <QuickAction
              icon="⎘"
              label="Scan QR"
              onPress={() => router.push('/payment/scan')}
            />
            <QuickAction
              icon="₹"
              label="Pay"
              onPress={() => router.push('/payment/pay')}
            />
            <QuickAction
              icon="+"
              label="Add Entry"
              onPress={() => router.push('/add-entry')}
            />
            <QuickAction
              icon="⊕"
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
    </SafeAreaView>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 bg-card rounded-xl py-3 items-center border border-gray-100"
      activeOpacity={0.7}
    >
      <Text className="text-primary text-xl font-bold mb-1">{icon}</Text>
      <Text className="text-text-secondary text-xs font-medium">{label}</Text>
    </TouchableOpacity>
  );
}
