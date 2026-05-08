import Constants from 'expo-constants';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  GestureResponderEvent,
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { fontSizes, fontWeights, lineHeights, radii, spacing } from '../../../shared/theme';

declare const require: (name: string) => Record<string, any>;

interface EnergySliderProps {
  onChange: (value: number) => void;
  value: number;
}

const TRACK_HORIZONTAL_INSET = 8;
const STAGE_HEIGHT = 72;
const TRACK_Y = 18;
const TRACK_HEIGHT = 40;
const TRACK_INNER_PAD = 5;
const PARTICLES = Array.from({ length: 22 }, (_, index) => ({
  id: `particle-${index}`,
  leftRatio: (8 + ((index * 17) % 82)) / 100,
  opacity: 0.24 + (index % 5) * 0.1,
  size: 1.5 + (index % 4) * 0.7,
  top: 26 + ((index * 11) % 18),
}));

function clampEnergy(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function useSweepElapsed(active: boolean) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    let frame = requestAnimationFrame(function tick() {
      const duration = active ? 760 : 1800;
      setElapsed((Date.now() - startedAt) % duration);
      frame = requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(frame);
  }, [active]);

  return elapsed;
}

function getPulse(elapsed: number, active: boolean) {
  const duration = active ? 760 : 1800;
  const phase = duration > 0 ? elapsed / duration : 0;
  return 1 - Math.abs(phase * 2 - 1);
}

function SkiaEnergyBar({
  active,
  elapsed,
  fillWidth,
  safeValue,
  stageWidth,
  tailLeft,
  tailWidth,
}: {
  active: boolean;
  elapsed: number;
  fillWidth: number;
  safeValue: number;
  stageWidth: number;
  tailLeft: number;
  tailWidth: number;
}) {
  const {
    Canvas,
    Circle,
    Group,
    LinearGradient: SkiaLinearGradient,
    RadialGradient,
    RoundedRect,
    vec,
  } = require('@shopify/react-native-skia');
  const trackWidth = Math.max(1, stageWidth - TRACK_HORIZONTAL_INSET * 2);
  const fillX = TRACK_HORIZONTAL_INSET + TRACK_INNER_PAD;
  const fillY = TRACK_Y + TRACK_INNER_PAD;
  const fillHeight = TRACK_HEIGHT - TRACK_INNER_PAD * 2;
  const pulse = getPulse(elapsed, active);
  const sweepSpan = Math.max(56, fillWidth + 18);
  const sweepX = fillX - 48 + sweepSpan * (active ? elapsed / 760 : elapsed / 1800);
  const particleOpacity = safeValue > 0 ? 0.16 + pulse * 0.12 : 0.04;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Canvas opaque={false} pointerEvents="none" style={styles.nativeCanvas}>
        <Group opacity={0.28}>
          <RoundedRect
            color="rgba(250, 204, 21, 0.08)"
            height={TRACK_HEIGHT + 2}
            r={22}
            width={trackWidth + 2}
            x={TRACK_HORIZONTAL_INSET - 1}
            y={TRACK_Y - 1}
          />
        </Group>

        <RoundedRect
          color="rgba(2, 6, 10, 0.72)"
          height={TRACK_HEIGHT}
          r={20}
          width={trackWidth}
          x={TRACK_HORIZONTAL_INSET}
          y={TRACK_Y}
        />
        <RoundedRect
          color="rgba(255, 247, 173, 0.50)"
          height={TRACK_HEIGHT}
          r={20}
          style="stroke"
          strokeWidth={1}
          width={trackWidth}
          x={TRACK_HORIZONTAL_INSET}
          y={TRACK_Y}
        />
        <RoundedRect
          color="rgba(255, 255, 255, 0.09)"
          height={TRACK_HEIGHT - 8}
          r={16}
          style="stroke"
          strokeWidth={1}
          width={trackWidth - 8}
          x={TRACK_HORIZONTAL_INSET + 4}
          y={TRACK_Y + 4}
        />

        <RoundedRect color="#FFD056" height={fillHeight} r={15} width={fillWidth} x={fillX} y={fillY}>
          <SkiaLinearGradient
            colors={['#8B5A12', '#FFE06D', '#FFF6B7', '#FFD056', '#D8941E']}
            end={vec(fillX + Math.max(1, fillWidth), fillY)}
            start={vec(fillX, fillY)}
          />
        </RoundedRect>
        <RoundedRect
          color="rgba(255, 255, 255, 0.34)"
          height={5}
          r={3}
          width={Math.max(1, fillWidth - 38)}
          x={fillX + 16}
          y={fillY + 7}
        />

        <Group opacity={safeValue > 0 ? 0.12 + pulse * 0.1 : 0}>
          <RoundedRect color="rgba(255, 255, 255, 0.12)" height={fillHeight + 8} r={14} width={28} x={sweepX} y={fillY - 4}>
            <SkiaLinearGradient
              colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.34)', 'rgba(255, 255, 255, 0)']}
              positions={[0, 0.5, 1]}
              end={vec(sweepX + 28, fillY)}
              start={vec(sweepX, fillY)}
            />
          </RoundedRect>
        </Group>

        <Group opacity={safeValue > 0 ? 0.12 + pulse * 0.12 : 0}>
          <RoundedRect
            color="rgba(103, 232, 249, 0.14)"
            height={fillHeight + 4}
            r={18}
            width={tailWidth}
            x={tailLeft}
            y={fillY - 2}
          >
            <SkiaLinearGradient
              colors={[
                'rgba(103, 232, 249, 0)',
                'rgba(103, 232, 249, 0.16)',
                'rgba(255, 247, 173, 0.22)',
                'rgba(250, 204, 21, 0)',
              ]}
              end={vec(tailLeft + Math.max(1, tailWidth), fillY)}
              start={vec(tailLeft, fillY)}
            />
          </RoundedRect>
        </Group>

        <Group opacity={safeValue > 0 ? 1 : 0}>
          <Circle cx={fillX + Math.max(0, fillWidth - 8)} cy={TRACK_Y + TRACK_HEIGHT / 2} r={9} color="rgba(255, 235, 99, 0.72)">
            <RadialGradient
              c={vec(fillX + Math.max(0, fillWidth - 8), TRACK_Y + TRACK_HEIGHT / 2)}
              colors={['rgba(255, 255, 255, 0.76)', 'rgba(250, 204, 21, 0.42)', 'rgba(250, 204, 21, 0)']}
              positions={[0, 0.58, 1]}
              r={16}
            />
          </Circle>
          <Circle cx={fillX + Math.max(0, fillWidth - 8)} cy={TRACK_Y + TRACK_HEIGHT / 2} r={12} color="rgba(250, 204, 21, 0.18)" />
        </Group>

        <Group opacity={particleOpacity}>
          {PARTICLES.map((particle) => (
            <Circle
              color="#FFF7AD"
              cx={fillX + fillWidth * particle.leftRatio}
              cy={particle.top}
              key={particle.id}
              r={safeValue > 0 ? particle.size : 0}
            />
          ))}
        </Group>
      </Canvas>
    </View>
  );
}

