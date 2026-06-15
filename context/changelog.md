# Changelog

## Format Entri

Mulai perubahan ini, setiap entri changelog baru wajib menggunakan format:

```text
## YYYY-MM-DD HH:mm WIB - Judul Perubahan
```

Catatan: entri lama yang sebelumnya tidak mencatat waktu diberi `00:00 WIB` sebagai placeholder historis.

## 2026-06-15 16:12 WIB - Person 3 History Notification

### Added

- Menambahkan endpoint backend `GET /api/transactions/notifications`.
- Menambahkan screen mobile `HistoryScreen` untuk riwayat peminjaman mahasiswa.
- Menambahkan screen mobile `NotificationScreen` untuk reminder jatuh tempo dan keterlambatan.
- Menambahkan hook mobile `useTransactions` untuk load riwayat, filter status, dan notifikasi.
- Menambahkan tab mahasiswa `Riwayat` dan route stack `Notification`.

### Changed

- Menambahkan dukungan query filter `?status=borrowed|returned|overdue` pada endpoint history.
- Memperluas `transactionApi` mobile dengan `fetchTransactionHistory` dan `fetchTransactionNotifications`.
- Menghubungkan tombol notifikasi di Home mahasiswa ke screen `Notification`.
- Memperbarui dokumentasi progress Person 3 agar mencerminkan fitur riwayat dan notifikasi yang sudah aktif.

### Notes

- Status `overdue` dihitung dinamis dari `due_date` jika transaksi aktif sudah melewati jatuh tempo.
- Notifikasi menampilkan transaksi aktif yang terlambat atau akan jatuh tempo dalam 2 hari.

## 2026-06-15 15:52 WIB - Mobile Camera Scan QR

### Added

- Menambahkan dependency `expo-camera` untuk akses kamera dan scan QR/barcode di aplikasi mobile.
- Mengaktifkan `CameraView` pada `ScanQRScreen`.
- Menambahkan permission flow kamera menggunakan `useCameraPermissions`.
- Menambahkan dokumentasi perbaikan di `docs/learn and fix bug/mobile-camera-scan-qr.md`.

### Changed

- Mengubah area scanner dari placeholder menjadi kamera perangkat.
- Menghubungkan hasil scan kamera ke `processQrValue`, sehingga scan kamera memakai flow transaksi yang sama dengan input manual.
- Mempertahankan input manual sebagai fallback untuk web, emulator, atau kondisi izin kamera ditolak.

### Notes

- Dependency berhasil dipasang dengan `npm install expo-camera@~17.0.10`.
- `npm install` menampilkan `11 moderate severity vulnerabilities`; audit/fix dependency belum dilakukan karena berisiko mengubah paket di luar scope fitur kamera.

## 2026-06-15 15:40 WIB - Person 3 Scan QR Mobile

### Added

- Menambahkan API client transaksi mobile di `elibrary-mobile/src/api/transactionApi.js`.
- Menambahkan hook `useQRScanner` untuk mengelola mode pinjam/kembali, input QR, loading, error, success, dan pencegahan double submit.
- Menambahkan screen mahasiswa `ScanQRScreen` dengan mode `Pinjam` dan `Kembalikan`.
- Menambahkan tab `Scan QR` pada navigasi mahasiswa.

### Changed

- Mengubah `borrowApi` agar memakai helper transaksi yang sama dengan fitur Scan QR.
- Memperbarui dokumentasi progress dan dokumentasi fitur Scan QR sesuai implementasi saat ini.

### Notes

- Scanner kamera native belum dipasang karena dependency kamera/scanner belum tersedia di project Expo.
- Branch ini menyediakan fallback input manual QR token yang terhubung langsung ke endpoint `/api/transactions/borrow` dan `/api/transactions/return`.

## 2026-06-15 15:26 WIB - Fix Web Refresh Session Logout

### Fixed

- Memperbaiki bug web refresh yang membuat user selalu diarahkan ke Onboarding/Login walaupun token masih tersimpan.
- Mengubah `SplashScreen` agar membaca `isLoadingSession`, `isLoggedIn`, dan `isAdmin` langsung dari `AuthContext`, bukan dari `route.params`.

### Documentation

- Menambahkan dokumentasi perbaikan di `docs/learn and fix bug/web-refresh-session-logout.md`.

## 2026-06-15 15:15 WIB - Dynamic Home User Name

### Changed

- Mengubah header Home mahasiswa agar menampilkan nama user login dari `AuthContext`, bukan teks hardcode `Fayiz Akbar`.
- Mengubah initial avatar Home agar mengikuti huruf pertama nama user yang sedang login.

## 2026-06-15 15:01 WIB - Changelog Timestamp Format

### Changed

- Memperbarui format heading changelog agar menampilkan tanggal, jam, dan menit.
- Menambahkan aturan format entri changelog untuk perubahan berikutnya.

