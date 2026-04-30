import { router } from 'expo-router';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { ConfirmButton } from '../../src/features/energy/components/ConfirmButton';
import { EnergyOrb } from '../../src/features/energy/components/EnergyOrb';
import { EnergySlider } from '../../src/features/energy/components/EnergySlider';
import { WeeklyFocusPanel } from '../../src/features/energy/components/WeeklyFocusPanel';
import { useEnergy } from '../../src/features/energy/hooks/useEnergy';
import { PrototypeScreen } from '../../src/shared/components/PrototypeShell';
import { colors, fontSizes, fontWeights, lineHeights, radii, spacing } from '../../src/shared/theme';

export default function EnergyScreen() {
  const {
    charging,
    confirmEnergy,
    energyValue,
    focuses,
    reminderVisible,
    requestConfirm,
    setReminderVisible,
    setTodayEnergy,
    toastVisible,
    weekEnergy,
  } = useEnergy();

  return (
    <View style={styles.root}>
      <PrototypeScreen contentStyle={styles.content}>
        <EnergyOrb charging={charging} value={weekEnergy} />
        <WeeklyFocusPanel focuses={focuses} />
        <EnergySlider onChange={setTodayEnergy} value={energyValue} />
        <ConfirmButton onPress={requestConfirm} />
      </PrototypeScreen>

      {toastVisible ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>今日能量已注入</Text>
        </View>
      ) : null}

      <Modal animationType="fade" transparent visible={reminderVisible}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalPanel}>
            <Text style={styles.modalTitle}>要不要先看看今天的清单？</Text>
            <Text style={styles.modalCopy}>看起来今天的清单还没看过。你可以先看一眼，再决定今日推进度。</Text>
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setReminderVisible(false);
                  router.push('/todo');
                }}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryLabel}>先看清单</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={confirmEnergy} style={styles.secondaryButton}>
                <Text style={styles.secondaryLabel}>继续注入</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing[5],
  },
  modalCopy: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    marginBottom: spacing[5],
    marginTop: spacing[2],
  },
  modalPanel: {
    backgroundColor: 'rgba(7, 17, 15, 0.95)',
    borderColor: 'rgba(207, 250, 254, 0.15)',
    borderRadius: radii.panel,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: 360,
    padding: spacing[5],
    width: '100%',
  },
  modalTitle: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.lg,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primaryDim,
    borderColor: colors.cyanBorder,
    borderRadius: radii.control,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
  },
  primaryLabel: {
    color: '#ECFEFF',
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.sm,
  },
  root: {
    flex: 1,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: radii.control,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
  },
  secondaryLabel: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.sm,
  },
  toast: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.68)',
    borderColor: 'rgba(207, 250, 254, 0.22)',
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    bottom: 90,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    position: 'absolute',
  },
  toastText: {
    color: '#ECFEFF',
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
  },
});
