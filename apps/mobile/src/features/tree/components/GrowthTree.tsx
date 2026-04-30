import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { PrototypeTreeTool } from '../../../shared/components';
import type { GrowthTreeDto } from '@newme/shared';
import type { TreeFruit } from '../data/fruits';

interface GrowthTreeProps {
  fruits: TreeFruit[];
  honorCount?: number;
  onDetailPress?: (type: 'fruit' | 'quarter' | 'honor') => void;
  onFruitPress: (fruit: TreeFruit) => void;
  stage?: GrowthTreeDto['stage'];
}

const DESIGN_WIDTH = 353;

const canopies = [
  { height: 176, left: 42, top: 68, width: 176 },
  { height: 224, left: 122, top: 34, width: 224 },
  { height: 176, left: 186, top: 112, width: 176 },
  { height: 208, left: 72, top: 164, width: 208 },
  { height: 176, left: 144, top: 202, width: 176 },
];

const branches = [
  { bottom: 306, height: 20, left: 112, rotate: '24deg', width: 148 },
  { bottom: 330, height: 20, right: 105, rotate: '-26deg', width: 142 },
  { bottom: 252, height: 16, left: 88, rotate: '8deg', width: 160 },
];

const canvasGradient = {
  backgroundImage:
    'radial-gradient(circle at 50% 35%, rgba(77, 255, 213, .15), transparent 45%), linear-gradient(180deg, rgba(255, 255, 255, .04), rgba(255, 255, 255, .015))',
} as unknown as ViewStyle;

const groundGradient = {
  backgroundImage: 'linear-gradient(0deg, rgba(12, 30, 20, .92), transparent)',
} as unknown as ViewStyle;

const canopyGradient = {
  backgroundImage:
    'radial-gradient(circle at 42% 38%, rgba(129, 255, 188, .30), rgba(22, 83, 62, .55) 55%, rgba(8, 30, 25, .88))',
} as unknown as ViewStyle;

const trunkGradient = {
  backgroundImage: 'linear-gradient(90deg, #1c120c, #4d3521, #1a110d)',
  boxShadow: 'inset -7px 0 20px rgba(0, 0, 0, .35)',
} as unknown as ViewStyle;

const fruitGradient = {
  backgroundImage: 'radial-gradient(circle at 34% 28%, #fff3b0, #dfb64c 45%, #725626)',
} as unknown as ViewStyle;

const glassBlur = {
  backdropFilter: 'blur(20px)',
} as unknown as ViewStyle;

