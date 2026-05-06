import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="energy"
      tabBar={() => null}
      screenOptions={() => ({
        headerShown: false,
      })}
    >
      <Tabs.Screen name="energy" options={{ title: '能量' }} />
      <Tabs.Screen name="todo" options={{ title: '清单' }} />
      <Tabs.Screen name="plan" options={{ title: '计划' }} />
      <Tabs.Screen name="tree" options={{ title: '成长树' }} />
      <Tabs.Screen name="me" options={{ title: '我的' }} />
    </Tabs>
  );
}
