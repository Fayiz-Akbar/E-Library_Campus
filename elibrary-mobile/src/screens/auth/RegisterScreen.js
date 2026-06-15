// src/screens/auth/RegisterScreen.js
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';

const MIN_PASSWORD_LENGTH = 6;

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const handleRegister = async () => {
    // Validasi input di sisi client
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Peringatan ⚠️', 'Semua field wajib diisi.');
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      Alert.alert('Peringatan ⚠️', `Password minimal ${MIN_PASSWORD_LENGTH} karakter.`);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Peringatan ⚠️', 'Password dan konfirmasi password tidak cocok.');
      return;
    }

    try {
      setLoading(true);
      const response = await register(name.trim(), email.trim(), password);

      if (response.success) {
        Alert.alert('Berhasil 🎉', response.message, [
          {
            text: 'OK',
            onPress: () => {
              const userRole = response.data.user.role;
              navigation.replace(userRole === 'admin' ? 'AdminTabs' : 'MainTabs');
            },
          },
        ]);
      } else {
        Alert.alert('Registrasi Gagal ❌', response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Dekorasi header */}
      <View style={styles.headerDecor}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.logoIcon}>
            <Ionicons name="person-add" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>Buat Akun Baru</Text>
          <Text style={styles.headerSubtitle}>
            Daftarkan dirimu untuk mulai meminjam buku
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.formContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.formContent}
      >
        {/* Input Nama */}
        <Text style={styles.inputLabel}>
          Nama Lengkap <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="person-outline"
            size={18}
            color={colors.secondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Masukkan nama lengkap"
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        {/* Input Email */}
        <Text style={styles.inputLabel}>
          Alamat Email <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="mail-outline"
            size={18}
            color={colors.secondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.textInput}
            placeholder="contoh@email.com"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Input Password */}
        <Text style={styles.inputLabel}>
          Password <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color={colors.secondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.textInput}
            placeholder={`Minimal ${MIN_PASSWORD_LENGTH} karakter`}
            placeholderTextColor="#94A3B8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Input Konfirmasi Password */}
        <Text style={styles.inputLabel}>
          Konfirmasi Password <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="shield-checkmark-outline"
            size={18}
            color={colors.secondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Ulangi password yang sama"
            placeholderTextColor="#94A3B8"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
          />
        </View>

        {/* Tombol Register */}
        <TouchableOpacity
          style={[styles.registerButton, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons
                name="rocket-outline"
                size={18}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.registerButtonText}>Daftar Sekarang</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Link ke halaman Login */}
        <View style={styles.loginLinkRow}>
          <Text style={styles.loginText}>Sudah punya akun? </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.loginLink}>Masuk di sini</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerDecor: {
    backgroundColor: colors.primary,
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -60,
    right: -40,
  },
  circle2: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -30,
    left: -20,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 10,
  },
  logoIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 6,
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 14,
  },
  required: {
    color: colors.danger,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 28,
    elevation: 4,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  loginLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  loginLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '800',
  },
});
