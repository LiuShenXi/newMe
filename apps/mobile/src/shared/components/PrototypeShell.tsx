import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren } from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import {
  prototype,
  prototypeGlassBlur,
  prototypeGlassShadow,
  prototypeGridBackground,
  prototypePhoneBackground,
} from '../theme';
import { PrototypeBottomNav, type PrototypeNavTab } from './PrototypePrimitives';

interface PrototypeScreenProps extends PropsWithChildren {
  activeTab?: PrototypeNavTab;
  contentMode?: 'fixed' | 'scroll';
  contentStyle?: StyleProp<ViewStyle>;
  scroll?: boolean;
  showNav?: boolean;
}

export function PrototypeScreen({
  activeTab,
  children,
  contentMode,
  contentStyle,
  scroll = true,
  showNav,
}: PrototypeScreenProps) {
  const shouldShowNav = showNav ?? Boolean(activeTab);
  const shouldScroll = contentMode ? contentMode === 'scroll' : scroll;
  const content = (
    <View style={styles.content}>
      <View style={[styles.main, shouldShowNav ? styles.mainWithNav : null, contentStyle]}>{children}</View>
    </View>
  );

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#091411', '#060B0A', '#030605']} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, prototypePhoneBackground]} />
      <View style={[styles.gridLayer, prototypeGridBackground]} />
      {shouldScroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
      {shouldShowNav && activeTab ? <PrototypeBottomNav activeTab={activeTab} /> : null}
    </View>
  );
}

export function GlassCard({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return (
    <View style={[styles.glassCard, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    minHeight: '100%',
    paddingBottom: 20,
    paddingHorizontal: prototype.size.contentX,
    paddingTop: prototype.size.contentTop,
  },
  glassCard: {
    ...prototypeGlassBlur,
    ...prototypeGlassShadow,
    backgroundColor: prototype.color.glass,
    borderColor: prototype.color.glassBorder,
    borderRadius: prototype.radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  gridLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  main: {
    flex: 1,
    gap: 12,
    minHeight: 0,
    paddingTop: 0,
  },
  mainWithNav: {
    paddingBottom: prototype.size.bottomNavHeight + prototype.size.bottomNavInsetWeb,
  },
  root: {
    backgroundColor: prototype.color.phone,
    flex: 1,
    overflow: 'hidden',
  },
  scrollContent: {
    minHeight: '100%',
    width: '100%',
  },
});