function FallbackEnergySlider({
  active,
  fillWidth,
  particles,
  pulseOpacity,
  safeValue,
  sweepTranslate,
  tailLeft,
  tailWidth,
}: {
  active: boolean;
  fillWidth: number;
  particles: typeof PARTICLES;
  pulseOpacity: Animated.AnimatedInterpolation<number>;
  safeValue: number;
  sweepTranslate: Animated.AnimatedInterpolation<number>;
  tailLeft: number;
  tailWidth: number;
}) {
  return (
    <>
      <View style={[styles.hudLine, styles.hudLineTopLeft]} testID="energy-bar-hud-line" />
      <View style={[styles.hudLine, styles.hudLineTopRight]} testID="energy-bar-hud-line" />
      <View style={[styles.hudLine, styles.hudLineBottomLeft]} testID="energy-bar-hud-line" />
      <View style={[styles.hudLine, styles.hudLineBottomRight]} testID="energy-bar-hud-line" />

      <View style={[styles.hudCorner, styles.hudCornerLeftTop]} testID="energy-bar-hud-corner" />
      <View style={[styles.hudCorner, styles.hudCornerLeftBottom]} testID="energy-bar-hud-corner" />
      <View style={[styles.hudCorner, styles.hudCornerRightTop]} testID="energy-bar-hud-corner" />
      <View style={[styles.hudCorner, styles.hudCornerRightBottom]} testID="energy-bar-hud-corner" />

      <View style={styles.outerGlow} />
      <View style={styles.trackFrame} testID="energy-bar-track">
        <View style={styles.trackInner} />
        <ExpoLinearGradient
          colors={['#8B5A12', '#FFE06D', '#FFF6B7', '#FFD056', '#D8941E']}
          end={{ x: 1, y: 0 }}
          start={{ x: 0, y: 0 }}
          style={[styles.fill, { width: fillWidth }]}
          testID="energy-bar-fill"
        >
          <View style={styles.fillCore} />
          <Animated.View
            style={[
              styles.sweep,
              {
                opacity: safeValue > 0 ? pulseOpacity : 0,
                transform: [{ translateX: sweepTranslate }],
              },
            ]}
          />
          {particles.map((particle) => (
            <View
              key={particle.id}
              style={[
                styles.particle,
                {
                  height: particle.size,
                  left: fillWidth * particle.leftRatio,
                  opacity: safeValue > 0 ? particle.opacity : 0,
                  top: particle.top - 18,
                  width: particle.size,
                },
              ]}
              testID="energy-bar-particle"
            />
          ))}
        </ExpoLinearGradient>
        <Animated.View
          style={[
            styles.tailMist,
            {
              left: tailLeft,
              opacity: safeValue > 0 ? pulseOpacity : 0,
              width: tailWidth,
            },
          ]}
          testID="energy-bar-tail"
        >
          <ExpoLinearGradient
            colors={['rgba(103, 232, 249, 0)', 'rgba(103, 232, 249, 0.26)', 'rgba(255, 247, 173, 0.34)', 'rgba(250, 204, 21, 0)']}
            end={{ x: 1, y: 0 }}
            start={{ x: 0, y: 0 }}
            style={styles.tailFade}
            testID="energy-bar-tail-fade"
          />
        </Animated.View>
        <View
          style={[styles.capGlow, { left: TRACK_INNER_PAD + Math.max(0, fillWidth - 8), opacity: safeValue > 0 ? 1 : 0 }]}
          testID="plasma-energy-nozzle"
        />
      </View>
    </>
  );
}

