// src/screens/student/CatalogScreen.js
import React from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { useCatalog } from '../../hooks/useCatalog';

const PLACEHOLDER_COVER = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80';

export default function CatalogScreen() {
  const {
    books,
    categories,
    loading,
    error,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    refreshCatalog
  } = useCatalog();

  // Render Tombol Filter Kategori (Horizontal)
  const renderCategoryItem = ({ item }) => {
    const isSelected = selectedCategory === item.id.toString();
    return (
      <TouchableOpacity
        style={[styles.categoryBadge, isSelected ? styles.categoryActive : styles.categoryInactive]}
        onPress={() => setSelectedCategory(isSelected ? '' : item.id.toString())}
        activeOpacity={0.7}
      >
        <Text style={[styles.categoryText, isSelected ? styles.textActive : styles.textInactive]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render Baris Buku Hasil Pencarian (Vertical)
  const renderBookItem = ({ item }) => (
    <TouchableOpacity style={styles.bookCard} activeOpacity={0.7}>
      <Image
        source={{ uri: item.cover_image || PLACEHOLDER_COVER }}
        style={styles.bookImage}
        resizeMode="cover"
      />
      <View style={styles.bookDetails}>
        <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.bookAuthor}>Oleh: {item.author}</Text>
        <Text style={styles.bookPublisher} numberOfLines={1}>Gedung: {item.publisher || 'Umum'}</Text>
        
        <View style={styles.badgeRow}>
          <View style={[styles.stockBadge, item.available_stock > 0 ? styles.bgSuccess : styles.bgDanger]}>
            <Text style={[styles.badgeText, item.available_stock > 0 ? styles.textSuccess : styles.textDanger]}>
              {item.available_stock > 0 ? `${item.available_stock} Tersedia` : 'Habis'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.actionIcon}>
        <Ionicons name="chevron-forward-circle" size={22} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 1. HEADER PENCARIAN (Nembus Notch Atas iPhone) */}
      <View style={styles.headerArea}>
        <Text style={styles.headerTitle}>Jelajahi Perpustakaan</Text>
        <Text style={styles.headerSubtitle}>Temukan ribuan ilmu dalam genggaman jemarimu</Text>
        
        {/* INPUT PENCARIAN ASLI (BISA DIKETIK) */}
        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ketik judul buku, penulis, atau ISBN..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={(text) => setSearch(text)}
            clearButtonMode="while-editing"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 2. FILTER KATEGORI HORIZONTAL */}
      <View style={styles.categoryArea}>
        <View style={styles.rowLabel}>
          <Text style={styles.sectionTitle}>Filter Kategori</Text>
          {selectedCategory !== '' && (
            <TouchableOpacity onPress={() => setSelectedCategory('')}>
              <Text style={styles.clearFilterText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => 'cat-' + item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryListPadding}
        />
      </View>

      {/* 3. LIST HASIL DATA BUKU UTAMA */}
      <View style={styles.listArea}>
        <Text style={styles.sectionTitleList}>Hasil Pencarian ({books.length})</Text>
        
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.infoText}>Mencari buku di database...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle" size={42} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refreshCatalog}>
              <Text style={styles.retryText}>Segarkan</Text>
            </TouchableOpacity>
          </View>
        ) : books.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="book-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Maaf Bree, judul buku yang kamu cari tidak ditemukan.</Text>
          </View>
        ) : (
          <FlatList
            data={books}
            renderItem={renderBookItem}
            keyExtractor={(item) => 'catalog-' + item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.bookListPadding}
            onRefresh={refreshCatalog}
            refreshing={loading}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFF' },
  
  // Header Style
  headerArea: {
    backgroundColor: colors.primary,
    paddingTop: 65,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.textOnPrimary },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2, marginBottom: 16 },
  searchWrapper: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    alignItems: 'center',
    height: 46,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 13, color: colors.textPrimary, height: '100%' },

  // Category Filter Style
  categoryArea: { marginTop: 20 },
  rowLabel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 24, marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: colors.textPrimary },
  clearFilterText: { fontSize: 12, color: colors.primary, fontWeight: 'bold' },
  categoryListPadding: { paddingLeft: 24, paddingRight: 10 },
  categoryBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginRight: 10, borderWidth: 1 },
  categoryActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryInactive: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  categoryText: { fontSize: 12, fontWeight: 'bold' },
  textActive: { color: colors.textOnPrimary },
  textInactive: { color: colors.textSecondary },

  // Book List Style
  listArea: { flex: 1, marginTop: 20 },
  sectionTitleList: { fontSize: 14, fontWeight: 'bold', color: colors.textPrimary, marginHorizontal: 24, marginBottom: 10 },
  bookListPadding: { paddingHorizontal: 24, paddingBottom: 20 },
  bookCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  bookImage: { width: 55, height: 75, borderRadius: 10, backgroundColor: colors.surface },
  bookDetails: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  bookTitle: { fontSize: 14, fontWeight: 'bold', color: colors.textPrimary, lineHeight: 18 },
  bookAuthor: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  bookPublisher: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
  badgeRow: { flexDirection: 'row', marginTop: 6 },
  stockBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  bgSuccess: { backgroundColor: '#E6F4EA' },
  bgDanger: { backgroundColor: '#FCE8E6' },
  badgeText: { fontSize: 9, fontWeight: 'bold' },
  textSuccess: { color: '#137333' },
  textDanger: { color: '#C5221F' },
  actionIcon: { paddingLeft: 6 },

  // Utility Screen Handling Style
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, marginTop: 40 },
  infoText: { marginTop: 10, color: colors.textSecondary, fontSize: 12 },
  errorText: { color: colors.danger, textAlign: 'center', marginTop: 10, fontSize: 13 },
  emptyText: { color: colors.textSecondary, textAlign: 'center', marginTop: 12, fontSize: 13, lineHeight: 18 },
  retryButton: { backgroundColor: colors.primary, marginTop: 14, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  retryText: { color: colors.textOnPrimary, fontSize: 12, fontWeight: 'bold' }
});