# CLAUDE.md — Mobile E-Library Kampus dengan QR Code

Dokumen ini adalah context utama untuk Claude (atau AI assistant lain) saat membantu development project ini. Baca seluruh isi file ini sebelum mulai membantu coding.

---

## 1. Project Overview

Aplikasi mobile e-library kampus berbasis React Native untuk peminjaman dan pengembalian buku menggunakan QR code, terhubung dengan kamera HP. Materi yang tercover: kamera (QR scanning), database, dan API.

**Tech Stack:**
- Frontend: React Native (CLI/Expo), JavaScript/TypeScript, `react-navigation`, Redux Toolkit/Zustand, `axios`, `react-native-vision-camera`, `react-native-qrcode-svg`, `AsyncStorage`
- Backend: Node.js + Express.js, JWT Auth
- Database: PostgreSQL
- Tools: Postman, Git/GitHub

---

## 2. ATURAN UTAMA UNTUK AI: TANYA DULU SEBELUM CODING

**Ini adalah aturan paling penting.** Sebelum menulis atau mengubah kode apapun, AI HARUS:

1. **Bertanya terlebih dahulu** jika ada bagian dari permintaan yang ambigu, kurang jelas, atau punya lebih dari satu cara implementasi yang masuk akal.
2. **Memberikan 2-3 opsi/saran** beserta kelebihan-kekurangan masing-masing, sebelum user memutuskan, untuk hal-hal seperti:
   - Pilihan library/package
   - Pendekatan struktur kode (misal: pakai custom hook vs logic langsung di komponen)
   - Penamaan file/folder/komponen baru jika belum ada konvensi
   - Pendekatan UI/UX jika ada beberapa cara menampilkan sesuatu
3. **Tidak langsung asumsi** - kalau requirement kurang detail (misal: "buatkan halaman login"), tanyakan dulu field apa saja yang dibutuhkan, validasi apa yang diperlukan, dsb — KECUALI requirement sudah jelas tercakup di dokumen ini.
4. Setelah user menjawab/memilih, baru lanjut ke implementasi kode.
5. Jika user secara eksplisit minta "langsung kerjakan saja" atau "pakai asumsi terbaik", AI boleh skip pertanyaan dan langsung jalan, tapi tetap sebutkan asumsi yang diambil di awal jawaban.

---

## 3. Struktur Folder

### Frontend (React Native)

```
elibrary-mobile/
├── src/
│   ├── api/
│   │   ├── axiosInstance.js        # konfigurasi base URL & interceptor token
│   │   ├── authApi.js
│   │   ├── userApi.js
│   │   ├── bookApi.js
│   │   └── transactionApi.js
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── components/
│   │   ├── common/                 # Button, Input, Card, Loader, Modal, dll
│   │   ├── ListItem.js
│   │   ├── SearchBar.js
│   │   ├── EmptyState.js
│   │   └── QRScannerOverlay.js
│   ├── constants/
│   │   ├── colors.js                # definisi warna (lihat bagian 4)
│   │   ├── theme.js                  # spacing, font size, border radius
│   │   └── config.js                 # API base URL, dll
│   ├── navigation/
│   │   ├── AppNavigator.js
│   │   ├── AuthNavigator.js
│   │   ├── StudentNavigator.js
│   │   └── AdminNavigator.js
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── SplashScreen.js
│   │   │   ├── OnboardingScreen.js
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   ├── student/
│   │   │   ├── HomeScreen.js
│   │   │   ├── CatalogScreen.js
│   │   │   ├── BookDetailScreen.js
│   │   │   ├── ScanQRScreen.js
│   │   │   ├── HistoryScreen.js
│   │   │   ├── ProfileScreen.js
│   │   │   └── NotificationScreen.js
│   │   └── admin/
│   │       ├── DashboardScreen.js
│   │       ├── ManageUsersScreen.js
│   │       ├── ManageBooksScreen.js
│   │       ├── ManageTransactionsScreen.js
│   │       └── ReportScreen.js
│   ├── store/
│   │   ├── index.js
│   │   ├── authSlice.js
│   │   ├── bookSlice.js
│   │   └── transactionSlice.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useQRScanner.js
│   ├── utils/
│   │   ├── formatDate.js
│   │   ├── formatCurrency.js
│   │   └── validators.js
│   └── App.js
├── .env
├── package.json
└── README.md
```

### Backend (Express)

