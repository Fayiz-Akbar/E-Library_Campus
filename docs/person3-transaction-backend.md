# Person 3 - Transaction Backend

Branch:

```text
feature/person3-transaction-backend
```

## Tujuan Fitur

Membangun fondasi backend untuk seluruh proses transaksi perpustakaan: pinjam buku, kembalikan buku, hitung denda, status transaksi, statistik transaksi, dan data yang akan dipakai oleh fitur scan QR, riwayat, admin transaksi, laporan, serta dashboard admin.

## Scope

Fitur ini fokus pada backend:

- Model transaksi.
- Controller transaksi.
- Routes transaksi.
- Util hitung denda.
- Validasi stok buku.
- Update `available_stock`.
- Statistik transaksi.

## File yang Dibuat atau Diubah

Backend:

```text
elibrary-backend/src/models/transactionModel.js
elibrary-backend/src/controllers/transactionController.js
elibrary-backend/src/routes/transactionRoutes.js
elibrary-backend/src/utils/calculateFine.js
elibrary-backend/server.js
elibrary-backend/src/config/db.js
```

Opsional jika dibutuhkan:

```text
elibrary-backend/src/utils/transactionStatus.js
```

## Database

Tabel utama:

```text
transactions
```

Field yang dipakai:

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

Status transaksi:

- `borrowed`: buku sedang dipinjam.
- `returned`: buku sudah dikembalikan.
- `overdue`: buku terlambat dikembalikan.
- `lost`: buku dinyatakan hilang oleh admin.
- `damaged`: buku dinyatakan rusak oleh admin.

## Endpoint

### Pinjam Buku

```text
POST /api/transactions/borrow
Authorization: Bearer <token>
```

Request body:

```json
{
  "book_id": 1
}
```

Alternatif untuk QR:

```json
{
  "qr_code": "BOOK-QR-TOKEN"
}
```

Flow:

1. Backend verifikasi JWT.
2. Ambil `user_id` dari token.
3. Validasi user masih aktif.
4. Cari buku berdasarkan `book_id` atau `qr_code`.
5. Validasi buku ada.
6. Validasi `available_stock > 0`.
7. Cek user tidak punya transaksi aktif untuk buku yang sama.
8. Buat transaksi baru dengan status `borrowed`.
9. Set `due_date`, contoh 7 hari dari `borrow_date`.
10. Kurangi `books.available_stock` sebanyak 1.
11. Return transaksi dan data buku.

Response sukses:

```json
{
  "success": true,
  "message": "Buku berhasil dipinjam.",
  "data": {
    "transaction": {},
    "book": {}
  }
}
```

Error penting:

- Buku tidak ditemukan.
- Stok tidak tersedia.
- User masih punya transaksi aktif untuk buku yang sama.
- Token tidak valid.

### Kembalikan Buku

```text
POST /api/transactions/return
Authorization: Bearer <token>
```

Request body:

```json
{
  "book_id": 1
}
```

Alternatif untuk QR:

```json
{
  "qr_code": "BOOK-QR-TOKEN"
}
```

Flow:

1. Backend verifikasi JWT.
2. Cari buku berdasarkan `book_id` atau `qr_code`.
3. Cari transaksi aktif milik user untuk buku tersebut.
4. Jika tidak ada transaksi aktif, return error.
5. Hitung keterlambatan berdasarkan `due_date`.
6. Hitung denda.
7. Update transaksi:
   - `return_date = now`
   - `fine_amount = hasil denda`
   - `status = returned`
8. Tambah `books.available_stock` sebanyak 1.
9. Return detail transaksi pengembalian.

Response sukses:

```json
{
  "success": true,
  "message": "Buku berhasil dikembalikan.",
  "data": {
    "transaction": {},
    "fine_amount": 0
  }
}
```

### Riwayat User

```text
GET /api/transactions/history/:user_id
Authorization: Bearer <token>
```

Aturan:

- Student hanya boleh melihat riwayat dirinya sendiri.
- Admin boleh melihat riwayat user mana pun.

### Statistik Transaksi

```text
GET /api/transactions/stats
Authorization: Bearer <admin-token>
```

Data minimal:

```json
{
  "active_transactions": 10,
  "overdue_transactions": 2,
  "returned_transactions": 30,
  "total_fines": 15000
}
```

## Aturan Denda

Aturan awal yang disarankan:

- Masa pinjam: 7 hari.
- Denda: Rp1.000 per hari keterlambatan.
- Jika dikembalikan sebelum atau tepat `due_date`, denda 0.

Util:

```text
calculateFine(dueDate, returnDate)
```

Return:

```js
{
  lateDays: 0,
  fineAmount: 0
}
```

## Acceptance Criteria

