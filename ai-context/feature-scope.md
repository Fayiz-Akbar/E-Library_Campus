# Feature Scope

Dokumen ini menjelaskan ruang lingkup fitur berdasarkan PRD dan kondisi implementasi saat ini.

## Tujuan Produk

Membangun aplikasi e-library kampus berbasis mobile yang memungkinkan:

- Mahasiswa mencari dan melihat buku.
- Mahasiswa meminjam dan mengembalikan buku dengan QR code.
- Mahasiswa melihat profil, QR member card, riwayat, dan notifikasi.
- Admin mengelola anggota, buku, kategori, transaksi, dan laporan.

## In Scope

### Auth dan Profil

- Splash screen.
- Onboarding.
- Register mahasiswa.
- Login mahasiswa/admin.
- JWT authentication.
- Persist session di mobile.
- Profile screen.
- Update profile.
- Role-based navigation.
- QR member card sebagai target PRD.

### User Management Admin

- List anggota.
- Search anggota.
- Toggle status anggota.
- Update role anggota.
- Statistik user.

### Buku dan Katalog

- Home mahasiswa.
- Katalog buku.
- Search buku.
- Filter kategori.
- Detail buku.
- Manajemen buku admin.
- CRUD buku.
- Generate QR/token buku.
- Statistik buku.
- Manajemen kategori.

### Transaksi dan QR

Target PRD:

- Scan QR buku.
- Mode pinjam.
- Mode kembalikan.
- API borrow.
- API return.
- Hitung denda.
- Riwayat peminjaman per user.
- Notifikasi jatuh tempo.
- Admin manajemen transaksi.
- Admin laporan/export.

Status: belum lengkap di kode aktual.

### Deployment/Operasional

- Database Supabase PostgreSQL.
- Backend lokal atau Render.
- Mobile via Expo Go atau build APK.

## Out of Scope Saat Ini

- Payment gateway untuk denda.
- Integrasi SSO kampus.
- Multi-library branch.
- Barcode fisik selain QR.
- Offline-first mode penuh.
- Push notification production lengkap jika FCM belum dikonfigurasi.
- Audit log detail semua perubahan admin.
- Recommendation engine berbasis ML.

## Pembagian Domain Kerja

### Person A: Auth dan User

Area:

- Auth screens.
- Profile.
- Admin manage users.
- Backend auth/user.
- JWT dan middleware role.

### Person B: Buku dan Katalog

Area:

- Home.
- Catalog.
- Book detail.
- Admin manage books.
- Category.
- Backend book/category.
- QR code buku.

### Person C: Transaksi dan QR

Area:

- Scan QR.
- Borrow/return.
- History.
- Notification.
- Admin transaction.
- Report.
- Backend transaction.
- Fine calculation.

## Acceptance Criteria Umum

Fitur dianggap selesai jika:

- UI tersedia dan bisa digunakan.
- API yang dibutuhkan tersedia.
- Loading, empty, dan error state ditangani.
- Endpoint privat memakai JWT.
- Endpoint admin memakai admin middleware.
- Data berhasil tersimpan di PostgreSQL.
- Response API mengikuti format standar.
- Mobile berjalan di Android, iOS, dan web bila screen tersebut memang relevan untuk web.

## Prioritas Implementasi

1. Stabilkan fitur auth dan konektivitas API.
2. Stabilkan katalog dan CRUD buku.
3. Lengkapi transaksi backend.
4. Lengkapi scan QR dan borrow/return mobile.
5. Tambahkan history dan notification.
6. Tambahkan dashboard/report admin.
7. Perkuat validasi, error handling, dan testing manual.
