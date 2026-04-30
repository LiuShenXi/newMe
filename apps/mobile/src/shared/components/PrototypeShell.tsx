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
      <LinearGradient colors={['#091411', '#060B0A', '#030605']} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />
      <View style={styles.cyanBloomTop} />
      <View style={styles.greenBloomBottom} />
      <View style={styles.gridLayer} />
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
    gap: 12,
    paddingBottom: 106,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.045)',
    borderColor: 'rgba(167, 243, 208, 0.10)',
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 48,
  },
  cyanBloomTop: {
    backgroundColor: 'rgba(37, 255, 219, 0.12)',
    borderRadius: 180,
    height: 250,
    left: '18%',
    position: 'absolute',
    top: -70,
    width: 250,
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
  gridLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  root: {
    backgroundColor: '#07110F',
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
    height: 20,
    marginBottom: 12,
    paddingHorizontal: 1,
  },
  statusText: {
    color: 'rgba(226, 232, 240, 0.78)',
    fontSize: 13,
    lineHeight: 18,
  },
});
