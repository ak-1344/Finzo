import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
  Share,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useParties } from '../../hooks/useParties';
import {
  formatRupees,
  formatDate,
  formatTime,
  rupeesToPaise,
} from '../../lib/utils';

export default function PartyDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getParty,
    getPartyTransactions,
    addPartyTransaction,
    deletePartyTransaction,
    settleParty,
    deleteParty,
    generateStatement,
  } = useParties();

  const party = getParty(id!);
  const transactions = party ? getPartyTransactions(party.id) : [];

  // Give/Get modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'give' | 'get'>('give');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  if (!party) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-text-secondary text-base">Party not found.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary text-base font-medium">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isSettled = party.balance === 0;
  const theyOweYou = party.balance > 0;

  const openGiveGet = (type: 'give' | 'get') => {
    setModalType(type);
    setAmount('');
    setNote('');
    setModalVisible(true);
  };

  const handleSaveEntry = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }

    addPartyTransaction({
      partyId: party.id,
      type: modalType,
      amount: rupeesToPaise(numAmount),
      note: note.trim(),
      timestamp: Date.now(),
      isSettlement: false,
    });

    setModalVisible(false);
  };

  const handleSettle = () => {
    if (party.balance === 0) {
      Alert.alert('Already Settled', 'This party has no outstanding balance.');
      return;
    }

    const balanceStr = formatRupees(Math.abs(party.balance));
    const direction = theyOweYou
      ? `${party.name} owes you ${balanceStr}`
      : `You owe ${party.name} ${balanceStr}`;

    Alert.alert(
      'Mark as Settled',
      `${direction}. Mark this as settled? A settlement entry will be created.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Settle',
          onPress: () => settleParty(party.id),
        },
      ]
    );
  };

  const handleShare = async () => {
    const statement = generateStatement(party.id);
    try {
      await Share.share({
        message: statement,
        title: `FINZO Statement — ${party.name}`,
      });
    } catch {
      Alert.alert('Error', 'Failed to share statement.');
    }
  };

  const handleDeleteParty = () => {
    Alert.alert(
      'Delete Party',
      `Are you sure you want to delete "${party.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteParty(party.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleDeleteTx = (txId: string, txNote: string) => {
    Alert.alert(
      'Delete Entry',
      `Delete "${txNote || 'this entry'}"? The party balance will be recalculated.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePartyTransaction(txId),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary text-base font-medium">← Back</Text>
        </TouchableOpacity>
        <Text className="text-text-primary text-lg font-bold" numberOfLines={1}>
          {party.name}
        </Text>
        <TouchableOpacity onPress={handleDeleteParty}>
          <Text className="text-danger text-sm font-medium">Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <View
        className={`mx-4 rounded-2xl p-5 mb-3 ${
          isSettled ? 'bg-gray-100' : theyOweYou ? 'bg-green-50' : 'bg-red-50'
        }`}
      >
        <Text
          className={`text-xs font-medium uppercase tracking-wider ${
            isSettled
              ? 'text-neutral'
              : theyOweYou
                ? 'text-green-600'
                : 'text-red-600'
          }`}
        >
          {isSettled
            ? 'Settled'
            : theyOweYou
              ? 'You Will Get'
              : 'You Will Give'}
        </Text>
        <Text
          className={`text-3xl font-bold mt-1 ${
            isSettled
              ? 'text-neutral'
              : theyOweYou
                ? 'text-success'
                : 'text-danger'
          }`}
        >
          {isSettled ? '₹0' : formatRupees(Math.abs(party.balance))}
        </Text>
        <Text className="text-text-muted text-xs mt-1">
          {party.type === 'customer' ? 'Customer' : 'Supplier'} • Added{' '}
          {formatDate(party.createdAt)}
        </Text>

        {/* Action buttons row */}
        <View className="flex-row gap-2 mt-4">
          {!isSettled && (
            <TouchableOpacity
              onPress={handleSettle}
              className="flex-1 bg-white/80 rounded-xl py-2.5 items-center border border-gray-200"
            >
              <Text className="text-text-primary text-sm font-medium">Settle</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleShare}
            className="flex-1 bg-white/80 rounded-xl py-2.5 items-center border border-gray-200"
          >
            <Text className="text-text-primary text-sm font-medium">Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transaction Timeline */}
      <View className="flex-row justify-between items-center px-5 mt-2 mb-2">
        <Text className="text-text-primary text-base font-semibold">
          History
        </Text>
        <Text className="text-text-muted text-xs">
          {transactions.length} entries
        </Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-text-muted text-sm">
              No entries yet. Tap "Gave" or "Got" below.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => handleDeleteTx(item.id, item.note)}
            className="bg-card rounded-xl p-4 mb-2 flex-row items-center justify-between border border-gray-100"
          >
            <View className="flex-row items-center flex-1 mr-3">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                  item.type === 'give' ? 'bg-red-100' : 'bg-green-100'
                }`}
              >
                <Text className="text-sm">
                  {item.isSettlement ? 'S' : item.type === 'give' ? '↑' : '↓'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-text-primary text-sm font-medium">
                  {item.isSettlement
                    ? 'Settlement'
                    : item.type === 'give'
                      ? 'You gave'
                      : 'You got'}
                </Text>
                {item.note ? (
                  <Text className="text-text-muted text-xs mt-0.5">
                    {item.note}
                  </Text>
                ) : null}
                <Text className="text-text-muted text-xs mt-0.5">
                  {formatDate(item.timestamp)} • {formatTime(item.timestamp)}
                </Text>
              </View>
            </View>
            <Text
              className={`text-base font-bold ${
                item.type === 'give' ? 'text-danger' : 'text-success'
              }`}
            >
              {item.type === 'give' ? '-' : '+'}
              {formatRupees(item.amount)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Bottom Action Bar — Give / Get */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-card border-t border-gray-100 px-4 py-3 flex-row gap-3"
        style={{ paddingBottom: 16 }}
      >
        <TouchableOpacity
          onPress={() => openGiveGet('give')}
          className="flex-1 bg-danger py-4 rounded-2xl items-center"
          style={{
            shadowColor: '#DC2626',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Text className="text-white text-base font-bold">↑ You Gave</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => openGiveGet('get')}
          className="flex-1 bg-success py-4 rounded-2xl items-center"
          style={{
            shadowColor: '#16A34A',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Text className="text-white text-base font-bold">↓ You Got</Text>
        </TouchableOpacity>
      </View>

      {/* Give/Get Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
            className="flex-1 bg-black/50 justify-end"
          >
            <TouchableOpacity
              activeOpacity={1}
              className="bg-card rounded-t-3xl p-6"
            >
              <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-4" />

              <Text className="text-text-primary text-lg font-bold mb-1">
                {modalType === 'give'
                  ? `You gave ${party.name}`
                  : `You got from ${party.name}`}
              </Text>
              <Text className="text-text-secondary text-sm mb-5">
                {modalType === 'give'
                  ? 'Money you gave or lent to them'
                  : 'Money you received from them'}
              </Text>

              {/* Amount */}
              <View className="flex-row items-center bg-background rounded-xl px-4 py-3 mb-4">
                <Text className="text-text-primary text-2xl font-bold mr-2">
                  ₹
                </Text>
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

              {/* Note */}
              <TextInput
                className="bg-background rounded-xl px-4 py-3 text-text-primary text-base mb-5"
                value={note}
                onChangeText={setNote}
                placeholder="Note (optional) — e.g. dinner, loan, rent"
                placeholderTextColor="#9CA3AF"
              />

              {/* Save */}
              <TouchableOpacity
                onPress={handleSaveEntry}
                className={`py-4 rounded-2xl items-center ${
                  modalType === 'give' ? 'bg-danger' : 'bg-success'
                }`}
              >
                <Text className="text-white text-base font-bold">
                  {modalType === 'give' ? 'Save — You Gave' : 'Save — You Got'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