```
elibrary-backend/
├── src/
│   ├── config/
│   │   └── db.js                     # koneksi database
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── bookController.js
│   │   └── transactionController.js
│   ├── models/
│   │   ├── userModel.js
│   │   ├── bookModel.js
│   │   ├── categoryModel.js
│   │   └── transactionModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── bookRoutes.js
│   │   └── transactionRoutes.js
│   ├── middlewares/
│   │   ├── authMiddleware.js          # verifikasi JWT
│   │   └── adminMiddleware.js         # cek role admin
│   ├── utils/
│   │   ├── generateQRCode.js
│   │   └── calculateFine.js
│   └── app.js
├── .env
├── package.json
└── server.js
```

**Catatan penempatan file berdasarkan domain:**
- Person A (User & Auth): `screens/auth/*`, `screens/student/ProfileScreen.js`, `screens/admin/ManageUsersScreen.js`, `api/authApi.js`, `api/userApi.js`, backend `authController.js` + `userController.js` + `userModel.js`
- Person B (Buku & Katalog): `screens/student/HomeScreen.js`, `CatalogScreen.js`, `BookDetailScreen.js`, `screens/admin/ManageBooksScreen.js`, `api/bookApi.js`, backend `bookController.js` + `bookModel.js`
- Person C (Transaksi & QR): `screens/student/ScanQRScreen.js`, `HistoryScreen.js`, `NotificationScreen.js`, `screens/admin/ManageTransactionsScreen.js`, `ReportScreen.js`, `api/transactionApi.js`, backend `transactionController.js` + `transactionModel.js`

---

## 4. Tema Warna (Ungu-Putih)

```javascript
// src/constants/colors.js
export const colors = {
  primary: '#7C3AED',        // Ungu utama - tombol, header, elemen aktif
  primaryDark: '#5B21B6',    // Ungu gelap - untuk pressed state / gradient
  primaryLight: '#C4B5FD',   // Ungu muda - background highlight, badge
  secondary: '#A78BFA',      // Aksen ungu sekunder

  background: '#FFFFFF',     // Background utama
  surface: '#F5F3FF',        // Background card/section (ungu sangat muda)

  textPrimary: '#1E1B2E',    // Teks utama
  textSecondary: '#6B7280',  // Teks sekunder/keterangan
  textOnPrimary: '#FFFFFF',  // Teks di atas warna primary

  border: '#E5E7EB',         // Garis pembatas/divider

  success: '#10B981',        // Status tersedia/berhasil
  warning: '#F59E0B',        // Status mendekati jatuh tempo
  danger: '#EF4444',         // Status terlambat/denda/error
  info: '#3B82F6',           // Notifikasi informasi
};
```

**Panduan penggunaan:**
- `primary` untuk tombol utama (Pinjam, Login, Simpan), tab aktif, header
- `surface` untuk background card buku, list item
- `success`/`warning`/`danger` untuk badge status transaksi (Tersedia/Akan Jatuh Tempo/Terlambat)
- Gunakan border radius konsisten (8-12px) dan shadow tipis untuk card, sesuai estetika modern

---

## 5. Coding Rules / Clean Code

### Naming Conventions
- **Komponen & Screen**: PascalCase → `BookCard.js`, `HomeScreen.js`
- **Variabel & function**: camelCase → `fetchBookList()`, `isLoading`
- **Konstanta global**: UPPER_SNAKE_CASE → `MAX_BORROW_LIMIT`, `API_BASE_URL`
- **File API/util**: camelCase → `bookApi.js`, `formatDate.js`

### Struktur Kode
- **Satu komponen per file**. Jangan gabung beberapa komponen besar dalam satu file.
- **Pisahkan logic dari UI**: gunakan custom hooks (`useXxx.js`) untuk logic yang kompleks (fetch data, form handling), biarkan komponen fokus pada rendering.
- **Reusable components** wajib ditaruh di `components/`, jangan duplikasi kode UI yang sama di banyak screen.
- **API call** selalu lewat folder `api/`, jangan panggil `axios` langsung dari komponen.

### Clean Code Principles
- **Single Responsibility**: satu fungsi hanya melakukan satu hal. Kalau fungsi sudah >30-40 baris, pertimbangkan untuk dipecah.
- **Hindari magic number/string**: gunakan konstanta (misal `MAX_BORROW_DAYS = 7` bukan angka `7` langsung di banyak tempat).
- **Penamaan deskriptif**: nama variabel/fungsi harus jelas menggambarkan isinya, hindari nama seperti `data1`, `temp`, `x`.
- **Error handling konsisten**: selalu pakai try-catch untuk async call, tampilkan pesan error yang user-friendly (jangan tampilkan raw error ke user).
- **Komentar untuk "why", bukan "what"**: tulis komentar untuk menjelaskan alasan/logic bisnis yang tidak obvious, bukan menjelaskan ulang kode yang sudah jelas.
- **Konsisten gunakan async/await**, hindari mixing dengan `.then()/.catch()`.

