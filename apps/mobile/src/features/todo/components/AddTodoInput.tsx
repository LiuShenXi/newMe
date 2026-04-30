import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, fontSizes, fontWeights, lineHeights, radii, spacing } from '../../../shared/theme';

interface AddTodoInputProps {
  onAdd: (title: string) => void;
}

export function AddTodoInput({ onAdd }: AddTodoInputProps) {
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState(false);

  function submit() {
    if (!draft.trim()) return;
    onAdd(draft);
    setDraft('');
    setOpen(false);
  }

  if (!open) {
    return (
      <Pressable accessibilityRole="button" onPress={() => setOpen(true)} style={styles.trigger}>
        <Text style={styles.triggerLabel}>＋ 添加一件小事</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.panel}>
      <TextInput
        onChangeText={setDraft}
        placeholder="写下一件今天要做的小事"
        placeholderTextColor={colors.textTertiary}
        style={styles.input}
        value={draft}
      />
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" onPress={submit} style={styles.primary}>
          <Text style={styles.primaryLabel}>添加</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => setOpen(false)} style={styles.secondary}>
          <Text style={styles.secondaryLabel}>取消</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[3],
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.24)',
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    color: colors.text,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    minHeight: 46,
    paddingHorizontal: spacing[3],
  },
  panel: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing[3],
  },
  primary: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    flex: 1,
    minHeight: 42,
    justifyContent: 'center',
  },
  primaryLabel: {
    color: colors.background,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.sm,
  },
  secondary: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    minHeight: 42,
    justifyContent: 'center',
  },
  secondaryLabel: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.sm,
  },
  trigger: {
    alignItems: 'center',
    backgroundColor: 'rgba(207, 250, 254, 0.06)',
    borderColor: 'rgba(207, 250, 254, 0.16)',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 48,
    justifyContent: 'center',
  },
  triggerLabel: {
    color: '#ECFEFF',
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.sm,
  },
});
