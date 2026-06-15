// src/screens/auth/SplashScreen.js
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';

/**
 * Splash screen dengan animasi fade-in logo.
 * Mengecek status login langsung dari AuthContext agar sesi tetap terbaca
 * setelah refresh web atau app dibuka ulang.
 */
export default function SplashScreen({ navigation }) {
  const { isLoadingSession, isLoggedIn, isAdmin } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animasi logo muncul
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    if (isLoadingSession) return undefined;

    // Navigasi otomatis setelah sesi dari storage selesai dimuat.
    const timer = setTimeout(() => {
      if (isLoggedIn) {
        navigation.replace(isAdmin ? 'AdminTabs' : 'MainTabs');
      } else {
        navigation.replace('Onboarding');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation, isLoadingSession, isLoggedIn, isAdmin, fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      {/* Dekorasi lingkaran background */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.iconWrapper}>
          <Ionicons name="library" size={48} color="#FFFFFF" />
        </View>
        <Text style={styles.appName}>E-Library</Text>
        <Text style={styles.tagline}>Perpustakaan Digital Kampus</Text>
      </Animated.View>

      <Animated.Text style={[styles.version, { opacity: fadeAnim }]}>
        v1.0.0
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -80,
    right: -60,
  },
  circle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -40,
    left: -40,
  },
  circle3: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: 150,
    left: 50,
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  version: {
    position: 'absolute',
    bottom: 40,
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '600',
  },
});
