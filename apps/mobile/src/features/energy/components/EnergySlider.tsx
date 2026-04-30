import { useState } from 'react';
import { GestureResponderEvent, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fontWeights, lineHeights, prototypeGlassShadow, radii, spacing } from '../../../shared/theme';

interface EnergySliderProps {
  onChange: (value: number) => void;
  value: number;
}

export function EnergySlider({ onChange, value }: EnergySliderProps) {
  const [width, setWidth] = useState(1);
  const usableWidth = Math.max(1, width - 8);
  const fillWidth = (usableWidth * value) / 100;
  const thumbLeft = 4 + fillWidth;

  function handleLayout(event: LayoutChangeEvent) {
    setWidth(Math.max(1, event.nativeEvent.layout.width));
  }

  function handlePress(event: GestureResponderEvent) {
    onChange((event.nativeEvent.locationX / width) * 100);
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>今日能量条</Text>
        <Text style={styles.value}>{value}%</Text>
      </View>
      <Pressable
        accessibilityLabel="今日推进度"
        accessibilityRole="adjustable"
        accessibilityValue={{ max: 100, min: 0, now: value, text: `${value}%` }}
        onLayout={handleLayout}
        onPress={handlePress}
        style={styles.slider}
      >
        <View style={styles.rail} />
        <View style={[styles.fill, { width: fillWidth }]} />
        <View style={[styles.tail, { left: thumbLeft }]} />
        <View style={[styles.thumb, { left: thumbLeft }]} />
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
  fill: {
    backgroundColor: '#FFF27A',
    borderRadius: radii.pill,
    height: 11,
    left: 4,
    position: 'absolute',
    top: 24,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[1],
  },
  rail: {
    backgroundColor: 'rgba(236, 254, 255, 0.08)',
    borderColor: 'rgba(236, 254, 255, 0.16)',
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    height: 13,
    left: 4,
    position: 'absolute',
    right: 4,
    top: 23,
  },
  slider: {
    height: 56,
    marginHorizontal: -2,
    overflow: 'hidden',
    position: 'relative',
  },
  tail: {
    backgroundColor: 'rgba(103, 232, 249, 0.28)',
    borderRadius: radii.pill,
    height: 46,
    marginLeft: -148,
    position: 'absolute',
    opacity: 0.94,
    top: 6,
    width: 166,
  },
  thumb: {
    backgroundColor: '#FFB020',
    borderColor: colors.text,
    borderRadius: radii.pill,
    borderWidth: 2,
    height: 28,
    marginLeft: -10,
    position: 'absolute',
    shadowColor: '#FACC15',
    shadowOpacity: 0.72,
    shadowRadius: 18,
    top: 16,
    width: 28,
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
