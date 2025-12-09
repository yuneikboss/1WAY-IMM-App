import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from './constants/colors';
import { useAuth } from './context/AuthContext';

type AuthMode = 'login' | 'signup' | 'verify';

export default function LoginScreen() {
  const router = useRouter();
  const { login, signup, verifyEmail, hasAcceptedGuidelines } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect to onboarding if guidelines not accepted
  React.useEffect(() => {
    if (!hasAcceptedGuidelines) {
      router.replace('/onboarding');
    }
  }, [hasAcceptedGuidelines]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (mode === 'signup') {
      if (!username.trim()) {
        newErrors.username = 'Username is required';
      } else if (username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (mode === 'signup' && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        router.replace('/');
      } else {
        Alert.alert('Error', 'Invalid email or password');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const success = await signup(email, username, password);
      if (success) {
        setMode('verify');
        Alert.alert('Verification Code Sent', `A verification code has been sent to ${email}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setErrors({ code: 'Please enter the 6-digit code' });
      return;
    }
    
    setLoading(true);
    try {
      const success = await verifyEmail(verificationCode);
      if (success) {
        router.replace('/');
      } else {
        Alert.alert('Error', 'Invalid verification code');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const renderVerifyScreen = () => (
    <View style={styles.formContainer}>
      <View style={styles.verifyIcon}>
        <Ionicons name="mail" size={48} color={COLORS.primary} />
      </View>
      <Text style={styles.verifyTitle}>Verify Your Email</Text>
      <Text style={styles.verifyDesc}>
        We've sent a 6-digit verification code to{'\n'}
        <Text style={styles.emailHighlight}>{email}</Text>
      </Text>

      <View style={styles.codeContainer}>
        <TextInput
          style={styles.codeInput}
          value={verificationCode}
          onChangeText={setVerificationCode}
          placeholder="000000"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="number-pad"
          maxLength={6}
        />
      </View>
      {errors.code && <Text style={styles.errorText}>{errors.code}</Text>}

      <TouchableOpacity style={styles.primaryBtn} onPress={handleVerify} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={COLORS.textPrimary} />
        ) : (
          <Text style={styles.primaryBtnText}>Verify & Continue</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.resendBtn}>
        <Text style={styles.resendText}>Didn't receive code? </Text>
        <Text style={styles.resendLink}>Resend</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setMode('signup')}>
        <Text style={styles.backText}>Back to Sign Up</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Image 
            source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/692bf8fe6f6012747066995c_1764997736375_fd969565.jpg' }} 
            style={styles.logo}
          />
          <Text style={styles.title}>1WAY</Text>
          <Text style={styles.subtitle}>
            {mode === 'verify' ? 'Almost there!' : mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </Text>
        </View>

        {mode === 'verify' ? renderVerifyScreen() : (
          <View style={styles.formContainer}>
            {mode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <View style={[styles.inputContainer, errors.username && styles.inputError]}>
                  <Ionicons name="person" size={20} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Choose a username"
                    placeholderTextColor={COLORS.textMuted}
                    autoCapitalize="none"
                  />
                </View>
                {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Ionicons name="mail" size={20} color={COLORS.textMuted} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed" size={20} color={COLORS.textMuted} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {mode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                  <Ionicons name="lock-closed" size={20} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm password"
                    placeholderTextColor={COLORS.textMuted}
                    secureTextEntry={!showPassword}
                  />
                </View>
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>
            )}

            {mode === 'login' && (
              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.primaryBtn} 
              onPress={mode === 'login' ? handleLogin : handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.textPrimary} />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialBtns}>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-google" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-apple" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-facebook" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.switchMode} onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
              <Text style={styles.switchText}>
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              </Text>
              <Text style={styles.switchLink}>
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  header: { alignItems: 'center', paddingTop: 80, paddingBottom: 40 },
  logo: { width: 80, height: 80, borderRadius: 40, marginBottom: 16 },
  title: { fontSize: 40, fontWeight: '800', color: COLORS.textPrimary },
  subtitle: { fontSize: 18, color: COLORS.textMuted, marginTop: 8 },
  formContainer: { paddingHorizontal: 24 },
  inputGroup: { marginBottom: 20 },
  label: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.backgroundCard, 
    borderRadius: 12, 
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: { borderColor: COLORS.error },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: 16, paddingVertical: 16 },
  errorText: { color: COLORS.error, fontSize: 12, marginTop: 4 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  primaryBtn: { 
    backgroundColor: COLORS.primary, 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.backgroundCard },
  dividerText: { color: COLORS.textMuted, paddingHorizontal: 16, fontSize: 14 },
  socialBtns: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  socialBtn: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: COLORS.backgroundCard, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  switchMode: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  switchText: { color: COLORS.textMuted, fontSize: 14 },
  switchLink: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  verifyIcon: { 
    width: 96, 
    height: 96, 
    borderRadius: 48, 
    backgroundColor: COLORS.backgroundCard, 
    justifyContent: 'center', 
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  verifyTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  verifyDesc: { color: COLORS.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  emailHighlight: { color: COLORS.primary, fontWeight: '600' },
  codeContainer: { marginVertical: 24 },
  codeInput: { 
    backgroundColor: COLORS.backgroundCard, 
    borderRadius: 12, 
    padding: 20, 
    fontSize: 32, 
    fontWeight: '700',
    color: COLORS.textPrimary, 
    textAlign: 'center',
    letterSpacing: 12,
  },
  resendBtn: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  resendText: { color: COLORS.textMuted },
  resendLink: { color: COLORS.primary, fontWeight: '600' },
  backText: { color: COLORS.textMuted, textAlign: 'center', marginTop: 24 },
});
