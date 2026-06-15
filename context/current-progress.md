# Current Progress

Tanggal konteks: 2026-06-15.

Dokumen ini membedakan target PRD dan kondisi implementasi aktual yang terlihat di repository.

## Status Umum

Project memiliki dua aplikasi utama:

- Backend Express di `elibrary-backend`.
- Mobile Expo React Native di `elibrary-mobile`.

Backend sudah dapat berjalan dan merespons:

```text
GET http://localhost:3000/
```

Mobile sudah memakai Axios dan `.env`:

```env
EXPO_PUBLIC_API_URL=http://192.168.18.169:3000/api
```

Catatan: IP ini adalah IP Wi-Fi laptop saat konteks dibuat. Jika jaringan berubah, IP bisa berubah.

## Selesai atau Terlihat Aktif

### Backend

- Server Express di `server.js`.
- CORS aktif.
- Body parser JSON/urlencoded aktif dengan limit `50mb`.
- Koneksi PostgreSQL/Supabase via `pg`.
- Auto-init tabel database via `initDatabase`.
- Auth register dan login.
- JWT middleware.
- Admin middleware.
- Get/update profile.
- Admin user list dengan search.
- Admin toggle status user.
- Admin update role user.
- User statistics.
- Category CRUD.
- Book list dengan search dan filter kategori.
- Book detail.
- Book CRUD admin.
- Book statistics.
- Generate token/QR data untuk buku.
- Transaction borrow API.
- Transaction return API.
- User transaction history API.
- User transaction history filter by status.
- User due date notification API.
- Admin all transactions API.
- Admin transaction override API.
- Admin transaction report API.
- Admin transaction CSV export API.
- Admin dashboard aggregator API.
- Transaction statistics API.
- Fine calculation utility.
- Atomic stock update for borrow/return.
- Seed admin melalui `seed-admin.js`.

### Mobile

- AuthProvider dan AuthContext.
- Splash screen.
- Onboarding screen.
- Login screen.
- Register screen.
- Student tabs: Home, Katalog, Scan QR, Riwayat, Profil.
- Admin tabs: Dashboard, Kelola Buku, Kelola Anggota, Transaksi, Laporan, Profil Admin.
- Book detail screen.
- API layer untuk auth, user, book, category, borrow.
- API layer transaksi untuk borrow/return berbasis QR.
- Hooks untuk auth, catalog, home, borrow.
- Hook `useQRScanner` untuk mengelola flow Scan QR.
- Borrow API sudah mengarah ke `/api/transactions/borrow`.
- Student tab `Scan QR` aktif dengan kamera perangkat melalui `expo-camera`.
- Student tab `Riwayat` aktif dengan filter Semua, Dipinjam, Dikembalikan, dan Terlambat.
- Screen `Notification` aktif untuk reminder jatuh tempo dan keterlambatan.
- Admin tab `Transaksi` aktif untuk list, filter, search, detail, dan override status transaksi.
- Admin tab `Laporan` aktif untuk preview laporan periode dan export CSV.
- Admin tab `Dashboard` aktif untuk statistik gabungan user, buku, dan transaksi.
- Fallback input manual QR/barcode tetap tersedia.
- Token disimpan melalui AsyncStorage.
- Role-based navigation di `App.js`.

## Belum Terlihat Aktif di Kode

Walaupun PRD mencantumkan fitur berikut sebagai target, kode aktual belum menunjukkan implementasi lengkap:

- Cron job atau FCM notification.

Backend transaksi dasar sudah aktif untuk borrow, return, history, notifications, admin transactions, override, report, export CSV, dashboard aggregator, dan stats. UI Scan QR, Riwayat, Notifikasi mahasiswa, Admin Transaksi, Laporan, dan Dashboard Admin sudah aktif.

## Catatan Bug/Perbaikan Terkini

### Timeout iOS Expo

Masalah:

- iOS tidak bisa login karena memakai URL API `172.25.32.1`.
- IP tersebut adalah adapter virtual WSL/Hyper-V, bukan IP Wi-Fi.

Perbaikan:

- `elibrary-mobile/.env` diganti menjadi `http://192.168.18.169:3000/api`.
- Dokumentasi ada di `ai-context/mobile-ios-api-timeout-fix.md`.

## Risiko Teknis

- `bookController.create` mengirim `qr_code` ke `bookModel.updateBook`, tetapi model `updateBook` saat ini tidak memasukkan `qr_code` dalam query update. Periksa lagi saat memperbaiki fitur QR buku.
- Route kategori `POST`, `PUT`, dan `DELETE` belum diproteksi admin.
- Nama file `src/app,.js` tidak lazim dan perlu diverifikasi apakah masih dibutuhkan.
- File PRD memiliki encoding tampilan karakter tree yang rusak di terminal, tetapi isi konseptual masih terbaca.

## Prioritas Lanjutan yang Disarankan

1. Proteksi mutation kategori dengan admin middleware.
2. Tambahkan validasi input yang lebih kuat.
3. Tambahkan dokumentasi endpoint API.