export function EnergySlider({ onChange, value }: EnergySliderProps) {
  const [stageWidth, setStageWidth] = useState(1);
  const [active, setActive] = useState(false);
  const sweep = useRef(new Animated.Value(0)).current;
  const safeValue = clampEnergy(value);
  const trackWidth = Math.max(1, stageWidth - TRACK_HORIZONTAL_INSET * 2);
  const fillWidth = Math.max(safeValue > 0 ? 2 : 1, (trackWidth * safeValue) / 100);
  const tailWidth = safeValue > 0 ? Math.min(76, Math.max(20, fillWidth * 0.22)) : 1;
  const tailLeft = TRACK_HORIZONTAL_INSET + TRACK_INNER_PAD + Math.max(0, fillWidth - tailWidth);
  const particles = useMemo(() => PARTICLES, []);
  const elapsed = useSweepElapsed(active);
  const isExpoGo = Constants.appOwnership === 'expo';
  const sweepTranslate = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: [-48, Math.max(56, fillWidth + 18)],
  });
  const pulseOpacity = sweep.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.45, active ? 0.95 : 0.72, 0.45],
  });

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(sweep, {
        duration: active ? 760 : 1800,
        easing: Easing.inOut(Easing.quad),
        toValue: 1,
        useNativeDriver: true,
      }),
    );

    sweep.setValue(0);
    loop.start();

    return () => loop.stop();
  }, [active, sweep]);

  function handleLayout(event: LayoutChangeEvent) {
    setStageWidth(Math.max(1, event.nativeEvent.layout.width));
  }

  function updateFromEvent(event: GestureResponderEvent) {
    const locationX = event.nativeEvent.locationX;

    if (!Number.isFinite(locationX) || trackWidth <= 0) {
      return;
    }

    const xInTrack = Math.max(0, Math.min(trackWidth, locationX - TRACK_HORIZONTAL_INSET));
    onChange(clampEnergy((xInTrack / trackWidth) * 100));
  }

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          setActive(true);
          updateFromEvent(event);
        },
        onPanResponderMove: updateFromEvent,
        onPanResponderRelease: () => setActive(false),
        onPanResponderTerminate: () => setActive(false),
        onStartShouldSetPanResponder: () => true,
      }),
    [trackWidth],
  );

  return (
    <View style={styles.card} testID="energy-bar-card">
      <View style={styles.header}>
        <Text style={styles.title}>今日能量条</Text>
        <Text style={styles.value} testID="energy-value-label">
          {safeValue}%
        </Text>
      </View>

      <View
        accessibilityLabel="今日推进度"
        accessibilityRole="adjustable"
        accessibilityValue={{ max: 100, min: 0, now: safeValue, text: `${safeValue}%` }}
        {...panResponder.panHandlers}
        onLayout={handleLayout}
        style={styles.stage}
        testID="plasma-energy-slider"
      >
        {isExpoGo ? (
          <FallbackEnergySlider
            active={active}
            fillWidth={fillWidth}
            particles={particles}
            pulseOpacity={pulseOpacity}
            safeValue={safeValue}
            sweepTranslate={sweepTranslate}
            tailLeft={tailLeft}
            tailWidth={tailWidth}
          />
        ) : (
          <SkiaEnergyBar
            active={active}
            elapsed={elapsed}
            fillWidth={fillWidth}
            safeValue={safeValue}
            stageWidth={stageWidth}
            tailLeft={tailLeft}
            tailWidth={tailWidth}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderRadius: 0,
    borderWidth: 0,
    marginTop: 16,
    minHeight: 112,
    overflow: 'visible',
    paddingBottom: 0,
    paddingHorizontal: spacing[4],
    paddingTop: 0,
  },
  capGlow: {
    backgroundColor: 'rgba(255, 208, 86, 0.34)',
    borderRadius: 999,
    height: 22,
    position: 'absolute',
    shadowColor: '#FACC15',
    shadowOpacity: 0.42,
    shadowRadius: 12,
    top: 9,
    width: 7,
  },
  fill: {
    borderRadius: radii.pill,
    bottom: TRACK_INNER_PAD,
    left: TRACK_INNER_PAD,
    overflow: 'hidden',
    position: 'absolute',
    top: TRACK_INNER_PAD,
  },
  fillCore: {
    backgroundColor: 'rgba(255, 255, 255, 0.36)',
    borderRadius: radii.pill,
    height: 5,
    left: 16,
    position: 'absolute',
    right: 22,
    top: 7,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  hudCorner: {
    borderColor: 'rgba(103, 232, 249, 0.8)',
    height: 21,
    position: 'absolute',
    width: 21,
  },
  hudCornerLeftBottom: {
    borderBottomLeftRadius: 18,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    left: 19,
    top: 38,
  },
  hudCornerLeftTop: {
    borderLeftWidth: 2,
    borderTopLeftRadius: 18,
    borderTopWidth: 2,
    left: 19,
    top: 17,
  },
  hudCornerRightBottom: {
    borderBottomRightRadius: 18,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    right: 19,
    top: 38,
  },
  hudCornerRightTop: {
    borderRightWidth: 2,
    borderTopRightRadius: 18,
    borderTopWidth: 2,
    right: 19,
    top: 17,
  },
  hudLine: {
    backgroundColor: 'rgba(103, 232, 249, 0.48)',
    height: 1,
    position: 'absolute',
  },
  hudLineBottomLeft: {
    bottom: 4,
    left: 22,
    width: 90,
  },
  hudLineBottomRight: {
    bottom: 9,
    right: 72,
    width: 72,
  },
  hudLineTopLeft: {
    left: 118,
    top: 6,
    width: 112,
  },
  hudLineTopRight: {
    right: 42,
    top: 2,
    width: 86,
  },
  nativeCanvas: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  outerGlow: {
    backgroundColor: 'rgba(250, 204, 21, 0.08)',
    borderRadius: 999,
    bottom: 15,
    left: 10,
    position: 'absolute',
    right: 10,
    shadowColor: '#FACC15',
    shadowOpacity: 0.72,
    shadowRadius: 24,
    top: 18,
  },
  particle: {
    backgroundColor: '#FFF7AD',
    borderRadius: 999,
    position: 'absolute',
    shadowColor: '#FACC15',
    shadowOpacity: 0.85,
    shadowRadius: 8,
  },
  stage: {
    height: STAGE_HEIGHT,
    overflow: 'hidden',
    position: 'relative',
  },
  sweep: {
    backgroundColor: 'rgba(255, 255, 255, 0.84)',
    bottom: -4,
    position: 'absolute',
    top: -4,
    width: 38,
  },
  tailFade: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  tailMist: {
    borderRadius: 999,
    bottom: 3,
    overflow: 'hidden',
    position: 'absolute',
    shadowColor: '#67E8F9',
    shadowOpacity: 0.72,
    shadowRadius: 14,
    top: 3,
  },
  title: {
    color: 'rgba(246, 242, 215, 0.88)',
    fontSize: 16,
    fontWeight: fontWeights.medium,
    lineHeight: 22,
  },
  trackFrame: {
    backgroundColor: 'rgba(2, 6, 10, 0.82)',
    borderColor: 'rgba(255, 247, 173, 0.74)',
    borderRadius: 999,
    borderWidth: 1,
    height: TRACK_HEIGHT,
    left: TRACK_HORIZONTAL_INSET,
    overflow: 'hidden',
    position: 'absolute',
    right: TRACK_HORIZONTAL_INSET,
    shadowColor: '#FACC15',
    shadowOpacity: 0.62,
    shadowRadius: 18,
    top: TRACK_Y,
  },
  trackInner: {
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 999,
    borderWidth: 1,
    bottom: 4,
    left: 4,
    position: 'absolute',
    right: 4,
    top: 4,
  },
  value: {
    color: '#FFF7AD',
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.md,
    textShadowColor: 'rgba(250, 204, 21, 0.72)' as any,
    textShadowOffset: { height: 0, width: 0 },
    textShadowRadius: 14,
  },
});
