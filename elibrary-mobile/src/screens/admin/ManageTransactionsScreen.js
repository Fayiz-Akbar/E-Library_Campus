// src/screens/admin/ManageTransactionsScreen.js
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import {
  ADMIN_TRANSACTION_FILTERS,
  OVERRIDE_STATUS_OPTIONS,
  useAdminTransactions,
} from '../../hooks/useTransactions';
import { getResponsiveContentStyle } from '../../utils/responsive';

const STATUS_META = {
  borrowed: { label: 'Dipinjam', color: colors.info, background: '#EFF6FF', icon: 'time-outline' },
  returned: { label: 'Dikembalikan', color: colors.success, background: '#ECFDF5', icon: 'checkmark-circle-outline' },
  overdue: { label: 'Terlambat', color: colors.danger, background: '#FEF2F2', icon: 'alert-circle-outline' },
  lost: { label: 'Hilang', color: '#7C2D12', background: '#FFEDD5', icon: 'help-circle-outline' },
  damaged: { label: 'Rusak', color: colors.warning, background: '#FFFBEB', icon: 'construct-outline' },
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

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.borrowed;
  return (
    <View style={[styles.statusBadge, { backgroundColor: meta.background }]}>
      <Ionicons name={meta.icon} size={13} color={meta.color} />
      <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
};

const InfoRow = ({ label, value, danger }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, danger && styles.dangerText]} numberOfLines={2}>{value || '-'}</Text>
  </View>
);

