// src/screens/student/BookDetailScreen.js
import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

const { width } = Dimensions.get('window');
const PLACEHOLDER_COVER = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80';

export default function BookDetailScreen({ route, navigation }) {
  // Menerima lemparan data objek buku dari halaman sebelumnya
  const { book } = route.params;
  const isAvailable = book.available_stock > 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent={true} backgroundColor="transparent" />

      {/* 1. CUSTOM TOP NAVIGATION BAR */}
      <View style={styles.topNavbar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navbarTitle} numberOfLines={1}>Detail Buku</Text>
        <TouchableOpacity style={styles.bookmarkButton} activeOpacity={0.7}>
          <Ionicons name="bookmark-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        {/* 2. HERO VISUAL: HERO BOOK COVER WITH AMBIENT SHADOW */}
        <View style={styles.coverSection}>
          <View style={styles.imageShadowBox}>
            <Image
              source={{ uri: book.cover_image || PLACEHOLDER_COVER }}
              style={styles.mainCoverImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* 3. BOOK IDENTITIES */}
        <View style={styles.infoSection}>
          <Text style={styles.bookAuthor}>{book.author?.toUpperCase()}</Text>
          <Text style={styles.bookTitle}>{book.title}</Text>
          
          <View style={styles.metaBadgeRow}>
            <View style={styles.publisherBadge}>
              <Ionicons name="business" size={12} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.publisherText}>{book.publisher || 'Perpustakaan Utama'}</Text>
            </View>
            <View style={[styles.stockBadge, isAvailable ? styles.bgSuccess : styles.bgDanger]}>
              <Text style={isAvailable ? styles.textSuccess : styles.textDanger}>
                {isAvailable ? `${book.available_stock} Tersedia` : 'Stok Habis'}
              </Text>
            </View>
          </View>
        </View>

        {/* 4. BOOK METRICS BAR (INFO TAMBAHAN ELEGAN) */}
        <View style={styles.metricsBar}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>ISBN</Text>
            <Text style={styles.metricLabel} numberOfLines={1}>{book.isbn ? book.isbn.substring(0, 5) + '...' : '-'}</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>Bahasa</Text>
            <Text style={styles.metricLabel}>Indonesia</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>Kondisi</Text>
            <Text style={styles.metricLabel}>Sangat Baik</Text>
          </View>
        </View>

        {/* 5. SYNOPSIS / SUMMARY SECTION */}
        <View style={styles.synopsisSection}>
          <Text style={styles.sectionTitle}>Sinopsis Buku</Text>
          <Text style={styles.synopsisParagraph}>
            {book.summary || 'Tidak ada sinopsis atau ringkasan deskripsi yang tersedia untuk katalog buku ini, Bree. Silakan hubungi petugas pustakawan administrasi kampus untuk informasi modul literatur lebih lengkap.'}
          </Text>
        </View>
      </ScrollView>

      {/* 6. FIXED BOTTOM ACTION BAR */}
      <View style={styles.bottomActionBar}>
        <TouchableOpacity 
          style={[styles.primaryActionBtn, !isAvailable && styles.disabledActionBtn]} 
          activeOpacity={0.8}
          disabled={!isAvailable}
          onPress={() => alert(`Proses peminjaman buku "${book.title}" berhasil diajukan!`)}
        >
          <Ionicons name="swap-horizontal" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.actionBtnText}>
            {isAvailable ? 'Ajukan Peminjaman Sekarang' : 'Koleksi Sedang Dipinjam'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  
  // Custom Navbar
  topNavbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#F4F1FE' },
  backButton: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  navbarTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, flex: 1, textAlign: 'center', marginHorizontal: 12 },
  bookmarkButton: { backgroundColor: '#F5F3FF', padding: 10, borderRadius: 12 },

  scrollPadding: { paddingBottom: 120 },

  // Hero Cover
  coverSection: { alignItems: 'center', marginTop: 24, marginBottom: 20 },
  imageShadowBox: {
    width: width * 0.52,
    height: width * 0.72,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    elevation: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },
  mainCoverImage: { width: '100%', height: '100%', borderRadius: 24 },

  // Identities
  infoSection: { alignItems: 'center', paddingHorizontal: 24, marginTop: 8 },
  bookAuthor: { fontSize: 11, fontWeight: '800', color: colors.primary, letterSpacing: 1.5 },
  bookTitle: { fontSize: 20, fontWeight: '900', color: colors.textPrimary, textAlign: 'center', marginTop: 6, lineHeight: 26 },
  metaBadgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 },
  publisherBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  publisherText: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
  stockBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  bgSuccess: { backgroundColor: '#E6F4EA' },
  bgDanger: { backgroundColor: '#FCE8E6' },
  textSuccess: { fontSize: 11, fontWeight: '800', color: '#137333' },
  textDanger: { fontSize: 11, fontWeight: '800', color: '#C5221F' },

  // Metrics Bar
  metricsBar: { flexDirection: 'row', backgroundColor: '#FAF9FE', marginHorizontal: 24, marginTop: 24, borderRadius: 16, paddingVertical: 14, borderWidth: 1, borderColor: '#ECE9FA' },
  metricItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  metricValue: { fontSize: 10, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase' },
  metricLabel: { fontSize: 13, fontWeight: '800', color: colors.textPrimary, marginTop: 2 },
  metricDivider: { width: 1, height: '70%', backgroundColor: '#E2E8F0', alignSelf: 'center' },

  // Synopsis
  synopsisSection: { paddingHorizontal: 24, marginTop: 28 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, marginBottom: 8 },
  synopsisParagraph: { fontSize: 13, color: colors.textSecondary, lineHeight: 22, textAlign: 'justify', fontWeight: '500' },

  // Sticky Bottom Bar
  bottomActionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 34, borderTopWidth: 1, borderColor: '#F4F1FE' },
  primaryActionBtn: { backgroundColor: colors.primary, borderRadius: 16, height: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6 },
  disabledActionBtn: { backgroundColor: '#CBD5E1', shadowOpacity: 0 },
  actionBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' }
});