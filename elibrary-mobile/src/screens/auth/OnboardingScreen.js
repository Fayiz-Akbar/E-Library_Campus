// src/screens/auth/OnboardingScreen.js
import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: '1',
    icon: 'library-outline',
    title: 'Koleksi Digital',
    description:
      'Jelajahi ribuan koleksi buku perpustakaan kampus langsung dari genggaman tanganmu.',
  },
  {
    id: '2',
    icon: 'qr-code-outline',
    title: 'Pinjam via QR Code',
    description:
      'Scan QR code buku untuk meminjam dan mengembalikan secara instan tanpa antri.',
  },
  {
    id: '3',
    icon: 'notifications-outline',
    title: 'Notifikasi Cerdas',
    description:
      'Dapatkan pengingat otomatis sebelum batas peminjaman berakhir. Tidak ada lagi denda!',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => {
    navigation.replace('Login');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const renderSlide = ({ item, index }) => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const iconScale = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.slide}>
        <Animated.View
          style={[styles.iconCircle, { transform: [{ scale: iconScale }] }]}
        >
          <Ionicons name={item.icon} size={64} color={colors.primary} />
        </Animated.View>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideDescription}>{item.description}</Text>
      </View>
    );
  };

  const isLastSlide = currentIndex === ONBOARDING_DATA.length - 1;

  return (
    <View style={styles.container}>
      {/* Tombol Skip di pojok kanan atas */}
      {!isLastSlide && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Lewati</Text>
        </TouchableOpacity>
      )}

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      />

      {/* Pagination dots */}
      <View style={styles.paginationRow}>
        {ONBOARDING_DATA.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              currentIndex === i ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      {/* Tombol aksi */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextButtonText}>
            {isLastSlide ? 'Mulai Sekarang' : 'Selanjutnya'}
          </Text>
          <Ionicons
            name={isLastSlide ? 'rocket-outline' : 'arrow-forward'}
            size={18}
            color="#FFFFFF"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipButton: {
    position: 'absolute',
    top: 56,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  skipText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 3,
    borderColor: colors.primaryLight,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  slideDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  dot: {
    borderRadius: 6,
    marginHorizontal: 5,
  },
  dotActive: {
    width: 28,
    height: 8,
    backgroundColor: colors.primary,
  },
  dotInactive: {
    width: 8,
    height: 8,
    backgroundColor: colors.primaryLight,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  nextButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
