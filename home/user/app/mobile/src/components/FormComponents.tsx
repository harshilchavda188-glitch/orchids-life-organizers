import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

/* ─── Input Field ─── */

interface InputFieldProps extends Omit<TextInputProps, 'onChange'> {
  icon?: React.ReactNode;
  value: string;
  onChangeText: (text: string) => void;
  suffix?: React.ReactNode;
}

export function InputField({ icon, value, onChangeText, suffix, style, ...rest }: InputFieldProps) {
  return (
    <View style={styles.inputRow}>
      {icon && <View style={styles.inputIcon}>{icon}</View>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={COLORS.textMuted}
        style={[styles.input, !icon && { paddingLeft: 0 }, style]}
        {...rest}
      />
      {suffix && <View style={styles.inputSuffix}>{suffix}</View>}
    </View>
  );
}

/* ─── Primary Button ─── */

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function PrimaryButton({ label, onPress, loading, disabled }: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.85}
      style={[styles.primaryBtn, (loading || disabled) && { opacity: 0.6 }]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={styles.primaryBtnText}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

/* ─── Icon Wrappers (simple text-based for no external icon lib) ─── */

export function IconText({ children, color, size = 18 }: { children: string; color?: string; size?: number }) {
  return <Text style={{ fontSize: size, color: color || COLORS.textMuted }}>{children}</Text>;
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    height: 52,
  },
  inputIcon: {
    marginRight: SPACING.md,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    height: '100%',
  },
  inputSuffix: {
    marginLeft: SPACING.sm,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
