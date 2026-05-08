import { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import { StyleSheet, Text, View } from 'react-native';

import { fontWeights, radii, prototypeNumberFont } from '../../../shared/theme';

declare const require: (name: string) => Record<string, any>;

interface EnergyOrbProps {
  charging: boolean;
  value: number;
}

interface BubbleSpec {
  bottom: number;
  index: number;
  left: number;
  opacity: number;
  size: number;
}

const ORB_SIZE = 242;
const CANVAS_PAD = 48;
const CANVAS_SIZE = ORB_SIZE + CANVAS_PAD * 2;
const ORB_CENTER = ORB_SIZE / 2;
const CANVAS_CENTER = ORB_CENTER + CANVAS_PAD;
const CORE_SIZE = 224;
const CORE_RADIUS = CORE_SIZE / 2;
const CORE_OFFSET = (ORB_SIZE - CORE_SIZE) / 2;
const CHARGE_DURATION = 1250;

const bubbleSpecs: BubbleSpec[] = Array.from({ length: 7 }, (_, index) => ({
  bottom: 12 + (index % 5) * 20,
  index,
  left: 42 + (index % 4) * 40,
  opacity: 0.42 - index * 0.026,
  size: 16 + index * 5,
}));

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function useChargeElapsed(charging: boolean) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!charging) {
      setElapsed(0);
      return undefined;
    }

    const startedAt = Date.now();
    let frame = requestAnimationFrame(function tick() {
      setElapsed((Date.now() - startedAt) % CHARGE_DURATION);
      frame = requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(frame);
  }, [charging]);

  return elapsed;
}

function EnergyBubble({
  bottom,
  charging,
  elapsed,
  index,
  left,
  opacity,
  skia,
  size,
}: BubbleSpec & { charging: boolean; elapsed: number; skia: Record<string, any> }) {
  const { BlurMask, Circle, Group, RadialGradient, vec } = skia;
  const baseCx = CANVAS_PAD + left + size / 2;
  const baseCy = CANVAS_PAD + ORB_SIZE - bottom - size / 2;
  const baseRadius = size / 2;
  const delayedElapsed = charging ? (elapsed - index * 90 + CHARGE_DURATION) % CHARGE_DURATION : 0;
  const progress = charging ? easeOutCubic(delayedElapsed / CHARGE_DURATION) : 0;
  const animatedCy = charging ? baseCy + 18 - progress * 108 : baseCy;
  const animatedRadius = charging ? baseRadius * (0.8 + progress * 0.35) : baseRadius;
  const animatedOpacity =
    charging && progress > 0.35 ? 0.7 * (1 - (progress - 0.35) / 0.65) : charging ? 0.12 + progress * 0.58 : opacity;

  return (
    <Group opacity={animatedOpacity}>
      <Circle
        cx={baseCx}
        cy={animatedCy}
        r={animatedRadius}
        color="rgba(165, 243, 252, 0.10)"
      >
        <RadialGradient
          c={vec(baseCx - baseRadius * 0.18, baseCy - baseRadius * 0.22)}
          colors={['rgba(207, 250, 254, 0.30)', 'rgba(165, 243, 252, 0.13)', 'rgba(7, 17, 15, 0.02)']}
          positions={[0, 0.62, 1]}
          r={baseRadius * 1.25}
        />
      </Circle>
      <Circle
        cx={baseCx}
        cy={animatedCy}
        r={animatedRadius}
        color="rgba(207, 250, 254, 0.22)"
        style="stroke"
        strokeWidth={1}
      />
      <Circle
        cx={baseCx}
        cy={animatedCy}
        r={animatedRadius}
        color="rgba(74, 255, 224, 0.12)"
      >
        <BlurMask blur={8} style="normal" />
      </Circle>
    </Group>
  );
}

function EnergyText({ charging, value }: EnergyOrbProps) {
  return (
    <View style={styles.textWrap}>
      <Text style={styles.value}>
        {value}
        <Text style={styles.percent}>%</Text>
      </Text>
      <Text style={styles.label}>本周能量</Text>
      <Text style={[styles.status, charging ? styles.statusCharging : null]} testID="energy-orb-status">
        {charging ? '能量注入中' : '静默充能中'}
      </Text>
    </View>
  );
}

function FallbackEnergyBubble({
  bottom,
  charging,
  elapsed,
  index,
  left,
  opacity,
  size,
}: BubbleSpec & { charging: boolean; elapsed: number }) {
  const delayedElapsed = charging ? (elapsed - index * 90 + CHARGE_DURATION) % CHARGE_DURATION : 0;
  const progress = charging ? easeOutCubic(delayedElapsed / CHARGE_DURATION) : 0;
  const translateY = charging ? 18 - progress * 108 : 0;
  const scale = charging ? 0.8 + progress * 0.35 : 1;
  const bubbleOpacity =
    charging && progress > 0.35 ? 0.7 * (1 - (progress - 0.35) / 0.65) : charging ? 0.12 + progress * 0.58 : opacity;

  return (
    <View
      style={[
        styles.fallbackBubble,
        {
          bottom,
          height: size,
          left,
          opacity: bubbleOpacity,
          transform: [{ translateY }, { scale }],
          width: size,
        },
      ]}
    />
  );
}

