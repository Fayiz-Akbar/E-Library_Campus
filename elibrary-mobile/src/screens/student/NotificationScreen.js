// src/screens/student/NotificationScreen.js
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
import { getHorizontalPadding, getResponsiveContentStyle } from '../../utils/responsive';
import { useTransactions } from '../../hooks/useTransactions';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatCurrency = (value) => `Rp${Number(value || 0).toLocaleString('id-ID')}`;

const getNotificationMeta = (item) => {
  if (item.notification_type === 'borrow_success') {
    return {
      title: 'Peminjaman berhasil',
      message: 'Transaksi peminjaman buku berhasil tercatat. Simpan buku dengan baik dan kembalikan sebelum jatuh tempo.',
      color: colors.success,
      background: '#ECFDF5',
      icon: 'checkmark-circle-outline',
      dateLabel: 'Jatuh tempo',
      showReturnAction: true,
    };
  }

  if (item.notification_type === 'return_success') {
    return {
      title: 'Pengembalian berhasil',
      message: `Buku berhasil dikembalikan. Denda akhir: ${formatCurrency(item.fine_amount)}.`,
      color: colors.success,
      background: '#ECFDF5',
      icon: 'checkmark-done-circle-outline',
      dateLabel: 'Dikembalikan',
      showReturnAction: false,
    };
  }

  if (item.notification_type === 'overdue') {
    return {
      title: 'Buku terlambat dikembalikan',
      message: `Terlambat ${item.late_days || 0} hari. Estimasi denda ${formatCurrency(item.estimated_fine_amount)}.`,
      color: colors.danger,
      background: '#FEF2F2',
      icon: 'alert-circle-outline',
      dateLabel: 'Jatuh tempo',
      showReturnAction: true,
    };
  }

  const hourText = item.hours_until_due <= 0
    ? 'hari ini'
    : `${item.hours_until_due} jam lagi`;

  return {
    title: 'Buku mendekati jatuh tempo',
    message: `Jatuh tempo ${hourText}. Kembalikan tepat waktu agar tidak terkena denda.`,
    color: colors.warning,
    background: '#FFFBEB',
    icon: 'notifications-outline',
    dateLabel: 'Jatuh tempo',
    showReturnAction: true,
  };
};

const NotificationItem = ({ item, onReturnPress }) => {
  const meta = getNotificationMeta(item);

  return (
    <View style={[styles.notificationItem, { borderColor: meta.color }]}>
      <View style={[styles.notificationIcon, { backgroundColor: meta.background }]}>
        <Ionicons name={meta.icon} size={24} color={meta.color} />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{meta.title}</Text>
        <Text style={styles.bookTitle} numberOfLines={2}>{item.title || 'Judul buku tidak tersedia'}</Text>
        <Text style={styles.notificationMessage}>{meta.message}</Text>
        <Text style={styles.dueDate}>
          {meta.dateLabel}: {formatDate(item.notification_type === 'return_success' ? item.return_date : item.due_date)}
        </Text>
        {meta.showReturnAction ? (
          <TouchableOpacity style={styles.returnButton} onPress={onReturnPress} activeOpacity={0.85}>
            <Ionicons name="scan-outline" size={16} color="#FFFFFF" />
            <Text style={styles.returnButtonText}>Scan Pengembalian</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export default function NotificationScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const contentStyle = getResponsiveContentStyle(width, 820);
  const horizontalPadding = getHorizontalPadding(width);
  const {
    notifications,
    notificationLoading,
    notificationError,
    loadNotifications,
  } = useTransactions({ autoLoadHistory: false, autoLoadNotifications: true });

  const goToScanReturn = () => {
    navigation.navigate('MainTabs', { screen: 'Scan QR' });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }]}
        refreshControl={<RefreshControl refreshing={notificationLoading} onRefresh={loadNotifications} />}
      >
        <View style={[styles.header, contentStyle]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={21} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>Reminder</Text>
            <Text style={styles.title}>Notifikasi</Text>
            <Text style={styles.subtitle}>Reminder jatuh tempo, keterlambatan, dan aktivitas transaksi.</Text>
          </View>
        </View>

        {notificationError ? (
          <View style={[styles.feedbackBox, styles.errorBox, contentStyle]}>
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{notificationError}</Text>
          </View>
        ) : null}

        {notificationLoading && notifications.length === 0 ? (
          <View style={[styles.centerState, contentStyle]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.centerText}>Memuat notifikasi...</Text>
          </View>
        ) : null}

        {!notificationLoading && notifications.length === 0 && !notificationError ? (
          <View style={[styles.centerState, contentStyle]}>
            <Ionicons name="notifications-off-outline" size={42} color={colors.primaryLight} />
            <Text style={styles.emptyTitle}>Tidak ada notifikasi.</Text>
            <Text style={styles.emptyText}>Reminder jatuh tempo dan aktivitas pinjam/kembali akan tampil di sini.</Text>
          </View>
        ) : null}

        <View style={[styles.list, contentStyle]}>
          {notifications.map((item) => (
            <NotificationItem key={String(item.notification_id || item.id)} item={item} onReturnPress={goToScanReturn} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingTop: 56, paddingBottom: 32 },
  header: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDE9FE',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerText: { flex: 1 },
  eyebrow: { fontSize: 12, color: colors.primary, fontWeight: '900', textTransform: 'uppercase', marginBottom: 3 },
  title: { fontSize: 23, lineHeight: 29, color: colors.textPrimary, fontWeight: '900' },
  subtitle: { marginTop: 6, fontSize: 13, lineHeight: 19, color: colors.textSecondary },
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
  notificationItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
  },
  notificationIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: { flex: 1, minWidth: 0 },
  notificationTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '900' },
  bookTitle: { marginTop: 4, color: colors.primary, fontSize: 13, lineHeight: 18, fontWeight: '900' },
  notificationMessage: { marginTop: 6, color: colors.textSecondary, fontSize: 12, lineHeight: 18, fontWeight: '700' },
  dueDate: { marginTop: 6, color: colors.textPrimary, fontSize: 12, fontWeight: '800' },
  returnButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    minHeight: 38,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  returnButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
});
