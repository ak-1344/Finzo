import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { Colors } from '../../constants/colors';

type TabIconProps = {
  label: string;
  emoji: string;
  color: string;
  focused: boolean;
};

function TabIcon({ label, emoji, color, focused }: TabIconProps) {
  return (
    <View className="items-center justify-center pt-1">
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text
        style={{ color, fontSize: 10, fontWeight: focused ? '700' : '500' }}
        className="mt-0.5"
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.muted,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: '#E5E7EB',
          height: 64,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon label="Home" emoji="🏠" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="cashbook"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon label="Cashbook" emoji="📒" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="parties"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon label="Parties" emoji="👥" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="buckets"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon label="Buckets" emoji="🪣" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon label="More" emoji="⚙️" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
