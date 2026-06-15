// src/screens/student/HomeScreen.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, FlatList, Image, TouchableOpacity, ActivityIndicator, TextInput, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { colors } from '../../constants/colors';
import { useHome } from '../../hooks/useHome';
import { useAuth } from '../../hooks/useAuth';
import { getContentMaxWidth, getHorizontalPadding, getResponsiveContentStyle } from '../../utils/responsive';

const PLACEHOLDER_COVER = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80';

export default function HomeScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const { books, loading, error, refreshData } = useHome();
  const [localSearch, setLocalSearch] = useState(''); 
  const displayName = user?.name?.trim() || 'Pengguna';
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const contentMaxWidth = getContentMaxWidth(width, 980);
  const contentStyle = getResponsiveContentStyle(width, 980);
  const horizontalPadding = getHorizontalPadding(width);
  const summaryWidth = typeof contentMaxWidth === 'number'
    ? Math.min(width - horizontalPadding * 2, contentMaxWidth)
    : width - horizontalPadding * 2;

  const handleSearchSubmit = () => {
    if (localSearch.trim() !== '') {
      navigation.navigate('Katalog', { searchQuery: localSearch });
      setLocalSearch(''); 
    }
  };

  // 1. KARTU POPULER (BISA DIKLIK MENUJU DETAIL)
  const renderPopularBook = ({ item }) => (
    <TouchableOpacity 
      style={styles.popularCard} 
      activeOpacity={0.8}
      onPress={() => navigation.navigate('BookDetail', { book: item })} // <=== AKSI KLIK PINDAH KE DETAIL
    >
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

  // 2. KARTU TERBARU (BISA DIKLIK MENUJU DETAIL)
  const renderLatestBook = ({ item }) => (
    <TouchableOpacity 
      style={styles.latestCard} 
      activeOpacity={0.7}
      onPress={() => navigation.navigate('BookDetail', { book: item })} // <=== AKSI KLIK PINDAH KE DETAIL
    >
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
          {item.publisher ? (
            <Text style={styles.publisherText} numberOfLines={1}>• {item.publisher}</Text>
          ) : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.primary} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} bounces={true}>
      
      {/* 1. HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.circleBg1} />
        <View style={styles.circleBg2} />
        
        <View style={[styles.headerTopRow, contentStyle]}>
          <View style={styles.profileTexts}>
            <Text style={styles.welcomeText}>Selamat Datang 👋</Text>
            <Text style={styles.usernameText} numberOfLines={1}>{displayName}</Text>
          </View>

          <View style={styles.rightActionsGroup}>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Notification')}
              activeOpacity={0.85}
            >
              <Ionicons name="notifications" size={20} color={colors.primary} />
              <View style={styles.notifBadge} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.avatarPlaceholder} activeOpacity={0.8}>
              <Text style={styles.avatarText}>{avatarInitial}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* INPUT PENCARIAN AKTIF */}
        <View style={[styles.searchBarReal, contentStyle]}>
          <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari buku langsung di sini..."
            placeholderTextColor={colors.textSecondary}
            value={localSearch}
            onChangeText={(text) => setLocalSearch(text)}
            onSubmitEditing={handleSearchSubmit} 
            returnKeyType="search"
          />
        </View>
      </View>

      {/* 2. FLOATING SUMMARY CARD */}
      <View style={[styles.floatingSummaryCard, contentStyle, { width: summaryWidth }]}>
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

      {/* DATA AREA */}
      {loading ? (
        <View style={styles.centerSection}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={{ color: colors.danger }}>{error}</Text>
        </View>
      ) : (
        <>
          {/* 3. REKOMENDASI POPULER */}
          <View style={[styles.sectionArea, contentStyle]}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Rekomendasi Populer</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Katalog')}>
                <Text style={styles.viewAllText}>Lihat Semua</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={books.slice(0, 5)} 
              renderItem={renderPopularBook}
              keyExtractor={(item) => 'pop-' + item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.horizontalScrollPadding, { paddingLeft: horizontalPadding, paddingRight: horizontalPadding }]}
            />
          </View>

          {/* 4. KOLEKSI TERBARU */}
          <View style={[styles.sectionArea, contentStyle, { marginBottom: 40 }]}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Koleksi Buku Terbaru</Text>
              <Ionicons name="flash" size={16} color={colors.warning} />
            </View>
            <FlatList
              data={books}
              renderItem={renderLatestBook}
              keyExtractor={(item) => 'lat-' + item.id.toString()}
              scrollEnabled={false} 
              contentContainerStyle={[styles.verticalListPadding, { paddingHorizontal: horizontalPadding }]}
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFF' },
  headerContainer: { backgroundColor: colors.primary, paddingTop: 65, paddingHorizontal: 24, paddingBottom: 75, position: 'relative', overflow: 'hidden', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  circleBg1: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.07)', top: -40, right: -30 },
  circleBg2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.04)', bottom: -40, left: -20 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  profileTexts: { flex: 1 },
  welcomeText: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  usernameText: { color: colors.textOnPrimary, fontSize: 16, fontWeight: 'bold' },
  rightActionsGroup: { flexDirection: 'row', alignItems: 'center' },
  notificationButton: { backgroundColor: '#FFFFFF', padding: 10, borderRadius: 12, marginRight: 10 },
  notifBadge: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger, top: 10, right: 10 },
  avatarPlaceholder: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, fontWeight: 'bold', color: colors.primary },
  searchBarReal: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 16, borderRadius: 14, alignItems: 'center', height: 46 },
  searchInput: { flex: 1, fontSize: 13, color: colors.textPrimary, height: '100%' },
  floatingSummaryCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, marginTop: -40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 6, shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
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
  horizontalScrollPadding: { paddingRight: 10 },
  popularCard: { width: 130, marginRight: 14 },
  imageShadowContainer: { borderRadius: 14, backgroundColor: '#E5E7EB', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 4 },
  popularImage: { width: 130, height: 175, borderRadius: 14 },
  popularInfo: { marginTop: 6 },
  bookTitle: { fontSize: 13, fontWeight: 'bold', color: colors.textPrimary },
  bookAuthor: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
  verticalListPadding: {},
  latestCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', marginBottom: 10, padding: 10, borderRadius: 14, alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 2 },
  latestImage: { width: 50, height: 68, borderRadius: 10, backgroundColor: colors.surface },
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
  centerSection: { marginTop: 40, alignItems: 'center' },
  errorContainer: { padding: 20, alignItems: 'center' }
});
