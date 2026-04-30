import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

type TabIconName = keyof typeof Ionicons.glyphMap;

const tabIconByRoute: Record<string, { focused: TabIconName; idle: TabIconName }> = {
  energy: { focused: 'flash', idle: 'flash-outline' },
  todo: { focused: 'checkbox', idle: 'checkbox-outline' },
  plan: { focused: 'calendar', idle: 'calendar-outline' },
  tree: { focused: 'leaf', idle: 'leaf-outline' },
};

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="energy"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#CFFAFE',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: 'rgba(10, 22, 19, 0.85)',
          borderColor: 'rgba(209, 250, 229, 0.10)',
          borderRadius: 26,
          borderTopColor: 'rgba(209, 250, 229, 0.10)',
          borderWidth: 1,
          bottom: 20,
          height: 70,
          left: 20,
          paddingBottom: 8,
          paddingHorizontal: 8,
          paddingTop: 8,
          position: 'absolute',
          right: 20,
          shadowColor: '#000000',
          shadowOpacity: 0.30,
          shadowRadius: 40,
        },
        tabBarActiveBackgroundColor: 'rgba(165, 243, 252, 0.10)',
        tabBarIcon: ({ color, focused, size }) => {
          const icon = tabIconByRoute[route.name] ?? tabIconByRoute.energy;

          return <Ionicons color={color} name={focused ? icon.focused : icon.idle} size={size} />;
        },
        tabBarItemStyle: {
          borderRadius: 16,
          minHeight: 54,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '400',
        },
      })}
    >
      <Tabs.Screen name="energy" options={{ title: '能量' }} />
      <Tabs.Screen name="todo" options={{ title: '清单' }} />
      <Tabs.Screen name="plan" options={{ title: '计划' }} />
      <Tabs.Screen name="tree" options={{ title: '成长树' }} />
    </Tabs>
  );
}
