# Pembagian Tugas Tim 3 Orang

Dokumen ini menjelaskan pembagian kerja tim menggunakan pendekatan **Vertical Slice**, yaitu setiap orang bertanggung jawab atas satu domain fitur secara full-stack: database, backend API, frontend mobile, dan bagian admin yang relevan.

Tujuan pembagian ini adalah agar pekerjaan tidak saling bertabrakan, setiap anggota punya area ownership yang jelas, dan integrasi akhir lebih mudah.

## Prinsip Pembagian

- Setiap person mengerjakan satu domain fitur dari backend sampai frontend.
- Setiap person bertanggung jawab pada tabel, endpoint, screen, API client, hook, dan validasi yang berhubungan dengan domainnya.
- Admin panel tetap dibagi berdasarkan domain, bukan dikerjakan bersama-sama.
- **Dashboard Admin dikerjakan oleh Person C saja** agar tidak ada konflik ownership di akhir.
- Jika ada file bersama seperti `App.js`, navigation, `axiosInstance.js`, atau `colors.js`, perubahan harus dikomunikasikan dulu.
- Semua endpoint privat wajib memakai JWT.
- Semua endpoint admin wajib memakai middleware admin.
- Response API harus konsisten:

```json
{
  "success": true,
  "message": "Pesan singkat",
  "data": {}
}
```

## Ringkasan Ownership

| Person | Domain | Fokus Utama | Admin Ownership |
| --- | --- | --- | --- |
| Person A | User & Auth | Login, register, profil, role, session | Manajemen Anggota |
| Person B | Buku & Katalog | Home, katalog, detail buku, kategori, QR buku | Manajemen Buku |
| Person C | Transaksi & QR | Pinjam, kembali, scan QR, riwayat, denda | Dashboard Admin, Manajemen Transaksi, Laporan |

## Person A - User & Auth

### Tanggung Jawab Utama

Person A memegang semua fitur yang berhubungan dengan identitas pengguna: registrasi, login, session, profil, role user, status user, dan admin mengelola anggota.

### Backend

Database:

- Setup dan maintenance tabel `users`.
- Pastikan field minimal tersedia:
  - `id`
  - `name`
  - `email`
  - `password`
  - `role`
  - `status`
  - `created_at`
  - `updated_at`

Endpoint:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `GET /api/users`
- `GET /api/users/stats`
- `PUT /api/users/:id/status`
- `PUT /api/users/:id/role`

Logic backend:

- Hash password dengan `bcryptjs`.
- Generate JWT saat login/register.
- Validasi email unik.
- Validasi password minimal 6 karakter.
- Cegah user `suspended` login.
- Cegah admin mengubah status/role akun sendiri.
- Pastikan data user yang dikirim ke client tidak mengandung password hash.

File backend utama:

```text
elibrary-backend/src/controllers/authController.js
elibrary-backend/src/controllers/userController.js
elibrary-backend/src/models/userModel.js
elibrary-backend/src/routes/authRoutes.js
elibrary-backend/src/routes/userRoutes.js
elibrary-backend/src/middlewares/authMiddleware.js
elibrary-backend/src/middlewares/adminMiddleware.js
elibrary-backend/seed-admin.js
```

### Frontend Mobile

Screen:

- Splash Screen.
- Onboarding.
- Login.
- Register.
- Profil.
- Admin: Manajemen Anggota.

API client dan state:

- Auth API.
- User API.
- Auth context.
- Auth hook.
- Penyimpanan token di AsyncStorage.
- Role-based navigation untuk student/admin.

File frontend utama:

```text
elibrary-mobile/App.js
elibrary-mobile/src/context/AuthContext.js
elibrary-mobile/src/hooks/useAuth.js
elibrary-mobile/src/api/authApi.js
elibrary-mobile/src/api/userApi.js
elibrary-mobile/src/screens/auth/SplashScreen.js
elibrary-mobile/src/screens/auth/OnboardingScreen.js
elibrary-mobile/src/screens/auth/LoginScreen.js
elibrary-mobile/src/screens/auth/RegisterScreen.js
elibrary-mobile/src/screens/student/ProfileScreen.js
elibrary-mobile/src/screens/admin/ManageUsersScreen.js
```

