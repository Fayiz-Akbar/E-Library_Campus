// src/screens/student/HomeScreen.js
import React from 'react';
import { StyleSheet, Text, View, ScrollView, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { colors } from '../../constants/colors';
import { useHome } from '../../hooks/useHome';

// Gambar tiruan cover buku premium jika admin tidak mengupload cover_image
const PLACEHOLDER_COVER = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80';

export default function HomeScreen() {
  const { books, loading, error, refreshData } = useHome();

  const renderPopularBook = ({ item }) => (
    <TouchableOpacity style={styles.popularCard} activeOpacity={0.8}>
      <View style={styles.imageShadowContainer}>
        <Image
          source={{ uri: item.cover_image || PLACEHOLDER_COVER }}
          style={styles.popularImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.popularInfo}>
        <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderLatestBook = ({ item }) => (
    <TouchableOpacity style={styles.latestCard} activeOpacity={0.7}>
      <Image
        source={{ uri: item.cover_image || PLACEHOLDER_COVER }}
        style={styles.latestImage}
        resizeMode="cover"
      />
      <View style={styles.latestDetails}>
        <Text style={styles.latestTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.latestAuthor}>Oleh: {item.author}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.stockBadge, item.available_stock > 0 ? styles.badgeSuccess : styles.badgeDanger]}>
            <Text style={[styles.badgeText, item.available_stock > 0 ? styles.textSuccess : styles.textDanger]}>
              {item.available_stock > 0 ? `${item.available_stock} Tersedia` : 'Habis'}
            </Text>
          </View>
          {item.publisher && <Text style={styles.publisherText} numberOfLines={1}>• {item.publisher}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.primary} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} bounces={true}>
      
      {/* 1. HEADER DENGAN SEARCH BAR PANDING (BIAR PADAT) */}
      <View style={styles.headerContainer}>
        <View style={styles.circleBg1} />
        <View style={styles.circleBg2} />
        
        <View style={styles.headerTopRow}>
          <View style={styles.profileSection}>
            <View style={styles.avatarPlaceholder}><Text style={styles.avatarText}>F</Text></View>
            <View style={styles.profileTexts}>
              <Text style={styles.welcomeText}>Selamat Datang 👋</Text>
              <Text style={styles.usernameText}>Fayiz Akbar</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications" size={20} color={colors.primary} />
            <View style={styles.notifBadge} />
          </TouchableOpacity>
        </View>

        {/* REKAYASA SEARCH BAR DI DALAM HEADER */}
        <View style={styles.searchBarFake}>
          <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 10 }} />
          <Text style={styles.searchPlaceholderText}>Cari judul buku, penulis, atau ISBN...</Text>
        </View>
      </View>

      {/* 2. FLOATING SUMMARY CARD */}
      <View style={styles.floatingSummaryCard}>
        <View style={styles.summaryLeft}>
          <View style={styles.bookIconContainer}>
            <Ionicons name="bookmark" size={22} color={colors.textOnPrimary} />
          </View>
          <View style={styles.summaryTexts}>
            <Text style={styles.summaryLabel}>Status Peminjaman</Text>
            <Text style={styles.summaryStatus}>Kamu bebas dari tunggakan buku</Text>
          </View>
        </View>
        <View style={styles.summaryRight}>
          <Text style={styles.summaryNumber}>0</Text>
          <Text style={styles.summaryUnit}>Buku</Text>
        </View>
      </View>

      {/* RENDER UTAMA */}
      {loading ? (
        <View style={styles.centerSection}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Menghubungkan ke Supabase...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          {/* 3. REKOMENDASI POPULER */}
          <View style={styles.sectionArea}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Rekomendasi Populer</Text>
              <Text style={styles.viewAllText}>Lihat Semua</Text>
            </View>
            <FlatList
              data={books.slice(0, 5)} 
              renderItem={renderPopularBook}
              keyExtractor={(item) => 'pop-' + item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollPadding}
            />
          </View>

          {/* 4. KOLEKSI TERBARU */}
          <View style={[styles.sectionArea, { marginBottom: 40 }]}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Koleksi Buku Terbaru</Text>
              <Ionicons name="flash" size={16} color={colors.warning} />
            </View>
            <FlatList
              data={books}
              renderItem={renderLatestBook}
              keyExtractor={(item) => 'lat-' + item.id.toString()}
              scrollEnabled={false} 
              contentContainerStyle={styles.verticalListPadding}
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFF' },
  headerContainer: {
    backgroundColor: colors.primary,
    paddingTop: 65, // Ditambah jarak ekstra agar nembus ke atas notch iPhone dengan anggun
    paddingHorizontal: 24,
    paddingBottom: 75,
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  circleBg1: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.07)', top: -40, right: -30 },
  circleBg2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.04)', bottom: -40, left: -20 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  profileSection: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, fontWeight: 'bold', color: colors.primary },
  profileTexts: { marginLeft: 12 },
  welcomeText: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  usernameText: { color: colors.textOnPrimary, fontSize: 16, fontWeight: 'bold' },
  notificationButton: { backgroundColor: '#FFFFFF', padding: 10, borderRadius: 12 },
  notifBadge: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger, top: 10, right: 10 },
  
  // Search Bar Styling
  searchBarFake: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  searchPlaceholderText: { color: colors.textSecondary, fontSize: 13 },

  floatingSummaryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    borderRadius: 18,
    padding: 16,
    marginTop: -40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  summaryLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  bookIconContainer: { backgroundColor: colors.primary, padding: 10, borderRadius: 12 },
  summaryTexts: { marginLeft: 12, flex: 1 },
  summaryLabel: { fontSize: 13, fontWeight: 'bold', color: colors.textPrimary },
  summaryStatus: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
  summaryRight: { alignItems: 'center', borderLeftWidth: 1, borderColor: '#F0EFFF', paddingLeft: 14 },
  summaryNumber: { fontSize: 22, fontWeight: 'bold', color: colors.primary },
  summaryUnit: { fontSize: 10, color: colors.textSecondary },

  sectionArea: { marginTop: 30 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 24, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: colors.textPrimary },
  viewAllText: { fontSize: 12, fontWeight: 'bold', color: colors.primary },

  horizontalScrollPadding: { paddingLeft: 24, paddingRight: 10 },
  popularCard: { width: 130, marginRight: 14 },
  imageShadowContainer: {
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  popularImage: { width: 130, height: 175, borderRadius: 14 },
  popularInfo: { marginTop: 6 },
  bookTitle: { fontSize: 13, fontWeight: 'bold', color: colors.textPrimary },
  bookAuthor: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },

  verticalListPadding: { paddingHorizontal: 24 },
  latestCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    padding: 10,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
  },
  latestImage: { width: 50, height: 68, borderRadius: 10 },
  latestDetails: { flex: 1, marginLeft: 14 },
  latestTitle: { fontSize: 13, fontWeight: 'bold', color: colors.textPrimary },
  latestAuthor: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  stockBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginRight: 6 },
  badgeSuccess: { backgroundColor: '#E6F4EA' },
  badgeDanger: { backgroundColor: '#FCE8E6' },
  badgeText: { fontSize: 9, fontWeight: 'bold' },
  textSuccess: { color: '#137333' },
  textDanger: { color: '#C5221F' },
  publisherText: { fontSize: 11, color: colors.textSecondary },

  centerSection: { marginTop: 50, alignItems: 'center' },
  loadingText: { marginTop: 10, color: colors.textSecondary, fontSize: 12 },
  errorContainer: { padding: 30, alignItems: 'center' },
  errorText: { color: colors.danger, textAlign: 'center' },
});