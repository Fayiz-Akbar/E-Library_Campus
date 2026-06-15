# Person 3 Roadmap Branch - Transaksi, QR, Laporan, Dashboard

Dokumen ini menjadi peta kerja Person 3 untuk domain **Transaksi & QR Scanning**. Scope Person 3 mencakup backend transaksi, scan QR, peminjaman, pengembalian, denda, riwayat, notifikasi, admin transaksi, laporan, dan Dashboard Admin.

## Prinsip Branch

- Satu branch mewakili satu fitur vertical slice yang jelas.
- Branch boleh menyentuh backend dan frontend selama masih dalam domain Person 3.
- Jangan mengerjakan Dashboard Admin bersama anggota lain. Dashboard Admin adalah ownership Person 3.
- Jika butuh data dari Person A atau Person B, gunakan endpoint statistik/endpoint existing, bukan mengubah domain mereka tanpa koordinasi.
- Setiap branch harus memiliki dokumentasi fitur, minimal salah satu file `person3-namafitur.md` di folder `docs`.

## Daftar Branch Person 3

| Urutan | Branch | Dokumentasi | Fokus |
| --- | --- | --- | --- |
| 1 | `feature/person3-transaction-backend` | `person3-transaction-backend.md` | Model, route, controller, borrow, return, denda |
| 2 | `feature/person3-scan-qr` | `person3-scan-qr.md` | Screen scan QR, mode pinjam/kembali, fallback web |
| 3 | `feature/person3-history-notification` | `person3-history-notification.md` | Riwayat user, notifikasi jatuh tempo |
| 4 | `feature/person3-admin-transactions` | `person3-admin-transactions.md` | Admin list transaksi, filter, override |
| 5 | `feature/person3-report-export` | `person3-report-export.md` | Laporan transaksi dan export |
| 6 | `feature/person3-dashboard-admin` | `person3-dashboard-admin.md` | Dashboard Admin gabungan statistik |

## Urutan Pengerjaan

1. Kerjakan backend transaksi dulu karena fitur frontend Person 3 bergantung pada API ini.
2. Setelah borrow/return stabil, kerjakan screen scan QR.
3. Setelah transaksi tercatat, kerjakan riwayat dan notifikasi.
4. Setelah data transaksi cukup lengkap, kerjakan admin transaksi.
5. Setelah filter admin transaksi stabil, kerjakan laporan/export.
6. Dashboard Admin dikerjakan terakhir oleh Person 3 karena membutuhkan statistik dari User, Buku, dan Transaksi.

## Dependency Antar Domain

Person 3 bergantung pada:

- User dari Person A:
  - `users.id`
  - JWT token
  - role `student`/`admin`
  - endpoint statistik user
- Buku dari Person B:
  - `books.id`
  - `books.qr_code`
  - `books.available_stock`
  - endpoint statistik buku

Person 3 tidak boleh:

- Mengubah flow login/register tanpa koordinasi Person A.
- Mengubah struktur buku/kategori tanpa koordinasi Person B.
- Mengubah desain global/tab navigation tanpa mencatat dampaknya.

## File Bersama yang Perlu Hati-hati

```text
elibrary-mobile/App.js
elibrary-mobile/src/api/axiosInstance.js
elibrary-mobile/src/utils/responsive.js
elibrary-backend/server.js
elibrary-backend/src/config/db.js
```

Jika branch Person 3 perlu menambah route baru di `server.js`, gunakan base path:

```text
/api/transactions
/api/dashboard
```

## Definition of Done Person 3

Satu branch Person 3 dianggap selesai jika:

- Endpoint backend tersedia dan response konsisten.
- Screen mobile terhubung ke API.
- Loading state, empty state, dan error state tersedia.
- Role access benar: student untuk fitur pribadi, admin untuk fitur admin.
- Data transaksi tersimpan dan stok buku berubah sesuai aksi.
- Dokumentasi fitur di `docs/person3-namafitur.md` diperbarui.
- Tidak merusak fitur Person A dan Person B.

## Checklist Integrasi Person 3

- Student bisa pinjam buku.
- Student bisa kembalikan buku.
- Stok buku berkurang saat dipinjam.
- Stok buku bertambah saat dikembalikan.
- Transaksi aktif muncul di riwayat.
- Denda muncul jika terlambat.
- Admin bisa melihat semua transaksi.
- Admin bisa filter transaksi.
- Admin bisa override status lost/damaged.
- Admin bisa export laporan.
- Dashboard Admin menampilkan statistik gabungan.