### Deliverable Person A

- User bisa register.
- User bisa login.
- Token tersimpan dan session tetap aktif saat app dibuka ulang.
- Role admin/student mengarah ke tampilan yang benar.
- User bisa melihat dan mengubah profil.
- Profil menampilkan QR member card.
- Admin bisa melihat daftar anggota.
- Admin bisa search anggota.
- Admin bisa mengaktifkan/nonaktifkan anggota.
- Admin bisa mengubah role anggota.
- Statistik user tersedia untuk dashboard.

### Catatan Integrasi

- Person A harus menyediakan status auth yang bisa dipakai Person B dan C.
- Person A harus memastikan endpoint admin bisa dipakai oleh screen admin.
- Jika mengubah struktur user/session, beri tahu Person B dan Person C.

## Person B - Buku & Katalog

### Tanggung Jawab Utama

Person B memegang semua fitur yang berhubungan dengan data buku: kategori, katalog, detail buku, stok, QR code buku, dan admin mengelola buku.

### Backend

Database:

- Setup dan maintenance tabel `books`.
- Setup dan maintenance tabel `categories`.
- Pastikan field minimal `books` tersedia:
  - `id`
  - `category_id`
  - `title`
  - `author`
  - `publisher`
  - `isbn`
  - `summary`
  - `cover_image`
  - `stock`
  - `available_stock`
  - `qr_code`
  - `created_at`
  - `updated_at`

Endpoint buku:

- `GET /api/books`
- `GET /api/books/:id`
- `GET /api/books/stats`
- `POST /api/books`
- `PUT /api/books/:id`
- `DELETE /api/books/:id`

Endpoint kategori:

- `GET /api/categories`
- `GET /api/categories/:id`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

Logic backend:

- Search buku berdasarkan judul, penulis, atau ISBN.
- Filter buku berdasarkan kategori.
- Generate `qr_code` unik saat buku dibuat.
- Set `available_stock` sama dengan `stock` saat buku baru dibuat.
- Validasi `title`, `author`, dan `stock`.
- Proteksi endpoint create/update/delete buku dengan admin middleware.
- Proteksi endpoint mutation kategori dengan admin middleware jika belum dilakukan.

File backend utama:

```text
elibrary-backend/src/controllers/bookController.js
elibrary-backend/src/controllers/categoryController.js
elibrary-backend/src/models/bookModel.js
elibrary-backend/src/models/categoryModel.js
elibrary-backend/src/routes/bookRoutes.js
elibrary-backend/src/routes/categoryRoutes.js
elibrary-backend/src/utils/generateQRCode.js
```

### Frontend Mobile

Screen:

- Home/Dashboard mahasiswa.
- Katalog buku.
- Detail buku.
- Admin: Manajemen Buku.

API client dan hook:

- Book API.
- Category API.
- Home hook.
- Catalog hook.
- Logic search/filter.
- Preview QR buku pada admin.

File frontend utama:

```text
elibrary-mobile/src/api/bookApi.js
elibrary-mobile/src/api/categoryApi.js
elibrary-mobile/src/hooks/useHome.js
elibrary-mobile/src/hooks/useCatalog.js
elibrary-mobile/src/screens/student/HomeScreen.js
elibrary-mobile/src/screens/student/CatalogScreen.js
elibrary-mobile/src/screens/student/BookDetailScreen.js
elibrary-mobile/src/screens/admin/ManageBooksScreen.js
elibrary-mobile/src/assets/images/book-placeholder.png
```

### Deliverable Person B

- Mahasiswa bisa melihat home berisi ringkasan dan rekomendasi buku.
- Mahasiswa bisa melihat katalog buku.
- Mahasiswa bisa search buku.
- Mahasiswa bisa filter buku berdasarkan kategori.
- Mahasiswa bisa membuka detail buku.
- Detail buku menampilkan stok dan tombol pinjam.
- Admin bisa menambah buku.
- Admin bisa mengedit buku.
- Admin bisa menghapus buku.
- Admin bisa melihat QR code buku.
- Statistik buku tersedia untuk dashboard.

### Catatan Integrasi

