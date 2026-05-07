import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BlurMask, Canvas, Circle, Group, Oval, RadialGradient, vec } from '@shopify/react-native-skia';
import { Easing, useDerivedValue, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';

import { fontWeights, radii, prototypeNumberFont } from '../../../shared/theme';

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

function EnergyBubble({ bottom, charging, index, left, opacity, size }: BubbleSpec & { charging: boolean }) {
  const progress = useSharedValue(0);
  const baseCx = CANVAS_PAD + left + size / 2;
  const baseCy = CANVAS_PAD + ORB_SIZE - bottom - size / 2;
  const baseRadius = size / 2;

  useEffect(() => {
    if (!charging) {
      progress.value = withTiming(0, { duration: 120 });
      return;
    }

    progress.value = 0;
    progress.value = withDelay(
      index * 90,
      withSequence(
        withTiming(1, {
          duration: CHARGE_DURATION,
          easing: Easing.out(Easing.cubic),
        }),
        withTiming(0, { duration: 0 }),
      ),
    );
  }, [charging, index, progress]);

  const animatedCy = useDerivedValue(() => baseCy + 18 - progress.value * 108);
  const animatedRadius = useDerivedValue(() => baseRadius * (0.8 + progress.value * 0.35));
  const animatedOpacity = useDerivedValue(() => {
    if (progress.value <= 0) {
      return opacity;
    }

    if (progress.value <= 0.35) {
      return 0.12 + (0.7 - 0.12) * (progress.value / 0.35);
    }

    return 0.7 * (1 - (progress.value - 0.35) / 0.65);
  });

  return (
    <Group opacity={charging ? animatedOpacity : opacity}>
      <Circle
        cx={baseCx}
        cy={charging ? animatedCy : baseCy}
        r={charging ? animatedRadius : baseRadius}
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
        cy={charging ? animatedCy : baseCy}
        r={charging ? animatedRadius : baseRadius}
        color="rgba(207, 250, 254, 0.42)"
        style="stroke"
        strokeWidth={1}
      />
      <Circle
        cx={baseCx}
        cy={charging ? animatedCy : baseCy}
        r={charging ? animatedRadius : baseRadius}
        color="rgba(74, 255, 224, 0.22)"
      >
        <BlurMask blur={8} style="normal" />
      </Circle>
    </Group>
  );
}

export function EnergyOrb({ charging, value }: EnergyOrbProps) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (!charging) {
      pulse.value = withTiming(0, { duration: 160 });
      return;
    }

    pulse.value = withSequence(
      withTiming(1, {
        duration: CHARGE_DURATION / 2,
        easing: Easing.inOut(Easing.cubic),
      }),
      withTiming(0, {
        duration: CHARGE_DURATION / 2,
        easing: Easing.inOut(Easing.cubic),
      }),
    );
  }, [charging, pulse]);

  const auraOpacity = useDerivedValue(() => 0.55 + pulse.value * 0.35);
  const auraRadius = useDerivedValue(() => 104 + pulse.value * 12);
  const coreRadius = useDerivedValue(() => CORE_RADIUS * (1 + pulse.value * 0.025));
  const coreGlowOpacity = useDerivedValue(() => 0.24 + pulse.value * 0.24);

  return (
    <View style={styles.wrap} testID="energy-orb">
      <Canvas pointerEvents="none" style={styles.canvas}>
        <Group opacity={auraOpacity}>
          <Circle cx={CANVAS_CENTER} cy={CANVAS_CENTER} r={auraRadius} color="rgba(165, 243, 252, 0.16)">
            <BlurMask blur={40} style="normal" />
          </Circle>
        </Group>

        <Oval color="rgba(165, 243, 252, 0.34)" height={32} width={160} x={CANVAS_PAD + 41} y={CANVAS_PAD + 202}>
          <BlurMask blur={20} style="normal" />
        </Oval>

        <Group opacity={coreGlowOpacity}>
          <Circle cx={CANVAS_CENTER} cy={CANVAS_CENTER} r={coreRadius} color="rgba(77, 255, 230, 0.40)">
            <BlurMask blur={30} style="normal" />
          </Circle>
        </Group>

        <Circle cx={CANVAS_CENTER} cy={CANVAS_CENTER} r={coreRadius} color="rgba(15, 32, 38, 0.70)">
          <RadialGradient
            c={vec(CANVAS_PAD + CORE_OFFSET + CORE_SIZE * 0.45, CANVAS_PAD + CORE_OFFSET + CORE_SIZE * 0.38)}
            colors={[
              'rgba(121, 255, 234, 0.22)',
              'rgba(15, 32, 38, 0.70)',
              'rgba(5, 12, 13, 0.95)',
              'rgba(5, 12, 13, 0.98)',
            ]}
            positions={[0, 0.5, 0.72, 1]}
            r={148}
          />
        </Circle>

        <Circle cx={CANVAS_CENTER} cy={CANVAS_CENTER} r={coreRadius} color="rgba(95, 255, 215, 0.18)">
          <RadialGradient
            c={vec(CANVAS_CENTER, CANVAS_PAD + 190)}
            colors={['rgba(95, 255, 215, 0.28)', 'rgba(95, 255, 215, 0.08)', 'rgba(95, 255, 215, 0)']}
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
          color="rgba(207, 250, 254, 0.45)"
          style="stroke"
          strokeWidth={1}
        />

        {bubbleSpecs.map((bubble) => (
          <EnergyBubble key={`${bubble.left}-${bubble.bottom}`} {...bubble} charging={charging} />
        ))}
      </Canvas>

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
