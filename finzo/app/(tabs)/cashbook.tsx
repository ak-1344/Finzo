import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBalance } from '../../hooks/useBalance';
import { useTransactions } from '../../hooks/useTransactions';
import {
  formatRupees,
  formatTime,
  formatDateKey,
  formatDate,
} from '../../lib/utils';

type FilterType = 'all' | 'in' | 'out';

export default function CashbookScreen() {
  const router = useRouter();
  const { balanceFormatted } = useBalance();
  const { groupedByDate, todayIn, todayOut, removeEntry, activeTransactions } =
    useTransactions();
  const [filter, setFilter] = useState<FilterType>('all');

  // Apply filter
  const filteredGroups = useMemo(() => {
    if (filter === 'all') return groupedByDate;
    return groupedByDate
      .map((group) => ({
        ...group,
        transactions: group.transactions.filter((t) => t.type === filter),
      }))
      .filter((group) => group.transactions.length > 0);
  }, [groupedByDate, filter]);

  // SectionList data format
  const sections = useMemo(
    () =>
      filteredGroups.map((group) => ({
        title: formatDateKey(group.dateKey),
        dateKey: group.dateKey,
        data: group.transactions,
        dayIn: group.transactions
          .filter((t) => t.type === 'in')
          .reduce((s, t) => s + t.amount, 0),
        dayOut: group.transactions
          .filter((t) => t.type === 'out')
          .reduce((s, t) => s + t.amount, 0),
      })),
    [filteredGroups]
  );

  const totalIn = useMemo(
    () =>
      activeTransactions
        .filter((t) => t.type === 'in')
        .reduce((s, t) => s + t.amount, 0),
    [activeTransactions]
  );

  const totalOut = useMemo(
    () =>
      activeTransactions
        .filter((t) => t.type === 'out')
        .reduce((s, t) => s + t.amount, 0),
    [activeTransactions]
  );

  const handleDelete = (id: string, label: string) => {
    Alert.alert(
      'Delete Entry',
      `Are you sure you want to delete "${label || 'Untitled'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeEntry(id),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-4 pb-3">
        <Text className="text-text-primary text-xl font-bold">Cashbook</Text>
      </View>

      {/* Summary Card */}
      <View className="mx-4 bg-card rounded-xl p-4 border border-gray-100 mb-3">
        <View className="flex-row justify-between items-center mb-3">
          <View>
            <Text className="text-text-muted text-xs">Total Balance</Text>
            <Text className="text-text-primary text-lg font-bold">
              {balanceFormatted}
            </Text>
          </View>
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1 bg-green-50 rounded-lg p-3">
            <Text className="text-green-600 text-xs">Total In</Text>
            <Text className="text-success text-base font-bold">
              +{formatRupees(totalIn)}
            </Text>
          </View>
          <View className="flex-1 bg-red-50 rounded-lg p-3">
            <Text className="text-red-600 text-xs">Total Out</Text>
            <Text className="text-danger text-base font-bold">
              -{formatRupees(totalOut)}
            </Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-4 mb-3 gap-2">
        {(['all', 'in', 'out'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            className={`px-4 py-2 rounded-full ${
              filter === f ? 'bg-primary' : 'bg-card border border-gray-200'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                filter === f ? 'text-white' : 'text-text-secondary'
              }`}
            >
              {f === 'all' ? 'All' : f === 'in' ? '↓ Money In' : '↑ Money Out'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transaction List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text className="text-3xl mb-2">📒</Text>
            <Text className="text-text-secondary text-sm text-center">
              No entries yet.{'\n'}Start logging your income & expenses.
            </Text>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View className="flex-row justify-between items-center mt-4 mb-2">
            <Text className="text-text-primary text-sm font-semibold">
              {section.title}
            </Text>
            <View className="flex-row gap-3">
              <Text className="text-success text-xs font-medium">
                +{formatRupees(section.dayIn)}
              </Text>
              <Text className="text-danger text-xs font-medium">
                -{formatRupees(section.dayOut)}
              </Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/edit-entry?id=${item.id}`)}
            onLongPress={() => handleDelete(item.id, item.label)}
            className="bg-card rounded-xl p-4 mb-2 flex-row items-center justify-between border border-gray-100"
          >
            <View className="flex-1 mr-3">
              <Text className="text-text-primary text-sm font-medium">
                {item.label || 'Untitled'}
              </Text>
              <Text className="text-text-muted text-xs mt-0.5">
                {formatTime(item.timestamp)} •{' '}
                {item.paymentMethod === 'cash'
                  ? 'Cash'
                  : item.paymentMethod === 'upi'
                    ? 'UPI'
                    : 'Manual'}
              </Text>
            </View>
            <Text
              className={`text-base font-bold ${
                item.type === 'in' ? 'text-success' : 'text-danger'
              }`}
            >
              {item.type === 'in' ? '+' : '-'}
              {formatRupees(item.amount)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={() => router.push('/add-entry')}
        className="absolute bottom-24 right-5 bg-primary rounded-2xl px-5 py-4 flex-row items-center"
        style={{
          shadowColor: '#1A56DB',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Text className="text-white text-lg mr-2">+</Text>
        <Text className="text-white font-semibold text-sm">Add Entry</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
