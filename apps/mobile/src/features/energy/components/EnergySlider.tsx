import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, GestureResponderEvent, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fontWeights, lineHeights, prototypeGlassShadow, radii, spacing } from '../../../shared/theme';

interface EnergySliderProps {
  onChange: (value: number) => void;
  value: number;
}

const SPARKS = Array.from({ length: 16 }, (_, index) => {
  const direction = index % 2 === 0 ? -1 : 1;
  return {
    color: ['#FFF7AD', '#67E8F9', '#FDE68A', '#A7F3D0'][index % 4],
    delay: index * 0.035,
    id: `spark-${index}`,
    size: 2 + (index % 4),
    x: -26 - (index % 5) * 15,
    y: direction * (7 + (index % 4) * 6),
  };
});

function clampEnergy(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

export function EnergySlider({ onChange, value }: EnergySliderProps) {
  const [width, setWidth] = useState(1);
  const [active, setActive] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;
  const safeValue = clampEnergy(value);
  const usableWidth = Math.max(1, width - 12);
  const fillWidth = (usableWidth * safeValue) / 100;
  const nozzleLeft = Math.max(12, Math.min(width - 18, 6 + fillWidth));
  const tailWidth = Math.max(4, Math.min(156, fillWidth));
  const tailLeft = Math.max(6, nozzleLeft - tailWidth - 2);
  const haloWidth = Math.max(0, Math.min(96, fillWidth));
  const haloLeft = Math.max(6, nozzleLeft - haloWidth);
  const hasCharge = safeValue > 2;
  const tailScale = pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.94, 1.08, 0.98] });
  const tailOpacity = pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.58, 0.96, 0.7] });
  const coreGlow = pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.58, 1, 0.72] });
  const sparks = useMemo(() => SPARKS, []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, {
        duration: active ? 680 : 1250,
        easing: Easing.inOut(Easing.quad),
        toValue: 1,
        useNativeDriver: true,
      }),
    );

    pulse.setValue(0);
    loop.start();

    return () => loop.stop();
  }, [active, pulse]);

  function handleLayout(event: LayoutChangeEvent) {
    setWidth(Math.max(1, event.nativeEvent.layout.width));
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

    if (locationX === null || !Number.isFinite(locationX) || width <= 0) {
      return;
    }

    onChange(clampEnergy((locationX / width) * 100));
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>今日能量条</Text>
        <Text style={styles.value} testID="energy-value-label">
          {safeValue}%
        </Text>
      </View>
      <Pressable
        accessibilityLabel="今日推进度"
        accessibilityRole="adjustable"
        accessibilityValue={{ max: 100, min: 0, now: safeValue, text: `${safeValue}%` }}
        onLayout={handleLayout}
        onPress={updateFromEvent}
        onPressIn={() => setActive(true)}
        onPressOut={() => setActive(false)}
        onResponderGrant={updateFromEvent}
        onResponderMove={updateFromEvent}
        onStartShouldSetResponder={() => true}
        style={styles.slider}
        testID="plasma-energy-slider"
      >
        <View style={styles.rail} />
        <Animated.View style={[styles.coreAura, { left: haloLeft, opacity: hasCharge ? coreGlow : 0, width: haloWidth }]} />
        <View style={[styles.coreFill, { width: fillWidth }]} />
        <Animated.View
          style={[
            styles.tail,
            {
              left: tailLeft,
              opacity: hasCharge ? tailOpacity : 0,
              transform: [{ scaleX: tailScale }],
              width: tailWidth,
            },
          ]}
          testID="plasma-energy-tail"
        >
          <View style={styles.tailOuter} />
          <View style={styles.tailMiddle} />
          <View style={styles.tailCore} />
        </Animated.View>
        {sparks.map((spark) => {
          const sparkProgress = pulse.interpolate({
            inputRange: [0, Math.min(0.92, 0.34 + spark.delay), 1],
            outputRange: [0, 0.9, 0],
          });
          const sparkX = pulse.interpolate({
            inputRange: [0, 1],
            outputRange: [-10, spark.x],
          });
          const sparkY = pulse.interpolate({
            inputRange: [0, 1],
            outputRange: [0, spark.y],
          });

          return (
            <Animated.View
              key={spark.id}
              style={[
                styles.spark,
                {
                  backgroundColor: spark.color,
                  height: spark.size,
                  left: nozzleLeft,
                  opacity: hasCharge ? sparkProgress : 0,
                  top: 29,
                  transform: [{ translateX: sparkX }, { translateY: sparkY }, { scale: active ? 1.18 : 1 }],
                  width: spark.size,
                },
              ]}
              testID="plasma-energy-spark"
            />
          );
        })}
        <Animated.View
          style={[
            styles.nozzleGlow,
            {
              left: nozzleLeft - 18,
              opacity: hasCharge ? tailOpacity : 0,
              transform: [{ scale: tailScale }],
            },
          ]}
        />
        <View style={[styles.nozzle, { left: nozzleLeft - 3, opacity: hasCharge ? 1 : 0 }]} testID="plasma-energy-nozzle">
          <View style={styles.nozzleCut} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...prototypeGlassShadow,
    backgroundColor: 'rgba(58, 55, 15, 0.38)',
    borderColor: 'rgba(250, 204, 21, 0.18)',
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    paddingHorizontal: spacing[4],
    paddingBottom: 14,
    paddingTop: 15,
    shadowColor: '#FACC15',
    shadowOpacity: 0.12,
    shadowRadius: 24,
  },
  coreAura: {
    backgroundColor: '#67E8F9',
    borderRadius: radii.pill,
    height: 20,
    opacity: 0.55,
    position: 'absolute',
    shadowColor: '#67E8F9',
    shadowOpacity: 0.72,
    shadowRadius: 20,
    top: 19,
  },
  coreFill: {
    backgroundColor: '#FFF27A',
    borderRadius: 3,
    height: 9,
    left: 6,
    position: 'absolute',
    shadowColor: '#FFF27A',
    shadowOpacity: 0.88,
    shadowRadius: 16,
    top: 25,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[1],
  },
  rail: {
    backgroundColor: 'rgba(3, 7, 18, 0.72)',
    borderColor: 'rgba(236, 254, 255, 0.18)',
    borderRadius: 9,
    borderWidth: 1,
    height: 15,
    left: 6,
    position: 'absolute',
    right: 6,
    shadowColor: '#67E8F9',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    top: 22,
  },
  slider: {
    height: 56,
    marginHorizontal: -2,
    overflow: 'hidden',
    position: 'relative',
  },
  tail: {
    height: 34,
    overflow: 'hidden',
    position: 'absolute',
    top: 11,
  },
  tailCore: {
    backgroundColor: 'rgba(255, 247, 173, 0.9)',
    borderBottomLeftRadius: 14,
    borderTopLeftRadius: 14,
    height: 6,
    opacity: 0.9,
    position: 'absolute',
    right: 0,
    top: 14,
    transform: [{ skewX: '-24deg' }],
    width: '56%',
  },
  tailMiddle: {
    backgroundColor: 'rgba(103, 232, 249, 0.46)',
    borderBottomLeftRadius: 28,
    borderTopLeftRadius: 10,
    height: 16,
    opacity: 0.78,
    position: 'absolute',
    right: 2,
    shadowColor: '#67E8F9',
    shadowOpacity: 0.78,
    shadowRadius: 22,
    top: 9,
    transform: [{ skewX: '-20deg' }],
    width: '78%',
  },
  tailOuter: {
    backgroundColor: 'rgba(20, 184, 166, 0.22)',
    borderBottomLeftRadius: 34,
    borderTopLeftRadius: 18,
    height: 26,
    opacity: 0.42,
    position: 'absolute',
    right: 8,
    top: 4,
    transform: [{ skewX: '-18deg' }],
    width: '100%',
  },
  nozzle: {
    backgroundColor: '#ECFEFF',
    borderColor: 'rgba(255, 247, 173, 0.82)',
    borderRadius: 3,
    borderWidth: 1.5,
    height: 28,
    overflow: 'hidden',
    position: 'absolute',
    shadowColor: '#FACC15',
    shadowOpacity: 0.72,
    shadowRadius: 18,
    top: 14,
    transform: [{ skewX: '-14deg' }],
    width: 6,
  },
  nozzleCut: {
    backgroundColor: '#67E8F9',
    height: 28,
    opacity: 0.68,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 2,
  },
  nozzleGlow: {
    backgroundColor: 'rgba(255, 184, 28, 0.28)',
    borderRadius: 32,
    height: 36,
    position: 'absolute',
    top: 10,
    width: 42,
  },
  spark: {
    borderRadius: 999,
    position: 'absolute',
    shadowColor: '#67E8F9',
    shadowOpacity: 0.95,
    shadowRadius: 12,
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.sm,
  },
  value: {
    color: '#FFF7AD',
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.sm,
  },
});