### Backend
- Controller hanya menangani request/response, logic bisnis kompleks (misal hitung denda) ditaruh di `utils/` agar bisa di-reuse dan ditest.
- Selalu validasi input dari client sebelum masuk ke query database.
- Response API konsisten dalam format, contoh:
```json
{
  "success": true,
  "message": "Buku berhasil dipinjam",
  "data": { ... }
}
```

---

## 6. Checklist Fitur

Status: `x` = belum dikerjakan, `o` = sudah selesai. AI tolong update tanda ini saat user bilang sebuah fitur sudah selesai diubah/dikerjakan.

### Auth & Profil (Person A)
- [x] Halaman Splash Screen
- [x] Halaman Onboarding
- [x] Halaman Login
- [x] Halaman Register
- [x] API Register & Login (JWT)
- [x] Halaman Profil + QR Member Card
- [x] API get/update profil
- [x] Admin: Manajemen Anggota (list, search, toggle status)
- [x] API admin users (list, update status/role, stats)

### Buku & Katalog (Person B)
- [o] Halaman Home/Dashboard mahasiswa
- [o] Halaman Katalog Buku (search & filter)
- [o] Halaman Detail Buku
- [x] Halaman Favorite
- [x] API list & detail buku
- [x] Admin: Manajemen Buku (CRUD + generate QR)
- [x] API CRUD buku + generate QR code
- [x] API stats buku

### Transaksi & QR Scanning (Person C)
- [x] Halaman Scan QR (mode pinjam/kembalikan)
- [x] API peminjaman buku (borrow)
- [x] API pengembalian buku (return) + hitung denda
- [x] Halaman Riwayat Peminjaman
- [x] API riwayat per user
- [x] Halaman Notifikasi jatuh tempo
- [x] Cron job notifikasi (FCM)
- [x] Admin: Manajemen Transaksi
- [x] Admin: Laporan (export)
- [x] API stats transaksi

### Gabungan
- [x] Dashboard Admin (gabungan statistik 3 domain)
- [x] Role-based access (middleware + conditional navigation)

---

## 7. Database & Hosting Plan

### Database Setup (Supabase PostgreSQL)

Project ini menggunakan **Supabase (PostgreSQL Cloud Free Tier)** baik untuk tahap *development* (lokal) maupun *production*. Kita tidak wajib menggunakan Docker secara lokal untuk menghindari kendala *environment/error* WSL di beberapa perangkat tim.

**Cara Konfigurasi Database ke Supabase:**
1. Buat project baru di Supabase dengan Region: **Singapore (ap-southeast-1)**.
2. Masuk ke **Project Settings > Database > Connection String**.
3. Pilih tab **URI**, lalu salin string koneksinya.
4. Format URI akan terlihat seperti ini:
   ```text
   postgresql://postgres.[username]:[password]@[aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres](https://aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres)


### Hosting Plan

- **Database (PostgreSQL)**: Supabase (free tier, tanpa kartu kredit, tidak ada batas waktu expired)
- **Backend (Express API)**: Render (free tier, 750 jam/bulan, tanpa kartu kredit)
- **Mobile App**: tidak perlu hosting — cukup build APK (Android) untuk demo, atau jalankan via Expo Go

**Catatan:**
- Backend di Render free tier akan "sleep" setelah 15 menit tidak ada request, dan butuh ~30-50 detik untuk bangun kembali (cold start) saat ada request pertama setelah idle. Pertimbangkan ini saat demo ke dosen — bisa akses dulu API beberapa menit sebelum presentasi agar server sudah "hangat".
- Connection string Supabase digunakan sebagai `DATABASE_URL` di environment variable Render (production) dan di `.env` lokal (development, mengarah ke Docker container).
- Pastikan struktur tabel & migration sama antara database lokal (Docker) dan Supabase (production) — gunakan migration script/file SQL yang sama untuk keduanya.

---

## 8. Catatan Tambahan

- Sepakati struktur API response sebelum coding agar frontend bisa pakai mock data lebih dulu.
- Gunakan branch Git per domain (`feature/auth`, `feature/katalog`, `feature/transaksi`), merge rutin ke `develop`.
- Dokumen ini sebaiknya disimpan di root masing-masing repo (frontend & backend) sebagai `CLAUDE.md` agar otomatis terbaca oleh Claude Code.
