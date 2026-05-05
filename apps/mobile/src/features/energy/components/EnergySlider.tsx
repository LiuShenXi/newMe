import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, GestureResponderEvent, LayoutChangeEvent, PanResponder, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fontWeights, lineHeights, prototypeGlassShadow, radii, spacing } from '../../../shared/theme';

interface EnergySliderProps {
  onChange: (value: number) => void;
  value: number;
}

const TRACK_HORIZONTAL_INSET = 8;
const PARTICLES = Array.from({ length: 22 }, (_, index) => ({
  id: `particle-${index}`,
  leftRatio: (8 + ((index * 17) % 82)) / 100,
  opacity: 0.24 + (index % 5) * 0.1,
  size: 1.5 + (index % 4) * 0.7,
  top: 8 + ((index * 11) % 18),
}));

function clampEnergy(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

export function EnergySlider({ onChange, value }: EnergySliderProps) {
  const [stageWidth, setStageWidth] = useState(1);
  const [active, setActive] = useState(false);
  const sweep = useRef(new Animated.Value(0)).current;
  const safeValue = clampEnergy(value);
  const trackWidth = Math.max(1, stageWidth - TRACK_HORIZONTAL_INSET * 2);
  const fillWidth = Math.max(safeValue > 0 ? 2 : 1, (trackWidth * safeValue) / 100);
  const fillRatio = fillWidth / trackWidth;
  const tailWidth = safeValue > 0 ? Math.min(76, Math.max(20, fillWidth * 0.22)) : 1;
  const tailLeft = TRACK_HORIZONTAL_INSET + Math.max(0, fillWidth - tailWidth);
  const capLeft = TRACK_HORIZONTAL_INSET + Math.max(0, fillWidth - 8);
  const particles = useMemo(() => PARTICLES, []);
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

  function getEventLocationX(event: GestureResponderEvent): number | null {
    const nativeEvent = event.nativeEvent as GestureResponderEvent['nativeEvent'] & {
      offsetX?: number;
      pageX?: number;
    };
    const webEvent = event as unknown as {
      currentTarget?: { getBoundingClientRect?: () => { left: number } };
    };

    if (typeof nativeEvent.locationX === 'number' && Number.isFinite(nativeEvent.locationX)) {
      return nativeEvent.locationX;
    }

    if (typeof nativeEvent.offsetX === 'number' && Number.isFinite(nativeEvent.offsetX)) {
      return nativeEvent.offsetX;
    }

    const rect = webEvent.currentTarget?.getBoundingClientRect?.();

    if (rect && typeof nativeEvent.pageX === 'number' && Number.isFinite(nativeEvent.pageX)) {
      return nativeEvent.pageX - rect.left;
    }

    return null;
  }

  function updateFromEvent(event: GestureResponderEvent) {
    const locationX = getEventLocationX(event);

    if (locationX === null || !Number.isFinite(locationX) || trackWidth <= 0) {
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
    [trackWidth, stageWidth],
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
          <LinearGradient
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
                    top: particle.top,
                    width: particle.size,
                  },
                ]}
                testID="energy-bar-particle"
              />
            ))}
          </LinearGradient>
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
            <LinearGradient
              colors={['rgba(103, 232, 249, 0)', 'rgba(103, 232, 249, 0.26)', 'rgba(255, 247, 173, 0.34)', 'rgba(250, 204, 21, 0)']}
              end={{ x: 1, y: 0 }}
              start={{ x: 0, y: 0 }}
              style={styles.tailFade}
              testID="energy-bar-tail-fade"
            />
          </Animated.View>
          <View style={[styles.capGlow, { left: capLeft, opacity: safeValue > 0 ? 1 : 0 }]} testID="plasma-energy-nozzle" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...prototypeGlassShadow,
    backgroundColor: 'rgba(42, 40, 8, 0.46)',
    borderColor: 'rgba(234, 179, 8, 0.32)',
    borderRadius: 27,
    borderWidth: 1,
    minHeight: 142,
    overflow: 'hidden',
    paddingBottom: 17,
    paddingHorizontal: spacing[4],
    paddingTop: 17,
    shadowColor: '#FACC15',
    shadowOpacity: 0.16,
    shadowRadius: 26,
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
    bottom: 5,
    left: 5,
    overflow: 'hidden',
    position: 'absolute',
    top: 5,
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
    height: 72,
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
  tailFade: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.sm,
  },
  trackFrame: {
    backgroundColor: 'rgba(2, 6, 10, 0.82)',
    borderColor: 'rgba(255, 247, 173, 0.74)',
    borderRadius: 999,
    borderWidth: 1,
    height: 40,
    left: TRACK_HORIZONTAL_INSET,
    overflow: 'hidden',
    position: 'absolute',
    right: TRACK_HORIZONTAL_INSET,
    shadowColor: '#FACC15',
    shadowOpacity: 0.62,
    shadowRadius: 18,
    top: 18,
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
