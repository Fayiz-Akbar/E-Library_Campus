// src/screens/admin/ReportScreen.js
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
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
import { useTransactionReport } from '../../hooks/useTransactions';
import { getResponsiveContentStyle } from '../../utils/responsive';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatCurrency = (value) => `Rp${Number(value || 0).toLocaleString('id-ID')}`;

const downloadCsvOnWeb = ({ csvText, startDate, endDate }) => {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return false;

  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `transaction-report-${startDate}-to-${endDate}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
};

const SummaryCard = ({ icon, label, value, color = colors.primary }) => (
  <View style={styles.summaryCard}>
    <View style={[styles.summaryIcon, { backgroundColor: `${color}18` }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <Text style={[styles.summaryValue, { color }]}>{value}</Text>
    <Text style={styles.summaryLabel}>{label}</Text>
  </View>
);

const ReportItem = ({ item }) => (
  <View style={styles.reportRow}>
    <View style={styles.rowIcon}>
      <Ionicons name="receipt-outline" size={20} color={colors.primary} />
    </View>
    <View style={styles.rowContent}>
      <Text style={styles.bookTitle} numberOfLines={1}>{item.book_title || '-'}</Text>
      <Text style={styles.studentText} numberOfLines={1}>{item.student_name || '-'} - {item.student_email || '-'}</Text>
      <View style={styles.rowMeta}>
        <Text style={styles.metaText}>Pinjam {formatDate(item.borrow_date)}</Text>
        <Text style={styles.metaText}>Status {item.status || '-'}</Text>
      </View>
    </View>
    <Text style={styles.fineText}>{formatCurrency(item.fine_amount)}</Text>
  </View>
);

export default function ReportScreen() {
  const { width } = useWindowDimensions();
  const contentStyle = getResponsiveContentStyle(width, 1080);
  const [csvModalVisible, setCsvModalVisible] = useState(false);
  const {
    startDate,
    endDate,
    summary,
    items,
    loading,
    exporting,
    error,
    csvText,
    setStartDate,
    setEndDate,
    loadReport,
    exportCsv,
  } = useTransactionReport({ autoLoad: true });

  const handleExport = async () => {
    const response = await exportCsv();

    if (!response.success) {
      Alert.alert('Export gagal', response.message || 'Gagal export laporan transaksi.');
      return;
    }

    const downloaded = downloadCsvOnWeb({
      csvText: response.data,
      startDate,
      endDate,
    });

    if (downloaded) {
      Alert.alert('Export berhasil', 'File CSV berhasil diunduh melalui browser.');
      return;
    }

    setCsvModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />
        <View style={[styles.headerTopRow, contentStyle]}>
          <View style={styles.headerIconBadge}>
            <Ionicons name="document-text" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.headerTextArea}>
            <Text style={styles.headerTitle}>Laporan Transaksi</Text>
            <Text style={styles.headerSubtitle}>Ringkasan periode dan export CSV administrasi</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => `report-${item.transaction_id}`}
        renderItem={({ item }) => <ReportItem item={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listPadding, contentStyle]}
        refreshing={loading}
        onRefresh={loadReport}
        ListHeaderComponent={(
          <>
            <View style={styles.filterPanel}>
              <Text style={styles.sectionTitle}>Periode Laporan</Text>
              <View style={styles.dateRow}>
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
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.primaryButton} onPress={loadReport} activeOpacity={0.85} disabled={loading}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="filter-outline" size={17} color="#FFFFFF" />
                      <Text style={styles.primaryButtonText}>Tampilkan</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.exportButton} onPress={handleExport} activeOpacity={0.85} disabled={exporting}>
                  {exporting ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <>
                      <Ionicons name="download-outline" size={17} color={colors.primary} />
                      <Text style={styles.exportButtonText}>Export CSV</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.summaryGrid}>
              <SummaryCard icon="swap-horizontal" label="Total" value={summary.total_transactions || 0} />
              <SummaryCard icon="time-outline" label="Dipinjam" value={summary.borrowed || 0} color={colors.info} />
              <SummaryCard icon="checkmark-circle-outline" label="Kembali" value={summary.returned || 0} color={colors.success} />
              <SummaryCard icon="alert-circle-outline" label="Terlambat" value={summary.overdue || 0} color={colors.danger} />
              <SummaryCard icon="help-circle-outline" label="Hilang" value={summary.lost || 0} color="#7C2D12" />
              <SummaryCard icon="cash-outline" label="Denda" value={formatCurrency(summary.total_fines)} color={colors.warning} />
            </View>

            <View style={styles.previewHeader}>
              <Text style={styles.sectionTitle}>Preview Transaksi</Text>
              <Text style={styles.previewCount}>{items.length} data</Text>
            </View>
          </>
        )}
        ListEmptyComponent={!loading ? (
          <View style={styles.emptyState}>
            <Ionicons name="file-tray-outline" size={42} color={colors.primaryLight} />
            <Text style={styles.emptyTitle}>Tidak ada data laporan.</Text>
            <Text style={styles.emptyText}>CSV tetap dapat diexport dengan header kolom saja.</Text>
          </View>
        ) : null}
      />

      <Modal visible={csvModalVisible} transparent animationType="slide" onRequestClose={() => setCsvModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.csvModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>CSV Laporan</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => setCsvModalVisible(false)}>
                <Ionicons name="close" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.csvNote}>
              Pada Android/iOS tanpa file helper, hasil export ditampilkan sebagai preview teks.
            </Text>
            <ScrollView style={styles.csvPreview}>
              <Text style={styles.csvText}>{csvText}</Text>
            </ScrollView>
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
  headerTopRow: { flexDirection: 'row', alignItems: 'center' },
  headerIconBadge: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  headerTextArea: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.68)', marginTop: 2 },
  listPadding: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 32 },
  filterPanel: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#F0EEFF' },
  sectionTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '900' },
  dateRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  dateInput: { flex: 1, minHeight: 42, borderRadius: 12, borderWidth: 1, borderColor: '#EDE9FE', paddingHorizontal: 12, color: colors.textPrimary, fontSize: 12, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  primaryButton: { flex: 1, minHeight: 44, borderRadius: 12, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  exportButton: { flex: 1, minHeight: 44, borderRadius: 12, backgroundColor: '#F5F3FF', borderWidth: 1, borderColor: '#EDE9FE', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  exportButtonText: { color: colors.primary, fontSize: 13, fontWeight: '900' },
  errorBox: { marginTop: 12, borderRadius: 12, padding: 12, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', flexDirection: 'row', alignItems: 'center', gap: 8 },
  errorText: { flex: 1, color: '#991B1B', fontSize: 13, fontWeight: '700' },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  summaryCard: { flexBasis: '30%', flexGrow: 1, minHeight: 104, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#F0EEFF' },
  summaryIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 9 },
  summaryValue: { fontSize: 18, fontWeight: '900' },
  summaryLabel: { marginTop: 3, color: colors.textSecondary, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  previewHeader: { marginTop: 18, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  previewCount: { color: colors.primary, fontSize: 12, fontWeight: '900' },
  reportRow: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 13, borderWidth: 1, borderColor: '#F0EEFF', marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' },
  rowContent: { flex: 1, minWidth: 0 },
  bookTitle: { color: colors.textPrimary, fontSize: 13, fontWeight: '900' },
  studentText: { marginTop: 2, color: colors.textSecondary, fontSize: 11, fontWeight: '700' },
  rowMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  metaText: { color: colors.textSecondary, fontSize: 10, fontWeight: '800' },
  fineText: { color: colors.warning, fontSize: 12, fontWeight: '900' },
  emptyState: { alignItems: 'center', padding: 24, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#F0EEFF' },
  emptyTitle: { marginTop: 10, color: colors.textPrimary, fontSize: 15, fontWeight: '900' },
  emptyText: { marginTop: 5, color: colors.textSecondary, fontSize: 12, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(30,27,46,0.58)', justifyContent: 'center', paddingHorizontal: 22 },
  csvModal: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, maxHeight: '82%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '900' },
  modalClose: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  csvNote: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, fontWeight: '700', marginBottom: 10 },
  csvPreview: { backgroundColor: '#0F172A', borderRadius: 12, padding: 12 },
  csvText: { color: '#E2E8F0', fontSize: 11, lineHeight: 17, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
});