function FallbackEnergyOrb({ charging, elapsed, value }: EnergyOrbProps & { elapsed: number }) {
  const phase = charging ? elapsed / CHARGE_DURATION : 0;
  const pulse = charging ? 1 - Math.abs(phase * 2 - 1) : 0;

  return (
    <View style={styles.wrap} testID="energy-orb">
      <View style={[styles.fallbackAura, { opacity: 0.55 + pulse * 0.35, transform: [{ scale: 1 + pulse * 0.12 }] }]} />
      <View style={styles.fallbackShadow} />
      <View style={[styles.fallbackCoreGlow, { opacity: 0.24 + pulse * 0.24 }]} />
      <View style={[styles.fallbackCore, { transform: [{ scale: 1 + pulse * 0.025 }] }]} />
      <View style={styles.fallbackCoreHighlight} />
      {bubbleSpecs.map((bubble) => (
        <FallbackEnergyBubble key={`${bubble.left}-${bubble.bottom}`} {...bubble} charging={charging} elapsed={elapsed} />
      ))}
      <EnergyText charging={charging} value={value} />
    </View>
  );
}

export function EnergyOrb({ charging, value }: EnergyOrbProps) {
  const elapsed = useChargeElapsed(charging);
  const isExpoGo = Constants.appOwnership === 'expo';

  if (isExpoGo) {
    return <FallbackEnergyOrb charging={charging} elapsed={elapsed} value={value} />;
  }

  const { Canvas, Circle, RadialGradient, vec } = require('@shopify/react-native-skia');
  const skia = require('@shopify/react-native-skia');
  const phase = charging ? elapsed / CHARGE_DURATION : 0;
  const pulse = charging ? 1 - Math.abs(phase * 2 - 1) : 0;
  const coreRadius = CORE_RADIUS * (1 + pulse * 0.025);

  return (
    <View style={styles.wrap} testID="energy-orb">
      <Canvas opaque={false} pointerEvents="none" style={styles.canvas}>
        <Circle cx={CANVAS_CENTER} cy={CANVAS_CENTER} r={coreRadius} color="rgba(15, 32, 38, 0.54)">
          <RadialGradient
            c={vec(CANVAS_PAD + CORE_OFFSET + CORE_SIZE * 0.45, CANVAS_PAD + CORE_OFFSET + CORE_SIZE * 0.38)}
            colors={[
              'rgba(121, 255, 234, 0.20)',
              'rgba(15, 32, 38, 0.58)',
              'rgba(5, 12, 13, 0.84)',
              'rgba(5, 12, 13, 0.92)',
            ]}
            positions={[0, 0.5, 0.72, 1]}
            r={148}
          />
        </Circle>

        <Circle cx={CANVAS_CENTER} cy={CANVAS_CENTER} r={coreRadius} color="rgba(95, 255, 215, 0.10)">
          <RadialGradient
            c={vec(CANVAS_CENTER, CANVAS_PAD + 190)}
            colors={['rgba(95, 255, 215, 0.16)', 'rgba(95, 255, 215, 0.05)', 'rgba(95, 255, 215, 0)']}
            positions={[0, 0.58, 1]}
            r={92}
          />
        </Circle>

        <Circle cx={CANVAS_CENTER} cy={CANVAS_CENTER} r={coreRadius} color="rgba(255, 255, 255, 0.04)">
          <RadialGradient
            c={vec(CANVAS_PAD + 104, CANVAS_PAD + 76)}
            colors={['rgba(255, 255, 255, 0.10)', 'rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0)']}
            positions={[0, 0.55, 1]}
            r={108}
          />
        </Circle>

        <Circle
          cx={CANVAS_CENTER}
          cy={CANVAS_CENTER}
          r={coreRadius}
          color="rgba(207, 250, 254, 0.18)"
          style="stroke"
          strokeWidth={1}
        />

        {bubbleSpecs.map((bubble) => (
          <EnergyBubble key={`${bubble.left}-${bubble.bottom}`} {...bubble} charging={charging} elapsed={elapsed} skia={skia} />
        ))}
      </Canvas>

      <EnergyText charging={charging} value={value} />
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    height: CANVAS_SIZE,
    left: -CANVAS_PAD,
    position: 'absolute',
    top: -CANVAS_PAD,
    width: CANVAS_SIZE,
  },
  fallbackAura: {
    backgroundColor: 'rgba(165, 243, 252, 0.16)',
    borderRadius: 122,
    height: 244,
    position: 'absolute',
    width: 244,
  },
  fallbackBubble: {
    backgroundColor: 'rgba(165, 243, 252, 0.18)',
    borderColor: 'rgba(207, 250, 254, 0.42)',
    borderRadius: 99,
    borderWidth: StyleSheet.hairlineWidth,
    position: 'absolute',
  },
  fallbackCore: {
    backgroundColor: 'rgba(5, 12, 13, 0.96)',
    borderColor: 'rgba(207, 250, 254, 0.45)',
    borderRadius: CORE_RADIUS,
    borderWidth: StyleSheet.hairlineWidth,
    height: CORE_SIZE,
    position: 'absolute',
    width: CORE_SIZE,
  },
  fallbackCoreGlow: {
    backgroundColor: 'rgba(77, 255, 230, 0.40)',
    borderRadius: CORE_RADIUS,
    height: CORE_SIZE,
    position: 'absolute',
    width: CORE_SIZE,
  },
  fallbackCoreHighlight: {
    backgroundColor: 'rgba(121, 255, 234, 0.16)',
    borderRadius: 58,
    height: 116,
    left: 70,
    position: 'absolute',
    top: 52,
    width: 116,
  },
  fallbackShadow: {
    backgroundColor: 'rgba(165, 243, 252, 0.22)',
    borderRadius: 80,
    bottom: 14,
    height: 30,
    opacity: 0.7,
    position: 'absolute',
    width: 160,
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
    alignSelf: 'center',
    height: ORB_SIZE,
    justifyContent: 'center',
    position: 'relative',
    width: ORB_SIZE,
  },
});
