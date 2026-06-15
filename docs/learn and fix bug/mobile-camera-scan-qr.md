# Perbaikan Mobile Camera Scan QR

Tanggal: 2026-06-15 15:52 WIB

## Masalah

Fitur `Scan QR` sebelumnya hanya menyediakan input manual QR token. Perangkat belum bisa melakukan scan QR/barcode melalui kamera karena dependency kamera belum tersedia dan screen belum memakai komponen kamera native.

## Penyebab

- Project Expo belum memiliki dependency `expo-camera`.
- `ScanQRScreen` masih memakai placeholder scanner.
- Hasil scan kamera belum dihubungkan ke flow transaksi `borrow` dan `return`.

## Solusi

Menggunakan `expo-camera` karena paling efektif untuk project Expo saat ini:

- Kompatibel dengan Expo.
- Menyediakan `CameraView`.
- Bisa membaca QR/barcode melalui `onBarcodeScanned`.
- Permission kamera ditangani melalui `useCameraPermissions`.
- Tetap menyediakan input manual sebagai fallback untuk web, emulator, atau kondisi kamera ditolak.

## File yang Diubah

```text
elibrary-mobile/package.json
elibrary-mobile/package-lock.json
elibrary-mobile/src/screens/student/ScanQRScreen.js
context/changelog.md
```

## Dependency Baru

```json
"expo-camera": "~17.0.10"
```

Dependency dipasang dengan:

```bash
npm install expo-camera@~17.0.10
```

## Cuplikan Kode Penting

Import kamera:

```javascript
import { CameraView, useCameraPermissions } from 'expo-camera';
```

Permission kamera:

```javascript
const [cameraPermission, requestCameraPermission] = useCameraPermissions();
const hasCameraPermission = cameraPermission?.granted;
```

Handler hasil scan:

```javascript
const handleBarcodeScanned = ({ data }) => {
  if (!data || isProcessing || successMessage) return;
  processQrValue(data);
};
```

Komponen kamera:

```javascript
<CameraView
  style={styles.camera}
  facing="back"
  barcodeScannerSettings={{
    barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39'],
  }}
  onBarcodeScanned={isProcessing || successMessage ? undefined : handleBarcodeScanned}
/>
```

Alur ini memakai `processQrValue(data)` dari `useQRScanner`, sehingga hasil scan kamera dan input manual tetap melewati logic transaksi yang sama.

## Flow Setelah Perbaikan

### Pinjam Buku

1. User login sebagai mahasiswa.
2. User membuka tab `Scan QR`.
3. User memilih mode `Pinjam`.
4. User memberi izin kamera.
5. User mengarahkan kamera ke QR/barcode buku.
6. Aplikasi membaca nilai QR/barcode.
7. Aplikasi mengirim request ke:

```text
POST /api/transactions/borrow
```

8. Jika sukses, aplikasi menampilkan status transaksi dan opsi `Scan Lagi` atau `Ke Home`.

### Kembalikan Buku

1. User membuka tab `Scan QR`.
2. User memilih mode `Kembalikan`.
3. User scan QR/barcode buku yang sedang dipinjam.
4. Aplikasi mengirim request ke:

```text
POST /api/transactions/return
```

5. Jika sukses, aplikasi menampilkan status transaksi dan denda jika ada.

## Cara Pengujian

### Pengujian Kamera di Perangkat

1. Pastikan backend berjalan.
2. Pastikan `.env` mobile mengarah ke IP laptop yang bisa diakses perangkat.
3. Jalankan Expo:

```bash
npm start
```

4. Buka aplikasi di perangkat.
5. Login sebagai mahasiswa.
6. Buka tab `Scan QR`.
7. Pilih mode `Pinjam`.
8. Izinkan kamera.
9. Scan QR/barcode buku.

Expected result:

- Kamera tampil.
- QR/barcode terbaca.
- Loading transaksi muncul.
- Pesan sukses/error tampil sesuai response backend.

### Pengujian Fallback Manual

1. Buka tab `Scan QR`.
2. Pilih mode `Pinjam` atau `Kembalikan`.
3. Isi input manual dengan QR token buku.
4. Tekan tombol proses.

Expected result:

- Endpoint transaksi tetap dipanggil.
- Flow tetap berjalan walaupun kamera tidak digunakan.

## Catatan Teknis

- Scan dikunci saat `isProcessing` agar hasil scan yang sama tidak membuat request dobel.
- Setelah transaksi sukses, scanner dihentikan sementara karena `onBarcodeScanned` dibuat `undefined` sampai user menekan `Scan Lagi`.
- Barcode yang didukung saat ini:
  - `qr`
  - `ean13`
  - `ean8`
  - `code128`
  - `code39`

## Catatan Audit NPM

Setelah instalasi, npm menampilkan `11 moderate severity vulnerabilities`. Perbaikan otomatis dengan `npm audit fix --force` tidak dijalankan karena dapat membawa breaking changes. Audit dependency sebaiknya dilakukan pada task terpisah.
