import { StyleSheet, Text, View } from 'react-native';

import { Button, Input } from '../../../shared/components';
import { colors, fontSizes, lineHeights, spacing } from '../../../shared/theme';

interface ManualInputProps {
  helper: string;
  label: string;
  onAiAssist?: () => void;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}

export function ManualInput({
  helper,
  label,
  onAiAssist,
  onChangeText,
  placeholder,
  value,
}: ManualInputProps) {
  return (
    <View style={styles.container}>
      <Input
        label={label}
        multiline
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={styles.input}
        value={value}
      />
      <Text style={styles.helper}>{helper}</Text>
      {onAiAssist ? (
        <Button onPress={onAiAssist} variant="secondary">
          AI 辅助
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[3],
  },
  helper: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
  },
  input: {
    minHeight: 132,
    textAlignVertical: 'top',
  },
});
