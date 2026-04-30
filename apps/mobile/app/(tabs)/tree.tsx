import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { FruitCapsule } from '../../src/features/tree/components/FruitCapsule';
import { GrowthTree } from '../../src/features/tree/components/GrowthTree';
import { type TreeFruit } from '../../src/features/tree/data/fruits';
import { PrototypeScreen } from '../../src/shared/components/PrototypeShell';
import { usePrototypeStore } from '../../src/stores/prototype.store';

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
  const fruits = usePrototypeStore((state) => state.fruits);
  const [selectedFruit, setSelectedFruit] = useState<TreeFruit | null>(null);
  const [detailType, setDetailType] = useState<'fruit' | 'quarter' | 'honor' | null>(null);

  const detail = detailType
    ? treeDetails[detailType]
    : null;

  return (
    <View style={[styles.phone, phoneGradient]}>
      <View style={[styles.grid, gridBackground]} />

      <PrototypeScreen contentStyle={styles.content} scroll={false}>
        <View style={styles.main}>
          {detail ? (
            <View style={styles.detail}>
              <Pressable accessibilityRole="button" onPress={() => setDetailType(null)} style={styles.backButton}>
                <Text style={styles.backText}>← 返回成长树</Text>
              </Pressable>
              <View style={styles.detailCard}>
                <Text style={styles.eyebrow}>tree detail</Text>
                <Text style={styles.detailTitle}>{detail.title}</Text>
                <Text style={styles.detailCopy}>{detail.sub}</Text>
              </View>
              <View style={styles.stats}>
                {detail.stats.map(([value, label]) => (
                  <View key={label} style={styles.statCard}>
                    <Text style={styles.statValue}>{value}</Text>
                    <Text style={styles.statLabel}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <GrowthTree fruits={fruits} onDetailPress={setDetailType} onFruitPress={setSelectedFruit} />
          )}
        </View>
      </PrototypeScreen>

      <FruitCapsule fruit={selectedFruit} onClose={() => setSelectedFruit(null)} />
    </View>
  );
}

const treeDetails = {
  fruit: {
    title: '每周果实',
    sub: '每颗果实都来自一次周结算，保存当周重点、结果和感悟。',
    stats: [['6', '累计果实'], ['78%', '最近一周'], ['72%', '季度均值']],
  },
  quarter: {
    title: 'Q2 成长阶段',
    sub: '这棵树正在进入第二个季度的成长阶段，计划、能量和果实会继续叠加。',
    stats: [['Q2', '当前阶段'], ['43%', '季度进度'], ['4 周', '滚动计划']],
  },
  honor: {
    title: '永久荣誉层',
    sub: '季度达标后的荣誉只会增加，不会因为后续波动而消失。',
    stats: [['1', '已有荣誉'], ['永久', '保留规则'], ['Q1', '首次获得']],
  },
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingBottom: 98,
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  main: {
    flex: 1,
    minHeight: 0,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backText: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
  },
  detail: {
    gap: 16,
  },
  detailCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.045)',
    borderColor: 'rgba(167, 243, 208, 0.10)',
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
  },
  detailCopy: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 24,
    marginTop: 12,
  },
  detailTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    marginTop: 8,
  },
  eyebrow: {
    color: 'rgba(209, 250, 229, 0.50)',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  phone: {
    backgroundColor: '#07110F',
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.045)',
    borderColor: 'rgba(167, 243, 208, 0.10)',
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    padding: 16,
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '300',
    lineHeight: 26,
    textAlign: 'center',
  },
});
