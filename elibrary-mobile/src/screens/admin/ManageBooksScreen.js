// src/screens/admin/ManageBooksScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, ActivityIndicator, Modal, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; 
import { colors } from '../../constants/colors';
import { fetchAllBooks } from '../../api/bookApi';
import { adminCreateBook, adminUpdateBook, adminDeleteBook } from '../../api/bookApi';
import { getResponsiveContentStyle } from '../../utils/responsive';
import axiosInstance from '../../api/axiosInstance'; 

const PLACEHOLDER_COVER = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80';

export default function ManageBooksScreen() {
  const { width } = useWindowDimensions();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]); 
  const [searchQuery, setSearchQuery] = useState('');
  
  // State Form Modal CRUD Buku
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null); 
  const [imageSourceType, setImageSourceType] = useState('url'); 
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // State Modal QR Code & Konfigurasi Dinamis (Aksi + Batas Waktu)
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [activeQrData, setActiveQrData] = useState({ id: '', title: '', token: '' });
  const [qrActionType, setQrActionType] = useState('pinjam'); // Pilihan: 'pinjam' atau 'kembali'
  const [qrDurationDays, setQrDurationDays] = useState('7'); // Default masa tenggat 7 hari

  // State: Khusus Tambah Kategori Cepat (Inline Category Creator)
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categorySubmitLoading, setCategorySubmitLoading] = useState(false);

  const [form, setForm] = useState({
    category_id: null, title: '', author: '', publisher: '', isbn: '', stock: '', summary: '', cover_image: '', qr_code: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const contentStyle = getResponsiveContentStyle(width, 1080);

  // Helper untuk memunculkan Alert yang aman di Web maupun Mobile
  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const loadAdminCatalog = async () => {
    try {
      setLoading(true);
      const res = await fetchAllBooks('', ''); 
      if (res.success) setBooks(res.data);
    } catch (err) {
      showAlert('Error ❌', 'Gagal menyinkronkan data katalog perpustakaan.');
    } finally {
      setLoading(false);
    }
  };

  const loadCategoriesFromBackend = async () => {
    try {
      const res = await axiosInstance.get('/categories');
      if (res.data && res.data.success && res.data.data) {
        setCategories(res.data.data);
      } else if (res.data && Array.isArray(res.data)) {
        setCategories(res.data);
      } else if (res.data && Array.isArray(res.data.data)) {
        setCategories(res.data.data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.log("Gagal memuat kategori via axiosInstance. Kategori diatur kosong.");
      setCategories([]); 
    }
  };

  useEffect(() => {
    loadAdminCatalog();
    loadCategoriesFromBackend();
  }, []);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      showAlert('Peringatan ⚠️', 'Nama kategori baru tidak boleh kosong, Bree!');
      return;
    }

    try {
      setCategorySubmitLoading(true);
      const res = await axiosInstance.post('/categories', { name: newCategoryName.trim() });
      
      if (res.data && res.data.success) {
        showAlert('Sukses ', `Kategori "${newCategoryName}" berhasil ditambahkan.`);
        await loadCategoriesFromBackend();
        
        const createdCategory = res.data.data;
        if (createdCategory && createdCategory.id) {
          setForm((prevForm) => ({ ...prevForm, category_id: createdCategory.id }));
        }

        setNewCategoryName('');
        setCategoryModalVisible(false);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Gagal menyimpan kategori baru.';
      showAlert('Gagal Simpan ❌', errMsg);
    } finally {
      setCategorySubmitLoading(false);
    }
  };

  const pickImageFromDevice = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      showAlert('Izin Ditolak ⚠️', 'Aplikasi butuh akses galeri untuk mengunggah gambar sampul, Bree!');
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

  const openQrModal = (book) => {
    // Menggunakan token asli database, fallback pakai string identitas ID jika buku sangat lama kosong
    const bookToken = book.qr_code || `BOOK-${book.id}`;
    setActiveQrData({ id: book.id, title: book.title, token: bookToken });
    setQrActionType('pinjam'); 
    setQrDurationDays('7');     
    setQrModalVisible(true);
  };

  const openAddModal = () => {
    setSelectedBookId(null);
    setImageSourceType('url');
    setDropdownOpen(false);
    
    // 🚀 REVISI SOLUSI 1: Suntik otomatis token qr_code unik saat buat buku baru
    setForm({ 
      category_id: null, 
      title: '', 
      author: '', 
      publisher: '', 
      isbn: '', 
      stock: '', 
      summary: '', 
      cover_image: '',
      qr_code: `LIB-${Math.random().toString(36).substring(2, 9).toUpperCase()}` // Otomatis terisi di database
    });
    
    setModalVisible(true);
  };

  const openEditModal = (book) => {
    setSelectedBookId(book.id);
    const isUrl = book.cover_image && (book.cover_image.startsWith('http') || book.cover_image.startsWith('data:'));
    setImageSourceType(isUrl ? 'url' : 'upload');
    setDropdownOpen(false);

    // 🚀 REVISI SOLUSI 1: Kunci agar qr_code yang sudah ada di database ikut ter-update
    setForm({
      category_id: book.category_id || null,
      title: book.title,
      author: book.author,
      publisher: book.publisher || '',
      isbn: book.isbn || '',
      stock: book.stock ? book.stock.toString() : '1',
      summary: book.summary || '',
      cover_image: book.cover_image || '',
      qr_code: book.qr_code || `LIB-${Math.random().toString(36).substring(2, 9).toUpperCase()}` // Jaga-jaga jika buku lama kosong
    });
    setModalVisible(true);
  };

  const handleSaveBook = async () => {
    if (!form.title || !form.author || !form.stock) {
      showAlert('Peringatan ⚠️', 'Judul, Penulis, dan Jumlah Stok wajib diisi, Bree!');
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
        showAlert('Sukses ', res.message);
        setModalVisible(false);
        loadAdminCatalog(); 
      }
    } catch (err) {
      showAlert('Gagal ❌', err.message || 'Terjadi kesalahan sistem internal.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteConfirm = (book) => {
    const executeDelete = async () => {
      try {
        const res = await adminDeleteBook(book.id);
        if (res.success) {
          showAlert('Terhapus ', res.message || 'Buku berhasil dimusnahkan.');
          loadAdminCatalog(); 
        } else {
          showAlert('Gagal ', res.message || 'Gagal menghapus buku.');
        }
      } catch (err) {
        const serverMessage = err.response?.data?.message || 'Gagal menghapus buku dari server. Periksa hak akses Admin Anda.';
        showAlert('Error Hapus ', serverMessage);
      }
    };

    if (Platform.OS === 'web') {
      const confirmWeb = window.confirm(`Apakah kamu yakin ingin menghapus buku "${book.title}" secara permanen dari sistem database, Bree?`);
      if (confirmWeb) {
        executeDelete();
      }
    } else {
      Alert.alert(
        'Konfirmasi Pemusnahan',
        `Apakah kamu yakin ingin menghapus buku "${book.title}" secara permanen dari sistem database?`,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Ya, Hapus',
            style: 'destructive',
            onPress: executeDelete,
          }
        ]
      );
    }
  };

  const selectedCategoryName = categories.find(c => c.id === form.category_id)?.name || 'Pilih Kategori Klasifikasi...';

  const filteredBooks = searchQuery.trim()
    ? books.filter(b =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : books;

  const totalBooks = books.length;
  const totalStock = books.reduce((sum, b) => sum + (b.stock || 0), 0);
  const totalAvailable = books.reduce((sum, b) => sum + (b.available_stock || 0), 0);

  // Payload Bundling JSON data QR
  const qrStringPayload = JSON.stringify({
    book_id: activeQrData.id,
    token: activeQrData.token,
    action: qrActionType,
    duration: qrActionType === 'pinjam' ? parseInt(qrDurationDays) || 7 : 0,
    generated_at: new Date().toISOString()
  });

  const renderAdminBookRow = ({ item, index }) => (
    <View style={styles.bookRowCard}>
      <View style={styles.cardAccentStrip} />
      <View style={styles.bookIndexBadge}>
        <Text style={styles.bookIndexText}>{index + 1}</Text>
      </View>
      <View style={styles.coverShadowWrap}>
        <Image source={{ uri: item.cover_image || PLACEHOLDER_COVER }} style={styles.rowCover} resizeMode="cover" />
      </View>
      <View style={styles.rowDetails}>
        <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.authorRow}>
          <Ionicons name="person-outline" size={11} color={colors.secondary} />
          <Text style={styles.rowAuthor} numberOfLines={1}>{item.author}</Text>
        </View>
        {item.publisher ? (
          <View style={styles.publisherRow}>
            <Ionicons name="business-outline" size={10} color={colors.textSecondary} />
            <Text style={styles.rowPublisher} numberOfLines={1}>{item.publisher}</Text>
          </View>
        ) : null}
        <View style={styles.rowStockArea}>
          <View style={styles.stockPill}>
            <Ionicons name="layers-outline" size={10} color={colors.primaryDark} />
            <Text style={styles.stockPillText}>{item.stock || 0} total</Text>
          </View>
          <View style={[styles.stockPill, item.available_stock > 0 ? styles.stockPillAvailable : styles.stockPillEmpty]}>
            <View style={[styles.stockDot, item.available_stock > 0 ? styles.dotGreen : styles.dotRed]} />
            <Text style={[styles.stockPillText, item.available_stock > 0 ? styles.stockTextGreen : styles.stockTextRed]}>
              {item.available_stock > 0 ? `${item.available_stock} tersedia` : 'Habis'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.rowActions}>
        <TouchableOpacity style={styles.qrActionBtn} onPress={() => openQrModal(item)} activeOpacity={0.7}>
          <View style={styles.actionBtnInner}><Ionicons name="qr-code-outline" size={16} color={colors.primary} /></View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editActionBtn} onPress={() => openEditModal(item)} activeOpacity={0.7}>
          <View style={styles.actionBtnInner}><Ionicons name="create-outline" size={16} color="#F59E0B" /></View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteActionBtn} onPress={() => handleDeleteConfirm(item)} activeOpacity={0.7}>
          <View style={styles.actionBtnInner}><Ionicons name="trash-outline" size={16} color={colors.danger} /></View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ===== HEADER ===== */}
      <View style={styles.adminHeader}>
        <View style={styles.headerCircle1} /><View style={styles.headerCircle2} /><View style={styles.headerCircle3} />
        <View style={[styles.headerTopRow, contentStyle]}>
          <View style={styles.headerIconBadge}><Ionicons name="library" size={20} color="#FFFFFF" /></View>
          <View style={styles.headerTextArea}>
            <Text style={styles.adminTitle}>Manajemen Buku</Text>
            <Text style={styles.adminSubtitle}>Kendalikan inventaris perpustakaan digital</Text>
          </View>
        </View>
        <View style={[styles.headerSearchBar, contentStyle]}>
          <Ionicons name="search" size={16} color={colors.textSecondary} style={{ marginRight: 10 }} />
          <TextInput style={styles.headerSearchInput} placeholder="Cari judul atau penulis buku..." placeholderTextColor="#94A3B8" value={searchQuery} onChangeText={setSearchQuery} returnKeyType="search" />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}><Ionicons name="close-circle" size={18} color="#94A3B8" /></TouchableOpacity>
          )}
        </View>
      </View>

      {/* ===== STATS CARDS ===== */}
      <View style={[styles.statsRow, contentStyle]}>
        <View style={styles.statCard}>
          <View style={[styles.statIconWrap, { backgroundColor: '#F3EEFF' }]}><Ionicons name="book" size={18} color={colors.primary} /></View>
          <Text style={styles.statNumber}>{totalBooks}</Text>
          <Text style={styles.statLabel}>Judul</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconWrap, { backgroundColor: '#E6F4EA' }]}><Ionicons name="layers" size={18} color={colors.success} /></View>
          <Text style={styles.statNumber}>{totalStock}</Text>
          <Text style={styles.statLabel}>Total Stok</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconWrap, { backgroundColor: '#FFF7E6' }]}><Ionicons name="checkmark-circle" size={18} color="#F59E0B" /></View>
          <Text style={styles.statNumber}>{totalAvailable}</Text>
          <Text style={styles.statLabel}>Tersedia</Text>
        </View>
      </View>

      <View style={[styles.sectionHeaderRow, contentStyle]}>
        <Text style={styles.sectionTitle}>{searchQuery.trim() ? `Hasil: ${filteredBooks.length} buku` : 'Daftar Inventaris Buku'}</Text>
        <View style={styles.countBadge}><Text style={styles.countBadgeText}>{filteredBooks.length}</Text></View>
      </View>

      {/* ===== BOOK LIST ===== */}
      {loading ? (
        <View style={styles.centerLoading}>
          <View style={styles.loadingSpinnerWrap}><ActivityIndicator size="large" color={colors.primary} /></View>
          <Text style={styles.loadingText}>Menyelaraskan rak buku admin...</Text>
        </View>
      ) : (
        <FlatList data={filteredBooks} renderItem={renderAdminBookRow} keyExtractor={(item) => 'admin-book-' + item.id.toString()} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.listContainerPadding, contentStyle]} onRefresh={loadAdminCatalog} refreshing={loading} ListEmptyComponent={loadAdminCatalog} />
      )}

      <TouchableOpacity style={styles.floatingAddBtn} activeOpacity={0.85} onPress={openAddModal}>
        <View style={styles.fabInner}><Ionicons name="add" size={26} color="#FFFFFF" /></View>
        <Text style={styles.fabLabel}>Tambah</Text>
      </TouchableOpacity>

      {/* ===== MODAL FORM INPUT BUKU ===== */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBlurOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalFormWrapper}>
            <View style={styles.modalDragHandle} />
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalTitleRow}>
                <View style={styles.modalIconBadge}><Ionicons name={selectedBookId ? "create" : "add-circle"} size={18} color="#FFFFFF" /></View>
                <View>
                  <Text style={styles.modalFormTitle}>{selectedBookId ? 'Edit Spesifikasi Buku' : 'Tambah Buku Baru'}</Text>
                  <Text style={styles.modalFormSubtitle}>{selectedBookId ? 'Perbarui informasi buku' : 'Daftarkan buku baru'}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}><Ionicons name="close" size={18} color={colors.textSecondary} /></TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScrollPadding}>
              <View style={styles.formSectionDivider}>
                <Ionicons name="folder-open-outline" size={14} color={colors.primary} />
                <Text style={styles.formSectionText}>Informasi Klasifikasi</Text>
              </View>

              <View style={styles.labelCategoryRow}>
                <Text style={styles.inputLabel}>Kategori Klasifikasi Buku</Text>
                <TouchableOpacity style={styles.inlineAddCategoryBtn} activeOpacity={0.7} onPress={() => setCategoryModalVisible(true)}>
                  <Ionicons name="add-circle-outline" size={13} color={colors.primary} />
                  <Text style={styles.inlineAddCategoryText}>+ Kategori Baru</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.dropdownTriggerBox} activeOpacity={0.8} onPress={() => setDropdownOpen(!dropdownOpen)}>
                <View style={styles.dropdownLeftIcon}><Ionicons name="pricetag-outline" size={14} color={form.category_id ? colors.primary : '#94A3B8'} /></View>
                <Text style={[styles.dropdownTriggerText, form.category_id && { color: colors.textPrimary }]}>{selectedCategoryName}</Text>
                <View style={styles.dropdownChevronWrap}><Ionicons name={dropdownOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.textSecondary} /></View>
              </TouchableOpacity>

              {dropdownOpen && (
                <View style={styles.dropdownExpandContainer}>
                  {categories.length === 0 ? (
                    <View style={styles.dropdownItemRow}><Text style={[styles.dropdownItemText, { color: colors.textSecondary }]}>Tidak ada kategori di database</Text></View>
                  ) : (
                    categories.map((cat) => (
                      <TouchableOpacity
                        key={'drop-cat-' + cat.id}
                        style={[styles.dropdownItemRow, form.category_id === cat.id && styles.dropdownItemActive]}
                        onPress={() => { setForm({ ...form, category_id: cat.id }); setDropdownOpen(false); }}
                      >
                        <View style={styles.dropdownItemLeft}>
                          <View style={[styles.catDot, form.category_id === cat.id && styles.catDotActive]} />
                          <Text style={[styles.dropdownItemText, form.category_id === cat.id && { color: colors.primary, fontWeight: '700' }]}>{cat.name}</Text>
                        </View>
                        {form.category_id === cat.id && <Ionicons name="checkmark-circle" size={16} color={colors.primary} />}
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}

              <View style={styles.formSectionDivider}>
                <Ionicons name="document-text-outline" size={14} color={colors.primary} />
                <Text style={styles.formSectionText}>Detail Buku</Text>
              </View>

              <Text style={styles.inputLabel}>Judul Buku *</Text>
              <View style={styles.inputWithIcon}>
                <Ionicons name="book-outline" size={16} color={colors.secondary} style={styles.inputIcon} />
                <TextInput style={styles.formInputBoxIcon} placeholder="Masukkan judul lengkap buku..." placeholderTextColor="#94A3B8" value={form.title} onChangeText={(text) => setForm({...form, title: text})} />
              </View>

              <Text style={styles.inputLabel}>Penulis / Pengarang *</Text>
              <View style={styles.inputWithIcon}>
                <Ionicons name="person-outline" size={16} color={colors.secondary} style={styles.inputIcon} />
                <TextInput style={styles.formInputBoxIcon} placeholder="Nama penulis..." placeholderTextColor="#94A3B8" value={form.author} onChangeText={(text) => setForm({...form, author: text})} />
              </View>

              <Text style={styles.inputLabel}>Penerbit Buku</Text>
              <View style={styles.inputWithIcon}>
                <Ionicons name="business-outline" size={16} color={colors.secondary} style={styles.inputIcon} />
                <TextInput style={styles.formInputBoxIcon} placeholder="Gedung/PT Penerbit..." placeholderTextColor="#94A3B8" value={form.publisher} onChangeText={(text) => setForm({...form, publisher: text})} />
              </View>

              <View style={styles.twoColRow}>
                <View style={styles.halfCol}>
                  <Text style={styles.inputLabel}>Stok *</Text>
                  <View style={styles.inputWithIcon}>
                    <Ionicons name="cube-outline" size={16} color={colors.secondary} style={styles.inputIcon} />
                    <TextInput style={styles.formInputBoxIcon} placeholder="10" placeholderTextColor="#94A3B8" keyboardType="numeric" value={form.stock} onChangeText={(text) => setForm({...form, stock: text})} />
                  </View>
                </View>
                <View style={styles.halfCol}>
                  <Text style={styles.inputLabel}>ISBN</Text>
                  <View style={styles.inputWithIcon}>
                    <Ionicons name="barcode-outline" size={16} color={colors.secondary} style={styles.inputIcon} />
                    <TextInput style={styles.formInputBoxIcon} placeholder="978-xxx" placeholderTextColor="#94A3B8" value={form.isbn} onChangeText={(text) => setForm({...form, isbn: text})} />
                  </View>
                </View>
              </View>

              <View style={styles.formSectionDivider}>
                <Ionicons name="image-outline" size={14} color={colors.primary} />
                <Text style={styles.formSectionText}>Gambar Sampul</Text>
              </View>

              <View style={styles.imageTabsSelectorRow}>
                <TouchableOpacity style={[styles.selectorTab, imageSourceType === 'url' ? styles.activeTabBg : styles.inactiveTabBg]} onPress={() => { setImageSourceType('url'); setForm({ ...form, cover_image: '' }); }} activeOpacity={0.8}>
                  <Ionicons name="link-outline" size={14} color={imageSourceType === 'url' ? '#FFFFFF' : colors.textSecondary} style={{ marginRight: 6 }} />
                  <Text style={[styles.tabBtnText, imageSourceType === 'url' ? styles.whiteText : styles.darkText]}>URL Link</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.selectorTab, imageSourceType === 'upload' ? styles.activeTabBg : styles.inactiveTabBg]} onPress={() => { setImageSourceType('upload'); setForm({ ...form, cover_image: '' }); }} activeOpacity={0.8}>
                  <Ionicons name="cloud-upload-outline" size={14} color={imageSourceType === 'upload' ? '#FFFFFF' : colors.textSecondary} style={{ marginRight: 6 }} />
                  <Text style={[styles.tabBtnText, imageSourceType === 'upload' ? styles.whiteText : styles.darkText]}>Upload Galeri</Text>
                </TouchableOpacity>
              </View>

              {imageSourceType === 'url' ? (
                <View style={styles.inputWithIcon}>
                  <Ionicons name="globe-outline" size={16} color={colors.secondary} style={styles.inputIcon} />
                  <TextInput style={styles.formInputBoxIcon} placeholder="https://example.com/cover.jpg" placeholderTextColor="#94A3B8" value={form.cover_image} onChangeText={(text) => setForm({...form, cover_image: text})} />
                </View>
              ) : (
                <TouchableOpacity style={styles.dashedUploadContainer} activeOpacity={0.7} onPress={pickImageFromDevice}>
                  {form.cover_image ? (
                    <View style={styles.uploadedPreviewBox}>
                      <Image source={{ uri: form.cover_image }} style={styles.miniPreviewImage} resizeMode="cover" />
                      <View style={styles.uploadChangeOverlay}><Ionicons name="camera-outline" size={14} color="#FFFFFF" /><Text style={styles.uploadOverlayText}>Ganti</Text></View>
                    </View>
                  ) : (
                    <View style={styles.uploadCenterPlaceholder}>
                      <View style={styles.uploadIconCircle}><Ionicons name="cloud-upload" size={24} color={colors.primary} /></View>
                      <Text style={styles.uploadBoxMainText}>Pilih File dari Galeri</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}

              <View style={styles.formSectionDivider}>
                <Ionicons name="reader-outline" size={14} color={colors.primary} />
                <Text style={styles.formSectionText}>Sinopsis</Text>
              </View>
              <TextInput style={[styles.formInputBox, styles.textAreaInput]} placeholder="Tuliskan intisari pembahasan buku..." placeholderTextColor="#94A3B8" multiline={true} numberOfLines={4} value={form.summary} onChangeText={(text) => setForm({...form, summary: text})} />
            </ScrollView>

            <View style={styles.formBottomActions}>
              <TouchableOpacity style={styles.formCancelBtn} onPress={() => setModalVisible(false)} activeOpacity={0.7}><Text style={styles.cancelBtnText}>Batal</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.formSubmitBtn, submitLoading && styles.formSubmitBtnDisabled]} disabled={submitLoading} onPress={handleSaveBook} activeOpacity={0.8}>
                {submitLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : (
                  <>
                    <Ionicons name={selectedBookId ? "save-outline" : "rocket-outline"} size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.submitBtnText}>{selectedBookId ? 'Simpan Perubahan' : 'Terbitkan & Buat QR'}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ===== SUB-MODAL TAMBAH KATEGORI ===== */}
      <Modal animationType="fade" transparent={true} visible={categoryModalVisible} onRequestClose={() => setCategoryModalVisible(false)}>
        <View style={styles.subModalOverlay}>
          <View style={styles.categoryMiniBox}>
            <View style={styles.miniHeaderRow}>
              <View style={styles.miniTitleGroup}>
                <Ionicons name="pricetags" size={16} color={colors.primary} />
                <Text style={styles.miniTitleText}>Kategori Klasifikasi Baru</Text>
              </View>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}><Ionicons name="close" size={18} color={colors.textSecondary} /></TouchableOpacity>
            </View>
            <Text style={styles.miniInputDesc}>Masukkan nama rumpun ilmu atau klasifikasi rak buku baru:</Text>
            <TextInput style={styles.miniTextInputBox} placeholder="Contoh: Kecerdasan Buatan, Jaringan, Novel..." placeholderTextColor="#94A3B8" value={newCategoryName} onChangeText={setNewCategoryName} autoFocus={true} />
            <View style={styles.miniBoxActions}>
              <TouchableOpacity style={styles.miniCancelBtn} onPress={() => setCategoryModalVisible(false)}><Text style={styles.miniCancelText}>Batal</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.miniSubmitBtn, categorySubmitLoading && { backgroundColor: '#CBD5E1' }]} disabled={categorySubmitLoading} onPress={handleCreateCategory}>
                {categorySubmitLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.miniSubmitText}>Simpan</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ===== MODAL PREVIEW QR CODE TUNED (DURASI & AKSI DINAMIS) ===== */}
      <Modal animationType="fade" transparent={true} visible={qrModalVisible} onRequestClose={() => setQrModalVisible(false)}>
        <View style={styles.modalCenterOverlay}>
          <View style={styles.qrCardWrapper}>
            <View style={styles.qrHeaderDecor}>
              <View style={styles.qrDecorCircle1} /><View style={styles.qrDecorCircle2} />
              <View style={styles.qrHeaderIconWrap}><Ionicons name="qr-code" size={22} color="#FFFFFF" /></View>
              <Text style={styles.qrModalSubtitle}>TOKEN IDENTIFIKASI QR CODE</Text>
            </View>
            <Text style={styles.qrModalTitle} numberOfLines={2}>{activeQrData.title}</Text>
            
            {/* 🚀 TRANSAKSI TOGGLE CONFIGURATION PANEL */}
            <View style={styles.qrConfigContainer}>
              <Text style={styles.configLabel}>Tipe Transaksi:</Text>
              <View style={styles.actionToggleRow}>
                <TouchableOpacity 
                  style={[styles.toggleTab, qrActionType === 'pinjam' ? styles.toggleTabActivePinjam : styles.toggleTabInactive]} 
                  onPress={() => setQrActionType('pinjam')}
                >
                  <Ionicons name="log-out-outline" size={14} color={qrActionType === 'pinjam' ? '#FFFFFF' : '#64748B'} />
                  <Text style={[styles.toggleTabText, qrActionType === 'pinjam' && styles.toggleTextActive]}>Peminjaman</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toggleTab, qrActionType === 'kembali' ? styles.toggleTabActiveKembali : styles.toggleTabInactive]} 
                  onPress={() => setQrActionType('kembali')}
                >
                  <Ionicons name="log-in-outline" size={14} color={qrActionType === 'kembali' ? '#FFFFFF' : '#64748B'} />
                  <Text style={[styles.toggleTabText, qrActionType === 'kembali' && styles.toggleTextActive]}>Pengembalian</Text>
                </TouchableOpacity>
              </View>

              {/* DURATION SETTING INPUT */}
              {qrActionType === 'pinjam' && (
                <View style={styles.durationInputStyleRow}>
                  <Text style={styles.configLabel}>Durasi Peminjaman (Hari):</Text>
                  <View style={styles.durationInputWrapper}>
                    <TextInput 
                      style={styles.qrDurationInput}
                      keyboardType="numeric"
                      maxLength={2}
                      value={qrDurationDays}
                      onChangeText={setQrDurationDays}
                      placeholder="7"
                    />
                    <Text style={styles.durationUnitText}>Hari</Text>
                  </View>
                </View>
              )}
            </View>

            {/* BOX CONTAINER GENERATOR QR CODE */}
            <View style={styles.qrImageContainer}>
              <View style={styles.qrCornerTL} /><View style={styles.qrCornerTR} /><View style={styles.qrCornerBL} /><View style={styles.qrCornerBR} />
              {activeQrData.token ? (
                <Image source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrStringPayload)}` }} style={styles.bigQrCodeImage} resizeMode="contain" />
              ) : null}
            </View>
            <View style={styles.qrInstructionBox}>
              <Ionicons name="scan-outline" size={16} color={colors.primary} />
              <Text style={styles.qrInstructionText}>
                {qrActionType === 'pinjam' 
                  ? `Masa berlaku token peminjaman dikunci untuk ${qrDurationDays || 7} hari ke depan sejak discan.` 
                  : 'Arahkan kamera HP mahasiswa untuk memproses validasi pengembalian inventaris.'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeQrBtn} onPress={() => setQrModalVisible(false)} activeOpacity={0.8}>
              <Ionicons name="close-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.closeQrBtnText}>Tutup Layar QR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7FF' },
  adminHeader: { backgroundColor: colors.primary, paddingTop: 58, paddingHorizontal: 22, paddingBottom: 22, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, position: 'relative', overflow: 'hidden' },
  headerCircle1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.06)', top: -50, right: -40 },
  headerCircle2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.04)', bottom: -30, left: -20 },
  headerCircle3: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)', top: 20, right: 80 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  headerIconBadge: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  headerTextArea: { flex: 1 },
  adminTitle: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.3 },
  adminSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2, letterSpacing: 0.2 },
  headerSearchBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 14, height: 44, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
  headerSearchInput: { flex: 1, fontSize: 13, color: colors.textPrimary, fontWeight: '500', height: '100%' },
  statsRow: { flexDirection: 'row', marginHorizontal: 18, marginTop: -1, paddingTop: 16, gap: 10 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 10, alignItems: 'center', elevation: 3, shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, borderWidth: 1, borderColor: '#F0EEFF' },
  statIconWrap: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statNumber: { fontSize: 20, fontWeight: '900', color: colors.textPrimary },
  statLabel: { fontSize: 10, fontWeight: '600', color: colors.textSecondary, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 22, marginTop: 20, marginBottom: 6 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  countBadge: { backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  countBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  listContainerPadding: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 110 },
  bookRowCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, marginBottom: 12, alignItems: 'center', elevation: 3, shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8, borderWidth: 1, borderColor: '#F0EEFF', position: 'relative', overflow: 'hidden' },
  cardAccentStrip: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: colors.primary, borderTopLeftRadius: 18, borderBottomLeftRadius: 18 },
  bookIndexBadge: { position: 'absolute', top: 6, right: 8, backgroundColor: '#F5F3FF', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  bookIndexText: { fontSize: 9, fontWeight: '800', color: colors.secondary },
  coverShadowWrap: { borderRadius: 12, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 6, marginLeft: 6 },
  rowCover: { width: 52, height: 72, borderRadius: 12, backgroundColor: colors.surface },
  rowDetails: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  rowTitle: { fontSize: 14, fontWeight: '800', color: colors.textPrimary, letterSpacing: 0.1 },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 4 },
  rowAuthor: { fontSize: 11, color: colors.textSecondary, fontWeight: '500', flex: 1 },
  publisherRow: { flexDirection: 'row', alignItems: 'center', marginTop: 1, gap: 4 },
  rowPublisher: { fontSize: 10, color: '#94A3B8', fontWeight: '500', flex: 1 },
  rowStockArea: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6, flexWrap: 'wrap' },
  stockPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F3FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, gap: 4 },
  stockPillAvailable: { backgroundColor: '#E6F4EA' },
  stockPillEmpty: { backgroundColor: '#FEE2E2' },
  stockPillText: { fontSize: 10, fontWeight: '700', color: colors.primaryDark },
  stockTextGreen: { color: '#137333' },
  stockTextRed: { color: '#C5221F' },
  stockDot: { width: 5, height: 5, borderRadius: 3 },
  dotGreen: { backgroundColor: '#10B981' },
  dotRed: { backgroundColor: '#EF4444' },
  rowActions: { gap: 6, paddingLeft: 6, alignItems: 'center' },
  actionBtnInner: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  qrActionBtn: { backgroundColor: '#F0EFFF', borderRadius: 10 },
  editActionBtn: { backgroundColor: '#FFF7E6', borderRadius: 10 },
  deleteActionBtn: { backgroundColor: '#FEE2E2', borderRadius: 10 },
  floatingAddBtn: { position: 'absolute', bottom: Platform.OS === 'android' ? 48 : 28, right: 22, backgroundColor: colors.primary, borderRadius: 18, paddingHorizontal: 18, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', elevation: 8, shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10 },
  fabInner: { width: 28, height: 28, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  fabLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', letterSpacing: 0.3 },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80 },
  loadingSpinnerWrap: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#F5F3FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  loadingText: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  modalBlurOverlay: { flex: 1, backgroundColor: 'rgba(30, 27, 46, 0.6)', justifyContent: 'flex-end' },
  modalFormWrapper: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 40 : 30, maxHeight: '90%', width: '100%' },
  modalDragHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 14 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottomWidth: 1, borderColor: '#F0EEFF' },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  modalIconBadge: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  modalFormTitle: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  modalFormSubtitle: { fontSize: 10, color: colors.textSecondary, marginTop: 1 },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#F5F3FF', justifyContent: 'center', alignItems: 'center' },
  formScrollPadding: { paddingTop: 10, paddingBottom: 16 },
  formSectionDivider: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 14, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#F5F3FF' },
  formSectionText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  labelCategoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  inlineAddCategoryBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 2, paddingHorizontal: 6 },
  inlineAddCategoryText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  inputLabel: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  requiredStar: { color: colors.danger, fontWeight: '800' },
  formInputBox: { backgroundColor: '#FAFAFF', borderWidth: 1.5, borderColor: '#E8E5F5', borderRadius: 14, paddingHorizontal: 14, height: 46, fontSize: 13, color: colors.textPrimary, marginBottom: 14, fontWeight: '500' },
  inputWithIcon: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFF', borderWidth: 1.5, borderColor: '#E8E5F5', borderRadius: 14, height: 46, marginBottom: 14, paddingHorizontal: 12 },
  inputIcon: { marginRight: 10 },
  formInputBoxIcon: { flex: 1, fontSize: 13, color: colors.textPrimary, fontWeight: '500', height: '100%' },
  twoColRow: { flexDirection: 'row', gap: 12 },
  halfCol: { flex: 1 },
  textAreaInput: { height: 90, paddingTop: 14, textAlignVertical: 'top', borderRadius: 14 },
  formBottomActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  formCancelBtn: { flex: 0.35, backgroundColor: '#F5F3FF', borderRadius: 14, height: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#E8E5F5' },
  cancelBtnText: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
  formSubmitBtn: { flex: 0.65, backgroundColor: colors.primary, borderRadius: 14, height: 48, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6 },
  formSubmitBtnDisabled: { backgroundColor: '#CBD5E1', elevation: 0 },
  submitBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  imageTabsSelectorRow: { flexDirection: 'row', backgroundColor: '#F5F3FF', borderRadius: 14, padding: 4, marginBottom: 14, gap: 4 },
  selectorTab: { flex: 1, flexDirection: 'row', height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  activeTabBg: { backgroundColor: colors.primary, elevation: 2, shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  inactiveTabBg: { backgroundColor: 'transparent' },
  tabBtnText: { fontSize: 11, fontWeight: '700' },
  whiteText: { color: '#FFFFFF' },
  darkText: { color: '#64748B' },
  dashedUploadContainer: { width: '100%', height: 140, borderRadius: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: colors.primaryLight, backgroundColor: '#FAF9FE', justifyContent: 'center', alignItems: 'center', marginBottom: 14, overflow: 'hidden' },
  uploadedPreviewBox: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  miniPreviewImage: { width: 56, height: 76, borderRadius: 8 },
  uploadChangeOverlay: { position: 'absolute', bottom: 8, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(124,58,237,0.85)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  uploadOverlayText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  modalCenterOverlay: { flex: 1, backgroundColor: 'rgba(30, 27, 46, 0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 },
  qrCardWrapper: { backgroundColor: '#FFFFFF', width: '100%', borderRadius: 24, overflow: 'hidden', alignItems: 'center', elevation: 14, shadowColor: '#000000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 16 },
  qrHeaderDecor: { width: '100%', backgroundColor: colors.primary, paddingVertical: 20, alignItems: 'center', position: 'relative', overflow: 'hidden' },
  qrDecorCircle1: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.08)', top: -30, right: -20 },
  qrDecorCircle2: { position: 'absolute', width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -10 },
  qrHeaderIconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  qrModalTitle: { fontSize: 16, fontWeight: '900', color: colors.textPrimary, textAlign: 'center', width: '100%', paddingHorizontal: 24, marginTop: 18 },
  qrModalSubtitle: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.75)', letterSpacing: 1.5 },
  qrImageContainer: { width: 210, height: 210, backgroundColor: '#FAFAFF', borderRadius: 20, borderWidth: 2, borderColor: '#F0EEFF', justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 16, position: 'relative' },
  qrCornerTL: { position: 'absolute', top: -1, left: -1, width: 20, height: 20, borderTopWidth: 3, borderLeftWidth: 3, borderColor: colors.primary, borderTopLeftRadius: 10 },
  qrCornerTR: { position: 'absolute', top: -1, right: -1, width: 20, height: 20, borderTopWidth: 3, borderRightWidth: 3, borderColor: colors.primary, borderTopRightRadius: 10 },
  qrCornerBL: { position: 'absolute', bottom: -1, left: -1, width: 20, height: 20, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: colors.primary, borderBottomLeftRadius: 10 },
  qrCornerBR: { position: 'absolute', bottom: -1, right: -1, width: 20, height: 20, borderBottomWidth: 3, borderRightWidth: 3, borderColor: colors.primary, borderBottomRightRadius: 10 },
  bigQrCodeImage: { width: 175, height: 175 },
  qrInstructionBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F3FF', marginHorizontal: 24, borderRadius: 12, padding: 12, gap: 10, marginBottom: 20 },
  qrInstructionText: { fontSize: 11, color: colors.textSecondary, lineHeight: 16, flex: 1 },
  closeQrBtn: { backgroundColor: colors.primary, width: '85%', height: 48, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24, elevation: 3, shadowColor: colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6 },
  closeQrBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  dropdownTriggerBox: { flexDirection: 'row', backgroundColor: '#FAFAFF', borderWidth: 1.5, borderColor: '#E8E5F5', borderRadius: 14, paddingHorizontal: 12, height: 46, alignItems: 'center', marginBottom: 14 },
  dropdownLeftIcon: { marginRight: 10 },
  dropdownTriggerText: { fontSize: 13, color: '#94A3B8', fontWeight: '500', flex: 1 },
  dropdownChevronWrap: { width: 26, height: 26, borderRadius: 8, backgroundColor: '#F5F3FF', justifyContent: 'center', alignItems: 'center' },
  dropdownExpandContainer: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E8E5F5', borderRadius: 14, marginTop: -10, marginBottom: 14, overflow: 'hidden', elevation: 4, shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8 },
  dropdownItemRow: { flexDirection: 'row', height: 44, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#F5F3FF' },
  dropdownItemActive: { backgroundColor: '#F5F3FF' },
  dropdownItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  catDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#CBD5E1' },
  catDotActive: { backgroundColor: colors.primary },
  dropdownItemText: { fontSize: 13, color: '#334155', fontWeight: '500' },
  subModalOverlay: { flex: 1, backgroundColor: 'rgba(15, 12, 26, 0.45)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  categoryMiniBox: { backgroundColor: '#FFFFFF', width: '100%', borderRadius: 20, padding: 20, elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.15, shadowRadius: 10 },
  miniHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F5F3FF', marginBottom: 14 },
  miniTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  miniTitleText: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  miniInputDesc: { fontSize: 12, color: colors.textSecondary, lineHeight: 18, marginBottom: 10 },
  miniTextInputBox: { backgroundColor: '#FAFAFF', borderWidth: 1.5, borderColor: '#E8E5F5', borderRadius: 12, paddingHorizontal: 14, height: 44, fontSize: 13, color: colors.textPrimary, marginBottom: 18, fontWeight: '500' },
  miniBoxActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  miniCancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#F5F3FF' },
  miniCancelText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  miniSubmitBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', minWidth: 80 },
  miniSubmitText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },

  // STYLES: Pendukung Konfigurasi QR Code Kustom & Dinamis
  qrConfigContainer: { width: '85%', marginTop: 14, gap: 8 },
  configLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },
  actionToggleRow: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 10, padding: 4, gap: 4 },
  toggleTab: { flex: 1, flexDirection: 'row', height: 34, borderRadius: 8, justifyContent: 'center', alignItems: 'center', gap: 6 },
  toggleTabInactive: { backgroundColor: 'transparent' },
  toggleTabActivePinjam: { backgroundColor: colors.primary },
  toggleTabActiveKembali: { backgroundColor: '#10B981' },
  toggleTabText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  toggleTextActive: { color: '#FFFFFF' },
  durationInputStyleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, backgroundColor: '#F8FAFC', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  durationInputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qrDurationInput: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: colors.primaryLight, borderRadius: 6, width: 44, height: 30, textAlign: 'center', fontSize: 13, fontWeight: '700', color: colors.textPrimary, padding: 0 },
  durationUnitText: { fontSize: 12, fontWeight: '700', color: colors.textPrimary }
});