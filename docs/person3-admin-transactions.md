# Person 3 - Admin Transactions

Branch:

```text
feature/person3-admin-transactions
```

## Tujuan Fitur

Membangun halaman admin untuk memonitor dan mengelola semua transaksi peminjaman/pengembalian buku. Admin bisa melihat transaksi aktif, terlambat, selesai, serta melakukan override untuk kasus buku hilang atau rusak.

## Scope

Frontend:

- Screen Admin Manajemen Transaksi.
- Filter transaksi.
- Detail transaksi.
- Override status transaksi.

Backend:

- Endpoint list semua transaksi.
- Endpoint filter transaksi.
- Endpoint override status.

Status implementasi branch saat ini:

- Screen admin `Transaksi` sudah tersedia di tab admin.
- Admin dapat melihat semua transaksi.
- Admin dapat filter berdasarkan status, search, dan periode tanggal.
- Admin dapat melihat detail transaksi.
- Admin dapat override status ke `lost`, `damaged`, atau `returned`.
- Endpoint `GET /api/transactions` sudah tersedia dan diproteksi admin middleware.
- Endpoint `PUT /api/transactions/:id/override` sudah tersedia dan diproteksi admin middleware.
- Tabel `transactions` menyimpan `override_note`, `overridden_at`, dan `overridden_by`.

## Branch Dependency

Bergantung pada:

```text
feature/person3-transaction-backend
feature/person3-history-notification
```

## File yang Dibuat atau Diubah

Frontend:

```text
elibrary-mobile/src/screens/admin/ManageTransactionsScreen.js
elibrary-mobile/src/hooks/useTransactions.js
elibrary-mobile/src/api/transactionApi.js
elibrary-mobile/App.js
```

Backend:

```text
elibrary-backend/src/controllers/transactionController.js
elibrary-backend/src/models/transactionModel.js
elibrary-backend/src/routes/transactionRoutes.js
```

## Endpoint

### List Semua Transaksi

```text
GET /api/transactions
Authorization: Bearer <admin-token>
```

Query filter:

```text
?status=borrowed
?status=returned
?status=overdue
?user_id=1
?book_id=2
?start_date=2026-06-01
?end_date=2026-06-30
```

Response data minimal:

```json
{
  "id": 1,
  "user_id": 1,
  "user_name": "Nama Mahasiswa",
  "user_email": "student@email.com",
  "book_id": 2,
  "book_title": "Judul Buku",
  "borrow_date": "2026-06-15T00:00:00.000Z",
  "due_date": "2026-06-22T00:00:00.000Z",
  "return_date": null,
  "fine_amount": 0,
  "status": "borrowed"
}
```

### Override Status

```text
PUT /api/transactions/:id/override
Authorization: Bearer <admin-token>
```

Request body:

```json
{
  "status": "lost",
  "note": "Buku dilaporkan hilang oleh peminjam."
}
```

Status override valid:

- `lost`
- `damaged`
- `returned`

## Flow Admin

1. Admin membuka halaman Manajemen Transaksi.
2. Aplikasi mengambil semua transaksi.
3. Admin dapat memilih filter:
   - Semua
   - Dipinjam
   - Dikembalikan
   - Terlambat
   - Hilang
   - Rusak
4. Admin dapat mencari nama user atau judul buku.
5. Admin membuka detail transaksi.
6. Admin dapat melakukan override jika buku hilang/rusak.
7. Aplikasi refresh list setelah override.

## UI yang Dibutuhkan

- Search bar.
- Filter status.
- Date range filter.
- Transaction card/list.
- Badge status.
- Modal detail transaksi.
- Modal override.
- Empty state.
- Loading state.
- Error state.

## Aturan Admin

- Hanya admin yang boleh mengakses endpoint ini.
- Student tidak boleh melihat transaksi user lain.
- Override harus tercatat dengan jelas.
- Jika status override `lost` atau `damaged`, stok tidak boleh asal ditambah.

## Acceptance Criteria

- Admin bisa melihat semua transaksi.
- Admin bisa filter transaksi berdasarkan status.
- Admin bisa filter transaksi berdasarkan periode.
- Admin bisa search berdasarkan user/buku.
- Admin bisa override status transaksi.
- Endpoint terlindungi admin middleware.
- UI tetap responsif di Android, iOS, dan web.

## Cara Pengujian

### Prasyarat

Pastikan:

- Backend transaksi sudah berjalan.
- Akun admin tersedia.
- Ada beberapa transaksi dengan status berbeda:
  - `borrowed`
  - `returned`
  - `overdue`
- Jika ingin menguji override, siapkan satu transaksi aktif.

### Pengujian via Aplikasi/Web - List Transaksi

Langkah:

1. Login sebagai admin.
2. Buka halaman `Manajemen Transaksi`.
3. Tunggu data selesai dimuat.

Expected result:

- List transaksi tampil.
- Setiap transaksi menampilkan nama user, judul buku, tanggal pinjam, jatuh tempo, status, dan denda.
- Badge status tampil dengan warna sesuai status.
- Jika tidak ada data, tampil empty state.

### Pengujian via Aplikasi/Web - Filter Status

Langkah:

1. Buka halaman `Manajemen Transaksi`.
2. Pilih filter `Dipinjam`.
3. Pilih filter `Dikembalikan`.
4. Pilih filter `Terlambat`.
5. Pilih filter `Hilang` atau `Rusak` jika tersedia.

Expected result:

- List hanya menampilkan transaksi sesuai status.
- Count transaksi berubah sesuai hasil filter.
- Tidak ada data yang salah status.

### Pengujian via Aplikasi/Web - Search

Langkah:

1. Ketik nama mahasiswa pada search bar.
2. Ketik judul buku pada search bar.

Expected result:

- List menampilkan transaksi yang cocok dengan nama user atau judul buku.
- Empty state tampil jika tidak ada hasil.

### Pengujian via Aplikasi/Web - Override

Langkah:

1. Buka detail salah satu transaksi.
2. Pilih aksi override.
3. Pilih status `lost` atau `damaged`.
4. Isi catatan jika field tersedia.
5. Simpan.

Expected result:

- Muncul konfirmasi sukses.
- Status transaksi berubah.
- List refresh otomatis.
- Stok buku tidak bertambah sembarangan untuk status `lost` atau `damaged`.

### Pengujian via API - List Semua Transaksi

Request:

```http
GET http://localhost:3000/api/transactions
Authorization: Bearer <ADMIN_TOKEN>
```

Expected result:

- Status HTTP `200`.
- `success = true`.
- Data berupa array transaksi.

### Pengujian via API - Filter Status

Request:

```http
GET http://localhost:3000/api/transactions?status=borrowed
Authorization: Bearer <ADMIN_TOKEN>
```

Expected result:

- Semua item memiliki `status = borrowed`.

### Pengujian via API - Filter Periode

Request:

```http
GET http://localhost:3000/api/transactions?start_date=2026-06-01&end_date=2026-06-30
Authorization: Bearer <ADMIN_TOKEN>
```

Expected result:

- Semua transaksi berada dalam periode tersebut.

### Pengujian via API - Override Status

Request:

```http
PUT http://localhost:3000/api/transactions/1/override
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "status": "lost",
  "note": "Buku dilaporkan hilang oleh peminjam."
}
```

Expected result:

- Status HTTP `200`.
- `success = true`.
- Data transaksi memiliki `status = lost`.

### Pengujian Keamanan

Request memakai token student:

```http
GET http://localhost:3000/api/transactions
Authorization: Bearer <STUDENT_TOKEN>
```

Expected result:

- Status HTTP `403`.
- Student tidak bisa melihat semua transaksi.
