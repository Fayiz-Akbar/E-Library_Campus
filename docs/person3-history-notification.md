# Person 3 - History and Notification

Branch:

```text
feature/person3-history-notification
```

## Tujuan Fitur

Membangun halaman riwayat peminjaman dan notifikasi jatuh tempo untuk mahasiswa. Fitur ini membantu user melihat status buku yang sedang dipinjam, buku yang sudah dikembalikan, keterlambatan, dan denda.

## Scope

Frontend:

- Screen Riwayat Peminjaman.
- Screen Notifikasi.
- Hook transaksi user.
- Integrasi endpoint history.

Backend:

- Endpoint history user.
- Query transaksi dengan join ke data buku.
- Data notifikasi jatuh tempo.

Status implementasi branch saat ini:

- Screen `Riwayat` sudah tersedia sebagai tab mahasiswa.
- Screen `Notification` sudah tersedia dari tombol notifikasi di halaman Riwayat.
- Filter riwayat `Semua`, `Dipinjam`, `Dikembalikan`, dan `Terlambat` sudah aktif.
- Endpoint `GET /api/transactions/history/:user_id` sudah mendukung query `status`.
- Endpoint `GET /api/transactions/notifications` sudah tersedia.
- Notifikasi menampilkan transaksi aktif yang terlambat atau akan jatuh tempo dalam 24 jam.
- Notifikasi juga menampilkan aktivitas peminjaman dan pengembalian yang berhasil dalam 24 jam terakhir.

## Branch Dependency

Bergantung pada:

```text
feature/person3-transaction-backend
```

## File yang Dibuat atau Diubah

Frontend:

