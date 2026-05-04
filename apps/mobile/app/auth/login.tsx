import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAuthLogin } from '../../src/features/auth/useAuthLogin';
import { Button, GlassCard, Input, PrototypeScreen } from '../../src/shared/components';
import { prototype } from '../../src/shared/theme';

export default function AuthLoginScreen() {
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const { codeSent, devCode, error, isRequestingCode, isSigningIn, requestCode, signIn } = useAuthLogin();

  return (
    <PrototypeScreen contentStyle={styles.content} scroll={false}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons color={prototype.color.softCyan} name="sparkles-outline" size={16} />
          <Text style={styles.badgeText}>NewMe Account</Text>
        </View>
        <Text style={styles.title}>验证码登录</Text>
        <Text style={styles.subtitle}>登录后即可用真实身份调用 AI 规划、同步和业务接口。</Text>
      </View>

      <GlassCard style={styles.form}>
        <Input
          autoComplete="tel"
          containerStyle={styles.field}
          inputMode="tel"
          keyboardType="phone-pad"
          label="手机号"
          onChangeText={setPhone}
          placeholder="请输入手机号"
          returnKeyType="next"
          value={phone}
        />
        <Input
          autoComplete="one-time-code"
          containerStyle={styles.field}
          inputMode="numeric"
          keyboardType="number-pad"
          label="验证码"
          maxLength={6}
          onChangeText={setCode}
          placeholder="请输入 6 位验证码"
          returnKeyType="done"
          value={code}
        />

        {codeSent ? (
          <View style={styles.notice}>
            <Ionicons color={prototype.color.softCyan} name="checkmark-circle-outline" size={16} />
            <Text style={styles.noticeText}>
              验证码已发送{devCode ? `（开发模式：${devCode}）` : ''}
            </Text>
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.actions}>
          <Button
            disabled={!phone.trim()}
            loading={isRequestingCode}
            onPress={() => requestCode(phone)}
            variant="secondary"
          >
            获取验证码
          </Button>
          <Button
            disabled={!phone.trim() || !code.trim()}
            loading={isSigningIn}
            onPress={() => signIn(phone, code)}
          >
            登录
          </Button>
        </View>
      </GlassCard>
    </PrototypeScreen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 10,
    marginTop: 4,
  },
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(207, 250, 254, 0.08)',
    borderColor: 'rgba(207, 250, 254, 0.18)',
    borderRadius: prototype.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  badgeText: {
    color: prototype.color.softCyan,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  content: {
    justifyContent: 'center',
    paddingBottom: 36,
  },
  error: {
    color: '#FCA5A5',
    fontSize: 13,
    lineHeight: 18,
  },
  field: {
    gap: 0,
  },
  form: {
    gap: 14,
    padding: 18,
  },
  header: {
    gap: 12,
    marginBottom: 8,
  },
  notice: {
    alignItems: 'center',
    backgroundColor: 'rgba(45, 212, 191, 0.08)',
    borderColor: 'rgba(153, 246, 228, 0.16)',
    borderRadius: prototype.radius.control,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  noticeText: {
    color: prototype.color.softCyan,
    fontSize: 13,
    lineHeight: 18,
  },
  subtitle: {
    color: prototype.color.muted,
    fontSize: 14,
    lineHeight: 22,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 38,
  },
});
