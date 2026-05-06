import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { PropsWithChildren, ReactNode } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { prototype, prototypeGlassBlur, prototypePrimaryShadow } from '../theme';

export type PrototypeButtonVariant = 'primary' | 'ghost' | 'secondary' | 'pill' | 'icon' | 'replan' | 'add';
export type PrototypeModalKind = 'center' | 'sheet';
export type PrototypeNavTab = 'energy' | 'todo' | 'plan' | 'tree' | 'me';

type TabIconName = keyof typeof Ionicons.glyphMap;

const tabs: Array<{ icon: TabIconName; id: PrototypeNavTab; label: string; path: string }> = [
  { icon: 'flash-outline', id: 'energy', label: '能量', path: '/(tabs)/energy' },
  { icon: 'list-outline', id: 'todo', label: '清单', path: '/(tabs)/todo' },
  { icon: 'flag-outline', id: 'plan', label: '计划', path: '/(tabs)/plan' },
  { icon: 'leaf-outline', id: 'tree', label: '成长树', path: '/(tabs)/tree' },
  { icon: 'person-outline', id: 'me', label: '我的', path: '/(tabs)/me' },
];

interface PrototypeButtonProps extends PropsWithChildren {
  accessibilityLabel?: string;
  disabled?: boolean;
  icon?: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  variant?: PrototypeButtonVariant;
}

interface PrototypeBottomNavProps {
  activeTab: PrototypeNavTab;
}

interface PrototypeModalLayerProps extends PropsWithChildren {
  kind?: PrototypeModalKind;
  onBackdropPress?: () => void;
}

interface PrototypeTreeToolProps {
  label: string;
  onPress?: () => void;
  tone: 'fruit' | 'honor' | 'quarter';
  value: string;
}

interface PrototypeTopActionsProps {
  onBack?: () => void;
  onRegenerate?: () => void;
  regenerateLabel?: string;
}