- Tombol `Pinjam` di detail buku akan terhubung ke logic Person C.
- Person B harus menjaga field `available_stock` agar siap dipakai transaksi.
- Person B harus memastikan `qr_code` buku dapat dibaca oleh fitur scan QR Person C.

## Person C - Transaksi & QR Scanning

### Tanggung Jawab Utama

Person C memegang fitur paling teknikal: scan QR, peminjaman, pengembalian, riwayat, denda, notifikasi, manajemen transaksi admin, laporan, dan **Dashboard Admin**.

### Backend

Database:

- Setup dan maintenance tabel `transactions`.
- Pastikan field minimal tersedia:
  - `id`
  - `user_id`
  - `book_id`
  - `borrow_date`
  - `due_date`
  - `return_date`
  - `fine_amount`
  - `status`
  - `created_at`
  - `updated_at`

Endpoint transaksi:

- `POST /api/transactions/borrow`
- `POST /api/transactions/return`
- `GET /api/transactions/history/:user_id`
- `GET /api/transactions`
- `GET /api/transactions/stats`
- `PUT /api/transactions/:id/override`
- `GET /api/transactions/export`

Endpoint dashboard admin:

- `GET /api/dashboard/admin`

Logic backend:

- Validasi token user saat pinjam/kembali.
- Validasi buku ada.
- Validasi stok tersedia sebelum peminjaman.
- Kurangi `available_stock` saat buku dipinjam.
- Tambah `available_stock` saat buku dikembalikan.
- Cegah transaksi ganda untuk buku yang sama jika user masih punya transaksi aktif.
- Hitung `due_date`.
- Hitung denda otomatis jika terlambat.
- Update status transaksi:
  - `borrowed`
  - `returned`
  - `overdue`
  - `lost`
  - `damaged`
- Admin bisa filter transaksi berdasarkan status/periode/user.
- Admin bisa override status buku hilang/rusak.
- Export laporan transaksi berdasarkan periode.
- Dashboard admin menggabungkan statistik dari user, buku, dan transaksi.

File backend yang perlu dibuat/dikelola:

```text
elibrary-backend/src/controllers/transactionController.js
elibrary-backend/src/controllers/dashboardController.js
elibrary-backend/src/models/transactionModel.js
elibrary-backend/src/routes/transactionRoutes.js
elibrary-backend/src/routes/dashboardRoutes.js
elibrary-backend/src/utils/calculateFine.js
```

Jika diperlukan:

```text
elibrary-backend/src/utils/exportReport.js
elibrary-backend/src/jobs/dueDateReminderJob.js
```

### Frontend Mobile

Screen mahasiswa:

- Scan QR.
- Riwayat Peminjaman.
- Notifikasi.

Screen admin:

- Dashboard Admin.
- Manajemen Transaksi.
- Laporan.

API client dan hook:

- Transaction API.
- Dashboard API.
- Borrow/return hook.
- QR scanner hook.
- Report/export helper.

File frontend yang perlu dibuat/dikelola:

```text
elibrary-mobile/src/api/transactionApi.js
elibrary-mobile/src/api/dashboardApi.js
elibrary-mobile/src/hooks/useBorrow.js
elibrary-mobile/src/hooks/useQRScanner.js
elibrary-mobile/src/hooks/useTransactions.js
elibrary-mobile/src/screens/student/ScanQRScreen.js
elibrary-mobile/src/screens/student/HistoryScreen.js
elibrary-mobile/src/screens/student/NotificationScreen.js
elibrary-mobile/src/screens/admin/DashboardScreen.js
elibrary-mobile/src/screens/admin/ManageTransactionsScreen.js
elibrary-mobile/src/screens/admin/ReportScreen.js
```

### Deliverable Person C

- Mahasiswa bisa scan QR untuk meminjam buku.
- Mahasiswa bisa scan QR untuk mengembalikan buku.
- Sistem menghitung denda otomatis jika terlambat.
- Mahasiswa bisa melihat riwayat peminjaman.
- Mahasiswa bisa melihat notifikasi jatuh tempo.
- Admin bisa melihat semua transaksi.
- Admin bisa filter transaksi berdasarkan status/periode.
- Admin bisa override transaksi buku hilang/rusak.
- Admin bisa export laporan.
- Dashboard Admin tersedia dan menampilkan statistik gabungan:
  - total anggota
  - anggota aktif
  - total buku
  - stok tersedia
  - transaksi aktif
  - transaksi terlambat
  - total denda

