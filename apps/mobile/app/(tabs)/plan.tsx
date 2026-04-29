import { StyleSheet, Text, View } from 'react-native';

export default function PlanScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>回看</Text>
      <Text style={styles.title}>计划</Text>
      <Text style={styles.subtitle}>周/月计划与年/季度计划切换会在 C8 接入。</Text>
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
