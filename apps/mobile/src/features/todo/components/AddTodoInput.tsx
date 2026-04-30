import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PrototypeButton, PrototypeInput } from '../../../shared/components';
import { radii, spacing } from '../../../shared/theme';

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
      <PrototypeButton onPress={() => setOpen(true)} style={styles.trigger} variant="add">
        ＋ 添加一件小事
      </PrototypeButton>
    );
  }

  return (
    <View style={styles.panel}>
      <PrototypeInput
        onChangeText={setDraft}
        placeholder="写下一件今天要做的小事"
        value={draft}
      />
      <View style={styles.actions}>
        <PrototypeButton onPress={submit} style={styles.action}>
          添加
        </PrototypeButton>
        <PrototypeButton onPress={() => setOpen(false)} style={styles.action} variant="secondary">
          取消
        </PrototypeButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[4],
  },
  action: {
    flex: 1,
  },
  panel: {
    backgroundColor: 'rgba(0, 0, 0, 0.20)',
    borderColor: 'rgba(207, 250, 254, 0.15)',
    borderRadius: radii.control,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing[3],
  },
  trigger: {
    marginTop: spacing[1],
  },
});
