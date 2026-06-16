// src/screens/student/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  TextInput,
  Modal,
  ActivityIndicator,
  useWindowDimensions,
  Platform, // 🚀 TAMBAHKAN: Driver pendeteksi sistem operasi/browser
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile } from '../../api/authApi';
import { getResponsiveContentStyle } from '../../utils/responsive';

export default function ProfileScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const { user, logout, refreshProfile } = useAuth();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const contentStyle = getResponsiveContentStyle(width, 720);

  useEffect(() => {
    // Sinkronkan data profil dari server saat screen dimount
    refreshProfile();
  }, []);

  // 🚀 PERBAIKAN UTAMA: Penanganan Tombol Logout yang Macet di Web Browser Laptop
  const handleLogout = () => {
    // Fungsi pembantu untuk mengeksekusi penghapusan token secara terpusat
    const executeLogout = async () => {
      await logout();
      
      // Jika di mobile, lakukan reset tumpukan navigasi ke Login screen
      // Jika di web, AuthContext kita yang baru sudah otomatis meng-handle hard redirect window.location.href
      if (Platform.OS !== 'web') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    };

    // 💡 KONDISI 1: Jika aplikasi sedang dibuka lewat browser laptop/web
    if (Platform.OS === 'web') {
      const confirmWeb = window.confirm('Apakah kamu yakin ingin keluar dari akun perpustakaan ini, Bree?');
      if (confirmWeb) {
        executeLogout();
      }
    } 
    // 💡 KONDISI 2: Jika aplikasi berjalan di HP Fisik / Emulator Android Studio
    else {
      Alert.alert(
        'Konfirmasi Logout',
        'Apakah Anda yakin ingin keluar dari akun ini?',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Ya, Keluar',
            style: 'destructive',
            onPress: executeLogout,
          },
        ]
      );
    }
  };

  const openEditModal = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert('Peringatan ⚠️', 'Nama dan email wajib diisi.');
      return;
    }

    try {
      setSaving(true);
      const response = await updateProfile({
        name: editName.trim(),
        email: editEmail.trim(),
      });

      if (response.success) {
        Alert.alert('Berhasil 🎉', 'Profil berhasil diperbarui.');
        setEditModalVisible(false);
        await refreshProfile();
      } else {
        Alert.alert('Gagal ❌', response.message);
      }
    } catch (error) {
      const message =
        error.response?.data?.message || 'Gagal memperbarui profil.';
      Alert.alert('Error ❌', message);
    } finally {
      setSaving(false);
    }
  };

  // Format tanggal bergabung
  const formatJoinDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // URL QR Member Card (menggunakan QR API Server seperti pola ManageBooksScreen)
  const memberQrUrl = user?.id
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        JSON.stringify({ type: 'member', userId: user.id, email: user.email })
      )}`
    : null;

  return (
    <View style={styles.container}>
      {/* Header Profil */}
      <View style={styles.profileHeader}>
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />
        <View style={styles.headerCircle3} />

        <View style={[styles.avatarContainer, contentStyle]}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.profileName}>{user?.name || 'Pengguna'}</Text>
          <Text style={styles.profileEmail}>{user?.email || '-'}</Text>

          <View style={styles.roleBadge}>
            <Ionicons
              name={user?.role === 'admin' ? 'shield-checkmark' : 'school'}
              size={12}
              color="#FFFFFF"
            />
            <Text style={styles.roleBadgeText}>
              {user?.role === 'admin' ? 'Administrator' : 'Mahasiswa'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.contentScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.contentPadding, contentStyle]}
      >
        {/* QR Member Card */}
        <View style={styles.qrCardContainer}>
          <View style={styles.qrCardHeader}>
            <View style={styles.qrIconWrap}>
              <Ionicons name="qr-code" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.qrCardTitle}>Kartu Anggota Digital</Text>
              <Text style={styles.qrCardSubtitle}>
                Tunjukkan QR ini saat di perpustakaan
              </Text>
            </View>
          </View>

          <View style={styles.qrImageWrapper}>
            <View style={styles.qrCornerTL} />
            <View style={styles.qrCornerTR} />
            <View style={styles.qrCornerBL} />
            <View style={styles.qrCornerBR} />
            {memberQrUrl ? (
              <Image
                source={{ uri: memberQrUrl }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            ) : (
              <ActivityIndicator size="large" color={colors.primary} />
            )}
          </View>

          <Text style={styles.qrMemberIdText}>
            ID: {user?.id ? `MBR-${String(user.id).padStart(5, '0')}` : '-'}
          </Text>
        </View>

        {/* Info Detail */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informasi Akun</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="person-outline" size={16} color={colors.primary} />
            </View>
            <View style={styles.infoTextArea}>
              <Text style={styles.infoLabel}>Nama Lengkap</Text>
              <Text style={styles.infoValue}>{user?.name || '-'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="mail-outline" size={16} color={colors.primary} />
            </View>
            <View style={styles.infoTextArea}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || '-'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={colors.primary}
              />
            </View>
            <View style={styles.infoTextArea}>
              <Text style={styles.infoLabel}>Bergabung Sejak</Text>
              <Text style={styles.infoValue}>
                {formatJoinDate(user?.created_at)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Ionicons
                name={user?.status === 'active' ? 'checkmark-circle-outline' : 'ban-outline'}
                size={16}
                color={user?.status === 'active' ? colors.success : colors.danger}
              />
            </View>
            <View style={styles.infoTextArea}>
              <Text style={styles.infoLabel}>Status Akun</Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: user?.status === 'active' ? colors.success : colors.danger },
                ]}
              >
                {user?.status === 'active' ? 'Aktif' : 'Ditangguhkan'}
              </Text>
            </View>
          </View>
        </View>

        {/* Tombol Aksi */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={openEditModal}
          activeOpacity={0.85}
        >
          <Ionicons name="create-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.editButtonText}>Edit Profil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.danger} style={{ marginRight: 8 }} />
          <Text style={styles.logoutButtonText}>Keluar dari Akun</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Edit Profil */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, contentStyle]}>
            <View style={styles.modalDragHandle} />

            <View style={styles.modalHeaderRow}>
              <View style={styles.modalTitleRow}>
                <View style={styles.modalIconBadge}>
                  <Ionicons name="create" size={18} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Edit Profil</Text>
                  <Text style={styles.modalSubtitle}>Perbarui informasi akun Anda</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Nama Lengkap</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={16} color={colors.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Nama lengkap"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={16} color={colors.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Alamat email"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSaveProfile}
                activeOpacity={0.85}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.saveBtnText}>Simpan</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7FF' },
  profileHeader: { backgroundColor: colors.primary, paddingTop: 58, paddingBottom: 30, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, position: 'relative', overflow: 'hidden' },
  headerCircle1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.06)', top: -60, right: -50 },
  headerCircle2: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.04)', bottom: -30, left: -30 },
  headerCircle3: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)', top: 30, right: 80 },
  avatarContainer: { alignItems: 'center' },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 14, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#FFFFFF' },
  profileName: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.3 },
  profileEmail: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4, fontWeight: '500' },
  roleBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 12, gap: 6 },
  roleBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  contentScroll: { flex: 1 },
 
  contentPadding: { 
    paddingHorizontal: 20, 
    paddingTop: 20, 
    paddingBottom: Platform.OS === 'android' ? 80 : 40 // Naikkan jarak dari 40 ke 80 khusus Android
  },
  qrCardContainer: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, alignItems: 'center', elevation: 3, shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, borderWidth: 1, borderColor: '#F0EEFF', marginBottom: 16 },
  qrCardHeader: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 16 },
  qrIconWrap: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  qrCardTitle: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  qrCardSubtitle: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  qrImageWrapper: { width: 180, height: 180, justifyContent: 'center', alignItems: 'center', position: 'relative', marginBottom: 12 },
  qrImage: { width: 160, height: 160 },
  qrCornerTL: { position: 'absolute', top: 0, left: 0, width: 24, height: 24, borderTopWidth: 3, borderLeftWidth: 3, borderColor: colors.primary, borderTopLeftRadius: 8 },
  qrCornerTR: { position: 'absolute', top: 0, right: 0, width: 24, height: 24, borderTopWidth: 3, borderRightWidth: 3, borderColor: colors.primary, borderTopRightRadius: 8 },
  qrCornerBL: { position: 'absolute', bottom: 0, left: 0, width: 24, height: 24, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: colors.primary, borderBottomLeftRadius: 8 },
  qrCornerBR: { position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderBottomWidth: 3, borderRightWidth: 3, borderColor: colors.primary, borderBottomRightRadius: 8 },
  qrMemberIdText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, letterSpacing: 1 },
  infoSection: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, elevation: 3, shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8, borderWidth: 1, borderColor: '#F0EEFF', marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  infoIconWrap: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  infoTextArea: { flex: 1 },
  infoLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 14, color: colors.textPrimary, fontWeight: '700', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F0EEFF', marginVertical: 2 },
  editButton: { backgroundColor: colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 16, elevation: 4, shadowColor: colors.primaryDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, marginBottom: 12 },
  editButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  logoutButton: { backgroundColor: '#FFFFFF', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 16, borderWidth: 1.5, borderColor: colors.danger },
  logoutButtonText: { color: colors.danger, fontSize: 15, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingBottom: 40, paddingTop: 12 },
  modalDragHandle: { width: 40, height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  modalIconBadge: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  modalSubtitle: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' },
  inputLabel: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginBottom: 8, marginTop: 12 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: 14, height: 50, borderWidth: 1.5, borderColor: colors.border },
  inputIcon: { marginRight: 10 },
  textInput: { flex: 1, fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  modalActions: { flexDirection: 'row', marginTop: 24, gap: 12 },
  cancelBtn: { flex: 1, backgroundColor: colors.surface, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  cancelBtnText: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  saveBtn: { flex: 2, backgroundColor: colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 14 },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});