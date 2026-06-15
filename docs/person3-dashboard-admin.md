# Person 3 - Dashboard Admin

Branch:

```text
feature/person3-dashboard-admin
```

## Tujuan Fitur

Membangun Dashboard Admin sebagai pusat ringkasan operasional perpustakaan. Dashboard ini hanya dikerjakan oleh Person 3 agar tidak terjadi konflik dengan anggota lain.

## Ownership

Dashboard Admin adalah tanggung jawab penuh Person 3.

Person A dan Person B hanya menyediakan endpoint statistik domain masing-masing:

- Person A: statistik user.
- Person B: statistik buku.

Person C mengerjakan:

- Endpoint agregator dashboard.
- API client dashboard.
- Screen Dashboard Admin.
- Integrasi ke navigasi admin.
- Layout dan visualisasi dashboard.

## Branch Dependency

Bergantung pada:

```text
feature/person3-transaction-backend
feature/person3-admin-transactions
feature/person3-report-export
```

Juga membutuhkan endpoint existing:

```text
GET /api/users/stats
GET /api/books/stats
GET /api/transactions/stats
```

## File yang Dibuat atau Diubah

Frontend:

```text
elibrary-mobile/src/screens/admin/DashboardScreen.js
elibrary-mobile/src/api/dashboardApi.js
elibrary-mobile/src/hooks/useDashboard.js
elibrary-mobile/App.js
```

Backend:

```text
elibrary-backend/src/controllers/dashboardController.js
elibrary-backend/src/routes/dashboardRoutes.js
elibrary-backend/server.js
```

## Endpoint

### Dashboard Admin

```text
GET /api/dashboard/admin
Authorization: Bearer <admin-token>
```

Response data:

```json
{
  "success": true,
  "message": "Berhasil mengambil dashboard admin.",
  "data": {
    "users": {
      "total_users": 100,
      "active_users": 95,
      "suspended_users": 5
    },
    "books": {
      "total_titles": 200,
      "total_books_stock": 500,
      "total_available_stock": 350
    },
    "transactions": {
      "active_transactions": 40,
      "overdue_transactions": 5,
      "returned_transactions": 120,
      "total_fines": 50000
    }
  }
}
```

## Flow Admin

1. Admin login.
2. Admin masuk ke Dashboard Admin.
3. Aplikasi memanggil:

```text
GET /api/dashboard/admin
```

4. Backend mengambil statistik user, buku, dan transaksi.
5. Aplikasi menampilkan summary cards.
6. Admin bisa lanjut ke:
   - Manajemen Anggota.
   - Manajemen Buku.
   - Manajemen Transaksi.
   - Laporan.

## Komponen UI

Dashboard minimal berisi:

- Card Total Anggota.
- Card Anggota Aktif.
- Card Total Judul Buku.
- Card Stok Tersedia.
- Card Transaksi Aktif.
- Card Transaksi Terlambat.
- Card Total Denda.
- Shortcut ke halaman admin lain.

Untuk web/tablet:

- Gunakan grid responsif 2-4 kolom.
- Jangan membuat card terlalu lebar.
- Gunakan max width sesuai `context/ui-design-guidelines.md`.

Untuk mobile:

- Gunakan single column atau 2 kolom kecil untuk summary cards.
- Pastikan angka dan label tidak terpotong.

## Aturan

- Hanya admin yang boleh mengakses dashboard.
- Dashboard tidak boleh memuat data password.
- Jika satu statistik gagal, dashboard sebaiknya tetap menampilkan data lain jika memungkinkan.
- Data harus berasal dari backend, bukan hardcode frontend.

## Acceptance Criteria

- Admin bisa membuka Dashboard Admin.
- Dashboard menampilkan statistik user.
- Dashboard menampilkan statistik buku.
- Dashboard menampilkan statistik transaksi.
- Dashboard punya shortcut ke halaman admin lain.
- Endpoint dashboard terlindungi admin middleware.
- UI responsif di mobile, tablet, dan web.

## Cara Pengujian

### Prasyarat

Pastikan:

- Akun admin tersedia.
- Endpoint statistik user dari Person A tersedia.
- Endpoint statistik buku dari Person B tersedia.
- Endpoint statistik transaksi dari Person C tersedia.
- Ada data user, buku, dan transaksi agar dashboard tidak kosong.

Endpoint dependency:

```text
GET /api/users/stats
GET /api/books/stats
GET /api/transactions/stats
```

### Pengujian via Aplikasi/Web - Render Dashboard

Langkah:

1. Login sebagai admin.
2. Masuk ke `Dashboard Admin`.
3. Tunggu data selesai dimuat.

Expected result:

- Dashboard tampil tanpa error.
- Card statistik user tampil.
- Card statistik buku tampil.
- Card statistik transaksi tampil.
- Total denda tampil.
- Shortcut ke Manajemen Anggota, Manajemen Buku, Manajemen Transaksi, dan Laporan tersedia.

### Pengujian via Aplikasi/Web - Responsif

Langkah:

1. Buka dashboard di web.
2. Resize browser ke lebar mobile.
3. Resize browser ke lebar tablet.
4. Resize browser ke lebar desktop.

Expected result:

- Mobile: card tidak terpotong.
- Tablet: grid lebih lega.
- Desktop: card tidak melebar berlebihan.
- Teks dan angka tetap terbaca.

### Pengujian via Aplikasi/Web - Shortcut

Langkah:

1. Tekan shortcut `Manajemen Anggota`.
2. Kembali ke dashboard.
3. Tekan shortcut `Manajemen Buku`.
4. Kembali ke dashboard.
5. Tekan shortcut `Manajemen Transaksi`.
6. Kembali ke dashboard.
7. Tekan shortcut `Laporan`.

Expected result:

- Setiap shortcut membawa admin ke halaman yang benar.
- Tidak ada navigation error.

### Pengujian via API - Dashboard Admin

Request:

```http
GET http://localhost:3000/api/dashboard/admin
Authorization: Bearer <ADMIN_TOKEN>
```

Expected result:

- Status HTTP `200`.
- `success = true`.
- Data memiliki object:
  - `users`
  - `books`
  - `transactions`

Contoh field yang wajib dicek:

```text
data.users.total_users
data.books.total_titles
data.transactions.active_transactions
data.transactions.total_fines
```

### Pengujian via API - Dependency Statistik

Uji endpoint dependency satu per satu:

```http
GET http://localhost:3000/api/users/stats
Authorization: Bearer <ADMIN_TOKEN>
```

```http
GET http://localhost:3000/api/books/stats
Authorization: Bearer <ADMIN_TOKEN>
```

```http
GET http://localhost:3000/api/transactions/stats
Authorization: Bearer <ADMIN_TOKEN>
```

Expected result:

- Semua endpoint mengembalikan status HTTP `200`.
- Semua response memiliki format `{ success, message, data }`.

### Pengujian Keamanan

Request memakai token student:

```http
GET http://localhost:3000/api/dashboard/admin
Authorization: Bearer <STUDENT_TOKEN>
```

Expected result:

- Status HTTP `403`.
- Student tidak bisa membuka dashboard admin.

Request tanpa token:

```http
GET http://localhost:3000/api/dashboard/admin
```

Expected result:

- Status HTTP `401`.
- Message menjelaskan token tidak ditemukan atau tidak valid.
