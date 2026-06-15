# Architecture

## Ringkasan Sistem

E-Library Campus adalah sistem perpustakaan kampus berbasis mobile dengan backend REST API. Target utama sistem adalah membantu mahasiswa mencari buku, melihat detail buku, meminjam/mengembalikan buku melalui QR code, melihat riwayat transaksi, serta membantu admin mengelola anggota, buku, kategori, transaksi, dan laporan.

Sumber konteks utama:

- `elibrary-backend/PRD.md`
- `elibrary-mobile/PRD.md`
- Kode aktual di `elibrary-backend/src` dan `elibrary-mobile/src`

## Komponen Utama

### Mobile App

Folder:

```text
elibrary-mobile/
```

Peran:

- Menjadi antarmuka utama mahasiswa dan admin.
- Menggunakan Expo React Native.
- Mengakses backend melalui Axios.
- Menyimpan token login di AsyncStorage.
- Mengatur navigasi berdasarkan status login dan role user.

Struktur penting saat ini:

```text
elibrary-mobile/
+-- App.js
+-- .env
+-- src/
    +-- api/
    +-- context/
    +-- hooks/
    +-- constants/
    +-- screens/
        +-- auth/
        +-- student/
        +-- admin/
```

### Backend API

Folder:

```text
elibrary-backend/
```

Peran:

- Menyediakan REST API untuk auth, user, kategori, dan buku.
- Menggunakan JWT untuk autentikasi.
- Menggunakan middleware role admin untuk endpoint admin.
- Membuat tabel database otomatis saat server start melalui `initDatabase`.

Struktur penting saat ini:

```text
elibrary-backend/
+-- server.js
+-- seed-admin.js
+-- src/
    +-- config/
    +-- controllers/
    +-- middlewares/
    +-- models/
    +-- routes/
    +-- utils/
```

Catatan: terdapat file `elibrary-backend/src/app,.js` dengan nama yang tidak lazim. Server aktual memakai `server.js`.

### Database

Database menggunakan PostgreSQL melalui Supabase. Koneksi dilakukan oleh `pg.Pool` dengan `DATABASE_URL` dari file `.env`.

Tabel yang dibuat otomatis:

- `users`
- `categories`
- `books`
- `transactions`

## Alur Komunikasi

```text
User
  -> Expo React Native App
  -> Axios Instance
  -> Express REST API
  -> PostgreSQL/Supabase
```

Token JWT disimpan di mobile dan dikirim pada request privat:

```text
Authorization: Bearer <token>
```

## Pembagian Domain

### Auth dan User

Mobile:

- `src/screens/auth/*`
- `src/screens/student/ProfileScreen.js`
- `src/screens/admin/ManageUsersScreen.js`
- `src/api/authApi.js`
- `src/api/userApi.js`
- `src/context/AuthContext.js`

Backend:

- `src/controllers/authController.js`
- `src/controllers/userController.js`
- `src/models/userModel.js`
- `src/routes/authRoutes.js`
- `src/routes/userRoutes.js`
- `src/middlewares/authMiddleware.js`
- `src/middlewares/adminMiddleware.js`

### Buku dan Katalog

Mobile:

- `src/screens/student/HomeScreen.js`
- `src/screens/student/CatalogScreen.js`
- `src/screens/student/BookDetailScreen.js`
- `src/screens/admin/ManageBooksScreen.js`
- `src/api/bookApi.js`
- `src/api/categoryApi.js`

Backend:

- `src/controllers/bookController.js`
- `src/controllers/categoryController.js`
- `src/models/bookModel.js`
- `src/models/categoryModel.js`
- `src/routes/bookRoutes.js`
- `src/routes/categoryRoutes.js`
- `src/utils/generateQRCode.js`

### Transaksi dan QR

Target PRD:

- Scan QR untuk pinjam/kembali.
- Riwayat peminjaman.
- Notifikasi jatuh tempo.
- Manajemen transaksi admin.
- Laporan dan export.

Status kode aktual:

- Tabel `transactions` dibuat otomatis di database.
- Belum ditemukan route/controller/model transaksi aktif di backend.
- Belum ditemukan screen scan QR, history, notification, manage transaction, atau report aktif di mobile.

## Prinsip Arsitektur

- Backend menjadi sumber kebenaran untuk validasi role, data user, buku, kategori, dan transaksi.
- Mobile tidak boleh mempercayai role hanya dari UI; akses admin tetap wajib divalidasi backend.
- API response harus konsisten:

```json
{
  "success": true,
  "message": "Pesan untuk user/developer",
  "data": {}
}
```

- Logic bisnis yang kompleks sebaiknya berada di backend model/service/util, bukan langsung di screen mobile.
- Mobile hanya memegang state UI, session, dan cache ringan.
