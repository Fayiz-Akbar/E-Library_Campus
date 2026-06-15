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
- Student tabs: Home, Katalog, Scan QR, Profil.
- Admin tabs: Kelola Buku, Kelola Anggota, Profil Admin.
- Book detail screen.
- API layer untuk auth, user, book, category, borrow.
- API layer transaksi untuk borrow/return berbasis QR.
- Hooks untuk auth, catalog, home, borrow.
- Hook `useQRScanner` untuk mengelola flow Scan QR.
- Borrow API sudah mengarah ke `/api/transactions/borrow`.
- Student tab `Scan QR` aktif dengan kamera perangkat melalui `expo-camera`.
- Fallback input manual QR/barcode tetap tersedia.
- Token disimpan melalui AsyncStorage.
- Role-based navigation di `App.js`.

## Belum Terlihat Aktif di Kode

Walaupun PRD mencantumkan fitur berikut sebagai target, kode aktual belum menunjukkan implementasi lengkap:

- History screen.
- Notification screen.
- Admin manage transactions screen.
- Admin report/export screen.
- Cron job atau FCM notification.
- Dashboard admin gabungan statistik semua domain.

Backend transaksi dasar sudah aktif untuk borrow, return, history, dan stats. UI Scan QR sudah aktif dengan kamera perangkat dan fallback input manual. Riwayat, notifikasi, admin transaksi, laporan, dan dashboard masih perlu dikerjakan pada branch Person 3 berikutnya.

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
2. Tambahkan UI riwayat dan notifikasi transaksi.
3. Tambahkan admin transaksi, laporan, dan dashboard admin.
4. Tambahkan validasi input yang lebih kuat.
5. Tambahkan dokumentasi endpoint API.
