import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function OnboardingChooseScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>冷启动</Text>
      <Text style={styles.title}>你想怎样开始今年？</Text>
      <Text style={styles.subtitle}>三条路径会在 C5 接入：深度愿景规划、快速规划、手动创建 OKR。</Text>
      <Link href="/(tabs)/energy" style={styles.link}>
        先进入今日能量
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0E1A',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  eyebrow: {
    color: '#00E5A0',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
  },
  link: {
    color: '#00E5A0',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 24,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.62)',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
});
