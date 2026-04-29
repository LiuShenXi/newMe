import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function EnergyScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.title}>今日能量</Text>
      <Text style={styles.subtitle}>C2 会在这里接入正式四 Tab 导航和原型视觉。</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f7fbff',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  subtitle: {
    color: '#475569',
    fontSize: 16,
    marginTop: 8,
  },
  title: {
    color: '#0f172a',
    fontSize: 32,
    fontWeight: '800',
  },
});