```text
elibrary-mobile/src/screens/student/HistoryScreen.js
elibrary-mobile/src/screens/student/NotificationScreen.js
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

### Riwayat User

```text
GET /api/transactions/history/:user_id
Authorization: Bearer <token>
```

Query opsional:

```text
?status=borrowed
?status=returned
?status=overdue
```

Response data minimal:

```json
{
  "id": 1,
  "book_id": 2,
  "title": "Judul Buku",
  "author": "Nama Penulis",
  "cover_image": "https://...",
  "borrow_date": "2026-06-15T00:00:00.000Z",
  "due_date": "2026-06-22T00:00:00.000Z",
  "return_date": null,
  "fine_amount": 0,
  "status": "borrowed"
}
```

### Notifikasi Jatuh Tempo

Opsi endpoint:

```text
GET /api/transactions/notifications
Authorization: Bearer <token>
```

Data yang dikembalikan:

- Buku yang akan jatuh tempo dalam 24 jam.
- Buku yang sudah terlambat.
- Nominal denda sementara jika overdue.
- Aktivitas peminjaman yang berhasil.
- Aktivitas pengembalian yang berhasil.

## Flow Riwayat

1. User membuka halaman Riwayat.
2. Aplikasi mengambil data transaksi user.
3. User bisa filter:
   - Semua
   - Dipinjam
   - Dikembalikan
   - Terlambat
4. Aplikasi menampilkan list transaksi.
5. User bisa melihat detail status, tanggal pinjam, jatuh tempo, tanggal kembali, dan denda.

## Flow Notifikasi

1. User membuka halaman Notifikasi.
2. Aplikasi mengambil transaksi aktif.
3. Sistem menandai transaksi:
   - Akan jatuh tempo dalam 24 jam.
   - Terlambat.
   - Berhasil dipinjam.
   - Berhasil dikembalikan.
4. User melihat pesan reminder atau aktivitas transaksi.
5. User bisa menuju scan pengembalian untuk buku yang masih aktif.

## Aturan Status Tampilan

Badge status:

- `Dipinjam`: status `borrowed`.
- `Dikembalikan`: status `returned`.
- `Terlambat`: status `overdue` atau due date sudah lewat.

Warna:

- Success untuk dikembalikan.
- Warning untuk hampir jatuh tempo.
- Danger untuk terlambat/denda.
- Info untuk dipinjam aktif.

## Empty State

Riwayat kosong:

```text
Belum ada riwayat peminjaman.
```

Notifikasi kosong:

```text
Tidak ada notifikasi jatuh tempo.
```

## Acceptance Criteria

- User bisa melihat semua riwayat peminjaman.
- User bisa filter riwayat berdasarkan status.
- User bisa melihat denda pada transaksi terlambat.
- Notifikasi menampilkan buku mendekati jatuh tempo.
- Notifikasi menampilkan buku terlambat.
- Loading, empty, dan error state tersedia.

## Cara Pengujian

### Prasyarat

Pastikan:

- Backend transaksi sudah berjalan.
- Student sudah login.
- Student memiliki minimal satu transaksi `borrowed`.
- Student memiliki minimal satu transaksi `returned`.
- Untuk menguji overdue, siapkan transaksi dengan `due_date` lebih kecil dari tanggal hari ini.

### Pengujian via Aplikasi - Riwayat Semua Transaksi

Langkah:

1. Login sebagai student.
2. Buka halaman `Riwayat`.
3. Tunggu data selesai dimuat.

Expected result:

- List riwayat tampil.
- Setiap item menampilkan judul buku, penulis, tanggal pinjam, jatuh tempo, status, dan denda.
- Jika tidak ada data, tampil empty state.

### Pengujian via Aplikasi - Filter Riwayat

Langkah:

1. Buka halaman `Riwayat`.
2. Pilih filter `Dipinjam`.
3. Pilih filter `Dikembalikan`.
4. Pilih filter `Terlambat`.

Expected result:

- Filter `Dipinjam` hanya menampilkan transaksi aktif.
- Filter `Dikembalikan` hanya menampilkan transaksi selesai.
- Filter `Terlambat` hanya menampilkan transaksi overdue.
- Count/list berubah sesuai filter.

### Pengujian via Aplikasi - Notifikasi

Langkah:

1. Login sebagai student.
2. Buka halaman `Notifikasi`.
3. Periksa list reminder.

Expected result:

- Buku yang akan jatuh tempo muncul sebagai warning.
- Buku yang sudah terlambat muncul sebagai danger.
- Jika tidak ada reminder, tampil empty state.

### Pengujian via API - Riwayat User

Request:

```http
GET http://localhost:3000/api/transactions/history/1
Authorization: Bearer <STUDENT_TOKEN>
```

Expected result:

- Status HTTP `200`.
- `success = true`.
- Data berupa array.
- Setiap item memiliki:
  - `book_id`
  - `title`
  - `borrow_date`
  - `due_date`
  - `return_date`
  - `fine_amount`
  - `status`

### Pengujian via API - Filter Status

Request:

```http
GET http://localhost:3000/api/transactions/history/1?status=borrowed
Authorization: Bearer <STUDENT_TOKEN>
```

Expected result:

- Semua item memiliki `status = borrowed`.

Ulangi untuk:

```text
status=returned
status=overdue
```

### Pengujian via API - Notifikasi

Request:

```http
GET http://localhost:3000/api/transactions/notifications
Authorization: Bearer <STUDENT_TOKEN>
```

Expected result:

- Status HTTP `200`.
- Data berisi transaksi mendekati jatuh tempo atau terlambat.
- Item overdue menampilkan estimasi denda jika ada.

### Pengujian Keamanan

Student mencoba melihat riwayat user lain:

```http
GET http://localhost:3000/api/transactions/history/999
Authorization: Bearer <STUDENT_TOKEN>
```

Expected result:

- Status HTTP `403`.
- Student tidak boleh melihat riwayat user lain.

Admin melihat riwayat user lain:

```http
GET http://localhost:3000/api/transactions/history/999
Authorization: Bearer <ADMIN_TOKEN>
```

Expected result:

- Status HTTP `200` jika user/transaksi tersedia.
