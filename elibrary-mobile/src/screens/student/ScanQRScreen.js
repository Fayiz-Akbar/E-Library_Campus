// src/screens/student/ScanQRScreen.js
import React, { useState, useEffect } from 'react'; // 🚀 DISUNTIK: useState & useEffect untuk antrean state
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors } from '../../constants/colors';
import { TRANSACTION_MODES } from '../../api/transactionApi';
import { useQRScanner } from '../../hooks/useQRScanner';
import { getHorizontalPadding, getResponsiveContentStyle } from '../../utils/responsive';

const MODE_OPTIONS = [
  {
    value: TRANSACTION_MODES.BORROW,
    label: 'Pinjam',
    icon: 'download-outline',
  },
  {
    value: TRANSACTION_MODES.RETURN,
    label: 'Kembalikan',
    icon: 'return-up-back-outline',
  },
];

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return `Rp${amount.toLocaleString('id-ID')}`;
};

const getBookTitle = (result) => result?.book?.title || result?.transaction?.book_title || '-';

export default function ScanQRScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const contentStyle = getResponsiveContentStyle(width, 760);
  const horizontalPadding = getHorizontalPadding(width);
  
  // 🚀 STATE BARU: Menampung antrean token agar tidak balapan dengan perpindahan tab
  const [pendingScan, setPendingScan] = useState(null);

  const {
    mode,
    isProcessing,
    errorMessage,
    successMessage,
    lastResult,
    handleModeChange,
    processQrValue,
    resetScannerState,
  } = useQRScanner();

  const isBorrowMode = mode === TRANSACTION_MODES.BORROW;
  const fineAmount = lastResult?.fine?.amount || lastResult?.fine?.fineAmount || lastResult?.transaction?.fine_amount || 0;
  const hasCameraPermission = cameraPermission?.granted;
  const isCameraPermissionDenied = cameraPermission && !cameraPermission.granted && cameraPermission.canAskAgain === false;

  // 🚀 EFFECT SAFETY LOCK: Tembak API hanya jika mode transaksi di HP sudah benar-benar sinkron
  useEffect(() => {
    if (pendingScan) {
      processQrValue(pendingScan);
      setPendingScan(null); // Kosongkan antrean setelah sukses diproses
    }
  }, [mode, pendingScan]);

  // 🚀 INTERSEPTOR KAMERA SCANNER
  const handleBarcodeScanned = ({ data }) => {
    if (!data || isProcessing || successMessage) return;
    
    try {
      const parsedPayload = JSON.parse(data);
      
      if (parsedPayload && parsedPayload.token) {
        const requiredMode = parsedPayload.action === 'pinjam' ? TRANSACTION_MODES.BORROW : TRANSACTION_MODES.RETURN;
        
        if (mode === requiredMode) {
          // A. Jika posisi tab sekarang sudah cocok dengan tipe QR, langsung eksekusi murni
          processQrValue(parsedPayload.token);
        } else {
          // B. Jika posisi tab berbeda, amankan token ke antrean lalu paksa tab berpindah dulu
          setPendingScan(parsedPayload.token);
          handleModeChange(requiredMode);
        }
        return;
      }
    } catch (error) {
      console.log("Membaca QR format lama / plain text token:", data);
    }

    // Fallback jika yang di-scan teks biasa non-JSON
    processQrValue(data);
  };

  const renderCameraArea = () => {
    if (!cameraPermission) {
      return (
        <View style={styles.scannerContent}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.scannerTitle}>Menyiapkan Kamera</Text>
          <Text style={styles.scannerText}>Aplikasi sedang membaca status izin kamera perangkat.</Text>
        </View>
      );
    }

    if (!hasCameraPermission) {
      return (
        <View style={styles.scannerContent}>
          <Ionicons name="camera-outline" size={52} color={colors.primary} />
          <Text style={styles.scannerTitle}>Izin Kamera Diperlukan</Text>
          <Text style={styles.scannerText}>
            Berikan izin kamera agar aplikasi dapat membaca QR buku secara langsung dari perangkat.
          </Text>
          <TouchableOpacity
            style={[styles.permissionButton, isCameraPermissionDenied && styles.permissionButtonDisabled]}
            onPress={requestCameraPermission}
            activeOpacity={0.85}
            disabled={isCameraPermissionDenied}
          >
            <Ionicons name="camera" size={17} color="#FFFFFF" />
            <Text style={styles.permissionButtonText}>
              {isCameraPermissionDenied ? 'Izin Ditolak' : 'Izinkan Kamera'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39'],
          }}
          onBarcodeScanned={isProcessing || successMessage ? undefined : handleBarcodeScanned}
        />
        <View style={styles.cameraOverlay}>
          <Text style={styles.cameraHint}>Arahkan kamera ke QR kustom buku dari Admin</Text>
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }]}
      >
        <View style={[styles.header, contentStyle]}>
          <View>
            <Text style={styles.eyebrow}>Transaksi Buku</Text>
            <Text style={styles.title}>Scan QR</Text>
            <Text style={styles.subtitle}>
              Langsung arahkan kamera ke QR kustom dari Admin. Sistem otomatis menyinkronkan data peminjaman & pengembalian buku.
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="scan" size={28} color="#FFFFFF" />
          </View>
        </View>

        <View style={[styles.section, contentStyle]}>
          <View style={styles.modeTabs}>
            {MODE_OPTIONS.map((option) => {
              const active = option.value === mode;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.modeButton, active && styles.modeButtonActive]}
                  onPress={() => handleModeChange(option.value)}
                  activeOpacity={0.8}
                  disabled={isProcessing}
                >
                  <Ionicons
                    name={option.icon}
                    size={18}
                    color={active ? colors.textOnPrimary : colors.primary}
                  />
                  <Text style={[styles.modeText, active && styles.modeTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.scannerFrame}>
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
            {renderCameraArea()}
          </View>
        </View>

        {errorMessage ? (
          <View style={[styles.feedbackBox, styles.errorBox, contentStyle]}>
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {successMessage ? (
          <View style={[styles.successCard, contentStyle]}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.successTitle}>{successMessage}</Text>
            <View style={styles.resultList}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Buku</Text>
                <Text style={styles.resultValue} numberOfLines={2}>{getBookTitle(lastResult)}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Status</Text>
                <Text style={styles.resultValue}>{lastResult?.transaction?.status || '-'}</Text>
              </View>
              {!isBorrowMode ? (
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Denda</Text>
                  <Text style={styles.resultValue}>{formatCurrency(fineAmount)}</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.successActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={resetScannerState} activeOpacity={0.85}>
                <Ionicons name="scan-outline" size={17} color={colors.primary} />
                <Text style={styles.secondaryButtonText}>Scan Lagi</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home')} activeOpacity={0.85}>
                <Ionicons name="home-outline" size={17} color="#FFFFFF" />
                <Text style={styles.homeButtonText}>Ke Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingTop: 56, paddingBottom: 32 },
  header: { backgroundColor: colors.primary, borderRadius: 18, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  eyebrow: { fontSize: 12, color: '#EDE9FE', fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  title: { fontSize: 26, lineHeight: 32, color: colors.textOnPrimary, fontWeight: '900' },
  subtitle: { marginTop: 8, fontSize: 13, lineHeight: 20, color: '#F5F3FF', fontWeight: '500', maxWidth: 520 },
  headerIcon: { width: 54, height: 54, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  section: { marginTop: 18, borderWidth: 1, borderColor: '#EDE9FE', borderRadius: 16, padding: 16, backgroundColor: '#FFFFFF' },
  modeTabs: { flexDirection: 'row', backgroundColor: '#F5F3FF', borderRadius: 12, padding: 4, gap: 4 },
  modeButton: { flex: 1, minHeight: 44, borderRadius: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  modeButtonActive: { backgroundColor: colors.primary },
  modeText: { color: colors.primary, fontWeight: '800', fontSize: 13 },
  modeTextActive: { color: colors.textOnPrimary },
  scannerFrame: { marginTop: 16, minHeight: 280, borderRadius: 16, backgroundColor: '#FAFAFF', borderWidth: 1, borderColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  scannerContent: { alignItems: 'center', paddingHorizontal: 24 },
  camera: { ...StyleSheet.absoluteFillObject },
  cameraOverlay: { position: 'absolute', left: 18, right: 18, bottom: 18, minHeight: 40, borderRadius: 10, backgroundColor: 'rgba(15,23,42,0.72)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  cameraHint: { color: '#FFFFFF', fontSize: 12, lineHeight: 17, fontWeight: '800', textAlign: 'center' },
  scannerTitle: { marginTop: 12, color: colors.textPrimary, fontSize: 18, lineHeight: 24, fontWeight: '900' },
  scannerText: { marginTop: 8, color: colors.textSecondary, fontSize: 13, lineHeight: 20, textAlign: 'center', maxWidth: 460 },
  permissionButton: { marginTop: 14, paddingHorizontal: 12, minHeight: 42, borderRadius: 10, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  permissionButtonDisabled: { backgroundColor: '#CBD5E1' },
  permissionButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  corner: { position: 'absolute', width: 36, height: 36, borderColor: colors.primary },
  cornerTopLeft: { top: 18, left: 18, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 10 },
  cornerTopRight: { top: 18, right: 18, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 10 },
  cornerBottomLeft: { bottom: 18, left: 18, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 10 },
  cornerBottomRight: { bottom: 18, right: 18, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 10 },
  feedbackBox: { marginTop: 14, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  errorBox: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  errorText: { color: '#991B1B', flex: 1, fontSize: 13, fontWeight: '700', lineHeight: 19 },
  successCard: { marginTop: 14, borderRadius: 16, borderWidth: 1, borderColor: '#BBF7D0', backgroundColor: '#F0FDF4', padding: 16 },
  successIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  successTitle: { color: '#14532D', fontSize: 16, lineHeight: 22, fontWeight: '900' },
  resultList: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#DCFCE7' },
  resultRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#DCFCE7', flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  resultLabel: { color: '#166534', fontSize: 12, fontWeight: '800' },
  resultValue: { color: colors.textPrimary, fontSize: 12, lineHeight: 18, fontWeight: '800', flex: 1, textAlign: 'right' },
  successActions: { marginTop: 14, flexDirection: 'row', gap: 10 },
  secondaryButton: { flex: 1, minHeight: 44, borderRadius: 10, borderWidth: 1, borderColor: colors.primary, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  secondaryButtonText: { color: colors.primary, fontSize: 13, fontWeight: '900' },
  homeButton: { flex: 1, minHeight: 44, borderRadius: 10, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  homeButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
});