import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { FruitCapsule } from '../../src/features/tree/components/FruitCapsule';
import { GrowthTree } from '../../src/features/tree/components/GrowthTree';
import { treeFruits, type TreeFruit } from '../../src/features/tree/data/fruits';

const phoneGradient = {
  backgroundImage:
    'radial-gradient(circle at 50% 8%, rgba(37, 255, 219, .12), transparent 28%), radial-gradient(circle at 20% 90%, rgba(120, 255, 175, .10), transparent 35%), linear-gradient(180deg, #091411 0%, #060b0a 55%, #030605 100%)',
} as unknown as ViewStyle;

const gridBackground = {
  backgroundImage:
    'linear-gradient(rgba(255, 255, 255, .04) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, .035) 1px, transparent 1px)',
  backgroundSize: '22px 22px',
} as unknown as ViewStyle;

export default function TreeScreen() {
  const [selectedFruit, setSelectedFruit] = useState<TreeFruit | null>(null);

  return (
    <View style={[styles.phone, phoneGradient]}>
      <StatusBar style="light" />
      <View style={[styles.grid, gridBackground]} />

      <View style={styles.content}>
        <View style={styles.statusBar}>
          <Text style={styles.statusText}>09:07</Text>
          <View style={styles.speaker} />
          <Text style={styles.statusText}>87%</Text>
        </View>

        <View style={styles.main}>
          <GrowthTree fruits={treeFruits} onFruitPress={setSelectedFruit} />
        </View>
      </View>

      <FruitCapsule fruit={selectedFruit} onClose={() => setSelectedFruit(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingBottom: 90,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  main: {
    flex: 1,
    minHeight: 0,
    paddingTop: 12,
  },
  phone: {
    backgroundColor: '#07110F',
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  speaker: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 999,
    height: 16,
    shadowColor: '#000000',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 8,
    width: 112,
  },
  statusBar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 20,
    justifyContent: 'space-between',
  },
  statusText: {
    color: 'rgba(203, 213, 225, 0.70)',
    fontSize: 12,
    lineHeight: 16,
  },
});
