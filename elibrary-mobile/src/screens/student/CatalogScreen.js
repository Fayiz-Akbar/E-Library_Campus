// src/screens/student/CatalogScreen.js
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { useCatalog } from '../../hooks/useCatalog';
import {
  getCatalogColumns,
  getContentMaxWidth,
  getGridItemWidth,
  getHorizontalPadding,
  getResponsiveContentStyle,
} from '../../utils/responsive';

const PLACEHOLDER_COVER = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80';

const getCategoryIcon = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes('teknologi') || lower.includes('komputer')) return 'code-slash';
  if (lower.includes('novel') || lower.includes('fiksi')) return 'book';
  if (lower.includes('sains') || lower.includes('matematika')) return 'flask';
  return 'bookmark';
};

export default function CatalogScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const contentMaxWidth = getContentMaxWidth(width, 1180);
  const horizontalPadding = getHorizontalPadding(width);
  const gridGap = width >= 768 ? 18 : 12;
  const columns = getCatalogColumns(width);
  const cardWidth = getGridItemWidth({
    width,
    columns,
    horizontalPadding,
    gap: gridGap,
    maxWidth: contentMaxWidth,
  });
  const coverHeight = Math.min(240, Math.max(160, cardWidth * 1.42));
  const contentStyle = getResponsiveContentStyle(width, 1180);

  const {
    books,
    categories,
    loading,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    refreshCatalog
  } = useCatalog();

  useEffect(() => {
    if (route.params?.searchQuery) {
      setSearch(route.params.searchQuery);
    }
  }, [route.params?.searchQuery]);

  const renderCategoryItem = ({ item }) => {
    const isSelected = selectedCategory === item.id.toString();
    return (
      <TouchableOpacity
        style={[styles.categoryPill, isSelected ? styles.pillActive : styles.pillInactive]}
        onPress={() => setSelectedCategory(isSelected ? '' : item.id.toString())}
        activeOpacity={0.8}
      >
        <Ionicons name={getCategoryIcon(item.name)} size={13} color={isSelected ? colors.primary : '#FFFFFF'} style={{ marginRight: 6 }} />
        <Text style={[styles.categoryText, isSelected ? styles.txtActive : styles.txtInactive]}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderBookGridItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.bookGridCard, { width: cardWidth }]}
      activeOpacity={0.95}
      onPress={() => navigation.navigate('BookDetail', { book: item })}
    >
      <View style={[styles.coverWrapper, { height: coverHeight }]}>
        <Image source={{ uri: item.cover_image || PLACEHOLDER_COVER }} style={styles.coverImage} resizeMode="cover" />
        <View style={[styles.floatingBadge, item.available_stock > 0 ? styles.bgSuccess : styles.bgDanger]}>
          <Text style={item.available_stock > 0 ? styles.textSuccess : styles.textDanger}>
            {item.available_stock > 0 ? `${item.available_stock} Tersedia` : 'Habis'}
          </Text>
        </View>
      </View>
      <View style={styles.bookMetaInfo}>
        <Text style={styles.metaAuthor} numberOfLines={1}>{item.author ? item.author.toUpperCase() : 'UNKNOWN'}</Text>
        <Text style={styles.metaTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.metaFooterRow}>
          <Text style={styles.metaPublisher} numberOfLines={1}>{item.publisher || 'Umum'}</Text>
          <Ionicons name="arrow-forward-circle" size={16} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const ListHeaderBanner = () => (
    <View style={[styles.bannerContainer, contentStyle]}>
      <View style={styles.bannerCircleDecor} />
      <View style={styles.bannerTextSection}>
        <View style={styles.badgePromo}>
          <Ionicons name="star" size={10} color="#FEF08A" style={{ marginRight: 4 }} />
          <Text style={styles.badgePromoText}>REKOMENDASI BULAN INI</Text>
        </View>
        <Text style={styles.bannerMainTitle}>Mulai Kebiasaan Membaca</Text>
        <Text style={styles.bannerSubTitle}>Pinjam buku esensial teknik & literatur terbaik secara gratis.</Text>
      </View>
      <Ionicons name="school" size={64} color="rgba(255,255,255,0.15)" style={styles.bannerIconDecor} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <View style={styles.circleBg1} />
        <View style={styles.circleBg2} />
        <View style={contentStyle}>
          <Text style={styles.subTitleLabel}>KATALOG DIGITAL</Text>
          <Text style={styles.mainLargeTitle}>Jelajahi Koleksi</Text>
          <View style={styles.searchContainerGlow}>
            <Ionicons name="search-outline" size={18} color={colors.primary} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.textInputField}
              placeholder="Cari judul buku, penulis, atau ISBN..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={(text) => setSearch(text)}
              clearButtonMode="while-editing"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.categoriesWrapper}>
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => 'premium-cat-' + item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScrollPadding}
            />
          </View>
        </View>
      </View>

      <View style={styles.gridSection}>
        {loading ? (
          <View style={styles.centerStatus}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingStatusText}>Menyusun rak buku digital...</Text>
          </View>
        ) : books.length === 0 ? (
          <View style={styles.centerStatus}>
            <ListHeaderBanner />
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={44} color={colors.textSecondary} />
              <Text style={styles.emptyMainText}>Buku Tidak Ditemukan</Text>
              <Text style={styles.emptySubText}>Kata kunci "{search}" belum terdaftar.</Text>
            </View>
          </View>
        ) : (
          <FlatList
            key={`catalog-${columns}`}
            data={books}
            renderItem={renderBookGridItem}
            keyExtractor={(item) => 'premium-grid-' + item.id.toString()}
            numColumns={columns}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={[styles.gridRowSpacing, { gap: gridGap }]}
            ListHeaderComponent={ListHeaderBanner}
            contentContainerStyle={[
              styles.gridContainerPadding,
              contentStyle,
              { paddingHorizontal: horizontalPadding },
            ]}
            onRefresh={refreshCatalog}
            refreshing={loading}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F4FE' },
  headerSection: { backgroundColor: colors.primary, paddingTop: 65, paddingHorizontal: 24, paddingBottom: 12, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, position: 'relative', overflow: 'hidden', elevation: 8, shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12 },
  circleBg1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.06)', top: -50, right: -30 },
  circleBg2: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.04)', bottom: -20, left: -40 },
  subTitleLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5 },
  mainLargeTitle: { fontSize: 26, fontWeight: '900', color: '#FFFFFF', marginTop: 2, letterSpacing: -0.5 },
  searchContainerGlow: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 14, alignItems: 'center', height: 48, marginTop: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 6 },
  textInputField: { flex: 1, fontSize: 13, color: colors.textPrimary, fontWeight: '600', height: '100%' },
  categoriesWrapper: { marginTop: 18, marginBottom: 8 },
  categoryScrollPadding: { paddingRight: 14 },
  categoryPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  pillActive: { backgroundColor: '#FFFFFF' },
  pillInactive: { backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  categoryText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.1 },
  txtActive: { color: colors.primary },
  txtInactive: { color: '#FFFFFF' },
  bannerContainer: { backgroundColor: '#6D28D9', borderRadius: 22, padding: 18, marginTop: 18, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden', position: 'relative', elevation: 4, shadowColor: '#6D28D9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
  bannerCircleDecor: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.05)', right: -10, top: -20 },
  bannerTextSection: { flex: 1, paddingRight: 10 },
  badgePromo: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 8 },
  badgePromoText: { color: '#FEF08A', fontSize: 8, fontWeight: '900', letterSpacing: 0.5 },
  bannerMainTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  bannerSubTitle: { fontSize: 11, color: '#E9D5FF', marginTop: 4, lineHeight: 15 },
  bannerIconDecor: { position: 'absolute', right: 12, bottom: -10 },
  gridSection: { flex: 1 },
  gridContainerPadding: { paddingBottom: 30 },
  gridRowSpacing: { justifyContent: 'flex-start' },
  bookGridCard: { marginBottom: 20, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 8, borderWidth: 1, borderColor: '#EAE6FA', elevation: 4, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 6 },
  coverWrapper: { width: '100%', borderRadius: 16, overflow: 'hidden', position: 'relative', backgroundColor: '#F1F5F9' },
  coverImage: { width: '100%', height: '100%' },
  floatingBadge: { position: 'absolute', bottom: 8, left: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  bgSuccess: { backgroundColor: 'rgba(240, 253, 244, 0.95)', borderWidth: 1, borderColor: '#DCFCE7' },
  bgDanger: { backgroundColor: 'rgba(254, 242, 242, 0.95)', borderWidth: 1, borderColor: '#FEE2E2' },
  textSuccess: { fontSize: 9, fontWeight: '800', color: '#15803D' },
  textDanger: { fontSize: 9, fontWeight: '800', color: '#B91C1C' },
  bookMetaInfo: { marginTop: 10, paddingHorizontal: 4 },
  metaAuthor: { fontSize: 9, fontWeight: '800', color: colors.primary, letterSpacing: 0.8 },
  metaTitle: { fontSize: 13, fontWeight: '800', color: colors.textPrimary, marginTop: 2, lineHeight: 17, minHeight: 34 },
  metaFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, borderTopWidth: 1, borderColor: '#F4F1FE', paddingTop: 6 },
  metaPublisher: { fontSize: 11, color: colors.textSecondary, fontWeight: '500', flex: 1, marginRight: 4 },
  centerStatus: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingBottom: 40 },
  loadingStatusText: { marginTop: 12, color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 40, paddingHorizontal: 20 },
  emptyMainText: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, marginTop: 10 },
  emptySubText: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: 4, lineHeight: 18 }
});
