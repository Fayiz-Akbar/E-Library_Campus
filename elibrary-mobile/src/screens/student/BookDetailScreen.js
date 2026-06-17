// src/screens/student/BookDetailScreen.js
import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, StatusBar, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { getResponsiveContentStyle } from '../../utils/responsive';

const PLACEHOLDER_COVER = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80';

export default function BookDetailScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const { book } = route.params;
  const contentStyle = getResponsiveContentStyle(width, 760);
  const coverWidth = Math.min(320, Math.max(190, width * 0.42));
  const coverHeight = coverWidth * 1.38;
  
  const isAvailable = book.available_stock > 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent={true} backgroundColor="transparent" />

      {/* ===== TOP NAVBAR ===== */}
      <View style={styles.topNavbar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navbarTitle} numberOfLines={1}>Detail Informasi Buku</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* ===== MAIN CONTENT ===== */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        <View style={[styles.detailContent, contentStyle]}>
          
          {/* SAMPUL BUKU */}
          <View style={styles.coverSection}>
            <View style={[styles.imageShadowBox, { width: coverWidth, height: coverHeight }]}>
              <Image source={{ uri: book.cover_image || PLACEHOLDER_COVER }} style={styles.mainCoverImage} resizeMode="cover" />
            </View>
          </View>

          {/* DETAIL UTAMA */}
          <View style={styles.infoSection}>
            <Text style={styles.bookAuthor}>{book.author ? book.author.toUpperCase() : 'UNKNOWN'}</Text>
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

          {/* BAR METRIKS SPESIFIKASI */}
          <View style={styles.metricsBar}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>ISBN</Text>
              <Text style={styles.metricLabel} numberOfLines={1}>{book.isbn ? book.isbn.substring(0, 13) : '-'}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>Bahasa</Text>
              <Text style={styles.metricLabel}>Indonesia</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>Kondisi</Text>
              <Text style={styles.metricLabel}>Baik</Text>
            </View>
          </View>

          {/* SINOPSIS */}
          <View style={styles.synopsisSection}>
            <Text style={styles.sectionTitle}>Sinopsis Buku</Text>
            <Text style={styles.synopsisParagraph}>
              {book.summary || 'Tidak ada sinopsis atau ringkasan deskripsi yang tersedia untuk katalog buku ini, Bree.'}
            </Text>
          </View>
          
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  topNavbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#F4F1FE' },
  backButton: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  navbarTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, flex: 1, textAlign: 'center', marginLeft: 22 },
  
  // Jarak bawah disesuaikan menjadi lebih pendek (40) karena bottom action bar sudah dimusnahkan
  scrollPadding: { paddingBottom: 40 }, 
  
  detailContent: { alignSelf: 'center' },
  coverSection: { alignItems: 'center', marginTop: 24, marginBottom: 20 },
  imageShadowBox: { borderRadius: 24, backgroundColor: '#F1F5F9', elevation: 12, shadowColor: colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.18, shadowRadius: 14 },
  mainCoverImage: { width: '100%', height: '100%', borderRadius: 24 },
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
  metricsBar: { flexDirection: 'row', backgroundColor: '#FAF9FE', marginHorizontal: 24, marginTop: 24, borderRadius: 16, paddingVertical: 14, borderWidth: 1, borderColor: '#ECE9FA' },
  metricItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  metricValue: { fontSize: 10, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase' },
  metricLabel: { fontSize: 13, fontWeight: '800', color: colors.textPrimary, marginTop: 2 },
  metricDivider: { width: 1, height: '70%', backgroundColor: '#E2E8F0', alignSelf: 'center' },
  synopsisSection: { paddingHorizontal: 24, marginTop: 28 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, marginBottom: 8 },
  synopsisParagraph: { fontSize: 13, color: colors.textSecondary, lineHeight: 22, textAlign: 'justify', fontWeight: '500' }
});