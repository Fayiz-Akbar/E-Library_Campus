# Business Rules

## Prinsip Umum

Sistem adalah aplikasi e-library kampus untuk mahasiswa dan admin perpustakaan. Semua aturan bisnis harus menjaga integritas data buku, anggota, transaksi, dan role akses.

## Role User

### Student

Mahasiswa dapat:

- Register akun.
- Login.
- Melihat profil.
- Mengubah profil sendiri.
- Melihat katalog buku.
- Mencari buku berdasarkan judul, penulis, atau ISBN.
- Memfilter buku berdasarkan kategori.
- Melihat detail buku.
- Target PRD: meminjam dan mengembalikan buku dengan QR code.
- Target PRD: melihat riwayat peminjaman dan notifikasi jatuh tempo.

Mahasiswa tidak boleh:

- Mengakses endpoint admin.
- Mengubah data buku.
- Mengubah role/status user lain.
- Mengakses laporan admin.

### Admin

Admin dapat:

- Login.
- Melihat profil.
- Mengelola anggota.
- Mengubah status anggota `active` atau `suspended`.
- Mengubah role anggota `student` atau `admin`.
- Melihat statistik user.
- Mengelola buku.
- Mengelola kategori.
- Melihat statistik buku.
- Target PRD: mengelola transaksi.
- Target PRD: melihat/export laporan.

Admin tidak boleh:

- Menonaktifkan akun sendiri.
- Mengubah role akun sendiri.

Aturan ini sudah diterapkan di `userController.js`.

## Auth

- Register membutuhkan `name`, `email`, dan `password`.
- Password minimal 6 karakter.
- Email harus unik.
- Password disimpan dalam bentuk hash menggunakan `bcryptjs`.
- Login menghasilkan JWT berisi `id`, `email`, dan `role`.
- Token berlaku 7 hari sesuai `authController.js`.
- User dengan status `suspended` tidak boleh login.

## User Management

- Status user valid saat ini: `active`, `suspended`.
- Role valid saat ini: `student`, `admin`.
- Endpoint user management hanya untuk admin dan harus melewati `verifyToken` + `isAdmin`.
- Response user tidak boleh mengembalikan password hash kecuali pada proses internal login.

## Buku

- Buku wajib memiliki `title`, `author`, dan `stock`.
- `stock` adalah jumlah total eksemplar.
- `available_stock` adalah jumlah eksemplar yang bisa dipinjam.
- Saat buku dibuat, `available_stock` mengikuti nilai awal `stock`.
- Buku dapat memiliki kategori atau `category_id = null`.
- Kategori yang dihapus akan membuat `category_id` buku menjadi `null` karena foreign key memakai `ON DELETE SET NULL`.
- QR code/token buku dibuat otomatis saat membuat buku.
- Pencarian buku dilakukan berdasarkan judul, penulis, atau ISBN.
- Filter katalog dilakukan berdasarkan kategori.

## Kategori

- Kategori memiliki `name`.
- Kategori digunakan untuk filter katalog.
- Pada kode aktual, route kategori belum diproteksi admin. Jika fitur ini dibuat lebih aman, endpoint `POST`, `PUT`, dan `DELETE` kategori sebaiknya diberi `verifyToken` + `isAdmin`.

## Transaksi Peminjaman

Target aturan PRD:

- Peminjaman dibuat saat mahasiswa/admin memindai QR buku.
- Satu transaksi menghubungkan `user_id` dan `book_id`.
- Saat buku dipinjam, `available_stock` harus berkurang.
- Saat buku dikembalikan, `available_stock` harus bertambah.
- `due_date` wajib ada.
- `return_date` diisi saat buku dikembalikan.
- `status` transaksi membedakan buku sedang dipinjam, sudah dikembalikan, atau terlambat.
- Denda dihitung dari keterlambatan setelah `due_date`.

Status kode aktual:

- Tabel `transactions` sudah dibuat di `db.js`.
- Model, controller, route, dan UI transaksi belum terlihat aktif.

## QR Code

Target PRD:

- QR digunakan untuk peminjaman dan pengembalian buku.
- QR member card digunakan untuk identitas/profil user.

Kode aktual:

- `bookModel.createBook` membuat UUID untuk `qr_code`.
- `bookController.create` memanggil util `generateBookQR`.
- Pastikan implementasi QR tidak menyimpan data sensitif seperti password atau token auth.

## Response API

Format response standar:

```json
{
  "success": true,
  "message": "Operasi berhasil",
  "data": {}
}
```

Untuk error:

```json
{
  "success": false,
  "message": "Pesan error yang bisa dipahami"
}
```

Jangan tampilkan raw stack trace ke client.

## Keamanan

- `JWT_SECRET` wajib diset di `.env` backend.
- `DATABASE_URL` tidak boleh di-commit.
- Token auth dikirim via header `Authorization`.
- Endpoint admin wajib diproteksi di backend, bukan hanya disembunyikan di mobile.
- Validasi input wajib dilakukan sebelum query database.
- Gunakan parameterized query untuk mencegah SQL injection.