### Catatan Integrasi

- Person C memakai data user dari Person A.
- Person C memakai data buku dan `qr_code` dari Person B.
- Person C bertanggung jawab penuh atas Dashboard Admin agar tidak ada pekerjaan yang nabrak.
- Jika membutuhkan endpoint statistik tambahan dari Person A atau B, koordinasikan format response lebih dulu.

## Dashboard Admin - Ownership Person C

Dashboard Admin **hanya dikerjakan oleh Person C**.

Alasan:

- Dashboard mengambil data dari banyak domain.
- Jika dikerjakan bersama, rawan konflik di screen, route, dan API client.
- Person C sudah memegang domain transaksi yang menjadi bagian terakhir dari flow sistem.

Data dashboard boleh mengambil dari:

- Endpoint statistik user milik Person A.
- Endpoint statistik buku milik Person B.
- Endpoint statistik transaksi milik Person C.

Namun implementasi screen dashboard, endpoint agregator dashboard, dan layout dashboard tetap menjadi tanggung jawab Person C.

## Batas File Agar Tidak Nabrak

### File Bersama

File berikut harus diedit hati-hati dan dikomunikasikan:

```text
elibrary-mobile/App.js
elibrary-mobile/src/api/axiosInstance.js
elibrary-mobile/src/constants/colors.js
elibrary-mobile/src/utils/responsive.js
elibrary-backend/server.js
elibrary-backend/src/config/db.js
```

Aturan:

- Jangan mengubah file bersama tanpa memberi tahu anggota lain.
- Jika menambah route baru di `server.js`, pastikan base path tidak bentrok.
- Jika mengubah schema di `db.js`, pastikan tidak merusak domain lain.

### Base Path API

Gunakan base path berikut:

| Domain | Base Path |
| --- | --- |
| Auth | `/api/auth` |
| User Admin | `/api/users` |
| Buku | `/api/books` |
| Kategori | `/api/categories` |
| Transaksi | `/api/transactions` |
| Dashboard Admin | `/api/dashboard` |

## Urutan Pengerjaan yang Disarankan

1. Person A menyelesaikan auth, session, middleware, dan role-based navigation.
2. Person B menyelesaikan buku, kategori, katalog, detail, dan QR buku.
3. Person C menyelesaikan transaksi backend berdasarkan `user_id`, `book_id`, dan `qr_code`.
4. Person C menyelesaikan scan QR, riwayat, dan pengembalian.
5. Person A menyelesaikan Manajemen Anggota.
6. Person B menyelesaikan Manajemen Buku.
7. Person C menyelesaikan Manajemen Transaksi, Laporan, dan Dashboard Admin.
8. Semua person melakukan testing integrasi sesuai domain masing-masing.

## Checklist Integrasi Akhir

### Auth dan Role

- Student login masuk ke area mahasiswa.
- Admin login masuk ke area admin.
- Token dikirim otomatis pada endpoint privat.
- User suspended tidak bisa login.

### Buku dan Katalog

- Buku tampil di home dan katalog.
- Search dan filter berjalan.
- Detail buku tampil benar.
- Admin bisa CRUD buku.
- QR buku tersedia.

### Transaksi

- Scan QR berhasil membaca data buku.
- Pinjam buku mengurangi stok tersedia.
- Kembali buku menambah stok tersedia.
- Riwayat transaksi muncul.
- Denda muncul jika terlambat.

### Admin

- Admin bisa kelola anggota.
- Admin bisa kelola buku.
- Admin bisa kelola transaksi.
- Admin bisa melihat dashboard.
- Admin bisa export laporan.

## Definition of Done

Satu fitur dianggap selesai jika:

- Backend endpoint tersedia dan sudah dites manual.
- Frontend screen tersedia dan terhubung ke API.
- Loading state tersedia.
- Empty state tersedia.
- Error state tersedia.
- Validasi input dasar tersedia.
- Role access sudah benar.
- Data tersimpan di database.
- Tidak merusak domain anggota lain.
- Dokumentasi/changelog diperbarui jika ada perubahan besar.
