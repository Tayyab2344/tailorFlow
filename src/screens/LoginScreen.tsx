import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DottedBackground from '../components/DottedBackground';
import LogoT from '../components/LogoT';

import { useStore } from '../hooks/use-store';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
}

export default function LoginScreen({ onNavigateToRegister }: LoginScreenProps) {
  const login = useStore((state) => state.login);
  const [email, setEmail] = useState('atelier@tailorflow.com');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleLogin = () => {
    login(email);
  };


  return (
    <View style={styles.container}>
      <DottedBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Logo & Headings */}
          <View style={styles.headerContainer}>
            <LogoT size={90} />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Manage your atelier with precision.</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL OR PHONE</Text>
              <TextInput
                style={[
                  styles.input,
                  isEmailFocused && styles.inputFocused
                ]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="atelier@tailorflow.com"
                placeholderTextColor="#999"
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
              />
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    isPasswordFocused && styles.inputFocused
                  ]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#444"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me & Forgot Password Row */}
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={rememberMe ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={rememberMe ? '#000' : '#888'}
                />
                <Text style={styles.checkboxLabel}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.9}
            >
              <Text style={styles.loginButtonText}>LOGIN</Text>
            </TouchableOpacity>
          </View>

          {/* Navigation link at bottom */}
          <View style={styles.footerNav}>
            <Text style={styles.footerNavText}>
              New to TailorFlow?{' '}
              <Text style={styles.createAccountLink} onPress={onNavigateToRegister}>
                Create Account
              </Text>
            </Text>
          </View>

          {/* Bottom Branding Tagline */}
          <View style={styles.brandTagline}>
            <Text style={styles.taglineText}>CRAFTED FOR THE MODERN ATELIER</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF6F3', // Warm cream background
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E1DA',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D4C8BE',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#333333',
    backgroundColor: '#FFFFFF',
  },
  inputFocused: {
    borderColor: '#000000',
  },
  passwordContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#666666',
    marginLeft: 8,
  },
  forgotPassword: {
    fontSize: 13,
    color: '#000000',
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: '#000000',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  footerNav: {
    alignItems: 'center',
    marginBottom: 40,
  },
  footerNavText: {
    fontSize: 14,
    color: '#666666',
  },
  createAccountLink: {
    color: '#000000',
    fontWeight: '700',
  },
  brandTagline: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 16,
  },
  taglineText: {
    fontSize: 10,
    color: '#BDB3A8',
    letterSpacing: 2,
    fontWeight: '600',
  },
});
