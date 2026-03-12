import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useParties } from '../../hooks/useParties';
import { formatRupees, formatDate } from '../../lib/utils';

type Tab = 'all' | 'customer' | 'supplier';

export default function PartiesScreen() {
  const router = useRouter();
  const {
    activeParties,
    customers,
    suppliers,
    totalToGet,
    totalToGive,
    getLastActivity,
    deleteParty,
  } = useParties();

  const [tab, setTab] = useState<Tab>('all');

  const displayedParties = useMemo(() => {
    const list =
      tab === 'customer'
        ? customers
        : tab === 'supplier'
          ? suppliers
          : activeParties;
    return list.sort((a, b) => {
      const aLast = getLastActivity(a.id) ?? a.createdAt;
      const bLast = getLastActivity(b.id) ?? b.createdAt;
      return bLast - aLast;
    });
  }, [tab, activeParties, customers, suppliers]);

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Party',
      `Are you sure you want to delete "${name}"? Their transaction history will be preserved.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteParty(id),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-4 pb-3">
        <Text className="text-text-primary text-xl font-bold">Parties</Text>
      </View>

      {/* Summary Card */}
      <View className="mx-4 bg-card rounded-xl p-4 border border-gray-100 mb-3">
        <View className="flex-row gap-3">
          <View className="flex-1 bg-red-50 rounded-lg p-3">
            <Text className="text-red-600 text-xs">You Will Give</Text>
            <Text className="text-danger text-base font-bold">
              {formatRupees(totalToGive)}
            </Text>
          </View>
          <View className="flex-1 bg-green-50 rounded-lg p-3">
            <Text className="text-green-600 text-xs">You Will Get</Text>
            <Text className="text-success text-base font-bold">
              {formatRupees(totalToGet)}
            </Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-4 mb-3 gap-2">
        {(
          [
            { key: 'all', label: 'All' },
            { key: 'customer', label: 'Customers' },
            { key: 'supplier', label: 'Suppliers' },
          ] as { key: Tab; label: string }[]
        ).map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full ${
              tab === t.key ? 'bg-primary' : 'bg-card border border-gray-200'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                tab === t.key ? 'text-white' : 'text-text-secondary'
              }`}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Party List */}
      <FlatList
        data={displayedParties}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text className="text-3xl mb-2">👥</Text>
            <Text className="text-text-secondary text-sm text-center">
              No parties yet.{'\n'}Add someone to track who owes you.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const lastActivity = getLastActivity(item.id);
          const isSettled = item.balance === 0;
          const theyOweYou = item.balance > 0;

          return (
            <TouchableOpacity
              onPress={() => router.push(`/party/${item.id}`)}
              onLongPress={() => handleDelete(item.id, item.name)}
              className="bg-card rounded-xl p-4 mb-2 flex-row items-center justify-between border border-gray-100"
            >
              {/* Avatar + Info */}
              <View className="flex-row items-center flex-1 mr-3">
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                    isSettled
                      ? 'bg-gray-100'
                      : theyOweYou
                        ? 'bg-green-100'
                        : 'bg-red-100'
                  }`}
                >
                  <Text className="text-base font-bold text-text-primary">
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-text-primary text-sm font-medium">
                    {item.name}
                  </Text>
                  <Text className="text-text-muted text-xs mt-0.5">
                    {lastActivity
                      ? formatDate(lastActivity)
                      : item.type === 'customer'
                        ? 'Customer'
                        : 'Supplier'}
                  </Text>
                </View>
              </View>

              {/* Balance */}
              {isSettled ? (
                <Text className="text-neutral text-sm font-medium">Settled</Text>
              ) : (
                <View className="items-end">
                  <Text
                    className={`text-base font-bold ${
                      theyOweYou ? 'text-success' : 'text-danger'
                    }`}
                  >
                    {formatRupees(Math.abs(item.balance))}
                  </Text>
                  <Text
                    className={`text-xs ${
                      theyOweYou ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {theyOweYou ? 'You will get' : 'You will give'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={() => router.push('/add-party')}
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
        <Text className="text-white font-semibold text-sm">Add Party</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
