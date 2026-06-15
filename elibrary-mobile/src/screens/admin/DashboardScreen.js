// src/screens/admin/DashboardScreen.js
import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { useDashboard } from '../../hooks/useDashboard';
import { getHorizontalPadding, getResponsiveContentStyle, getScreenSize } from '../../utils/responsive';

const formatCurrency = (value) => `Rp${Number(value || 0).toLocaleString('id-ID')}`;

const StatCard = ({ icon, label, value, color = colors.primary }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: `${color}18` }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={[styles.statValue, { color }]} numberOfLines={1}>{value}</Text>
    <Text style={styles.statLabel} numberOfLines={2}>{label}</Text>
  </View>
);

const ShortcutButton = ({ icon, label, description, onPress }) => (
  <TouchableOpacity style={styles.shortcutButton} onPress={onPress} activeOpacity={0.85}>
    <View style={styles.shortcutIcon}>
      <Ionicons name={icon} size={20} color={colors.primary} />
    </View>
    <View style={styles.shortcutTextWrap}>
      <Text style={styles.shortcutLabel}>{label}</Text>
      <Text style={styles.shortcutDescription} numberOfLines={2}>{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
  </TouchableOpacity>
);

export default function DashboardScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const { isTablet } = getScreenSize(width);
  const horizontalPadding = getHorizontalPadding(width);
  const contentStyle = getResponsiveContentStyle(width, 1080);
  const { dashboard, loading, error, loadDashboard } = useDashboard({ autoLoad: true });
  const { users, books, transactions, warnings } = dashboard;
  const hasWarning = warnings && Object.values(warnings).some(Boolean);

  const shortcuts = [
    {
      icon: 'people-outline',
      label: 'Manajemen Anggota',
      description: 'Kelola akun dan status anggota',
      target: 'Kelola Anggota',
    },
    {
      icon: 'library-outline',
      label: 'Manajemen Buku',
      description: 'Kelola katalog, stok, dan QR buku',
      target: 'Kelola Buku',
    },
    {
      icon: 'receipt-outline',
      label: 'Manajemen Transaksi',
      description: 'Monitor pinjam, kembali, dan override',
      target: 'Transaksi',
    },
    {
      icon: 'document-text-outline',
      label: 'Laporan',
      description: 'Preview periode dan export CSV',
      target: 'Laporan',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadDashboard} />}
      >
        <View style={[styles.header, contentStyle]}>
          <View>
            <Text style={styles.eyebrow}>Admin Panel</Text>
            <Text style={styles.title}>Dashboard Admin</Text>
            <Text style={styles.subtitle}>
              Ringkasan operasional perpustakaan dari anggota, buku, dan transaksi.
            </Text>
          </View>
          <View style={styles.headerIcon}>
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="grid" size={28} color="#FFFFFF" />
            )}
          </View>
        </View>

        {error ? (
          <View style={[styles.feedbackBox, styles.errorBox, contentStyle]}>
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {hasWarning ? (
          <View style={[styles.feedbackBox, styles.warningBox, contentStyle]}>
            <Ionicons name="warning-outline" size={18} color={colors.warning} />
            <Text style={styles.warningText}>
              Sebagian statistik gagal dimuat. Data lain tetap ditampilkan dengan fallback aman.
            </Text>
          </View>
        ) : null}

        <View style={[styles.sectionHeader, contentStyle]}>
          <Text style={styles.sectionTitle}>Statistik Utama</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadDashboard} activeOpacity={0.8}>
            <Ionicons name="refresh" size={16} color={colors.primary} />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.statGrid, contentStyle, isTablet && styles.statGridTablet]}>
          <StatCard icon="people" label="Total Anggota" value={users.total_users || 0} />
          <StatCard icon="checkmark-circle" label="Anggota Aktif" value={users.active_users || 0} color={colors.success} />
          <StatCard icon="ban" label="Suspended" value={users.suspended_users || 0} color={colors.danger} />
          <StatCard icon="library" label="Judul Buku" value={books.total_titles || 0} color={colors.info} />
          <StatCard icon="layers" label="Total Stok" value={books.total_books_stock || 0} color={colors.primaryDark} />
          <StatCard icon="cube" label="Stok Tersedia" value={books.total_available_stock || 0} color={colors.success} />
          <StatCard icon="swap-horizontal" label="Transaksi Aktif" value={transactions.active_transactions || 0} color={colors.info} />
          <StatCard icon="alert-circle" label="Terlambat" value={transactions.overdue_transactions || 0} color={colors.danger} />
          <StatCard icon="cash" label="Total Denda" value={formatCurrency(transactions.total_fines)} color={colors.warning} />
        </View>

        <View style={[styles.sectionHeader, contentStyle]}>
          <Text style={styles.sectionTitle}>Shortcut Operasional</Text>
        </View>

        <View style={[styles.shortcutGrid, contentStyle, isTablet && styles.shortcutGridTablet]}>
          {shortcuts.map((shortcut) => (
            <ShortcutButton
              key={shortcut.target}
              icon={shortcut.icon}
              label={shortcut.label}
              description={shortcut.description}
              onPress={() => navigation.navigate(shortcut.target)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7FF' },
  scrollContent: { paddingTop: 56, paddingBottom: 34 },
  header: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  eyebrow: { color: '#EDE9FE', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', marginBottom: 4 },
  title: { color: '#FFFFFF', fontSize: 26, lineHeight: 32, fontWeight: '900' },
  subtitle: { color: '#F5F3FF', fontSize: 13, lineHeight: 20, marginTop: 8, maxWidth: 560 },
  headerIcon: { width: 54, height: 54, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  feedbackBox: { marginTop: 14, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  errorBox: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  errorText: { flex: 1, color: '#991B1B', fontSize: 13, lineHeight: 19, fontWeight: '700' },
  warningBox: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A' },
  warningText: { flex: 1, color: '#92400E', fontSize: 13, lineHeight: 19, fontWeight: '700' },
  sectionHeader: { marginTop: 18, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '900' },
  refreshButton: { minHeight: 34, borderRadius: 10, paddingHorizontal: 11, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EDE9FE', flexDirection: 'row', alignItems: 'center', gap: 6 },
  refreshText: { color: colors.primary, fontSize: 12, fontWeight: '900' },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statGridTablet: { gap: 12 },
  statCard: { flexBasis: '30%', flexGrow: 1, minWidth: 138, minHeight: 116, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 13, borderWidth: 1, borderColor: '#F0EEFF' },
  statIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 9 },
  statValue: { fontSize: 20, fontWeight: '900' },
  statLabel: { marginTop: 4, color: colors.textSecondary, fontSize: 11, lineHeight: 15, fontWeight: '800', textTransform: 'uppercase' },
  shortcutGrid: { gap: 10 },
  shortcutGridTablet: { flexDirection: 'row', flexWrap: 'wrap' },
  shortcutButton: { minHeight: 76, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#F0EEFF', padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12, flexBasis: '48%', flexGrow: 1 },
  shortcutIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' },
  shortcutTextWrap: { flex: 1, minWidth: 0 },
  shortcutLabel: { color: colors.textPrimary, fontSize: 13, fontWeight: '900' },
  shortcutDescription: { color: colors.textSecondary, fontSize: 11, lineHeight: 16, marginTop: 3, fontWeight: '700' },
});
