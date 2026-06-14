// src/screens/admin/ManageBooksScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, ActivityIndicator, Modal, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; 
import { colors } from '../../constants/colors';
import { fetchAllBooks } from '../../api/bookApi';
import { adminCreateBook, adminUpdateBook, adminDeleteBook } from '../../api/bookApi';

const PLACEHOLDER_COVER = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80';

export default function ManageBooksScreen() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Form Modal CRUD
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null); 
  const [imageSourceType, setImageSourceType] = useState('url'); 
  
  // 🚀 STATE BARU: Khusus untuk Mengontrol Modal Pop-up Tampilan QR Code Buku
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [activeQrData, setActiveQrData] = useState({ title: '', qr_code: '' });

  const [form, setForm] = useState({
    title: '', author: '', publisher: '', isbn: '', stock: '', summary: '', cover_image: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const loadAdminCatalog = async () => {
    try {
      setLoading(true);
      const res = await fetchAllBooks('', ''); 
      if (res.success) setBooks(res.data);
    } catch (err) {
      Alert.alert('Error ❌', 'Gagal menyinkronkan data katalog perpustakaan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminCatalog();
  }, []);

  const pickImageFromDevice = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Izin Ditolak ⚠️', 'Aplikasi butuh akses galeri untuk mengunggah gambar sampul, Bree!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false, 
      quality: 0.5, 
      base64: true, 
    });

    if (!result.canceled) {
      const base64String = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setForm({ ...form, cover_image: base64String });
    }
  };

  // 🚀 FUNGSI BARU: Pemicu Buka Pop-up QR Code
  const openQrModal = (book) => {
    if (!book.qr_code) {
      Alert.alert('Peringatan ⚠️', 'Buku lama ini belum memiliki data QR Code Token, silakan edit lalu simpan ulang terlebih dahulu.');
      return;
    }
    setActiveQrData({ title: book.title, qr_code: book.qr_code });
    setQrModalVisible(true);
  };

  const openAddModal = () => {
    setSelectedBookId(null);
    setImageSourceType('url');
    setForm({ title: '', author: '', publisher: '', isbn: '', stock: '', summary: '', cover_image: '' });
    setModalVisible(true);
  };

  const openEditModal = (book) => {
    setSelectedBookId(book.id);
    const isUrl = book.cover_image && (book.cover_image.startsWith('http') || book.cover_image.startsWith('data:'));
    setImageSourceType(isUrl ? 'url' : 'upload');

    setForm({
      title: book.title,
      author: book.author,
      publisher: book.publisher || '',
      isbn: book.isbn || '',
      stock: book.stock ? book.stock.toString() : '1',
      summary: book.summary || '',
      cover_image: book.cover_image || ''
    });
    setModalVisible(true);
  };

  const handleSaveBook = async () => {
    if (!form.title || !form.author || !form.stock) {
      Alert.alert('Peringatan ⚠️', 'Judul, Penulis, dan Jumlah Stok wajib diisi, Bree!');
      return;
    }

    try {
      setSubmitLoading(true);
      let res;
      if (selectedBookId) {
        res = await adminUpdateBook(selectedBookId, form);
      } else {
        res = await adminCreateBook(form);
      }

      if (res.success) {
        Alert.alert('Sukses 🎉', res.message);
        setModalVisible(false);
        loadAdminCatalog(); 
      }
    } catch (err) {
      Alert.alert('Gagal ❌', err.message || 'Terjadi kesalahan sistem internal.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteConfirm = (book) => {
    Alert.alert(
      'Konfirmasi Pemusnahan',
      `Apakah kamu yakin ingin menghapus buku "${book.title}" secara permanen dari sistem database?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await adminDeleteBook(book.id);
              if (res.success) {
                Alert.alert('Terhapus 🗑️', res.message);
                loadAdminCatalog();
              }
            } catch (err) {
              Alert.alert('Error ❌', 'Gagal menghapus buku dari server.');
            }
          }
        }
      ]
    );
  };

  const renderAdminBookRow = ({ item }) => (
    <View style={styles.bookRowCard}>
      <Image source={{ uri: item.cover_image || PLACEHOLDER_COVER }} style={styles.rowCover} resizeMode="cover" />
      <View style={styles.rowDetails}>
        <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.rowAuthor}>Oleh: {item.author}</Text>
        <View style={styles.rowStockArea}>
          <Text style={styles.stockLabel}>Total Stok: <Text style={styles.boldDarkText}>{item.stock || 0}</Text></Text>
          <Text style={styles.stockLabel}>• Sisa: <Text style={styles.boldSuccessText}>{item.available_stock || 0}</Text></Text>
        </View>
      </View>
      
      {/* 🚀 UPGRADE: Kolom Tombol Aksi Row (Kini Berjumlah 3 Tombol) */}
      <View style={styles.rowActions}>
        <TouchableOpacity style={styles.qrActionBtn} onPress={() => openQrModal(item)}>
          <Ionicons name="qr-code-outline" size={17} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.editActionBtn} onPress={() => openEditModal(item)}>
          <Ionicons name="create-outline" size={17} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteActionBtn} onPress={() => handleDeleteConfirm(item)}>
          <Ionicons name="trash-outline" size={17} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.adminHeader}>
        <Text style={styles.adminTitle}>Manajemen Buku</Text>
        <Text style={styles.adminSubtitle}>Kendalikan, tambah, dan modifikasi inventaris buku perpustakaan.</Text>
      </View>

      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Menyelaraskan rak buku admin...</Text>
        </View>
      ) : (
        <FlatList
          data={books}
          renderItem={renderAdminBookRow}
          keyExtractor={(item) => 'admin-book-' + item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainerPadding}
          onRefresh={loadAdminCatalog}
          refreshing={loading}
        />
      )}

      <TouchableOpacity style={styles.floatingAddBtn} activeOpacity={0.85} onPress={openAddModal}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* 4. MODAL FORM INPUT POPUP */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBlurOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalFormWrapper}>
            
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalFormTitle}>{selectedBookId ? 'Edit Spesifikasi Buku' : 'Tambah Buku Baru'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScrollPadding}>
              <Text style={styles.inputLabel}>Judul Buku *</Text>
              <TextInput style={styles.formInputBox} placeholder="Masukkan judul lengkap buku..." value={form.title} onChangeText={(text) => setForm({...form, title: text})} />

              <Text style={styles.inputLabel}>Penulis / Pengarang *</Text>
              <TextInput style={styles.formInputBox} placeholder="Nama penulis..." value={form.author} onChangeText={(text) => setForm({...form, author: text})} />

              <Text style={styles.inputLabel}>Penerbit Buku</Text>
              <TextInput style={styles.formInputBox} placeholder="Gedung/PT Penerbit..." value={form.publisher} onChangeText={(text) => setForm({...form, publisher: text})} />

              <Text style={styles.inputLabel}>Jumlah Penyediaan Stok *</Text>
              <TextInput style={styles.formInputBox} placeholder="Contoh: 10" keyboardType="numeric" value={form.stock} onChangeText={(text) => setForm({...form, stock: text})} />

              <Text style={styles.inputLabel}>Nomor Internasional ISBN</Text>
              <TextInput style={styles.formInputBox} placeholder="Kode nomor ISBN buku..." value={form.isbn} onChangeText={(text) => setForm({...form, isbn: text})} />

              <Text style={styles.inputLabel}>Metode Input Gambar Sampul</Text>
              <View style={styles.imageTabsSelectorRow}>
                <TouchableOpacity 
                  style={[styles.selectorTab, imageSourceType === 'url' ? styles.activeTabBg : styles.inactiveTabBg]}
                  onPress={() => { setImageSourceType('url'); setForm({ ...form, cover_image: '' }); }}
                >
                  <Ionicons name="link-outline" size={15} color={imageSourceType === 'url' ? '#FFFFFF' : '#1E1B2E'} style={{ marginRight: 6 }} />
                  <Text style={[styles.tabBtnText, imageSourceType === 'url' ? styles.whiteText : styles.darkText]}>Pakai URL Link</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.selectorTab, imageSourceType === 'upload' ? styles.activeTabBg : styles.inactiveTabBg]}
                  onPress={() => { setImageSourceType('upload'); setForm({ ...form, cover_image: '' }); }}
                >
                  <Ionicons name="cloud-upload-outline" size={15} color={imageSourceType === 'upload' ? '#FFFFFF' : '#1E1B2E'} style={{ marginRight: 6 }} />
                  <Text style={[styles.tabBtnText, imageSourceType === 'upload' ? styles.whiteText : styles.darkText]}>Upload Galeri</Text>
                </TouchableOpacity>
              </View>

              {imageSourceType === 'url' ? (
                <TextInput style={styles.formInputBox} placeholder="https://example.com/cover.jpg" value={form.cover_image} onChangeText={(text) => setForm({...form, cover_image: text})} />
              ) : (
                <TouchableOpacity style={styles.dashedUploadContainer} activeOpacity={0.7} onPress={pickImageFromDevice}>
                  {form.cover_image ? (
                    <View style={styles.uploadedPreviewBox}>
                      <Image source={{ uri: form.cover_image }} style={styles.miniPreviewImage} resizeMode="cover" />
                      <Text style={styles.uploadBoxSubText}>Ketuk untuk mengganti file gambar</Text>
                    </View>
                  ) : (
                    <View style={styles.uploadCenterPlaceholder}>
                      <Ionicons name="image-outline" size={30} color={colors.primary} />
                      <Text style={styles.uploadBoxMainText}>Pilih File Gambar dari HP</Text>
                      <Text style={styles.uploadBoxSubText}>Mendukung JPG, PNG otomatis dikompresi</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}

              <Text style={styles.inputLabel}>Ringkasan Deskripsi / Sinopsis</Text>
              <TextInput style={[styles.formInputBox, styles.textAreaInput]} placeholder="Tuliskan intisari pembahasan buku..." multiline={true} numberOfLines={4} value={form.summary} onChangeText={(text) => setForm({...form, summary: text})} />
            </ScrollView>

            <TouchableOpacity style={[styles.formSubmitBtn, submitLoading && { backgroundColor: '#CBD5E1' }]} disabled={submitLoading} onPress={handleSaveBook} activeOpacity={0.8}>
              {submitLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>{selectedBookId ? 'Simpan Perubahan Info' : 'Terbitkan Buku & QR Token'}</Text>
              )}
            </TouchableOpacity>

          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* 🚀 MODAL POPUP TERBARU: Khusus Menampilkan QR Code Token Hasil Produksi Backend */}
      <Modal animationType="fade" transparent={true} visible={qrModalVisible} onRequestClose={() => setQrModalVisible(false)}>
        <View style={styles.modalCenterOverlay}>
          <View style={styles.qrCardWrapper}>
            <Text style={styles.qrModalTitle} numberOfLines={1}>{activeQrData.title}</Text>
            <Text style={styles.qrModalSubtitle}>TOKEN IDENTIFIKASI QR CODE RESMI</Text>
            
            {/* Area Box Gambar QR Code Base64 atau API Auto-Generate */}
            <View style={styles.qrImageContainer}>
              {activeQrData.qr_code ? (
                <Image 
                  source={{ 
                    uri: activeQrData.qr_code.startsWith('data:image') 
                      ? activeQrData.qr_code 
                      : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(activeQrData.qr_code)}`
                  }} 
                  style={styles.bigQrCodeImage} 
                  resizeMode="contain" 
                />
              ) : null}
            </View>
            
            <Text style={styles.qrInstructionText}>Arahkan kamera HP mahasiswa ke kode di atas untuk memproses peminjaman kilat.</Text>
            
            <TouchableOpacity style={styles.closeQrBtn} onPress={() => setQrModalVisible(false)} activeOpacity={0.8}>
              <Text style={styles.closeQrBtnText}>Tutup Layar QR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9FE' },
  adminHeader: { backgroundColor: colors.primary, paddingTop: 65, paddingHorizontal: 24, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  adminTitle: { fontSize: 24, fontWeight: '900', color: '#FFFFFF', marginTop: 2 },
  adminSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4, lineHeight: 16 },
  listContainerPadding: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 },
  bookRowCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, marginBottom: 12, alignItems: 'center', borderColor: '#ECE9FA', borderWidth: 1, elevation: 2, shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4 },
  rowCover: { width: 44, height: 60, borderRadius: 8, backgroundColor: colors.surface },
  rowDetails: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  rowTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  rowAuthor: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
  rowStockArea: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
  stockLabel: { fontSize: 11, color: colors.textSecondary },
  boldDarkText: { fontWeight: 'bold', color: '#000000' },
  boldSuccessText: { fontWeight: 'bold', color: colors.success },
  
  // Style Tombol Row Actions (Kini 3 Tombol Senada)
  rowActions: { flexDirection: 'row', gap: 5, paddingLeft: 4 },
  qrActionBtn: { backgroundColor: '#F0EFFF', padding: 7, borderRadius: 8 },
  editActionBtn: { backgroundColor: '#F5F3FF', padding: 7, borderRadius: 8 },
  deleteActionBtn: { backgroundColor: '#FCE8E6', padding: 7, borderRadius: 8 },
  
  floatingAddBtn: { position: 'absolute', bottom: 30, right: 24, backgroundColor: colors.primary, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
  modalBlurOverlay: { flex: 1, backgroundColor: 'rgba(30, 27, 46, 0.5)', justifyContent: 'flex-end' },
  modalFormWrapper: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 34, maxHeight: '85%', width: '100%' },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottomWidth: 1, borderColor: '#F3F4F6' },
  modalFormTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  formScrollPadding: { paddingTop: 16, paddingBottom: 20 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  formInputBox: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 14, height: 44, fontSize: 13, color: colors.textPrimary, marginBottom: 16, fontWeight: '500' },
  textAreaInput: { height: 80, paddingTop: 12, textAlignVertical: 'top' },
  formSubmitBtn: { backgroundColor: colors.primary, borderRadius: 14, height: 48, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80 },
  loadingText: { marginTop: 10, color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  imageTabsSelectorRow: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 12, gap: 4 },
  selectorTab: { flex: 1, flexDirection: 'row', height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  activeTabBg: { backgroundColor: colors.primary },
  inactiveTabBg: { backgroundColor: 'transparent' },
  tabBtnText: { fontSize: 11, fontWeight: '700' },
  whiteText: { color: '#FFFFFF' },
  darkText: { color: '#334155' },
  dashedUploadContainer: { width: '100%', height: 125, borderRadius: 14, borderStyle: 'dashed', borderWidth: 2, borderColor: colors.primaryLight, backgroundColor: '#FAF9FE', justifyContent: 'center', alignItems: 'center', marginBottom: 16, overflow: 'hidden' },
  uploadCenterPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  uploadBoxMainText: { fontSize: 12, fontWeight: '800', color: colors.textPrimary, marginTop: 4 },
  uploadBoxSubText: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },
  uploadedPreviewBox: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  miniPreviewImage: { width: 50, height: 68, borderRadius: 6, marginBottom: 4 },

  //  STYLING BARU: MODAL POPUP KHUSUS PREVIEW QR CODE
  modalCenterOverlay: { flex: 1, backgroundColor: 'rgba(30, 27, 46, 0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  qrCardWrapper: { backgroundColor: '#FFFFFF', width: '100%', borderRadius: 24, padding: 24, alignItems: 'center', elevation: 10, shadowColor: '#000000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12 },
  qrModalTitle: { fontSize: 16, fontWeight: '900', color: colors.textPrimary, textAlign: 'center', width: '100%' },
  qrModalSubtitle: { fontSize: 9, fontWeight: '800', color: colors.secondary, marginTop: 4, letterSpacing: 1 },
  qrImageContainer: { width: 200, height: 200, backgroundColor: '#F8FAFC', borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 16, pading: 12 },
  bigQrCodeImage: { width: 180, height: 180 },
  qrInstructionText: { fontSize: 11, color: colors.textSecondary, textAlign: 'center', lineHeight: 16, paddingHorizontal: 10, marginBottom: 24 },
  closeQrBtn: { backgroundColor: colors.primary, width: '100%', height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  closeQrBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' }
});