## 2026-06-15 00:00 WIB - Person 3 Transaction Backend

### Added

- Menambahkan route backend transaksi di `elibrary-backend/src/routes/transactionRoutes.js`.
- Menambahkan controller transaksi di `elibrary-backend/src/controllers/transactionController.js`.
- Menambahkan model transaksi di `elibrary-backend/src/models/transactionModel.js`.
- Menambahkan util denda di `elibrary-backend/src/utils/calculateFine.js`.
- Menambahkan endpoint:
  - `POST /api/transactions/borrow`
  - `POST /api/transactions/return`
  - `GET /api/transactions/history/:user_id`
  - `GET /api/transactions/stats`
- Menambahkan helper `getClient()` pada koneksi database agar borrow/return bisa memakai SQL transaction.

### Changed

- Mendaftarkan base route `/api/transactions` di `elibrary-backend/server.js`.
- Menambahkan index database transaksi untuk query `user_id`, `book_id`, `status`, dan transaksi aktif user-buku.
- Merapikan urutan route buku agar `/api/books/stats` tidak tertangkap sebagai `/api/books/:id`.
- Mengubah `elibrary-mobile/src/api/borrowApi.js` agar tombol pinjam memakai endpoint baru `/transactions/borrow`.

### Database

- Tidak menambah tabel baru karena tabel `transactions` sudah tersedia.
- Menambahkan index:
  - `idx_transactions_user_id`
  - `idx_transactions_book_id`
  - `idx_transactions_status`
  - `idx_transactions_active_user_book`

### Notes

- Proses pinjam dan kembali dibuat atomic menggunakan `BEGIN`, `COMMIT`, `ROLLBACK`, dan row locking `FOR UPDATE`.
- Peminjaman mengurangi `books.available_stock`.
- Pengembalian menambah `books.available_stock` sampai batas maksimum `books.stock`.
- Denda awal menggunakan aturan Rp1.000 per hari keterlambatan.

## 2026-06-15 00:00 WIB - Responsive UI Flexibility

### Added

- Menambahkan helper responsif `elibrary-mobile/src/utils/responsive.js`.
- Menambahkan aturan responsif yang lebih eksplisit di `context/ui-design-guidelines.md`.

### Changed

- Katalog buku kini memakai `useWindowDimensions` untuk menyesuaikan jumlah kolom di mobile, tablet, dan web.
- Detail buku kini membatasi ukuran cover dan action button agar tidak membesar berlebihan di desktop.
- Home screen kini memakai constrained content width untuk search, summary card, section, dan list.
- Login dan Register kini memakai max width agar form tidak melebar penuh di web.
- Onboarding kini membaca ukuran viewport secara dinamis, bukan `Dimensions.get('window')` statis.
- Profile, Manage Users, dan Manage Books kini memakai constrained content width untuk tampilan web.

### Notes

- Perubahan dibuat agar UI tetap fleksibel di Android, iOS, tablet, dan web.
- Aturan implementasi baru: hindari `Dimensions.get('window')` di level module untuk layout responsif; gunakan `useWindowDimensions`.

## 2026-06-15 00:00 WIB - AI Context Documentation

### Added

- Menambahkan dokumentasi konteks AI lengkap untuk project E-Library Campus:
  - `architecture.md`
  - `business-rules.md`
  - `current-progress.md`
  - `database-schema.md`
  - `feature-scope.md`
  - `stakeholders-and-roles.md`
  - `system-flow.md`
  - `tech-stack.md`
  - `ui-design-guidelines.md`

### Notes

- Dokumentasi dibuat berdasarkan `elibrary-backend/PRD.md`, `elibrary-mobile/PRD.md`, dan pengecekan kode aktual.
- `current-progress.md` sengaja membedakan target PRD dengan fitur yang benar-benar terlihat aktif di repository.
- `ui-design-guidelines.md` mencakup konteks responsif untuk Android, iOS, tablet, dan web.

## 2026-06-15 00:00 WIB - iOS Expo API Timeout Fix

### Fixed

- Memperbaiki konfigurasi API mobile untuk Expo Go di iOS.
- Mengganti `EXPO_PUBLIC_API_URL` dari IP adapter virtual WSL/Hyper-V `172.25.32.1` ke IP Wi-Fi laptop `192.168.18.169`.
- Menambahkan dokumentasi penyebab dan langkah perbaikan timeout API iOS di `ai-context/mobile-ios-api-timeout-fix.md`.

### Notes

- Backend sudah merespons normal di `http://localhost:3000/`.
- Error iOS terjadi karena perangkat fisik tidak bisa mengakses IP adapter virtual laptop.
- Expo perlu direstart setelah perubahan `.env`; gunakan `npx expo start -c` jika masih membaca konfigurasi lama.
