import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Switch,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReminders } from '../hooks/useReminders';
import { useParties } from '../hooks/useParties';
import { formatDate, formatTime } from '../lib/utils';
import { Reminder, Party } from '../types';

export default function RemindersScreen() {
  const router = useRouter();
  const {
    activeReminders,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminder,
  } = useReminders();
  const { activeParties, getParty } = useParties();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  // Form state
  const [message, setMessage] = useState('');
  const [recurring, setRecurring] = useState<'none' | 'weekly' | 'monthly'>('none');
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [showPartyPicker, setShowPartyPicker] = useState(false);
  const [triggerDate, setTriggerDate] = useState(''); // DD/MM/YYYY
  const [triggerTime, setTriggerTime] = useState(''); // HH:MM

  const resetForm = () => {
    setMessage('');
    setRecurring('none');
    setSelectedPartyId(null);
    setTriggerDate('');
    setTriggerTime('');
    setEditingReminder(null);
  };

  const openAddModal = () => {
    resetForm();
    // Default to tomorrow at 9:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    setTriggerDate(
      `${String(tomorrow.getDate()).padStart(2, '0')}/${String(tomorrow.getMonth() + 1).padStart(2, '0')}/${tomorrow.getFullYear()}`
    );
    setTriggerTime('09:00');
    setShowAddModal(true);
  };

  const openEditModal = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setMessage(reminder.message);
    setRecurring(reminder.recurring);
    setSelectedPartyId(reminder.linkedPartyId);
    const d = new Date(reminder.triggerAt);
    setTriggerDate(
      `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
    );
    setTriggerTime(
      `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    );
    setShowAddModal(true);
  };

  const parseTriggerAt = (): number | null => {
    // Parse DD/MM/YYYY
    const dateParts = triggerDate.split('/');
    if (dateParts.length !== 3) return null;
    const [dd, mm, yyyy] = dateParts.map(Number);
    if (!dd || !mm || !yyyy) return null;

    // Parse HH:MM
    const timeParts = triggerTime.split(':');
    if (timeParts.length !== 2) return null;
    const [hh, min] = timeParts.map(Number);
    if (isNaN(hh) || isNaN(min)) return null;

    const date = new Date(yyyy, mm - 1, dd, hh, min, 0, 0);
    if (isNaN(date.getTime())) return null;

    return date.getTime();
  };

  const handleSave = async () => {
    if (!message.trim()) {
      Alert.alert('Missing Message', 'Please enter a reminder message.');
      return;
    }

    const triggerAt = parseTriggerAt();
    if (!triggerAt) {
      Alert.alert('Invalid Date/Time', 'Please enter a valid date (DD/MM/YYYY) and time (HH:MM).');
      return;
    }

    if (recurring === 'none' && triggerAt <= Date.now()) {
      Alert.alert('Past Date', 'Please select a future date for one-time reminders.');
      return;
    }

    if (editingReminder) {
      await updateReminder(editingReminder.id, {
        message: message.trim(),
        recurring,
        linkedPartyId: selectedPartyId,
        triggerAt,
      });
    } else {
      await addReminder({
        message: message.trim(),
        recurring,
        linkedPartyId: selectedPartyId,
        triggerAt,
        isActive: true,
      });
    }

    setShowAddModal(false);
    resetForm();
  };

  const handleDelete = (reminder: Reminder) => {
    Alert.alert(
      'Delete Reminder',
      `Delete "${reminder.message}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteReminder(reminder.id),
        },
      ]
    );
  };

  const getRecurringLabel = (r: 'none' | 'weekly' | 'monthly') => {
    if (r === 'weekly') return '🔄 Weekly';
    if (r === 'monthly') return '🔄 Monthly';
    return '📌 One-time';
  };

  const selectedParty = selectedPartyId ? getParty(selectedPartyId) : undefined;

  const renderReminder = ({ item }: { item: Reminder }) => {
    const party = item.linkedPartyId ? getParty(item.linkedPartyId) : undefined;
    const isPast = item.recurring === 'none' && item.triggerAt <= Date.now();

    return (
      <TouchableOpacity
        onPress={() => openEditModal(item)}
        onLongPress={() => handleDelete(item)}
        className={`bg-card rounded-xl p-4 mb-2 border flex-row items-center ${
          isPast ? 'border-gray-100 opacity-60' : 'border-gray-100'
        }`}
      >
        <View className="flex-1 mr-3">
          <Text className="text-text-primary text-sm font-medium mb-1">
            {item.message}
          </Text>
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text className="text-text-muted text-xs">
              {formatDate(item.triggerAt)} • {formatTime(item.triggerAt)}
            </Text>
            <Text className="text-xs text-primary/70">{getRecurringLabel(item.recurring)}</Text>
            {party && (
              <Text className="text-xs text-text-secondary">
                👤 {party.name}
              </Text>
            )}
          </View>
        </View>
        <Switch
          value={item.isActive}
          onValueChange={() => toggleReminder(item.id)}
          trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
          thumbColor={item.isActive ? '#1A56DB' : '#9CA3AF'}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary text-base font-medium">← Back</Text>
        </TouchableOpacity>
        <Text className="text-text-primary text-lg font-bold">Reminders</Text>
        <View className="w-12" />
      </View>

      {/* Summary */}
      <View className="mx-4 bg-primary/10 rounded-xl p-4 mb-4">
        <Text className="text-primary text-sm font-medium">
          🔔 {activeReminders.filter((r) => r.isActive).length} active reminder
          {activeReminders.filter((r) => r.isActive).length !== 1 ? 's' : ''}
        </Text>
      </View>

      {activeReminders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl mb-3">🔔</Text>
          <Text className="text-text-secondary text-sm text-center">
            No reminders yet.{'\n'}Add one to stay on top of payments!
          </Text>
        </View>
      ) : (
        <FlatList
          data={activeReminders}
          keyExtractor={(item) => item.id}
          renderItem={renderReminder}
          contentContainerClassName="px-4 pb-24"
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={openAddModal}
        className="absolute bottom-6 right-5 bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg"
        style={{ elevation: 5 }}
      >
        <Text className="text-white text-2xl font-light">+</Text>
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => { setShowAddModal(false); resetForm(); }}
      >
        <SafeAreaView className="flex-1 bg-background">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
          >
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
              <TouchableOpacity onPress={() => { setShowAddModal(false); resetForm(); }}>
                <Text className="text-text-secondary text-base">Cancel</Text>
              </TouchableOpacity>
              <Text className="text-text-primary text-lg font-bold">
                {editingReminder ? 'Edit Reminder' : 'Add Reminder'}
              </Text>
              <TouchableOpacity onPress={handleSave}>
                <Text className="text-primary text-base font-bold">Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              className="flex-1 px-5"
              contentContainerClassName="pb-8 pt-4"
              keyboardShouldPersistTaps="handled"
            >
              {/* Message */}
              <Text className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">
                Reminder Message
              </Text>
              <TextInput
                className="bg-card rounded-xl px-4 py-4 text-text-primary text-base border border-gray-200 mb-5"
                value={message}
                onChangeText={setMessage}
                placeholder="e.g. Collect payment from Ramesh"
                placeholderTextColor="#9CA3AF"
                multiline
              />

              {/* Date */}
              <Text className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">
                Date (DD/MM/YYYY)
              </Text>
              <TextInput
                className="bg-card rounded-xl px-4 py-4 text-text-primary text-base border border-gray-200 mb-5"
                value={triggerDate}
                onChangeText={setTriggerDate}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />

              {/* Time */}
              <Text className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">
                Time (HH:MM, 24h format)
              </Text>
              <TextInput
                className="bg-card rounded-xl px-4 py-4 text-text-primary text-base border border-gray-200 mb-5"
                value={triggerTime}
                onChangeText={setTriggerTime}
                placeholder="09:00"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />

              {/* Recurring */}
              <Text className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">
                Repeat
              </Text>
              <View className="flex-row gap-2 mb-6">
                {(
                  [
                    { key: 'none', label: '📌 One-time' },
                    { key: 'weekly', label: '🔄 Weekly' },
                    { key: 'monthly', label: '📅 Monthly' },
                  ] as { key: 'none' | 'weekly' | 'monthly'; label: string }[]
                ).map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => setRecurring(opt.key)}
                    className={`flex-1 py-3 rounded-xl items-center border ${
                      recurring === opt.key
                        ? 'bg-primary/10 border-primary'
                        : 'bg-card border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        recurring === opt.key ? 'text-primary' : 'text-text-secondary'
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Link to Party */}
              <Text className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">
                Link to Party (Optional)
              </Text>
              <TouchableOpacity
                onPress={() => setShowPartyPicker(true)}
                className={`bg-card rounded-xl px-4 py-4 border mb-5 flex-row items-center justify-between ${
                  selectedParty ? 'border-primary' : 'border-gray-200'
                }`}
              >
                <Text
                  className={`text-base ${
                    selectedParty ? 'text-text-primary font-medium' : 'text-text-muted'
                  }`}
                >
                  {selectedParty ? `👤 ${selectedParty.name}` : 'Select a party...'}
                </Text>
                {selectedParty && (
                  <TouchableOpacity onPress={() => setSelectedPartyId(null)}>
                    <Text className="text-text-muted text-lg">✕</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>

        {/* Party Picker Modal */}
        <Modal
          visible={showPartyPicker}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowPartyPicker(false)}
        >
          <SafeAreaView className="flex-1 bg-background">
            <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
              <TouchableOpacity onPress={() => setShowPartyPicker(false)}>
                <Text className="text-text-secondary text-base">Cancel</Text>
              </TouchableOpacity>
              <Text className="text-text-primary text-lg font-bold">Select Party</Text>
              <View className="w-16" />
            </View>
            <FlatList
              data={activeParties}
              keyExtractor={(item) => item.id}
              contentContainerClassName="px-4 pt-4 pb-8"
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedPartyId(item.id);
                    setShowPartyPicker(false);
                  }}
                  className="bg-card rounded-xl p-4 mb-2 border border-gray-100 flex-row items-center"
                >
                  <Text className="text-xl mr-3">👤</Text>
                  <View className="flex-1">
                    <Text className="text-text-primary text-sm font-medium">{item.name}</Text>
                    <Text className="text-text-muted text-xs capitalize">{item.type}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="items-center pt-12">
                  <Text className="text-text-muted text-sm">No parties yet</Text>
                </View>
              }
            />
          </SafeAreaView>
        </Modal>
      </Modal>
    </SafeAreaView>
  );
}
