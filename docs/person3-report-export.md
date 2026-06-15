# Person 3 - Report Export

Branch:

```text
feature/person3-report-export
```

## Tujuan Fitur

Membangun fitur laporan transaksi untuk admin agar data peminjaman, pengembalian, keterlambatan, dan denda bisa dilihat berdasarkan periode serta diexport untuk kebutuhan administrasi perpustakaan.

## Scope

Frontend:

- Screen Admin Laporan.
- Filter periode.
- Ringkasan laporan.
- Tombol export.

Backend:

- Endpoint laporan transaksi.
- Endpoint export laporan.
- Query agregasi transaksi.

## Branch Dependency

Bergantung pada:

```text
feature/person3-admin-transactions
```

## File yang Dibuat atau Diubah

Frontend:

```text
elibrary-mobile/src/screens/admin/ReportScreen.js
elibrary-mobile/src/api/transactionApi.js
elibrary-mobile/src/hooks/useTransactions.js
elibrary-mobile/App.js
```

Backend:

```text
elibrary-backend/src/controllers/transactionController.js
elibrary-backend/src/models/transactionModel.js
elibrary-backend/src/routes/transactionRoutes.js
elibrary-backend/src/utils/exportReport.js
```

## Endpoint

### Preview Laporan

```text
GET /api/transactions/report
Authorization: Bearer <admin-token>
```

Query:

```text
?start_date=2026-06-01&end_date=2026-06-30
```

Response:

```json
{
  "success": true,
  "message": "Berhasil mengambil laporan transaksi.",
  "data": {
    "summary": {
      "total_transactions": 40,
      "borrowed": 10,
      "returned": 25,
      "overdue": 5,
      "total_fines": 50000
    },
    "items": []
  }
}
```

### Export Laporan

```text
GET /api/transactions/export
Authorization: Bearer <admin-token>
```

Query:

```text
?start_date=2026-06-01&end_date=2026-06-30&format=csv
```

Format awal yang disarankan:

- CSV, karena paling sederhana dan bisa dibuka Excel.

## Flow Admin

1. Admin membuka halaman Laporan.
2. Admin memilih periode tanggal.
3. Aplikasi menampilkan ringkasan laporan.
4. Aplikasi menampilkan daftar transaksi dalam periode tersebut.
5. Admin menekan tombol export.
6. Backend menghasilkan file CSV.
7. Admin mengunduh atau membuka file.

## Kolom Export

Minimal kolom CSV:

```text
transaction_id
student_name
student_email
book_title
borrow_date
due_date
return_date
status
fine_amount
```

## UI yang Dibutuhkan

- Date range input.
- Summary cards.
- List/table preview.
- Tombol export.
- Loading state.
- Empty state.
- Error state.

## Aturan

- Hanya admin yang boleh export laporan.
- Jika periode kosong, gunakan bulan berjalan sebagai default.
- Jika tidak ada data, export tetap boleh menghasilkan CSV dengan header.
- Nominal denda harus konsisten dengan data transaksi.

## Acceptance Criteria

- Admin bisa memilih periode laporan.
- Admin bisa melihat summary laporan.
- Admin bisa melihat preview transaksi.
- Admin bisa export CSV.
- Endpoint terlindungi admin middleware.
- Export tidak membuka data password atau data sensitif lain.

## Cara Pengujian

### Prasyarat

Pastikan:

- Akun admin tersedia.
- Ada transaksi pada periode yang akan diuji.
- Ada minimal satu transaksi `returned`.
- Ada minimal satu transaksi `overdue` atau transaksi dengan `fine_amount > 0` untuk menguji total denda.

### Pengujian via Aplikasi/Web - Preview Laporan

Langkah:

1. Login sebagai admin.
2. Buka halaman `Laporan`.
3. Pilih `start_date` dan `end_date`.
4. Tekan tombol tampilkan/filter laporan.

Expected result:

- Summary laporan tampil.
- Total transaksi sesuai periode.
- Total denda tampil.
- Preview transaksi tampil.
- Jika periode kosong, halaman memakai default bulan berjalan.

### Pengujian via Aplikasi/Web - Export

Langkah:

1. Setelah preview laporan tampil, tekan tombol `Export`.
2. Pilih format CSV jika ada pilihan format.
3. Tunggu proses selesai.

Expected result:

- File CSV berhasil diunduh atau dibuka.
- File berisi header kolom.
- File berisi transaksi sesuai periode.
- Tidak ada field password atau data sensitif.

### Pengujian via API - Preview Laporan

Request:

```http
GET http://localhost:3000/api/transactions/report?start_date=2026-06-01&end_date=2026-06-30
Authorization: Bearer <ADMIN_TOKEN>
```

Expected result:

- Status HTTP `200`.
- `success = true`.
- Data memiliki `summary`.
- Data memiliki `items`.
- Summary memiliki:
  - `total_transactions`
  - `borrowed`
  - `returned`
  - `overdue`
  - `total_fines`

### Pengujian via API - Export CSV

Request:

```http
GET http://localhost:3000/api/transactions/export?start_date=2026-06-01&end_date=2026-06-30&format=csv
Authorization: Bearer <ADMIN_TOKEN>
```

Expected result:

- Status HTTP `200`.
- Header response menunjukkan file CSV, misalnya `Content-Type: text/csv`.
- Body berisi CSV dengan header:

```text
transaction_id,student_name,student_email,book_title,borrow_date,due_date,return_date,status,fine_amount
```

### Pengujian via API - Periode Tanpa Data

Request:

```http
GET http://localhost:3000/api/transactions/report?start_date=2000-01-01&end_date=2000-01-31
Authorization: Bearer <ADMIN_TOKEN>
```

Expected result:

- Status HTTP `200`.
- `success = true`.
- Summary bernilai 0.
- Items berupa array kosong.

### Pengujian Keamanan

Request memakai token student:

```http
GET http://localhost:3000/api/transactions/export?start_date=2026-06-01&end_date=2026-06-30&format=csv
Authorization: Bearer <STUDENT_TOKEN>
```

Expected result:

- Status HTTP `403`.
- Student tidak bisa export laporan.
