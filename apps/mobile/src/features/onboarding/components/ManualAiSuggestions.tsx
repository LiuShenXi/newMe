import { StyleSheet, Text, View } from 'react-native';

import { Button, Card } from '../../../shared/components';
import { colors, fontSizes, lineHeights, spacing } from '../../../shared/theme';

interface ManualAiSuggestion {
  reason?: string;
  title: string;
}

interface ManualAiSuggestionsProps {
  error?: string | null;
  onAccept: (suggestion: ManualAiSuggestion) => void;
  suggestions: ManualAiSuggestion[];
}

export function ManualAiSuggestions({ error, onAccept, suggestions }: ManualAiSuggestionsProps) {
  if (!suggestions.length && !error) {
    return null;
  }

  return (
    <View style={styles.container}>
      {suggestions.length ? (
        <Card title="AI 给你的当前层建议">
          <View style={styles.list}>
            {suggestions.map((suggestion) => (
              <View key={suggestion.title} style={styles.suggestion}>
                <Text style={styles.title}>{suggestion.title}</Text>
                {suggestion.reason ? <Text style={styles.reason}>{suggestion.reason}</Text> : null}
                <Button onPress={() => onAccept(suggestion)} variant="secondary">
                  接受这条建议
                </Button>
              </View>
            ))}
          </View>
        </Card>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[3],
  },
  error: {
    color: colors.danger,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
  },
  list: {
    gap: spacing[3],
    marginTop: spacing[3],
  },
  reason: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
  },
  suggestion: {
    gap: spacing[2],
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
  },
});
