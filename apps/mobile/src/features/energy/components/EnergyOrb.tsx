import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { fontWeights, radii, prototypeNumberFont } from '../../../shared/theme';

interface EnergyOrbProps {
  charging: boolean;
  value: number;
}

const bubbleSpecs = Array.from({ length: 7 }, (_, index) => ({
  bottom: 12 + (index % 5) * 20,
  left: 42 + (index % 4) * 40,
  opacity: 0.42 - index * 0.026,
  size: 16 + index * 5,
}));

const coreGradient = {
  backgroundImage:
    'radial-gradient(circle at 45% 38%, rgba(121, 255, 234, .22), rgba(15, 32, 38, .70) 50%, rgba(5, 12, 13, .95) 72%)',
  boxShadow:
    '0 0 42px rgba(77, 255, 230, .28), inset 0 -28px 42px rgba(95, 255, 215, .22), inset 0 18px 60px rgba(255, 255, 255, .07)',
  filter: 'none',
} as never;

const auraBlur = {
  filter: 'blur(40px)',
} as never;

const shadowBlur = {
  filter: 'blur(20px)',
} as never;

const bubbleShadow = {
  boxShadow: 'inset 0 -8px 18px rgba(74, 255, 224, .24), 0 0 20px rgba(74, 255, 224, .25)',
} as never;

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
      <Animated.View style={[styles.aura, auraBlur, charging ? styles.auraCharging : null, { transform: [{ scale: auraScale }] }]} />
      <Animated.View style={[styles.core, coreGradient, charging ? styles.coreCharging : null, { transform: [{ scale: coreScale }] }]} />
      <View style={[styles.shadow, shadowBlur]} />
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
            bubbleShadow,
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
    backgroundColor: 'rgba(165, 243, 252, 0.10)',
    borderRadius: radii.pill,
    height: 242,
    position: 'absolute',
    width: 242,
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
    backgroundColor: 'rgba(15, 32, 38, 0.70)',
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
    fontSize: 13,
    fontWeight: fontWeights.semibold,
    lineHeight: 16,
    marginTop: 12,
  },
  percent: {
    color: 'rgba(207, 250, 254, 0.90)',
    fontSize: 24,
  },
  shadow: {
    backgroundColor: 'rgba(165, 243, 252, 0.40)',
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
    fontSize: 12,
    lineHeight: 16,
    marginTop: 12,
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
    ...prototypeNumberFont,
    color: '#FFFFFF',
    fontSize: 58,
    lineHeight: 58,
  },
  wrap: {
    alignItems: 'center',
    height: 242,
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'relative',
    width: 242,
  },
});
