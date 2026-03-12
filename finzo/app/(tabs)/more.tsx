import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBalance } from '../../hooks/useBalance';

export default function MoreScreen() {
  const { balanceFormatted } = useBalance();

  const menuItems = [
    { emoji: '💰', label: 'Update Balance', sublabel: `Current: ${balanceFormatted}`, available: false },
    { emoji: '🔔', label: 'Reminders', sublabel: 'Milestone 5', available: false },
    { emoji: '📊', label: 'Reports', sublabel: 'Milestone 5', available: false },
    { emoji: '🤖', label: 'AI Assistant', sublabel: 'Milestone 7', available: false },
    { emoji: '☁️', label: 'Backup & Sync', sublabel: 'Milestone 6', available: false },
    { emoji: '🔒', label: 'App Lock', sublabel: 'Milestone 6', available: false },
    { emoji: 'ℹ️', label: 'About FINZO', sublabel: 'v1.0.0', available: false },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-4 pb-3">
        <Text className="text-text-primary text-xl font-bold">More</Text>
      </View>
      <View className="px-4 mt-2">
        {menuItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() =>
              Alert.alert('Coming Soon', `${item.label} will be available in a future update.`)
            }
            className="bg-card rounded-xl p-4 mb-2 flex-row items-center border border-gray-100"
          >
            <Text className="text-xl mr-4">{item.emoji}</Text>
            <View className="flex-1">
              <Text className="text-text-primary text-sm font-medium">
                {item.label}
              </Text>
              <Text className="text-text-muted text-xs">{item.sublabel}</Text>
            </View>
            <Text className="text-text-muted text-lg">›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
