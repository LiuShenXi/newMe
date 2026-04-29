import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.title}>NewMe</Text>
      <Text style={styles.subtitle}>移动端壳工程已接入 Expo Router。</Text>
      <Link href="/(tabs)/energy" style={styles.link}>
        进入今日能量
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#f7fbff',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  link: {
    color: '#0f766e',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 24,
  },
  subtitle: {
    color: '#475569',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  title: {
    color: '#0f172a',
    fontSize: 36,
    fontWeight: '800',
  },
});
