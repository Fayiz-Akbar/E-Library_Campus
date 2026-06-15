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
- Seed admin melalui `seed-admin.js`.

### Mobile

- AuthProvider dan AuthContext.
- Splash screen.
- Onboarding screen.
- Login screen.
- Register screen.
- Student tabs: Home, Katalog, Profil.
- Admin tabs: Kelola Buku, Kelola Anggota, Profil Admin.
- Book detail screen.
- API layer untuk auth, user, book, category, borrow.
- Hooks untuk auth, catalog, home, borrow.
- Token disimpan melalui AsyncStorage.
- Role-based navigation di `App.js`.

## Belum Terlihat Aktif di Kode

Walaupun PRD mencantumkan fitur berikut sebagai target, kode aktual belum menunjukkan implementasi lengkap:

- Backend transaction route.
- Backend transaction controller/model.
- API peminjaman buku.
- API pengembalian buku.
- Hitung denda keterlambatan.
- Scan QR screen.
- History screen.
- Notification screen.
- Admin manage transactions screen.
- Admin report/export screen.
- Cron job atau FCM notification.
- Dashboard admin gabungan statistik semua domain.

Tabel `transactions` sudah ada di schema, jadi fondasi database untuk transaksi sudah disiapkan.

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
- Route `GET /api/books/:id` didefinisikan sebelum `GET /api/books/stats`; ini dapat membuat `/stats` tertangkap sebagai `:id`. Pindahkan route `/stats` sebelum `/:id` saat melakukan perbaikan backend.
- Route kategori `POST`, `PUT`, dan `DELETE` belum diproteksi admin.
- Nama file `src/app,.js` tidak lazim dan perlu diverifikasi apakah masih dibutuhkan.
- File PRD memiliki encoding tampilan karakter tree yang rusak di terminal, tetapi isi konseptual masih terbaca.

## Prioritas Lanjutan yang Disarankan

1. Rapikan route order buku agar `/stats` tidak bentrok dengan `/:id`.
2. Proteksi mutation kategori dengan admin middleware.
3. Lengkapi domain transaksi: model, controller, routes, API mobile, screens.
4. Tambahkan scan QR dan peminjaman/pengembalian.
5. Tambahkan dashboard admin dan laporan.
6. Tambahkan validasi input yang lebih kuat.
7. Tambahkan dokumentasi endpoint API.
