import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../../../shared/components';
import { colors, fontSizes, fontWeights, lineHeights, spacing } from '../../../shared/theme';

interface AiDraftViewProps {
  items: string[];
  title: string;
}

export function AiDraftView({ items, title }: AiDraftViewProps) {
  return (
    <Card title={title}>
      <View style={styles.list}>
        {items.map((item) => (
          <Text key={item} style={styles.item}>
            {item}
          </Text>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  item: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.sm,
  },
  list: {
    gap: spacing[2],
    marginTop: spacing[3],
  },
});
