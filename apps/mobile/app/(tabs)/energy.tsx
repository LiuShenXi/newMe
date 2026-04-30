import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ConfirmButton } from '../../src/features/energy/components/ConfirmButton';
import { EnergyOrb } from '../../src/features/energy/components/EnergyOrb';
import { EnergySlider } from '../../src/features/energy/components/EnergySlider';
import { WeeklyFocusPanel } from '../../src/features/energy/components/WeeklyFocusPanel';
import { useEnergy } from '../../src/features/energy/hooks/useEnergy';
import {
  PrototypeActionRow,
  PrototypeButton,
  PrototypeModalCard,
  PrototypeModalLayer,
  PrototypeScreen,
  PrototypeToast,
} from '../../src/shared/components';
import { colors, fontSizes, fontWeights, lineHeights, spacing } from '../../src/shared/theme';

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
      <PrototypeScreen activeTab="energy" contentStyle={styles.content}>
        <EnergyOrb charging={charging} value={weekEnergy} />
        <WeeklyFocusPanel focuses={focuses} />
        <EnergySlider onChange={setTodayEnergy} value={energyValue} />
        <ConfirmButton onPress={requestConfirm} />
      </PrototypeScreen>

      {toastVisible ? (
        <PrototypeToast>今日能量已注入</PrototypeToast>
      ) : null}

      {reminderVisible ? (
        <PrototypeModalLayer onBackdropPress={() => setReminderVisible(false)}>
          <PrototypeModalCard>
            <Text style={styles.modalTitle}>要不要先看看今天的清单？</Text>
            <Text style={styles.modalCopy}>看起来今天的清单还没看过。你可以先看一眼，再决定今日推进度。</Text>
            <PrototypeActionRow>
              <PrototypeButton
                onPress={() => {
                  setReminderVisible(false);
                  router.push('/todo');
                }}
                style={styles.modalButton}
              >
                先看清单
              </PrototypeButton>
              <PrototypeButton onPress={confirmEnergy} style={styles.modalButton} variant="secondary">
                继续注入
              </PrototypeButton>
            </PrototypeActionRow>
          </PrototypeModalCard>
        </PrototypeModalLayer>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
  },
  modalCopy: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 20,
    marginTop: 8,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.sm,
  },
  modalButton: {
    flex: 1,
  },
  root: {
    flex: 1,
  },
});
