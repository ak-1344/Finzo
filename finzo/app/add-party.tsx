import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useParties } from '../hooks/useParties';

export default function AddPartyScreen() {
  const router = useRouter();
  const { addParty } = useParties();

  const [name, setName] = useState('');
  const [type, setType] = useState<'customer' | 'supplier'>('customer');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for this party.');
      return;
    }

    const party = addParty(name.trim(), type);
    // Navigate to the new party's detail page
    router.replace(`/party/${party.id}`);
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
          <Text className="text-text-primary text-lg font-bold">Add Party</Text>
          <View className="w-12" />
        </View>

        <View className="flex-1 px-5 mt-4">
          {/* Type Toggle */}
          <Text className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">
            Party Type
          </Text>
          <View className="flex-row bg-card rounded-xl overflow-hidden border border-gray-200 mb-6">
            <TouchableOpacity
              onPress={() => setType('customer')}
              className={`flex-1 py-4 items-center ${
                type === 'customer' ? 'bg-success' : 'bg-card'
              }`}
            >
              <Text
                className={`text-base font-bold ${
                  type === 'customer' ? 'text-white' : 'text-text-secondary'
                }`}
              >
                👤 Customer
              </Text>
              <Text
                className={`text-xs mt-1 ${
                  type === 'customer' ? 'text-white/70' : 'text-text-muted'
                }`}
              >
                They owe you
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setType('supplier')}
              className={`flex-1 py-4 items-center ${
                type === 'supplier' ? 'bg-danger' : 'bg-card'
              }`}
            >
              <Text
                className={`text-base font-bold ${
                  type === 'supplier' ? 'text-white' : 'text-text-secondary'
                }`}
              >
                🏪 Supplier
              </Text>
              <Text
                className={`text-xs mt-1 ${
                  type === 'supplier' ? 'text-white/70' : 'text-text-muted'
                }`}
              >
                You owe them
              </Text>
            </TouchableOpacity>
          </View>

          {/* Name Input */}
          <Text className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">
            Name
          </Text>
          <TextInput
            className="bg-card rounded-xl px-4 py-4 text-text-primary text-base border border-gray-200 mb-6"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Rahul, Sharma Ji, Office Canteen..."
            placeholderTextColor="#9CA3AF"
            autoFocus
          />

          {/* Info */}
          <View className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <Text className="text-primary text-sm font-medium mb-1">
              💡 How parties work
            </Text>
            <Text className="text-text-secondary text-xs leading-5">
              • <Text className="font-medium">Customer</Text> — someone who owes you money (you gave them something){'\n'}
              • <Text className="font-medium">Supplier</Text> — someone you owe money to (they gave you something){'\n'}
              • You can log "Gave" and "Got" entries for each party{'\n'}
              • The balance updates automatically
            </Text>
          </View>
        </View>

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
            <Text className="text-white text-base font-bold">Add Party</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