export function GrowthTree({ fruits, honorCount = 1, onDetailPress, onFruitPress, stage = 'q2_growth' }: GrowthTreeProps) {
  const aura = useRef(new Animated.Value(0)).current;
  const [canvasWidth, setCanvasWidth] = useState(DESIGN_WIDTH);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(aura, { duration: 2500, toValue: 1, useNativeDriver: true }),
        Animated.timing(aura, { duration: 2500, toValue: 0, useNativeDriver: true }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [aura]);

  const metrics = useMemo(() => {
    const scale = Math.min(canvasWidth / DESIGN_WIDTH, 1);
    const offsetX = Math.max((canvasWidth - DESIGN_WIDTH * scale) / 2, 0);

    return { offsetX, scale };
  }, [canvasWidth]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setCanvasWidth(event.nativeEvent.layout.width);
  };

  const auraScale = aura.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const auraOpacity = aura.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.9] });

  return (
    <View onLayout={handleLayout} style={[styles.canvas, canvasGradient]}>
      <View style={[styles.groundGlow, groundGradient]} />
      <Animated.View
        style={[
          styles.treeAura,
          {
            opacity: auraOpacity,
            transform: [{ translateX: -144 }, { scale: auraScale }],
          },
        ]}
      />
      <View style={[styles.trunk, trunkGradient]} />

      {branches.map((branch, index) => (
        <View
          key={`${branch.bottom}-${branch.rotate}`}
          style={[
            styles.branch,
            {
              bottom: branch.bottom,
              height: branch.height,
              left: branch.left === undefined ? undefined : metrics.offsetX + branch.left * metrics.scale,
              right: branch.right === undefined ? undefined : metrics.offsetX + branch.right * metrics.scale,
              transform: [{ rotate: branch.rotate }],
              width: branch.width * metrics.scale,
            },
            index === 2 ? styles.branchThin : null,
          ]}
        />
      ))}

      {canopies.map((canopy) => (
        <View
          key={`${canopy.left}-${canopy.top}`}
          style={[
            styles.canopy,
            canopyGradient,
            {
              height: canopy.height * metrics.scale,
              left: metrics.offsetX + canopy.left * metrics.scale,
              top: canopy.top,
              width: canopy.width * metrics.scale,
            },
          ]}
        />
      ))}

      {fruits.map((fruit, index) => (
        <Pressable
          accessibilityLabel={`打开${fruit.week}`}
          accessibilityRole="button"
          key={fruit.week}
          onPress={() => onFruitPress(fruit)}
          style={({ pressed }) => [
            styles.fruit,
            fruitGradient,
            {
              height: fruit.size * metrics.scale,
              left: metrics.offsetX + fruit.x * metrics.scale,
              opacity: pressed ? 0.82 : 1,
              top: fruit.y,
              transform: [{ scale: pressed ? 0.95 : 1 }],
              width: fruit.size * metrics.scale,
              zIndex: 20 + index,
            },
          ]}
        />
      ))}

      <View style={styles.tools}>
        <PrototypeTreeTool label="果实" onPress={() => onDetailPress?.('fruit')} tone="fruit" value={`${fruits.length}`} />
        <PrototypeTreeTool label="阶段" onPress={() => onDetailPress?.('quarter')} tone="quarter" value={stageToQuarterLabel(stage)} />
        <PrototypeTreeTool label="荣誉" onPress={() => onDetailPress?.('honor')} tone="honor" value={`${honorCount}`} />
      </View>

      <View style={[styles.tip, glassBlur]}>
        <Text style={styles.tipText}>点击果实查看时间胶囊</Text>
      </View>
    </View>
  );
}

function stageToQuarterLabel(stage: GrowthTreeDto['stage']) {
  if (stage === 'q1_start') return 'Q1';
  if (stage === 'q2_growth') return 'Q2';
  if (stage === 'q3_flourish') return 'Q3';
  return 'Q4';
}

const styles = StyleSheet.create({
  branch: {
    backgroundColor: '#3B2718',
    borderRadius: 999,
    position: 'absolute',
    zIndex: 4,
  },
  branchThin: {
    height: 16,
  },
  canopy: {
    backgroundColor: 'rgba(22, 83, 62, 0.72)',
    borderRadius: 999,
    position: 'absolute',
    shadowColor: '#81FFBC',
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    zIndex: 8,
  },
  canvas: {
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
    borderColor: 'rgba(167, 243, 208, 0.10)',
    borderRadius: 34,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#FFFFFF',
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 0,
  },
  fruit: {
    backgroundColor: '#DFB64C',
    borderColor: 'rgba(254, 243, 199, 0.60)',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    position: 'absolute',
    shadowColor: '#EFC966',
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 22,
  },
  groundGlow: {
    backgroundColor: 'rgba(12, 30, 20, 0.62)',
    bottom: 0,
    height: 144,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 2,
  },
  tip: {
    backgroundColor: 'rgba(0, 0, 0, 0.30)',
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    bottom: 20,
    left: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: 'absolute',
    zIndex: 30,
  },
  tipText: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  tools: {
    gap: 8,
    position: 'absolute',
    right: 12,
    top: 20,
    zIndex: 30,
  },
  treeAura: {
    backgroundColor: 'rgba(167, 243, 208, 0.12)',
    borderRadius: 999,
    height: 288,
    left: '50%',
    position: 'absolute',
    shadowColor: '#A7F3D0',
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 40,
    top: 64,
    width: 288,
    zIndex: 1,
  },
  trunk: {
    backgroundColor: '#4D3521',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    bottom: 40,
    height: 310,
    left: '50%',
    marginLeft: -24,
    position: 'absolute',
    shadowColor: '#000000',
    shadowOffset: { height: 0, width: -7 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    width: 48,
    zIndex: 3,
  },
});
