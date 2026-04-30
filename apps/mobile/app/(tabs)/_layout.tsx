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
        tabBarActiveTintColor: '#00E5A0',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.48)',
        tabBarStyle: {
          backgroundColor: 'rgba(9, 27, 23, 0.92)',
          borderColor: 'rgba(207, 250, 254, 0.13)',
          borderRadius: 28,
          borderTopColor: 'rgba(207, 250, 254, 0.13)',
          borderWidth: 1,
          bottom: 22,
          height: 62,
          left: 20,
          paddingBottom: 7,
          paddingHorizontal: 8,
          paddingTop: 7,
          position: 'absolute',
          right: 20,
          shadowColor: '#000000',
          shadowOpacity: 0.32,
          shadowRadius: 24,
        },
        tabBarActiveBackgroundColor: 'rgba(29, 78, 70, 0.82)',
        tabBarIcon: ({ color, focused, size }) => {
          const icon = tabIconByRoute[route.name] ?? tabIconByRoute.energy;

          return <Ionicons color={color} name={focused ? icon.focused : icon.idle} size={size} />;
        },
        tabBarItemStyle: {
          borderRadius: 20,
          minHeight: 48,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
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
