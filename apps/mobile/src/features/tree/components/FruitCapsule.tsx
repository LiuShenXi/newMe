import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { TreeFruit } from '../data/fruits';

interface FruitCapsuleProps {
  fruit: TreeFruit | null;
  onClose: () => void;
}

export function FruitCapsule({ fruit, onClose }: FruitCapsuleProps) {
  return (
    <Modal animationType="fade" transparent visible={fruit !== null}>
      <View style={styles.layer}>
        <View style={styles.card}>
          {fruit ? (
            <>
              <Text style={styles.eyebrow}>time capsule</Text>
              <Text style={styles.title}>{fruit.week}</Text>
              <Text style={styles.date}>{fruit.date}</Text>

              <View style={styles.result}>
                <View style={styles.dot}>
                  <Text style={styles.dotText}>{fruit.score}%</Text>
                </View>
                <View>
                  <Text style={styles.resultTitle}>本周结果</Text>
                  <Text style={styles.resultCopy}>果实亮度来自周结算确认值</Text>
                </View>
              </View>

              <View style={styles.focusBlock}>
                <Text style={styles.focusTitle}>本周重点</Text>
                <View style={styles.focusList}>
                  {fruit.focuses.map((focus, index) => (
                    <View key={focus} style={styles.focusItem}>
                      <Text style={styles.focusIndex}>{index + 1}</Text>
                      <Text style={styles.focusText}>{focus}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <Text style={styles.reflection}>{fruit.reflection || fruit.note}</Text>

              <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>收起</Text>
              </Pressable>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#101827',
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: 340,
    padding: 22,
    shadowColor: '#000000',
    shadowOffset: { height: 24, width: 0 },
    shadowOpacity: 0.42,
    shadowRadius: 60,
    width: '100%',
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: '#00E5A0',
    borderRadius: 16,
    justifyContent: 'center',
    marginTop: 20,
    minHeight: 52,
  },
  closeText: {
    color: '#04110D',
    fontSize: 15,
    fontWeight: '900',
  },
  date: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  dot: {
    alignItems: 'center',
    backgroundColor: '#DFB64C',
    borderColor: 'rgba(254, 243, 199, 0.60)',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    height: 54,
    justifyContent: 'center',
    shadowColor: '#EFC966',
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 22,
    width: 54,
  },
  dotText: {
    color: '#1C120C',
    fontSize: 13,
    fontWeight: '900',
  },
  eyebrow: {
    color: 'rgba(254, 243, 199, 0.60)',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  focusBlock: {
    marginTop: 16,
  },
  focusIndex: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 999,
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '800',
    height: 24,
    lineHeight: 24,
    overflow: 'hidden',
    textAlign: 'center',
    width: 24,
  },
  focusItem: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.045)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  focusList: {
    gap: 8,
  },
  focusText: {
    color: '#CBD5E1',
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  focusTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 10,
  },
  layer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  reflection: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 24,
    marginTop: 14,
  },
  result: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  resultCopy: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  resultTitle: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 8,
  },
});
