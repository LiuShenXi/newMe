import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fontWeights, lineHeights, radii } from '../../../shared/theme';

interface EnergyOrbProps {
  charging: boolean;
  value: number;
}

const bubbleSpecs = Array.from({ length: 10 }, (_, index) => ({
  bottom: 14 + (index % 5) * 18,
  delay: index * 80,
  left: 44 + (index % 4) * 38,
  opacity: 0.46 - index * 0.026,
  size: 10 + (index % 4) * 7,
}));

export function EnergyOrb({ charging, value }: EnergyOrbProps) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!charging) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { duration: 580, toValue: 1, useNativeDriver: true }),
        Animated.timing(pulse, { duration: 580, toValue: 0, useNativeDriver: true }),
      ]),
      { iterations: 2 },
    );

    animation.start();
    return () => animation.stop();
  }, [charging, pulse]);

  const auraScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const coreScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] });

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.aura, charging ? styles.auraCharging : null, { transform: [{ scale: auraScale }] }]} />
      <Animated.View style={[styles.core, charging ? styles.coreCharging : null, { transform: [{ scale: coreScale }] }]} />
      <View style={styles.shadow} />
      {bubbleSpecs.map((bubble) => (
        <View
          key={`${bubble.left}-${bubble.bottom}`}
          style={[
            styles.bubble,
            {
              bottom: bubble.bottom,
              height: bubble.size,
              left: bubble.left,
              opacity: charging ? bubble.opacity + 0.18 : bubble.opacity,
              width: bubble.size,
            },
          ]}
        />
      ))}
      <View style={styles.textWrap}>
        <Text style={styles.value}>
          {value}
          <Text style={styles.percent}>%</Text>
        </Text>
        <Text style={styles.label}>本周能量</Text>
        <Text style={[styles.status, charging ? styles.statusCharging : null]}>
          {charging ? '能量注入中' : '静默充能中'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  aura: {
    backgroundColor: 'rgba(104, 211, 190, 0.13)',
    borderRadius: radii.pill,
    height: 250,
    position: 'absolute',
    width: 250,
  },
  auraCharging: {
    backgroundColor: 'rgba(254, 240, 138, 0.16)',
  },
  bubble: {
    backgroundColor: 'rgba(165, 243, 252, 0.12)',
    borderColor: 'rgba(207, 250, 254, 0.40)',
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    position: 'absolute',
  },
  core: {
    backgroundColor: 'rgba(18, 42, 37, 0.62)',
    borderColor: 'rgba(207, 250, 254, 0.42)',
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    height: 224,
    position: 'absolute',
    shadowColor: '#4DFFE6',
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.42,
    shadowRadius: 34,
    width: 224,
  },
  coreCharging: {
    backgroundColor: '#172316',
    shadowColor: '#FACC15',
    shadowOpacity: 0.48,
  },
  label: {
    color: 'rgba(253, 230, 138, 0.90)',
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.xs,
    marginTop: 10,
  },
  percent: {
    color: 'rgba(207, 250, 254, 0.90)',
    fontSize: 24,
  },
  shadow: {
    backgroundColor: 'rgba(94, 234, 212, 0.20)',
    borderRadius: radii.pill,
    bottom: 8,
    height: 32,
    position: 'absolute',
    width: 160,
  },
  status: {
    alignSelf: 'center',
    borderColor: 'rgba(207, 250, 254, 0.20)',
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    color: 'rgba(236, 254, 255, 0.70)',
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusCharging: {
    backgroundColor: 'rgba(254, 243, 199, 0.10)',
    borderColor: 'rgba(254, 243, 199, 0.40)',
    color: '#FFFBEB',
  },
  textWrap: {
    alignItems: 'center',
    position: 'relative',
  },
  value: {
    color: colors.text,
    fontSize: 64,
    fontWeight: fontWeights.regular,
    lineHeight: 68,
  },
  wrap: {
    alignItems: 'center',
    height: 270,
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'relative',
    width: 270,
  },
});
