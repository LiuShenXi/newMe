import { StyleSheet, Text, View } from 'react-native';

export default function TreeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>反馈</Text>
      <Text style={styles.title}>成长树</Text>
      <Text style={styles.subtitle}>年度成长树、果实和荣誉层会在 C9 接入。</Text>
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
