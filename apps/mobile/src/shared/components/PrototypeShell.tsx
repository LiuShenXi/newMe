import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren } from 'react';
import { ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface PrototypeScreenProps extends PropsWithChildren {
  contentStyle?: StyleProp<ViewStyle>;
  scroll?: boolean;
}

export function PrototypeStatusBar() {
  return (
    <View style={styles.statusBar}>
      <Text style={styles.statusText}>09:07</Text>
      <View style={styles.speaker} />
      <Text style={styles.statusText}>87%</Text>
    </View>
  );
}

export function PrototypeScreen({ children, contentStyle, scroll = true }: PrototypeScreenProps) {
  const content = (
    <View style={[styles.content, contentStyle]}>
      <PrototypeStatusBar />
      {children}
    </View>
  );

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#07140F', '#020605', '#07140F']} locations={[0, 0.56, 1]} style={StyleSheet.absoluteFill} />
      <View style={styles.greenBloomTop} />
      <View style={styles.greenBloomBottom} />
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </View>
  );
}

export function GlassCard({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return (
    <View style={[styles.glassCard, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 106,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  glassCard: {
    backgroundColor: 'rgba(18, 36, 31, 0.72)',
    borderColor: 'rgba(207, 250, 254, 0.15)',
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowColor: '#34D399',
    shadowOpacity: 0.12,
    shadowRadius: 28,
  },
  greenBloomBottom: {
    backgroundColor: 'rgba(20, 184, 166, 0.10)',
    borderRadius: 170,
    bottom: -100,
    height: 250,
    left: -90,
    position: 'absolute',
    width: 250,
  },
  greenBloomTop: {
    backgroundColor: 'rgba(45, 212, 191, 0.14)',
    borderRadius: 180,
    height: 260,
    position: 'absolute',
    right: -120,
    top: 60,
    width: 260,
  },
  root: {
    backgroundColor: '#020605',
    flex: 1,
    overflow: 'hidden',
  },
  scrollContent: {
    minHeight: '100%',
    width: '100%',
  },
  speaker: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
    borderRadius: 999,
    height: 15,
    width: 112,
  },
  statusBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 1,
  },
  statusText: {
    color: 'rgba(226, 232, 240, 0.78)',
    fontSize: 13,
    lineHeight: 18,
  },
});