export function PrototypeBottomNav({ activeTab }: PrototypeBottomNavProps) {
  return (
    <View style={[styles.bottomNav, prototypeGlassBlur]} testID="prototype-bottom-nav">
      {tabs.map((tab) => {
        const active = tab.id === activeTab;

        return (
          <Pressable
            accessibilityLabel={tab.label}
            accessibilityRole="tab"
            key={tab.id}
            onPress={() => router.replace(tab.path)}
            style={({ pressed }) => [
              styles.navButton,
              active ? styles.navButtonActive : null,
              pressed ? styles.pressed : null,
            ]}
            testID="prototype-nav-button"
          >
            <Ionicons color={active ? prototype.color.softCyan : prototype.color.dim} name={tab.icon} size={20} />
            <Text style={[styles.navLabel, active ? styles.navLabelActive : null]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function PrototypeButton({
  accessibilityLabel,
  children,
  disabled = false,
  icon,
  onPress,
  style,
  textStyle,
  variant = 'primary',
}: PrototypeButtonProps) {
  const testID = `prototype-button-${variant}`;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.buttonBase,
        styles[`${variant}Button`],
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
      testID={testID}
    >
      {icon}
      <Text style={[styles.buttonText, styles[`${variant}Text`], textStyle]}>{children}</Text>
    </Pressable>
  );
}

export function PrototypeTopActions({
  onBack,
  onRegenerate,
  regenerateLabel = '重新生成当前层级',
}: PrototypeTopActionsProps) {
  return (
    <View style={styles.topActions}>
      <Pressable
        accessibilityLabel="返回上一步"
        accessibilityRole="button"
        onPress={onBack}
        style={({ pressed }) => [styles.topIconButton, pressed ? styles.pressed : null]}
      >
        <Ionicons color="#CBD5E1" name="chevron-back" size={18} />
      </Pressable>
      {onRegenerate ? (
        <Pressable
          accessibilityLabel={regenerateLabel}
          accessibilityRole="button"
          onPress={onRegenerate}
          style={({ pressed }) => [styles.topIconButton, styles.regenerateButton, pressed ? styles.pressed : null]}
        >
          <Ionicons color="#FEF3C7" name="refresh" size={17} />
        </Pressable>
      ) : (
        <View style={styles.topActionSpacer} />
      )}
    </View>
  );
}

export function PrototypeOnboardingPanel({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.onboardingPanel, style]}>{children}</View>;
}

export function PrototypeEyebrow({ children, tone = 'plain' }: PropsWithChildren<{ tone?: 'gold' | 'plain' }>) {
  return <Text style={[styles.eyebrow, tone === 'gold' ? styles.eyebrowGold : null]}>{children}</Text>;
}

export function PrototypeTreeTool({ label, onPress, tone, value }: PrototypeTreeToolProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.treeTool, styles[`${tone}TreeTool`], pressed ? styles.pressed : null]}
      testID="prototype-button-tree-tool"
    >
      <Text style={styles.treeToolValue}>{value}</Text>
      <Text style={styles.treeToolLabel}>{label}</Text>
    </Pressable>
  );
}

export function PrototypeModalLayer({ children, kind = 'center', onBackdropPress }: PrototypeModalLayerProps) {
  return (
    <Pressable
      accessibilityRole="none"
      onPress={onBackdropPress}
      style={[styles.modalLayer, kind === 'sheet' ? styles.sheetLayer : null]}
      testID={kind === 'sheet' ? 'prototype-sheet-layer' : 'prototype-modal-layer'}
    >
      <Pressable accessibilityRole="none" onPress={(event) => event.stopPropagation()} style={styles.modalContent}>
        {children}
      </Pressable>
    </Pressable>
  );
}

export function PrototypeModalCard({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return (
    <View style={[styles.modalCard, style]} testID="prototype-modal-card">
      {children}
    </View>
  );
}

export function PrototypeEditSheet({ children }: PropsWithChildren) {
  return (
    <View style={styles.editSheet} testID="prototype-edit-sheet">
      <View style={styles.sheetHandle} />
      {children}
    </View>
  );
}

export function PrototypeActionRow({ children }: PropsWithChildren) {
  return <View style={styles.modalActions}>{children}</View>;
}

export function PrototypeToast({ children }: PropsWithChildren) {
  return (
    <View style={[styles.toast, prototypeGlassBlur]} testID="prototype-toast">
      <Text style={styles.toastText}>{children}</Text>
    </View>
  );
}

export function PrototypeInput(props: TextInputProps) {
  return <TextInput placeholderTextColor={prototype.color.dim} style={styles.input} {...props} />;
}

export function PrototypeTextarea({ style, ...props }: TextInputProps) {
  return (
    <TextInput
      multiline
      placeholderTextColor={prototype.color.dim}
      style={[styles.textarea, style]}
      textAlignVertical="top"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: prototype.color.glassBorder,
    borderRadius: prototype.radius.control,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 48,
  },
  addText: {
    color: 'rgba(236, 253, 245, 0.80)',
  },
  bottomNav: {
    backgroundColor: prototype.color.glassStrong,
    borderColor: 'rgba(209, 250, 229, 0.10)',
    borderRadius: prototype.radius.nav,
    borderWidth: StyleSheet.hairlineWidth,
    bottom: prototype.size.bottomNavInsetWeb,
    boxShadow: '0 -10px 40px rgba(0, 0, 0, .30)',
    flexDirection: 'row',
    height: prototype.size.bottomNavHeight,
    left: 20,
    padding: 8,
    position: 'absolute',
    right: 20,
    zIndex: 40,
  } as ViewStyle,
  buttonBase: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  disabled: {
    opacity: 0.4,
  },
  editSheet: {
    backgroundColor: 'rgba(7, 17, 15, 0.95)',
    borderColor: 'rgba(207, 250, 254, 0.26)',
    borderRadius: 30,
    borderBottomLeftRadius: 42,
    borderBottomRightRadius: 42,
    borderWidth: StyleSheet.hairlineWidth,
    boxShadow: '0 -18px 70px rgba(0, 0, 0, .72), inset 0 1px 0 rgba(255, 255, 255, .08)',
    padding: 20,
    width: '100%',
  } as ViewStyle,
  fruitTreeTool: {
    borderColor: 'rgba(254, 243, 199, 0.20)',
  },
  ghostButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: prototype.radius.control,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
    paddingHorizontal: 18,
  },
  ghostText: {
    color: '#CBD5E1',
  },
  honorTreeTool: {
    borderColor: 'rgba(209, 250, 229, 0.20)',
  },
  iconButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: prototype.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    height: 36,
    width: 36,
  },
  iconText: {
    color: '#CBD5E1',
  },
  eyebrow: {
    color: 'rgba(209, 250, 229, 0.52)',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  eyebrowGold: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(254, 240, 138, 0.14)',
    borderColor: 'rgba(254, 240, 138, 0.20)',
    borderRadius: prototype.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    color: '#FEF3C7',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
    textTransform: 'none',
  },
  input: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 46,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCard: {
    backgroundColor: 'rgba(7, 17, 15, 0.95)',
    borderColor: 'rgba(207, 250, 254, 0.15)',
    borderRadius: 30,
    borderWidth: StyleSheet.hairlineWidth,
    boxShadow: '0 30px 80px rgba(0, 0, 0, .55)',
    padding: 20,
    width: '100%',
  } as ViewStyle,
  modalContent: {
    width: '100%',
  },
  modalLayer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    padding: 24,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 80,
  },
  onboardingPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.045)',
    borderColor: prototype.color.glassBorder,
    borderRadius: prototype.radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, .08), 0 20px 48px rgba(0, 0, 0, .22)',
    gap: 16,
    overflow: 'hidden',
    padding: 20,
  } as ViewStyle,
  navButton: {
    alignItems: 'center',
    borderRadius: prototype.radius.navItem,
    flex: 1,
    gap: 4,
    height: 54,
    justifyContent: 'center',
  },
  navButtonActive: {
    backgroundColor: 'rgba(165, 243, 252, 0.10)',
    boxShadow: 'inset 0 0 24px rgba(65, 255, 226, .11)',
  } as ViewStyle,
  navLabel: {
    color: prototype.color.dim,
    fontSize: 11,
    lineHeight: 14,
  },
  navLabelActive: {
    color: prototype.color.softCyan,
  },
  pillButton: {
    backgroundColor: 'rgba(207, 250, 254, 0.08)',
    borderColor: 'rgba(207, 250, 254, 0.15)',
    borderRadius: prototype.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 34,
    paddingHorizontal: 12,
  },
  pillText: {
    color: prototype.color.softCyan,
    fontSize: 12,
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  primaryButton: {
    ...prototypePrimaryShadow,
    backgroundColor: 'rgba(207, 250, 254, 0.10)',
    borderColor: prototype.color.cyanBorder,
    borderRadius: prototype.radius.control,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 49,
    paddingHorizontal: 18,
  },
  primaryText: {
    color: '#ECFEFF',
  },
  quarterTreeTool: {
    borderColor: 'rgba(207, 250, 254, 0.20)',
  },
  replanButton: {
    backgroundColor: 'rgba(254, 240, 138, 0.10)',
    borderRadius: prototype.radius.pill,
    minHeight: 34,
    paddingHorizontal: 12,
  },
  replanText: {
    color: '#FEF3C7',
    fontSize: 12,
    lineHeight: 16,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: prototype.radius.control,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
    paddingHorizontal: 18,
  },
  secondaryText: {
    color: '#E2E8F0',
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: 'rgba(148, 163, 184, 0.36)',
    borderRadius: prototype.radius.pill,
    height: 4,
    marginBottom: 18,
    width: 44,
  },
  sheetLayer: {
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    justifyContent: 'flex-end',
    padding: 18,
  },
  textarea: {
    backgroundColor: 'rgba(3, 14, 15, 0.96)',
    borderColor: prototype.color.cyanBorder,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 26,
    minHeight: 104,
    padding: 16,
  },
  topActions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 36,
  },
  topActionSpacer: {
    height: 34,
    width: 34,
  },
  topIconButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: prototype.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  regenerateButton: {
    backgroundColor: 'rgba(254, 240, 138, 0.10)',
    borderColor: 'rgba(254, 240, 138, 0.20)',
  },
  toast: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderColor: prototype.color.cyanBorder,
    borderRadius: prototype.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    bottom: 96,
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: 'absolute',
    zIndex: 60,
  },
  toastText: {
    color: '#ECFEFF',
    fontSize: 12,
    lineHeight: 16,
  },
  treeTool: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.36)',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  treeToolLabel: {
    color: '#FFFBEB',
    fontSize: 12,
    lineHeight: 16,
  },
  treeToolValue: {
    color: '#FFFBEB',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
  },
});
