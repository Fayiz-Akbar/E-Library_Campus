# Stakeholders and Roles

## Stakeholder Produk

### Mahasiswa

Pengguna utama aplikasi mobile untuk mencari dan meminjam buku.

Kebutuhan:

- Registrasi dan login mudah.
- Katalog buku mudah dicari.
- Informasi stok jelas.
- Proses pinjam/kembali cepat.
- Riwayat peminjaman mudah dilihat.
- Notifikasi jatuh tempo jelas.

### Admin Perpustakaan

Pengelola operasional perpustakaan.

Kebutuhan:

- Mengelola data anggota.
- Mengelola data buku dan kategori.
- Melihat stok dan statistik.
- Mengelola transaksi peminjaman/pengembalian.
- Melihat laporan.
- Mencegah akses tidak sah.

### Dosen/Penguji

Stakeholder evaluasi akademik.

Kebutuhan:

- Aplikasi bisa didemokan.
- Alur fitur utama jelas.
- QR/camera, database, dan API terlihat berjalan.
- Struktur kode rapi dan bisa dijelaskan.

### Tim Developer

Pengembang backend, mobile, dan dokumentasi.

Kebutuhan:

- Konteks project jelas.
- Pembagian domain jelas.
- Aturan coding konsisten.
- Dokumentasi setup dan AI context lengkap.

## Role Aplikasi

### Guest

Belum login.

Akses:

- Splash.
- Onboarding.
- Login.
- Register.

Tidak boleh:

- Mengakses profil.
- Mengakses endpoint privat.
- Mengakses tab student/admin.

### Student

User login dengan role `student`.

Akses:

- Home.
- Katalog.
- Detail buku.
- Profil.
- Target PRD: scan QR.
- Target PRD: riwayat.
- Target PRD: notifikasi.

Tidak boleh:

- Kelola buku.
- Kelola anggota.
- Kelola transaksi admin.
- Laporan admin.

### Admin

User login dengan role `admin`.

Akses:

- Kelola buku.
- Kelola anggota.
- Profil admin.
- Statistik user/buku.
- Target PRD: dashboard admin.
- Target PRD: kelola transaksi.
- Target PRD: laporan/export.

Tidak boleh:

- Mengubah status akun sendiri.
- Mengubah role akun sendiri.

## Role Teknis dalam Kode

### Mobile App

Menentukan route berdasarkan:

- `isLoggedIn`
- `isAdmin`
- `isLoadingSession`

Lokasi:

```text
elibrary-mobile/App.js
elibrary-mobile/src/context/AuthContext.js
```

### Backend

Menentukan akses melalui middleware:

```text
verifyToken
isAdmin
```

Lokasi:

```text
elibrary-backend/src/middlewares/authMiddleware.js
elibrary-backend/src/middlewares/adminMiddleware.js
```

Backend tetap wajib menjadi penjaga akses final meskipun mobile sudah menyembunyikan UI admin.
