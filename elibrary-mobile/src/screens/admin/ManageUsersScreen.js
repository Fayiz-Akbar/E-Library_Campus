// src/screens/admin/ManageUsersScreen.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { fetchAllUsers, toggleUserStatus, fetchUserStats } from '../../api/userApi';

export default function ManageUsersScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    suspended_users: 0,
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetchAllUsers(searchQuery);
      if (res.success) setUsers(res.data);
    } catch (err) {
      Alert.alert('Error ❌', 'Gagal memuat data anggota perpustakaan.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetchUserStats();
      if (res.success) setStats(res.data);
    } catch (err) {
      // Gagal memuat statistik tidak menghentikan tampilan utama
    }
  };

  useEffect(() => {
    loadUsers();
    loadStats();
  }, []);

  // Re-search saat user mengetik di search bar
  useEffect(() => {
    const debounce = setTimeout(() => {
      loadUsers();
    }, 400);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleToggleStatus = (user) => {
    const newStatus = user.status === 'active' ? 'dinonaktifkan' : 'diaktifkan kembali';
    Alert.alert(
      'Konfirmasi',
      `Apakah Anda yakin ingin ${newStatus} akun "${user.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Lanjutkan',
          onPress: async () => {
            try {
              const res = await toggleUserStatus(user.id);
              if (res.success) {
                Alert.alert('Berhasil ✅', res.message);
                loadUsers();
                loadStats();
              }
            } catch (err) {
              const message = err.response?.data?.message || 'Gagal mengubah status anggota.';
              Alert.alert('Error ❌', message);
            }
          },
        },
      ]
    );
  };

  // Format tanggal bergabung singkat
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderUserRow = ({ item, index }) => (
    <View style={styles.userRowCard}>
      <View style={styles.cardAccentStrip} />

      {/* Nomor urut */}
      <View style={styles.indexBadge}>
        <Text style={styles.indexText}>{index + 1}</Text>
      </View>

      {/* Avatar */}
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>
          {item.name?.charAt(0)?.toUpperCase() || 'U'}
        </Text>
      </View>

      {/* Detail */}
      <View style={styles.rowDetails}>
        <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.emailRow}>
          <Ionicons name="mail-outline" size={11} color={colors.secondary} />
          <Text style={styles.rowEmail} numberOfLines={1}>{item.email}</Text>
        </View>
        <View style={styles.badgeRow}>
          {/* Badge Role */}
          <View style={[styles.rolePill, item.role === 'admin' ? styles.rolePillAdmin : styles.rolePillStudent]}>
            <Ionicons
              name={item.role === 'admin' ? 'shield-checkmark' : 'school'}
              size={10}
              color={item.role === 'admin' ? colors.primary : colors.info}
            />
            <Text style={[styles.rolePillText, item.role === 'admin' ? styles.roleTextAdmin : styles.roleTextStudent]}>
              {item.role === 'admin' ? 'Admin' : 'Mahasiswa'}
            </Text>
          </View>

          {/* Badge Status */}
          <View style={[styles.statusPill, item.status === 'active' ? styles.statusActive : styles.statusSuspended]}>
            <View style={[styles.statusDot, item.status === 'active' ? styles.dotGreen : styles.dotRed]} />
            <Text style={[styles.statusPillText, item.status === 'active' ? styles.statusTextGreen : styles.statusTextRed]}>
              {item.status === 'active' ? 'Aktif' : 'Suspended'}
            </Text>
          </View>
        </View>
        <Text style={styles.joinDate}>Bergabung {formatDate(item.created_at)}</Text>
      </View>

      {/* Toggle Aksi */}
      <TouchableOpacity
        style={[styles.toggleBtn, item.status === 'active' ? styles.toggleBtnSuspend : styles.toggleBtnActivate]}
        onPress={() => handleToggleStatus(item)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={item.status === 'active' ? 'ban-outline' : 'checkmark-circle-outline'}
          size={18}
          color={item.status === 'active' ? colors.danger : colors.success}
        />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="people-outline" size={48} color={colors.primaryLight} />
      </View>
      <Text style={styles.emptyTitle}>
        {searchQuery.trim() ? 'Anggota Tidak Ditemukan' : 'Belum Ada Anggota'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery.trim()
          ? `Tidak ada anggota yang cocok dengan "${searchQuery}"`
          : 'Belum ada anggota yang terdaftar di sistem perpustakaan.'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />
        <View style={styles.headerCircle3} />

        <View style={styles.headerTopRow}>
          <View style={styles.headerIconBadge}>
            <Ionicons name="people" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.headerTextArea}>
            <Text style={styles.headerTitle}>Manajemen Anggota</Text>
            <Text style={styles.headerSubtitle}>Kelola akun anggota perpustakaan</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.textSecondary} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama atau email anggota..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.statIconWrap, { backgroundColor: '#F3EEFF' }]}>
            <Ionicons name="people" size={18} color={colors.primary} />
          </View>
          <Text style={styles.statNumber}>{stats.total_users}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconWrap, { backgroundColor: '#E6F4EA' }]}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          </View>
          <Text style={styles.statNumber}>{stats.active_users}</Text>
          <Text style={styles.statLabel}>Aktif</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconWrap, { backgroundColor: '#FEF2F2' }]}>
            <Ionicons name="ban" size={18} color={colors.danger} />
          </View>
          <Text style={styles.statNumber}>{stats.suspended_users}</Text>
          <Text style={styles.statLabel}>Suspended</Text>
        </View>
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>
          {searchQuery.trim() ? `Hasil: ${users.length} anggota` : 'Daftar Anggota'}
        </Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{users.length}</Text>
        </View>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.centerLoading}>
          <View style={styles.loadingSpinnerWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
          <Text style={styles.loadingText}>Memuat data anggota...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserRow}
          keyExtractor={(item) => 'user-' + item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listPadding}
          onRefresh={() => { loadUsers(); loadStats(); }}
          refreshing={loading}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7FF' },

  // Header
  header: {
    backgroundColor: colors.primary,
    paddingTop: 58,
    paddingHorizontal: 22,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  headerCircle1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.06)', top: -50, right: -40 },
  headerCircle2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.04)', bottom: -30, left: -20 },
  headerCircle3: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)', top: 20, right: 80 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  headerIconBadge: {
    width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  headerTextArea: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.3 },
  headerSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2, letterSpacing: 0.2 },
  searchBar: {
    flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 14,
    paddingHorizontal: 14, height: 44, alignItems: 'center',
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6,
  },
  searchInput: { flex: 1, fontSize: 13, color: colors.textPrimary, fontWeight: '500', height: '100%' },

  // Stats
  statsRow: { flexDirection: 'row', marginHorizontal: 18, paddingTop: 16, gap: 10 },
  statCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 10,
    alignItems: 'center', elevation: 3, shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, borderWidth: 1, borderColor: '#F0EEFF',
  },
  statIconWrap: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statNumber: { fontSize: 20, fontWeight: '900', color: colors.textPrimary },
  statLabel: { fontSize: 10, fontWeight: '600', color: colors.textSecondary, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Section Header
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 22, marginTop: 20, marginBottom: 6 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  countBadge: { backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  countBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },

  // List
  listPadding: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 30 },

  // User Row Card
  userRowCard: {
    flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14,
    marginBottom: 12, alignItems: 'center', elevation: 3, shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8,
    borderWidth: 1, borderColor: '#F0EEFF', position: 'relative', overflow: 'hidden',
  },
  cardAccentStrip: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
    backgroundColor: colors.primary, borderTopLeftRadius: 18, borderBottomLeftRadius: 18,
  },
  indexBadge: {
    position: 'absolute', top: 6, right: 8, backgroundColor: '#F5F3FF',
    width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center',
  },
  indexText: { fontSize: 9, fontWeight: '800', color: colors.secondary },

  // Avatar
  avatarCircle: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: colors.surface,
    justifyContent: 'center', alignItems: 'center', marginLeft: 6, marginRight: 12,
    borderWidth: 2, borderColor: colors.primaryLight,
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: colors.primary },

  // Details
  rowDetails: { flex: 1 },
  rowName: { fontSize: 14, fontWeight: '800', color: colors.textPrimary, letterSpacing: 0.1 },
  emailRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 4 },
  rowEmail: { fontSize: 11, color: colors.textSecondary, fontWeight: '500', flex: 1 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6, flexWrap: 'wrap' },
  joinDate: { fontSize: 10, color: '#94A3B8', marginTop: 4, fontWeight: '500' },

  // Role Pills
  rolePill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, gap: 4 },
  rolePillAdmin: { backgroundColor: '#F3EEFF' },
  rolePillStudent: { backgroundColor: '#EFF6FF' },
  rolePillText: { fontSize: 10, fontWeight: '700' },
  roleTextAdmin: { color: colors.primary },
  roleTextStudent: { color: colors.info },

  // Status Pills
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, gap: 4 },
  statusActive: { backgroundColor: '#E6F4EA' },
  statusSuspended: { backgroundColor: '#FEF2F2' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  dotGreen: { backgroundColor: colors.success },
  dotRed: { backgroundColor: colors.danger },
  statusPillText: { fontSize: 10, fontWeight: '700' },
  statusTextGreen: { color: colors.success },
  statusTextRed: { color: colors.danger },

  // Toggle Button
  toggleBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  toggleBtnSuspend: { backgroundColor: '#FEF2F2' },
  toggleBtnActivate: { backgroundColor: '#E6F4EA' },

  // Loading
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingSpinnerWrap: { width: 60, height: 60, borderRadius: 20, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  loadingText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },

  // Empty State
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyIconCircle: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: colors.surface,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    borderWidth: 3, borderColor: '#F0EEFF',
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, fontWeight: '500' },
});
