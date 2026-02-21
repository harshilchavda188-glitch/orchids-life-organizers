import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING, COUNTRY_CODES } from '../constants/theme';
import { InputField, PrimaryButton } from '../components/FormComponents';
import { User, generateId, getStoredUsers, storeUser } from '../hooks/useAuth';

type AuthTab = 'login' | 'signup' | 'phone';

interface AuthScreenProps {
  onAuth: (user: User) => void;
}

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);

  // Signup
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Phone
  const [countryCode, setCountryCode] = useState('+91');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpResendTimer, setOtpResendTimer] = useState(0);
  const otpRefs = useRef<(TextInput | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearError = () => setError('');
  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleLogin = useCallback(async () => {
    clearError();
    if (!loginEmail.trim()) return setError('Please enter your email address');
    if (!validateEmail(loginEmail)) return setError('Please enter a valid email address');
    if (!loginPassword) return setError('Please enter your password');
    if (loginPassword.length < 6) return setError('Password must be at least 6 characters');

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1200));

    const users = await getStoredUsers();
    const found = users[loginEmail.toLowerCase()];

    if (!found) {
      setIsLoading(false);
      return setError('No account found with this email. Please sign up first.');
    }
    if (found.password !== loginPassword) {
      setIsLoading(false);
      return setError('Incorrect password. Please try again.');
    }

    onAuth({
      id: generateId(),
      name: found.name,
      email: found.email,
      authMethod: 'email',
      createdAt: new Date().toISOString(),
    });
    setIsLoading(false);
  }, [loginEmail, loginPassword, onAuth]);

  const handleSignup = useCallback(async () => {
    clearError();
    if (!signupName.trim()) return setError('Please enter your name');
    if (!signupEmail.trim()) return setError('Please enter your email address');
    if (!validateEmail(signupEmail)) return setError('Please enter a valid email address');
    if (!signupPassword) return setError('Please create a password');
    if (signupPassword.length < 6) return setError('Password must be at least 6 characters');
    if (signupPassword !== signupConfirm) return setError('Passwords do not match');

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1200));

    const users = await getStoredUsers();
    if (users[signupEmail.toLowerCase()]) {
      setIsLoading(false);
      return setError('An account with this email already exists. Please log in.');
    }

    await storeUser(signupEmail, {
      name: signupName.trim(),
      email: signupEmail.trim(),
      password: signupPassword,
    });

    onAuth({
      id: generateId(),
      name: signupName.trim(),
      email: signupEmail.trim(),
      authMethod: 'email',
      createdAt: new Date().toISOString(),
    });
    setIsLoading(false);
  }, [signupName, signupEmail, signupPassword, signupConfirm, onAuth]);

  const handleSendOtp = useCallback(async () => {
    clearError();
    if (!phoneNumber.trim()) return setError('Please enter your phone number');
    if (phoneNumber.replace(/\D/g, '').length < 10) return setError('Please enter a valid 10-digit phone number');

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setOtpSent(true);
    setOtpResendTimer(30);
    setIsLoading(false);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setOtpResendTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [phoneNumber]);

  const handleVerifyOtp = useCallback(async () => {
    clearError();
    const otpValue = otp.join('');
    if (otpValue.length < 6) return setError('Please enter the complete 6-digit OTP');

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    onAuth({
      id: generateId(),
      name: 'User',
      email: '',
      phone: `${countryCode}${phoneNumber}`,
      authMethod: 'phone',
      createdAt: new Date().toISOString(),
    });
    setIsLoading(false);
  }, [otp, countryCode, phoneNumber, onAuth]);

  const handleGoogleSignIn = useCallback(async () => {
    clearError();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1500));

    onAuth({
      id: generateId(),
      name: 'Google User',
      email: 'user@gmail.com',
      authMethod: 'google',
      createdAt: new Date().toISOString(),
    });
    setIsLoading(false);
  }, [onAuth]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const tabs: { id: AuthTab; label: string }[] = [
    { id: 'login', label: 'Login' },
    { id: 'signup', label: 'Signup' },
    { id: 'phone', label: 'Phone' },
  ];

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode);

  return (
    <LinearGradient colors={[COLORS.background, COLORS.backgroundSecondary, COLORS.white]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.appIcon}>
              <Text style={styles.appIconText}>✦</Text>
            </LinearGradient>
            <Text style={styles.appName}>Smart Life</Text>
            <Text style={styles.subtitle}>Organize your day, manage your life</Text>
          </View>

          {/* Auth Card */}
          <View style={styles.card}>
            {/* Tab Switcher */}
            <View style={styles.tabRow}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => {
                    setActiveTab(tab.id);
                    clearError();
                  }}
                  activeOpacity={0.7}
                  style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                >
                  <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Error */}
            {error !== '' && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Login Form */}
            {activeTab === 'login' && (
              <View style={styles.form}>
                <InputField
                  icon={<Text style={styles.iconEmoji}>✉</Text>}
                  placeholder="Email address"
                  value={loginEmail}
                  onChangeText={setLoginEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <InputField
                  icon={<Text style={styles.iconEmoji}>🔒</Text>}
                  placeholder="Password"
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                  secureTextEntry={!showLoginPw}
                  suffix={
                    <TouchableOpacity onPress={() => setShowLoginPw(!showLoginPw)}>
                      <Text style={styles.eyeIcon}>{showLoginPw ? '🙈' : '👁'}</Text>
                    </TouchableOpacity>
                  }
                />
                <PrimaryButton label="Sign In" onPress={handleLogin} loading={isLoading} />
              </View>
            )}

            {/* Signup Form */}
            {activeTab === 'signup' && (
              <View style={styles.form}>
                <InputField
                  icon={<Text style={styles.iconEmoji}>👤</Text>}
                  placeholder="Full name"
                  value={signupName}
                  onChangeText={setSignupName}
                  autoCapitalize="words"
                />
                <InputField
                  icon={<Text style={styles.iconEmoji}>✉</Text>}
                  placeholder="Email address"
                  value={signupEmail}
                  onChangeText={setSignupEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <InputField
                  icon={<Text style={styles.iconEmoji}>🔒</Text>}
                  placeholder="Create password"
                  value={signupPassword}
                  onChangeText={setSignupPassword}
                  secureTextEntry={!showSignupPw}
                  suffix={
                    <TouchableOpacity onPress={() => setShowSignupPw(!showSignupPw)}>
                      <Text style={styles.eyeIcon}>{showSignupPw ? '🙈' : '👁'}</Text>
                    </TouchableOpacity>
                  }
                />
                <InputField
                  icon={<Text style={styles.iconEmoji}>🔒</Text>}
                  placeholder="Confirm password"
                  value={signupConfirm}
                  onChangeText={setSignupConfirm}
                  secureTextEntry={!showConfirmPw}
                  suffix={
                    <TouchableOpacity onPress={() => setShowConfirmPw(!showConfirmPw)}>
                      <Text style={styles.eyeIcon}>{showConfirmPw ? '🙈' : '👁'}</Text>
                    </TouchableOpacity>
                  }
                />
                <PrimaryButton label="Create Account" onPress={handleSignup} loading={isLoading} />
              </View>
            )}

            {/* Phone Login */}
            {activeTab === 'phone' && (
              <View style={styles.form}>
                {!otpSent ? (
                  <>
                    <View style={styles.phoneRow}>
                      <TouchableOpacity
                        onPress={() => setShowCountryPicker(true)}
                        style={styles.countryBtn}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.countryFlag}>{selectedCountry?.flag}</Text>
                        <Text style={styles.countryCode}>{countryCode}</Text>
                        <Text style={styles.chevron}>▼</Text>
                      </TouchableOpacity>
                      <View style={styles.phoneInputWrap}>
                        <Text style={[styles.iconEmoji, { marginRight: 10 }]}>📱</Text>
                        <TextInput
                          placeholder="Phone number"
                          placeholderTextColor={COLORS.textMuted}
                          value={phoneNumber}
                          onChangeText={setPhoneNumber}
                          keyboardType="phone-pad"
                          maxLength={10}
                          style={styles.phoneInput}
                        />
                      </View>
                    </View>
                    <PrimaryButton label="Send OTP" onPress={handleSendOtp} loading={isLoading} />
                  </>
                ) : (
                  <>
                    <Text style={styles.otpInfo}>
                      Enter the 6-digit code sent to{' '}
                      <Text style={styles.otpPhone}>
                        {countryCode} {phoneNumber}
                      </Text>
                    </Text>
                    <View style={styles.otpRow}>
                      {otp.map((digit, i) => (
                        <TextInput
                          key={i}
                          ref={(ref) => {
                            otpRefs.current[i] = ref;
                          }}
                          value={digit}
                          onChangeText={(v) => handleOtpChange(i, v)}
                          onKeyPress={({ nativeEvent }) => handleOtpKeyPress(i, nativeEvent.key)}
                          keyboardType="number-pad"
                          maxLength={1}
                          style={styles.otpInput}
                          textAlign="center"
                        />
                      ))}
                    </View>
                    <PrimaryButton label="Verify OTP" onPress={handleVerifyOtp} loading={isLoading} />
                    <View style={styles.resendRow}>
                      {otpResendTimer > 0 ? (
                        <Text style={styles.resendTimer}>Resend OTP in {otpResendTimer}s</Text>
                      ) : (
                        <TouchableOpacity
                          onPress={() => {
                            setOtpSent(false);
                            setOtp(['', '', '', '', '', '']);
                          }}
                        >
                          <Text style={styles.resendLink}>Resend OTP</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </>
                )}
              </View>
            )}

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign In */}
            <TouchableOpacity
              onPress={handleGoogleSignIn}
              disabled={isLoading}
              activeOpacity={0.7}
              style={styles.googleBtn}
            >
              <Text style={styles.googleG}>G</Text>
              <Text style={styles.googleBtnText}>Sign in with Google</Text>
            </TouchableOpacity>
          </View>

          {/* Legal */}
          <Text style={styles.legal}>
            By signing in, you agree to our{' '}
            <Text style={styles.legalLink}>Terms of Service</Text> and{' '}
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Picker Modal */}
      <Modal visible={showCountryPicker} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCountryPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <FlatList
              data={COUNTRY_CODES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setCountryCode(item.code);
                    setShowCountryPicker(false);
                  }}
                  style={[
                    styles.countryItem,
                    countryCode === item.code && styles.countryItemActive,
                  ]}
                >
                  <Text style={styles.countryItemFlag}>{item.flag}</Text>
                  <Text style={styles.countryItemName}>{item.country}</Text>
                  <Text style={styles.countryItemCode}>{item.code}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  appIconText: {
    fontSize: 36,
    color: '#fff',
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.tabBg,
    borderRadius: RADIUS.lg,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.text,
  },
  errorBox: {
    backgroundColor: COLORS.errorBg,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.error,
  },
  form: {
    gap: 14,
  },
  iconEmoji: {
    fontSize: 16,
  },
  eyeIcon: {
    fontSize: 18,
  },
  // Phone
  phoneRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    height: 52,
    gap: 6,
  },
  countryFlag: {
    fontSize: 18,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  chevron: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  phoneInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    height: 52,
  },
  phoneInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    height: '100%',
  },
  // OTP
  otpInfo: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  otpPhone: {
    fontWeight: '600',
    color: COLORS.text,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  otpInput: {
    width: 44,
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.inputBg,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  resendRow: {
    alignItems: 'center',
  },
  resendTimer: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  resendLink: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  // Google
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    height: 52,
    gap: 12,
    backgroundColor: COLORS.white,
  },
  googleG: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.google.blue,
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  // Legal
  legal: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
    maxWidth: 320,
  },
  legalLink: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    gap: 12,
  },
  countryItemActive: {
    backgroundColor: '#eff6ff',
  },
  countryItemFlag: {
    fontSize: 22,
  },
  countryItemName: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  countryItemCode: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginLeft: 'auto',
  },
});
