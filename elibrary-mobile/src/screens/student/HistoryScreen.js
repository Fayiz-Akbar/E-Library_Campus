// src/screens/student/HistoryScreen.js
import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform, 
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { getHorizontalPadding, getResponsiveContentStyle } from '../../utils/responsive';
import { HISTORY_FILTERS, useTransactions } from '../../hooks/useTransactions';

const STATUS_META = {
  borrowed: { label: 'Dipinjam', color: colors.info, background: '#EFF6FF', icon: 'time-outline' },
  returned: { label: 'Dikembalikan', color: colors.success, background: '#ECFDF5', icon: 'checkmark-circle-outline' },
  overdue: { label: 'Terlambat', color: colors.danger, background: '#FEF2F2', icon: 'alert-circle-outline' },
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatCurrency = (value) => `Rp${Number(value || 0).toLocaleString('id-ID')}`;

const TransactionItem = ({ item }) => {
  const meta = STATUS_META[item.status] || STATUS_META.borrowed;

  return (
    <View style={styles.transactionItem}>
      <View style={styles.transactionHeader}>
        <View style={styles.bookIcon}>
          <Ionicons name="book-outline" size={22} color={colors.primary} />
        </View>
        <View style={styles.transactionTitleWrap}>
          <Text style={styles.bookTitle} numberOfLines={2}>{item.title || 'Judul buku tidak tersedia'}</Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>{item.author || 'Penulis tidak tersedia'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: meta.background }]}>
          <Ionicons name={meta.icon} size={13} color={meta.color} />
          <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>

      <View style={styles.detailGrid}>
        <View style={styles.detailCell}>
          <Text style={styles.detailLabel}>Pinjam</Text>
          <Text style={styles.detailValue}>{formatDate(item.borrow_date)}</Text>
        </View>
        <View style={styles.detailCell}>
          <Text style={styles.detailLabel}>Jatuh Tempo</Text>
          <Text style={styles.detailValue}>{formatDate(item.due_date)}</Text>
        </View>
        <View style={styles.detailCell}>
          <Text style={styles.detailLabel}>Kembali</Text>
          <Text style={styles.detailValue}>{formatDate(item.return_date)}</Text>
        </View>
        <View style={styles.detailCell}>
          <Text style={styles.detailLabel}>Denda</Text>
          <Text style={[styles.detailValue, Number(item.fine_amount) > 0 && styles.fineText]}>
            {formatCurrency(item.fine_amount)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default function HistoryScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const contentStyle = getResponsiveContentStyle(width, 820);
  const horizontalPadding = getHorizontalPadding(width);
  const {
    selectedStatus,
    history,
    historyLoading,
    historyError,
    handleStatusChange,
    loadHistory,
  } = useTransactions({ autoLoadHistory: true });

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }]}
        refreshControl={<RefreshControl refreshing={historyLoading} onRefresh={() => loadHistory(selectedStatus)} />}
      >
        {/* ===== HEADER Clean Version ===== */}
        <View style={[styles.header, contentStyle]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>Aktivitas</Text>
            <Text style={styles.title}>Riwayat Peminjaman</Text>
            <Text style={styles.subtitle}>Pantau status buku, jatuh tempo, dan denda dari transaksi kamu.</Text>
          </View>
        </View>

        {/* ===== FILTER ROW ===== */}
        <View style={[styles.filterRow, contentStyle]}>
          {HISTORY_FILTERS.map((filter) => {
            const active = selectedStatus === filter.key;
            return (
              <TouchableOpacity
                key={filter.key}
                style={[styles.filterButton, active && styles.filterButtonActive]}
                onPress={() => handleStatusChange(filter.key)}
                activeOpacity={0.85}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{filter.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ===== FEEDBACK ERROR ===== */}
        {historyError ? (
          <View style={[styles.feedbackBox, styles.errorBox, contentStyle]}>
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{historyError}</Text>
          </View>
        ) : null}

        {/* ===== LOADING STATE ===== */}
        {historyLoading && history.length === 0 ? (
          <View style={[styles.centerState, contentStyle]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.centerText}>Memuat riwayat...</Text>
          </View>
        ) : null}

        {/* ===== EMPTY STATE ===== */}
        {!historyLoading && history.length === 0 && !historyError ? (
          <View style={[styles.centerState, contentStyle]}>
            <Ionicons name="file-tray-outline" size={42} color={colors.primaryLight} />
            <Text style={styles.emptyTitle}>Belum ada riwayat peminjaman.</Text>
            <Text style={styles.emptyText}>Transaksi pinjam dan pengembalian akan tampil di halaman ini.</Text>
          </View>
        ) : null}

        {/* ===== TRANSACTION LIST ===== */}
        <View style={[styles.list, contentStyle]}>
          {history.map((item) => (
            <TransactionItem key={String(item.id)} item={item} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { 
    paddingTop: Platform.OS === 'android' ? 68 : 56, 
    paddingBottom: 32 
  },
  header: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  eyebrow: { fontSize: 12, color: '#EDE9FE', fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 },
  title: { fontSize: 24, lineHeight: 30, color: '#FFFFFF', fontWeight: '900' },
  subtitle: { marginTop: 8, fontSize: 13, lineHeight: 20, color: '#F5F3FF', maxWidth: 520 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  filterButton: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EDE9FE',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.primary, fontSize: 12, fontWeight: '900' },
  filterTextActive: { color: '#FFFFFF' },
  feedbackBox: {
    marginTop: 14,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorBox: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  errorText: { color: '#991B1B', flex: 1, fontSize: 13, fontWeight: '700', lineHeight: 19 },
  centerState: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#EDE9FE',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
  },
  centerText: { marginTop: 10, color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
  emptyTitle: { marginTop: 10, color: colors.textPrimary, fontSize: 15, fontWeight: '900', textAlign: 'center' },
  emptyText: { marginTop: 6, color: colors.textSecondary, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  list: { marginTop: 14, gap: 12 },
  transactionItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDE9FE',
    borderRadius: 14,
    padding: 14,
  },
  transactionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bookIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionTitleWrap: { flex: 1, minWidth: 0 },
  bookTitle: { color: colors.textPrimary, fontSize: 14, lineHeight: 19, fontWeight: '900' },
  bookAuthor: { marginTop: 2, color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  statusBadge: {
    minHeight: 28,
    borderRadius: 8,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: { fontSize: 11, fontWeight: '900' },
  detailGrid: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  detailCell: { flexBasis: '48%', flexGrow: 1, backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10 },
  detailLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: '800' },
  detailValue: { marginTop: 3, color: colors.textPrimary, fontSize: 12, fontWeight: '900' },
  fineText: { color: colors.danger },
});