- Borrow berhasil membuat transaksi.
- Borrow mengurangi `available_stock`.
- Borrow gagal jika stok 0.
- Borrow gagal jika buku tidak ditemukan.
- Return berhasil menutup transaksi aktif.
- Return menambah `available_stock`.
- Return menghitung denda jika terlambat.
- Riwayat user bisa diambil.
- Statistik transaksi bisa diambil admin.
- Semua query menggunakan parameterized query.

## Cara Pengujian

### Prasyarat

Sebelum menguji, pastikan:

- Backend berjalan di `http://localhost:3000`.
- Database Supabase aktif.
- Minimal ada satu akun student.
- Minimal ada satu akun admin.
- Minimal ada satu buku dengan `available_stock > 0`.
- Student dan admin sudah bisa login.

Ambil token student:

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "student@email.com",
  "password": "password123"
}
```

Ambil token admin:

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@elibrary.com",
  "password": "admin123"
}
```

Simpan token dari response:

```text
data.token
```

### Pengujian via API - Pinjam Buku

Request:

```http
POST http://localhost:3000/api/transactions/borrow
Authorization: Bearer <STUDENT_TOKEN>
Content-Type: application/json

{
  "book_id": 1
}
```

Expected result:

- Status HTTP `201` atau `200`.
- `success` bernilai `true`.
- Response berisi data transaksi.
- `status` transaksi bernilai `borrowed`.
- `due_date` terisi.
- `available_stock` buku berkurang 1.

Cek stok buku:

```http
GET http://localhost:3000/api/books/1
Authorization: Bearer <STUDENT_TOKEN>
```

Expected result:

- `available_stock` lebih kecil dari stok sebelum peminjaman.

### Pengujian via API - Pinjam Buku Stok Habis

Kondisi:

- Gunakan buku dengan `available_stock = 0`.

Request:

```http
POST http://localhost:3000/api/transactions/borrow
Authorization: Bearer <STUDENT_TOKEN>
Content-Type: application/json

{
  "book_id": 99
}
```

Expected result:

- Status HTTP `400` atau `409`.
- `success` bernilai `false`.
- Message menjelaskan stok tidak tersedia.
- Tidak ada transaksi baru dibuat.

### Pengujian via API - Kembalikan Buku

Request:

```http
POST http://localhost:3000/api/transactions/return
Authorization: Bearer <STUDENT_TOKEN>
Content-Type: application/json

{
  "book_id": 1
}
```

Expected result:

- Status HTTP `200`.
- `success` bernilai `true`.
- `status` transaksi menjadi `returned`.
- `return_date` terisi.
- `fine_amount` terisi, minimal `0`.
- `available_stock` buku bertambah 1.

### Pengujian via API - Return Tanpa Transaksi Aktif

Request:

```http
POST http://localhost:3000/api/transactions/return
Authorization: Bearer <STUDENT_TOKEN>
Content-Type: application/json

{
  "book_id": 1
}
```

Expected result jika buku sudah dikembalikan sebelumnya:

- Status HTTP `404` atau `400`.
- `success` bernilai `false`.
- Message menjelaskan tidak ada transaksi aktif.

### Pengujian via API - Riwayat User

Request:

```http
GET http://localhost:3000/api/transactions/history/1
Authorization: Bearer <STUDENT_TOKEN>
```

Expected result:

- Status HTTP `200`.
- `success` bernilai `true`.
- Data berupa array transaksi.
- Transaksi yang baru dibuat muncul di list.

### Pengujian via API - Statistik Transaksi Admin

Request:

```http
GET http://localhost:3000/api/transactions/stats
Authorization: Bearer <ADMIN_TOKEN>
```

Expected result:

- Status HTTP `200`.
- `success` bernilai `true`.
- Data memiliki:
  - `active_transactions`
  - `overdue_transactions`
  - `returned_transactions`
  - `total_fines`

### Pengujian via API - Proteksi Admin

Request dengan token student:

```http
GET http://localhost:3000/api/transactions/stats
Authorization: Bearer <STUDENT_TOKEN>
```

Expected result:

- Status HTTP `403`.
- `success` bernilai `false`.
- Message menjelaskan akses hanya untuk admin.

### Pengujian dari Aplikasi/Web

Jika screen frontend belum tersedia, pengujian aplikasi dilakukan setelah branch `person3-scan-qr` dan `person3-history-notification`.

Flow yang harus diuji setelah frontend tersedia:

1. Login sebagai student.
2. Buka detail buku.
3. Tekan tombol `Pinjam`.
4. Pastikan muncul pesan sukses.
5. Buka riwayat.
6. Pastikan transaksi muncul dengan status `Dipinjam`.
7. Kembalikan buku dari scan QR atau tombol return.
8. Pastikan status berubah menjadi `Dikembalikan`.
