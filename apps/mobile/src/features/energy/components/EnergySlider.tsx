import { useState } from 'react';
import { GestureResponderEvent, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fontWeights, lineHeights, radii, spacing } from '../../../shared/theme';

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
    backgroundColor: 'rgba(255, 255, 255, 0.055)',
    borderColor: 'rgba(250, 204, 21, 0.18)',
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    shadowColor: '#FACC15',
    shadowOpacity: 0.12,
    shadowRadius: 24,
  },
  fill: {
    backgroundColor: '#FACC15',
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
    backgroundColor: 'rgba(236, 254, 255, 0.10)',
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
    backgroundColor: 'rgba(103, 232, 249, 0.24)',
    borderRadius: radii.pill,
    height: 34,
    marginLeft: -120,
    position: 'absolute',
    top: 12,
    width: 132,
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
