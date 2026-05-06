import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type ViewStyle } from 'react-native';

import type { UpdateUserProfileRequest, UserContext } from '@newme/shared';

import { useAuthStore } from '../../src/stores/auth.store';
import { apiFetch } from '../../src/shared/api/client';
import {
  PrototypeEditSheet,
  PrototypeModalCard,
  PrototypeModalLayer,
  PrototypeScreen,
  PrototypeToast,
} from '../../src/shared/components';
import { prototype, prototypeGlassBlur } from '../../src/shared/theme';

const fallbackName = '林间行者';
const fallbackEmail = 'wzz***@gmail.com';

export default function MeScreen() {
  const clearSession = useAuthStore((state) => state.clearSession);
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);
  const [avatarSheetVisible, setAvatarSheetVisible] = useState(false);
  const [defaultAvatarRestored, setDefaultAvatarRestored] = useState(false);
  const [editSheetVisible, setEditSheetVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [nameDraft, setNameDraft] = useState(user?.displayName?.trim() || fallbackName);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayName = user?.displayName?.trim() || fallbackName;
  const email = user?.email?.trim() || fallbackEmail;
  const phone = user?.phone ?? '+86 138 **** 6688';
  const overlayVisible = avatarSheetVisible || editSheetVisible || logoutVisible;

  useEffect(() => {
    if (!editSheetVisible) {
      setNameDraft(displayName);
    }
  }, [displayName, editSheetVisible]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  function showToast(message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 1400);
  }

  async function saveName() {
    const nextName = nameDraft.trim() || '未命名用户';
    const payload: UpdateUserProfileRequest = {
      displayName: nextName,
      email: user?.email ?? null,
    };

    try {
      const updatedUser = await apiFetch<UserContext>('/me/profile', {
        body: payload,
        method: 'PATCH',
      });
      setUser(updatedUser);
      setEditSheetVisible(false);
      showToast('昵称已更新');
    } catch {
      setUser({
        ...(user ?? createFallbackUser()),
        displayName: nextName,
        email: user?.email ?? null,
      });
      setEditSheetVisible(false);
      showToast('昵称已更新');
    }
  }

  async function confirmLogout() {
    setLogoutVisible(false);

    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
      // 本机退出优先，服务端吊销失败时也清除本地登录态。
    } finally {
      await clearSession();
      router.replace('/auth/login');
    }
  }

  function handleAvatarAction(message: string, restoreDefault = false) {
    if (restoreDefault) setDefaultAvatarRestored(true);
    setAvatarSheetVisible(false);
    showToast(message);
  }

  return (
    <PrototypeScreen activeTab="me" contentStyle={styles.content} scroll={false} showNav={!overlayVisible}>
      <View style={styles.main}>
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <Pressable
              accessibilityLabel="点击更换头像"
              accessibilityRole="button"
              onPress={() => setAvatarSheetVisible(true)}
              style={styles.avatar}
            >
              <View style={[styles.avatarHead, defaultAvatarRestored ? styles.avatarMuted : null]} />
              <View style={[styles.avatarBody, defaultAvatarRestored ? styles.avatarMuted : null]} />
              <View style={styles.avatarEdit}>
                <Ionicons color="rgba(226, 232, 240, 0.86)" name="pencil" size={12} />
              </View>
            </Pressable>

            <View style={styles.profileText}>
              <View style={styles.nameLine}>
                <Text numberOfLines={1} style={styles.userName}>
                  {displayName}
                </Text>
                <Pressable
                  accessibilityLabel="编辑昵称"
                  accessibilityRole="button"
                  onPress={() => setEditSheetVisible(true)}
                  style={styles.nameEdit}
                >
                  <Ionicons color="rgba(207, 250, 254, 0.72)" name="pencil" size={13} />
                </Pressable>
              </View>
              <View style={styles.statusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>已登录 · 同步正常</Text>
              </View>
            </View>
          </View>

          <View style={styles.accountLines}>
            <View style={styles.accountLine}>
              <Text style={styles.accountLabel}>手机号</Text>
              <Text numberOfLines={1} style={styles.accountValue}>
                {phone}
              </Text>
            </View>
            <View style={styles.accountLine}>
              <Text style={styles.accountLabel}>邮箱</Text>
              <Text numberOfLines={1} style={styles.accountValue}>
                {email}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => setLogoutVisible(true)}
          style={({ pressed }) => [styles.logoutButton, pressed ? styles.pressed : null]}
        >
          <Text style={styles.logoutText}>退出登录</Text>
        </Pressable>
      </View>

      {editSheetVisible ? (
        <PrototypeModalLayer kind="sheet" onBackdropPress={() => setEditSheetVisible(false)}>
          <PrototypeEditSheet>
            <Text style={styles.sheetTitle}>编辑昵称</Text>
            <Text style={styles.sheetCopy}>昵称只用于 App 内展示。</Text>
            <TextInput
              accessibilityLabel="昵称"
              maxLength={16}
              onChangeText={setNameDraft}
              placeholder="请输入昵称"
              placeholderTextColor={prototype.color.dim}
              style={styles.input}
              value={nameDraft}
            />
            <View style={styles.sheetActions}>
              <Pressable accessibilityRole="button" onPress={saveName} style={[styles.sheetButton, styles.primary]}>
                <Text style={styles.primaryText}>保存</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => setEditSheetVisible(false)}
                style={[styles.sheetButton, styles.secondary]}
              >
                <Text style={styles.secondaryText}>取消</Text>
              </Pressable>
            </View>
          </PrototypeEditSheet>
        </PrototypeModalLayer>
      ) : null}

      {avatarSheetVisible ? (
        <PrototypeModalLayer kind="sheet" onBackdropPress={() => setAvatarSheetVisible(false)}>
          <PrototypeEditSheet>
            <Text style={styles.sheetTitle}>更换头像</Text>
            <Text style={styles.sheetCopy}>点击头像进入这里，不在页面上再放重复按钮。</Text>
            <View style={styles.actionList}>
              <AvatarAction label="从相册选择" onPress={() => handleAvatarAction('头像上传后端后续接入')} />
              <AvatarAction label="拍照上传" onPress={() => handleAvatarAction('头像上传后端后续接入')} />
              <AvatarAction label="恢复默认头像" onPress={() => handleAvatarAction('已恢复默认头像', true)} />
            </View>
            <View style={styles.singleAction}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setAvatarSheetVisible(false)}
                style={[styles.sheetButton, styles.secondary]}
              >
                <Text style={styles.secondaryText}>取消</Text>
              </Pressable>
            </View>
          </PrototypeEditSheet>
        </PrototypeModalLayer>
      ) : null}

      {logoutVisible ? (
        <PrototypeModalLayer onBackdropPress={() => setLogoutVisible(false)}>
          <PrototypeModalCard>
            <Text style={styles.modalTitle}>要退出当前账号吗？</Text>
            <Text style={styles.modalCopy}>退出后，本机将清除登录态。已同步的成长树、清单和计划会保留在云端。</Text>
            <View style={styles.sheetActions}>
              <Pressable
                accessibilityLabel="确认退出登录"
                accessibilityRole="button"
                onPress={confirmLogout}
                style={[styles.sheetButton, styles.logoutConfirm]}
              >
                <Text style={styles.logoutConfirmText}>退出登录</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => setLogoutVisible(false)}
                style={[styles.sheetButton, styles.secondary]}
              >
                <Text style={styles.secondaryText}>取消</Text>
              </Pressable>
            </View>
          </PrototypeModalCard>
        </PrototypeModalLayer>
      ) : null}

      {toast ? <PrototypeToast>{toast}</PrototypeToast> : null}
    </PrototypeScreen>
  );
}

function AvatarAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={`${label} ›`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.actionRow, pressed ? styles.pressed : null]}
    >
      <Text style={styles.actionText}>{label}</Text>
      <Text style={styles.actionChevron}>›</Text>
    </Pressable>
  );
}

function createFallbackUser(): UserContext {
  return {
    currentQuarterId: '2026-Q2',
    currentWeekId: '2026-W18',
    hasCompletedOnboarding: true,
    id: 'local-user',
    phone: '+86 138 **** 6688',
    timezone: 'Asia/Shanghai',
  };
}

const styles = StyleSheet.create({
  accountLabel: {
    color: 'rgba(148, 163, 184, 0.78)',
    fontSize: 13,
    lineHeight: 18,
  },
  accountLine: {
    alignItems: 'center',
    borderTopColor: 'rgba(255, 255, 255, 0.07)',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    minHeight: 52,
  },
  accountLines: {
    marginTop: 28,
  },
  accountValue: {
    color: 'rgba(226, 232, 240, 0.92)',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    minWidth: 0,
    textAlign: 'right',
  },
  actionChevron: {
    color: '#E2E8F0',
    fontSize: 18,
    lineHeight: 22,
  },
  actionList: {
    gap: 9,
  },
  actionRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
    borderColor: 'rgba(255, 255, 255, 0.065)',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionText: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 18,
  },
  avatar: {
    backgroundColor: 'rgba(22, 62, 48, 0.70)',
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    height: 68,
    position: 'relative',
    width: 68,
  },
  avatarBody: {
    backgroundColor: 'rgba(236, 254, 255, 0.72)',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    bottom: 11,
    height: 26,
    left: 15,
    position: 'absolute',
    width: 42,
  },
  avatarEdit: {
    ...prototypeGlassBlur,
    alignItems: 'center',
    backgroundColor: 'rgba(6, 12, 11, 0.92)',
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: prototype.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    bottom: -4,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: -4,
    width: 24,
  },
  avatarHead: {
    backgroundColor: 'rgba(236, 254, 255, 0.88)',
    borderRadius: prototype.radius.pill,
    boxShadow: '0 0 16px rgba(207, 250, 254, .32)',
    height: 30,
    left: 22,
    position: 'absolute',
    top: 16,
    width: 30,
  } as ViewStyle,
  avatarMuted: {
    opacity: 0.82,
  },
  content: {
    gap: 0,
    paddingTop: 20,
  },
  input: {
    backgroundColor: 'rgba(3, 14, 15, 0.96)',
    borderColor: 'rgba(207, 250, 254, 0.20)',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    color: '#FFFFFF',
    fontSize: 15,
    height: 50,
    paddingHorizontal: 14,
  },
  logoutButton: {
    alignItems: 'center',
    borderBottomColor: 'rgba(255, 255, 255, 0.07)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.07)',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 22,
    paddingVertical: 17,
    width: '100%',
  },
  logoutConfirm: {
    backgroundColor: 'rgba(244, 63, 94, 0.13)',
    borderColor: 'rgba(244, 63, 94, 0.20)',
  },
  logoutConfirmText: {
    color: '#FECDD3',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  logoutText: {
    color: 'rgba(254, 205, 211, 0.92)',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  main: {
    flex: 1,
  },
  modalCopy: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 21,
    marginTop: 8,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  nameEdit: {
    alignItems: 'center',
    borderRadius: prototype.radius.pill,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  nameLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minWidth: 0,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  primary: {
    backgroundColor: 'rgba(207, 250, 254, 0.14)',
    borderColor: 'rgba(207, 250, 254, 0.20)',
    boxShadow: '0 0 30px rgba(63, 255, 227, .12)',
  } as ViewStyle,
  primaryText: {
    color: '#ECFEFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  profileCard: {
    paddingTop: 6,
  },
  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  profileText: {
    flex: 1,
    minWidth: 0,
  },
  secondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.055)',
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  secondaryText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  sheetButton: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 12,
  },
  sheetCopy: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 20,
    marginBottom: 16,
    marginTop: 7,
  },
  sheetTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 23,
  },
  singleAction: {
    marginTop: 16,
  },
  statusDot: {
    backgroundColor: '#7BFFC2',
    borderRadius: prototype.radius.pill,
    boxShadow: '0 0 10px rgba(123, 255, 194, .80)',
    height: 6,
    width: 6,
  } as ViewStyle,
  statusPill: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 9,
  },
  statusText: {
    color: 'rgba(209, 250, 229, 0.68)',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  userName: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 27,
    minWidth: 0,
  },
});