export default function ManageTransactionsScreen() {
  const { width } = useWindowDimensions();
  const contentStyle = getResponsiveContentStyle(width, 1080);
  const {
    transactions,
    selectedStatus,
    searchQuery,
    startDate,
    endDate,
    loading,
    submitting,
    error,
    stats,
    setSearchQuery,
    setStartDate,
    setEndDate,
    handleStatusChange,
    loadAdminTransactions,
    submitOverride,
  } = useAdminTransactions({ autoLoad: true });

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [overrideVisible, setOverrideVisible] = useState(false);
  const [overrideStatus, setOverrideStatus] = useState('lost');
  const [overrideNote, setOverrideNote] = useState('');

  const openOverride = (transaction) => {
    setSelectedTransaction(transaction);
    setOverrideStatus('lost');
    setOverrideNote('');
    setOverrideVisible(true);
  };

  const closeOverride = () => {
    setOverrideVisible(false);
    setOverrideNote('');
  };

  const handleSubmitOverride = async () => {
    if (!selectedTransaction) return;

    const response = await submitOverride({
      transactionId: selectedTransaction.id,
      status: overrideStatus,
      note: overrideNote,
    });

    if (response.success) {
      Alert.alert('Berhasil', response.message || 'Status transaksi berhasil diperbarui.');
      closeOverride();
      setSelectedTransaction(null);
    } else {
      Alert.alert('Gagal', response.message || 'Gagal override status transaksi.');
    }
  };

  const renderTransaction = ({ item }) => (
    <TouchableOpacity style={styles.transactionCard} onPress={() => setSelectedTransaction(item)} activeOpacity={0.85}>
      <View style={styles.cardAccentStrip} />
      <View style={styles.cardHeader}>
        <View style={styles.transactionIcon}>
          <Ionicons name="swap-horizontal" size={22} color={colors.primary} />
        </View>
        <View style={styles.cardTitleWrap}>
          <Text style={styles.bookTitle} numberOfLines={1}>{item.book_title || '-'}</Text>
          <Text style={styles.userText} numberOfLines={1}>{item.user_name || '-'} - {item.user_email || '-'}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <View style={styles.metaGrid}>
        <InfoRow label="Pinjam" value={formatDate(item.borrow_date)} />
        <InfoRow label="Jatuh Tempo" value={formatDate(item.due_date)} />
        <InfoRow label="Kembali" value={formatDate(item.return_date)} />
        <InfoRow label="Denda" value={formatCurrency(item.fine_amount)} danger={Number(item.fine_amount) > 0} />
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.transactionId}>TRX-{item.id}</Text>
        <TouchableOpacity style={styles.overrideButton} onPress={() => openOverride(item)} activeOpacity={0.85}>
          <Ionicons name="create-outline" size={15} color={colors.primary} />
          <Text style={styles.overrideButtonText}>Override</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="file-tray-outline" size={44} color={colors.primaryLight} />
      <Text style={styles.emptyTitle}>Tidak ada transaksi.</Text>
      <Text style={styles.emptyText}>Ubah filter atau periode untuk melihat data transaksi lain.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />
        <View style={[styles.headerTopRow, contentStyle]}>
          <View style={styles.headerIconBadge}>
            <Ionicons name="receipt" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.headerTextArea}>
            <Text style={styles.headerTitle}>Manajemen Transaksi</Text>
            <Text style={styles.headerSubtitle}>Monitor peminjaman, pengembalian, dan override buku</Text>
          </View>
        </View>

        <View style={[styles.searchBar, contentStyle]}>
          <Ionicons name="search" size={16} color={colors.textSecondary} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama, email, atau judul buku..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={[styles.statsRow, contentStyle]}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.active}</Text>
          <Text style={styles.statLabel}>Aktif</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.danger }]}>{stats.overdue}</Text>
          <Text style={styles.statLabel}>Terlambat</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.success }]}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Selesai</Text>
        </View>
      </View>

      <View style={[styles.filterWrap, contentStyle]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {ADMIN_TRANSACTION_FILTERS.map((filter) => {
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
        </ScrollView>
        <View style={styles.dateFilterRow}>
          <TextInput
            style={styles.dateInput}
            placeholder="Mulai: YYYY-MM-DD"
            placeholderTextColor="#94A3B8"
            value={startDate}
            onChangeText={setStartDate}
          />
          <TextInput
            style={styles.dateInput}
            placeholder="Akhir: YYYY-MM-DD"
            placeholderTextColor="#94A3B8"
            value={endDate}
            onChangeText={setEndDate}
          />
        </View>
      </View>

      {error ? (
        <View style={[styles.errorBox, contentStyle]}>
          <Ionicons name="alert-circle" size={18} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {loading && transactions.length === 0 ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Memuat transaksi...</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => `admin-transaction-${item.id}`}
          contentContainerStyle={[styles.listPadding, contentStyle]}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadAdminTransactions}
          ListEmptyComponent={!loading ? renderEmpty : null}
        />
      )}

      <Modal visible={!!selectedTransaction && !overrideVisible} transparent animationType="fade" onRequestClose={() => setSelectedTransaction(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.detailModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detail Transaksi</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedTransaction(null)}>
                <Ionicons name="close" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {selectedTransaction ? (
              <>
                <StatusBadge status={selectedTransaction.status} />
                <View style={styles.detailBlock}>
                  <InfoRow label="Kode" value={`TRX-${selectedTransaction.id}`} />
                  <InfoRow label="Mahasiswa" value={selectedTransaction.user_name} />
                  <InfoRow label="Email" value={selectedTransaction.user_email} />
                  <InfoRow label="Buku" value={selectedTransaction.book_title} />
                  <InfoRow label="Pinjam" value={formatDate(selectedTransaction.borrow_date)} />
                  <InfoRow label="Jatuh Tempo" value={formatDate(selectedTransaction.due_date)} />
                  <InfoRow label="Kembali" value={formatDate(selectedTransaction.return_date)} />
                  <InfoRow label="Denda" value={formatCurrency(selectedTransaction.fine_amount)} danger={Number(selectedTransaction.fine_amount) > 0} />
                  <InfoRow label="Catatan Override" value={selectedTransaction.override_note} />
                </View>
                <TouchableOpacity style={styles.modalPrimaryButton} onPress={() => openOverride(selectedTransaction)} activeOpacity={0.85}>
                  <Ionicons name="create-outline" size={17} color="#FFFFFF" />
                  <Text style={styles.modalPrimaryButtonText}>Override Status</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal visible={overrideVisible} transparent animationType="slide" onRequestClose={closeOverride}>
        <View style={styles.modalOverlay}>
          <View style={styles.overrideModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Override Status</Text>
              <TouchableOpacity style={styles.modalClose} onPress={closeOverride}>
                <Ionicons name="close" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Status Baru</Text>
            <View style={styles.overrideOptions}>
              {OVERRIDE_STATUS_OPTIONS.map((option) => {
                const active = overrideStatus === option.key;
                return (
                  <TouchableOpacity
                    key={option.key}
                    style={[styles.overrideOption, active && styles.overrideOptionActive]}
                    onPress={() => setOverrideStatus(option.key)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.overrideOptionText, active && styles.overrideOptionTextActive]}>{option.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>Catatan</Text>
            <TextInput
              style={styles.noteInput}
              value={overrideNote}
              onChangeText={setOverrideNote}
              placeholder="Contoh: Buku dilaporkan hilang oleh peminjam."
              placeholderTextColor="#94A3B8"
              multiline
            />

            <TouchableOpacity
              style={[styles.modalPrimaryButton, submitting && styles.disabledButton]}
              onPress={handleSubmitOverride}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={17} color="#FFFFFF" />
                  <Text style={styles.modalPrimaryButtonText}>Simpan Override</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7FF' },
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
  headerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  headerIconBadge: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  headerTextArea: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.68)', marginTop: 2 },
  searchBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 14, height: 44, alignItems: 'center' },
  searchInput: { flex: 1, fontSize: 13, color: colors.textPrimary, fontWeight: '600', height: '100%' },
  statsRow: { flexDirection: 'row', marginHorizontal: 18, paddingTop: 16, gap: 10 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#F0EEFF' },
  statNumber: { fontSize: 20, fontWeight: '900', color: colors.textPrimary },
  statLabel: { fontSize: 10, fontWeight: '700', color: colors.textSecondary, marginTop: 2, textTransform: 'uppercase' },
  filterWrap: { paddingHorizontal: 18, marginTop: 14 },
  filterScroll: { gap: 8, paddingRight: 18 },
  filterButton: { minHeight: 36, paddingHorizontal: 13, borderRadius: 10, borderWidth: 1, borderColor: '#EDE9FE', backgroundColor: '#FFFFFF', justifyContent: 'center' },
  filterButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.primary, fontSize: 12, fontWeight: '900' },
  filterTextActive: { color: '#FFFFFF' },
  dateFilterRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  dateInput: { flex: 1, height: 42, borderRadius: 12, borderWidth: 1, borderColor: '#EDE9FE', backgroundColor: '#FFFFFF', paddingHorizontal: 12, fontSize: 12, color: colors.textPrimary, fontWeight: '700' },
  errorBox: { marginHorizontal: 18, marginTop: 12, borderRadius: 12, padding: 12, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', flexDirection: 'row', gap: 8, alignItems: 'center' },
  errorText: { flex: 1, color: '#991B1B', fontSize: 13, fontWeight: '700' },
  centerLoading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 10, color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
  listPadding: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 30 },
  transactionCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#F0EEFF', position: 'relative', overflow: 'hidden' },
  cardAccentStrip: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: colors.primary },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  transactionIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' },
  cardTitleWrap: { flex: 1, minWidth: 0 },
  bookTitle: { color: colors.textPrimary, fontSize: 14, lineHeight: 19, fontWeight: '900' },
  userText: { marginTop: 2, color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  statusBadge: { minHeight: 28, borderRadius: 8, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusText: { fontSize: 11, fontWeight: '900' },
  metaGrid: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  infoRow: { flexBasis: '48%', flexGrow: 1, backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10 },
  infoLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: '800' },
  infoValue: { marginTop: 3, color: colors.textPrimary, fontSize: 12, lineHeight: 17, fontWeight: '900' },
  dangerText: { color: colors.danger },
  cardFooter: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  transactionId: { color: colors.textSecondary, fontSize: 11, fontWeight: '900' },
  overrideButton: { minHeight: 34, paddingHorizontal: 11, borderRadius: 10, backgroundColor: '#F5F3FF', flexDirection: 'row', alignItems: 'center', gap: 6 },
  overrideButtonText: { color: colors.primary, fontSize: 12, fontWeight: '900' },
  emptyState: { marginTop: 28, alignItems: 'center', padding: 24, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#F0EEFF' },
  emptyTitle: { marginTop: 10, color: colors.textPrimary, fontSize: 15, fontWeight: '900' },
  emptyText: { marginTop: 5, color: colors.textSecondary, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(30,27,46,0.58)', justifyContent: 'center', paddingHorizontal: 22 },
  detailModal: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, maxHeight: '86%' },
  overrideModal: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  modalTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '900' },
  modalClose: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  detailBlock: { marginTop: 12, gap: 8 },
  modalPrimaryButton: { marginTop: 14, minHeight: 46, borderRadius: 12, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  modalPrimaryButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  inputLabel: { color: colors.textPrimary, fontSize: 12, fontWeight: '900', marginTop: 4, marginBottom: 8 },
  overrideOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  overrideOption: { minHeight: 38, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: '#EDE9FE', justifyContent: 'center' },
  overrideOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  overrideOptionText: { color: colors.primary, fontSize: 12, fontWeight: '900' },
  overrideOptionTextActive: { color: '#FFFFFF' },
  noteInput: { minHeight: 92, borderWidth: 1, borderColor: '#EDE9FE', borderRadius: 12, padding: 12, color: colors.textPrimary, textAlignVertical: 'top', fontSize: 13, lineHeight: 19 },
  disabledButton: { backgroundColor: '#CBD5E1' },
});
