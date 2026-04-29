import { StyleSheet, Text, View } from 'react-native';

export default function TodoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>执行</Text>
      <Text style={styles.title}>今日清单</Text>
      <Text style={styles.subtitle}>今日任务、新增、勾选和本周入口会在 C7 接入。</Text>
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
  subtitle: {
    color: 'rgba(255, 255, 255, 0.62)',
    fontSize: 16,
    marginTop: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
});
