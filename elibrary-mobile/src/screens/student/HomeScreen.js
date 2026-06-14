// src/screens/student/HomeScreen.js
import React from 'react';
import { StyleSheet, Text, View, ScrollView, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { colors } from '../../constants/colors';
import { useHome } from '../../hooks/useHome';

export default function HomeScreen() {
  const { books, loading, error, refreshData } = useHome();

  // Komponen Card Buku untuk Horizontal Slider (Buku Populer)
  const renderPopularBook = ({ item }) => (
    <TouchableOpacity style={styles.popularCard}>
      <Image
        source={item.cover_image ? { uri: item.cover_image } : require('../../assets/images/book-placeholder.png')}
        style={styles.popularImage}
      />
      <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>
    </TouchableOpacity>
  );

  // Komponen List Baris Buku untuk List Vertikal (Buku Terbaru)
  const renderLatestBook = ({ item }) => (
    <TouchableOpacity style={styles.latestCard}>
      <Image
        source={item.cover_image ? { uri: item.cover_image } : require('../../assets/images/book-placeholder.png')}
        style={styles.latestImage}
      />
      {/* PERBAIKAN: Mengubah <div> menjadi <View> sesuai standar React Native */}
      <View style={styles.latestDetails}>
        <Text style={styles.latestTitle}>{item.title}</Text>
        <Text style={styles.latestAuthor}>Oleh: {item.author}</Text>
        <View style={styles.badgeContainer}>
          <Text style={[styles.stockBadge, item.available_stock > 0 ? styles.badgeSuccess : styles.badgeDanger]}>
            {item.available_stock > 0 ? `Tersedia: ${item.available_stock}` : 'Kosong'}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} bounces={true}>
      {/* 1. HEADER SECTIONS */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Selamat Datang,</Text>
          <Text style={styles.usernameText}>Mahasiswa Kampus</Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={24} color={colors.textOnPrimary} />
        </TouchableOpacity>
      </View>

      {/* 2. SUMMARY BORROW CARD */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Ionicons name="book" size={32} color={colors.primary} />
          <View style={styles.summaryTexts}>
            <Text style={styles.summaryNumber}>0 Buku</Text>
            <Text style={styles.summaryLabel}>Sedang Dipinjam</Text>
          </View>
        </View>
      </View>

      {/* HANDLING STATE LOADING / ERROR */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={refreshData}>
            <Text style={styles.refreshButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* 3. HORIZONTAL SLIDER - BUKU POPULER */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Rekomendasi Buku Populer</Text>
            <FlatList
              data={books.slice(0, 5)} 
              renderItem={renderPopularBook}
              keyExtractor={(item) => 'pop-' + item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>

          {/* 4. VERTICAL LIST - BUKU TERBARU */}
          <View style={[styles.sectionContainer, { marginBottom: 40 }]}>
            <Text style={styles.sectionTitle}>Koleksi Buku Terbaru</Text>
            <FlatList
              data={books}
              renderItem={renderLatestBook}
              keyExtractor={(item) => 'lat-' + item.id.toString()}
              scrollEnabled={false} 
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: { color: colors.primaryLight, fontSize: 14 },
  usernameText: { color: colors.textOnPrimary, fontSize: 20, fontWeight: 'bold' },
  iconButton: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 50 },
  summaryCard: {
    backgroundColor: colors.background,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginTop: -25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryTexts: { marginLeft: 16 },
  summaryNumber: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
  summaryLabel: { fontSize: 12, color: colors.textSecondary },
  sectionContainer: { marginTop: 25 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginHorizontal: 20, marginBottom: 12 },
  horizontalList: { paddingLeft: 20, paddingRight: 10 },
  popularCard: { backgroundColor: colors.surface, marginRight: 15, borderRadius: 12, padding: 10, width: 130, alignItems: 'center' },
  popularImage: { width: 110, height: 140, borderRadius: 8, marginBottom: 8, backgroundColor: colors.border },
  bookTitle: { fontSize: 13, fontWeight: 'bold', color: colors.textPrimary, textAlign: 'center', width: '100%' },
  bookAuthor: { fontSize: 11, color: colors.textSecondary, textAlign: 'center', marginTop: 2 },
  latestCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  latestImage: { width: 50, height: 70, borderRadius: 6, backgroundColor: colors.border },
  latestDetails: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  latestTitle: { fontSize: 14, fontWeight: 'bold', color: colors.textPrimary },
  latestAuthor: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  badgeContainer: { flexDirection: 'row', marginTop: 6 },
  stockBadge: { fontSize: 10, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: 'bold' },
  badgeSuccess: { backgroundColor: '#D1FAE5', color: colors.success },
  badgeDanger: { backgroundColor: '#FEE2E2', color: colors.danger },
  errorContainer: { padding: 30, alignItems: 'center' },
  errorText: { color: colors.danger, textAlign: 'center', marginBottom: 15, fontSize: 14 },
  refreshButton: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  refreshButtonText: { color: colors.textOnPrimary, fontWeight: 'bold' },
});