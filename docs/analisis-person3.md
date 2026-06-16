# Analisis Person 3 - Transaksi, QR, Laporan, dan Dashboard

Tanggal analisis: 2026-06-15

Dokumen ini merangkum seluruh pekerjaan Person 3 berdasarkan `context/`, `docs/`, dan `context/changelog.md`. Fokus Person 3 adalah domain transaksi perpustakaan: peminjaman, pengembalian, scan QR, riwayat, notifikasi, admin transaksi, laporan/export, dan dashboard admin.

## Ringkasan Status

Secara umum, seluruh roadmap utama Person 3 sudah diimplementasikan:

- Backend transaksi dasar sudah aktif.
- Scan QR mahasiswa sudah memakai kamera perangkat melalui `expo-camera`.
- Riwayat dan notifikasi mahasiswa sudah aktif.
- Admin transaksi sudah aktif.
- Laporan dan export CSV sudah aktif.
- Dashboard admin gabungan statistik sudah aktif.

Sisa fitur yang masih tercatat belum aktif adalah cron job atau FCM notification. Notifikasi saat ini bersifat on-demand saat user membuka screen `Notification`, bukan push notification otomatis.

## Roadmap dan Realisasi

| Urutan | Branch/Fitur | Status | Catatan |
| --- | --- | --- | --- |
| 1 | Transaction Backend | Selesai | Borrow, return, history, stats, denda, atomic stock update |
| 2 | Scan QR | Selesai | Awalnya fallback manual, lalu ditingkatkan memakai kamera perangkat |
| 3 | History Notification | Selesai | Riwayat, filter status, notifikasi jatuh tempo |
| 4 | Admin Transactions | Selesai | List semua transaksi, filter, search, detail, override |
| 5 | Report Export | Selesai | Preview laporan periode dan export CSV |
| 6 | Dashboard Admin | Selesai | Aggregator statistik user, buku, transaksi |

## Backend

### Base Route

Backend Person 3 memakai dua base route utama:

```text
/api/transactions
/api/dashboard
```

Route `/api/transactions` didaftarkan di `elibrary-backend/server.js`.
Route `/api/dashboard` juga sudah didaftarkan di `elibrary-backend/server.js`.

### Endpoint Transaksi Mahasiswa

| Method | Endpoint | Fungsi | Akses |
| --- | --- | --- | --- |
| POST | `/api/transactions/borrow` | Meminjam buku berdasarkan `book_id` atau `qr_code` | Login |
| POST | `/api/transactions/return` | Mengembalikan buku berdasarkan `book_id` atau `qr_code` | Login |
| GET | `/api/transactions/history/:user_id` | Riwayat transaksi user | User sendiri atau admin |
| GET | `/api/transactions/notifications` | Notifikasi jatuh tempo/terlambat | Login |

Analisis:

- Borrow dan return sudah memakai SQL transaction dengan `BEGIN`, `COMMIT`, `ROLLBACK`.
- Stok buku dikurangi saat peminjaman.
- Stok buku ditambah saat pengembalian dengan batas maksimum `books.stock`.
- Denda dihitung menggunakan util `calculateFine`.
- Status `overdue` dihitung dinamis dari `due_date` untuk tampilan/filter.

### Endpoint Admin Transaksi

| Method | Endpoint | Fungsi | Akses |
| --- | --- | --- | --- |
| GET | `/api/transactions` | List semua transaksi dengan filter | Admin |
| PUT | `/api/transactions/:id/override` | Override status transaksi | Admin |
| GET | `/api/transactions/stats` | Statistik transaksi | Admin |

Filter admin transaksi:

```text
status
user_id
book_id
start_date
end_date
search
```

Status yang didukung:

```text
borrowed
returned
overdue
lost
damaged
```

Analisis:

- Endpoint admin dilindungi `verifyToken` dan `isAdmin`.
- Override `lost` dan `damaged` tidak menambah stok.
- Override `returned` menambah stok hanya jika transaksi sebelumnya aktif dan belum punya `return_date`.
- Override menyimpan audit minimal melalui `override_note`, `overridden_at`, dan `overridden_by`.

### Endpoint Laporan dan Export

| Method | Endpoint | Fungsi | Akses |
| --- | --- | --- | --- |
| GET | `/api/transactions/report` | Preview laporan transaksi periode | Admin |
| GET | `/api/transactions/export` | Export CSV laporan transaksi | Admin |

Aturan laporan:

- Jika periode kosong, backend memakai bulan berjalan.
- Export CSV tetap menghasilkan header walaupun tidak ada transaksi.
- Export tidak menyertakan password atau data sensitif.

Kolom CSV:

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

Analisis:

- Util `exportReport.js` sudah menangani escaping CSV.
- Format export awal hanya CSV, sesuai scope.
- Pada mobile native, export ditampilkan sebagai preview teks karena belum memakai file helper native.

### Endpoint Dashboard

| Method | Endpoint | Fungsi | Akses |
| --- | --- | --- | --- |
| GET | `/api/dashboard/admin` | Aggregator statistik user, buku, transaksi | Admin |

Sumber data:

- `userModel.getUserStatistics`
- `bookModel.getBookStatistics`
- `transactionModel.getTransactionStatistics`

Analisis:

- Dashboard tidak hardcode data di frontend.
- Aggregator memakai `Promise.all`.
- Jika salah satu statistik gagal, backend mengembalikan fallback nol dan field `warnings`.
- Pendekatan ini menjaga dashboard tetap tampil sebagian saat satu domain bermasalah.

## Database

Tabel utama Person 3:

```text
transactions
```

Field transaksi utama:

- `user_id`
- `book_id`
- `borrow_date`
- `due_date`
- `return_date`
- `fine_amount`
- `status`

Field tambahan untuk admin override:

- `override_note`
- `overridden_at`
- `overridden_by`

Index transaksi:

- `idx_transactions_user_id`
- `idx_transactions_book_id`
- `idx_transactions_status`
- `idx_transactions_active_user_book`

Analisis:

- Struktur tabel sudah cukup untuk transaksi dasar, monitoring admin, dan audit override sederhana.
- Untuk audit yang lebih kuat, nanti bisa dibuat tabel terpisah seperti `transaction_audits`, tetapi belum wajib untuk scope saat ini.

## Mobile

### Navigasi Mahasiswa

Tab mahasiswa saat ini:

```text
Home
Katalog
Scan QR
Riwayat
Profil
```

Stack tambahan:

```text
Notification
BookDetail
```

### Navigasi Admin

Tab admin saat ini:

```text
Dashboard
Kelola Buku
Kelola Anggota
Transaksi
Laporan
Profil Admin
```

Analisis:

- Semua fitur Person 3 sudah masuk ke navigasi utama.
- Jumlah tab admin cukup banyak untuk layar kecil. Secara fungsional aman, tetapi secara UX bisa dipertimbangkan memakai drawer/menu admin di fase berikutnya.

## Mobile API dan Hooks

### API

| File | Fungsi |
| --- | --- |
| `transactionApi.js` | Borrow/return QR, history, notifications, admin transactions, override, report, export |
| `dashboardApi.js` | Fetch dashboard admin |
| `borrowApi.js` | Wrapper peminjaman buku via endpoint transaksi |

### Hooks

| File | Fungsi |
| --- | --- |
| `useQRScanner.js` | Mode pinjam/kembali, proses QR, loading/error/success, proteksi double submit |
| `useTransactions.js` | Riwayat, notifikasi, admin transaksi, laporan |
| `useDashboard.js` | Dashboard admin |

Analisis:

- Struktur hook sudah memisahkan state dan API call dari screen.
- `useTransactions.js` menjadi file yang cukup besar karena menaungi banyak domain turunan. Masih dapat diterima, tetapi jika fitur berkembang bisa dipecah menjadi `useTransactionHistory`, `useAdminTransactions`, dan `useTransactionReport`.

## Mobile Screens Person 3

| Screen | Status | Fungsi |
| --- | --- | --- |
| `ScanQRScreen` | Aktif | Scan QR/barcode kamera, fallback manual, pinjam/kembali |
| `HistoryScreen` | Aktif | Riwayat peminjaman dengan filter status |
| `NotificationScreen` | Aktif | Reminder jatuh tempo dan overdue |
| `ManageTransactionsScreen` | Aktif | Admin list/filter/search/detail/override transaksi |
| `ReportScreen` | Aktif | Admin preview laporan dan export CSV |
| `DashboardScreen` | Aktif | Admin statistik gabungan dan shortcut |

## Flow Utama

### Flow Pinjam via QR

```text
Student login
  -> buka Scan QR
  -> pilih mode Pinjam
  -> scan QR/barcode buku
  -> mobile kirim POST /api/transactions/borrow
  -> backend validasi token, user, buku, stok
  -> backend buat transaksi
  -> backend kurangi available_stock
  -> mobile tampilkan hasil
```

### Flow Kembali via QR

```text
Student buka Scan QR
  -> pilih mode Kembalikan
  -> scan QR/barcode buku
  -> mobile kirim POST /api/transactions/return
  -> backend cari transaksi aktif
  -> backend hitung denda jika terlambat
  -> backend set returned
  -> backend tambah available_stock
  -> mobile tampilkan hasil
```

### Flow Riwayat dan Notifikasi

```text
Student buka Riwayat
  -> mobile fetch history user
  -> user filter status
  -> student buka Notifikasi
  -> mobile fetch transaksi aktif yang due soon/overdue
```

### Flow Admin Transaksi

```text
Admin buka Transaksi
  -> mobile fetch semua transaksi
  -> admin filter/search/periode
  -> admin buka detail
  -> admin override lost/damaged/returned
  -> backend simpan audit override
  -> mobile refresh list
```

### Flow Laporan dan Dashboard

```text
Admin buka Laporan
  -> mobile fetch report periode
  -> admin export CSV

Admin buka Dashboard
  -> mobile fetch /api/dashboard/admin
  -> backend agregasi user, buku, transaksi
  -> mobile tampilkan summary dan shortcut
```

## Kesesuaian dengan Definition of Done

| Kriteria | Status | Catatan |
| --- | --- | --- |
| Endpoint backend tersedia | Terpenuhi | Semua endpoint utama Person 3 sudah ada |
| Response konsisten `{ success, message, data }` | Terpenuhi | Kecuali export CSV yang memang response file/text |
| Screen mobile terhubung API | Terpenuhi | Semua screen Person 3 memakai API client |
| Loading state | Terpenuhi | Ada di screen utama |
| Empty state | Terpenuhi | Ada di riwayat, notifikasi, admin transaksi, laporan |
| Error state | Terpenuhi | Ada di hook/screen |
| Role access benar | Terpenuhi | Admin endpoint memakai middleware admin, history user dibatasi |
| Stok berubah sesuai transaksi | Terpenuhi | Borrow/return atomic |
| Dokumentasi fitur diperbarui | Terpenuhi | Semua `docs/person3-*.md` tersedia |

## Risiko dan Catatan Teknis

1. Push notification belum ada.

   Notifikasi saat ini hanya muncul saat screen dibuka. Jika ingin reminder otomatis, perlu implementasi FCM/Expo Notifications dan cron/scheduler backend.

2. Export native masih berupa preview teks.

   Web sudah bisa download CSV. Untuk Android/iOS yang lebih nyaman, bisa tambah `expo-file-system` dan `expo-sharing`.

3. Audit override masih sederhana.

   Field `override_note`, `overridden_at`, dan `overridden_by` cukup untuk scope awal. Jika perlu histori perubahan berlapis, tambahkan tabel `transaction_audits`.

4. Admin tab cukup banyak.

   Admin memiliki enam tab. Pada layar kecil, UX bisa terasa padat. Alternatif berikutnya: drawer navigation atau dashboard shortcut sebagai entry point dengan tab lebih sedikit.

5. Validasi tanggal masih berbasis string input.

   Report dan admin transaction memakai input `YYYY-MM-DD`. Lebih nyaman jika nanti memakai date picker.

6. QR buku lama perlu diperhatikan.

   Buku yang dibuat sebelum fitur QR final mungkin tidak memiliki `qr_code`. Admin sudah diberi peringatan di Manajemen Buku, tetapi migration atau action generate ulang QR bisa dipertimbangkan.

7. Audit dependency npm.

   Saat pemasangan `expo-camera`, npm melaporkan `11 moderate severity vulnerabilities`. Belum diperbaiki karena `npm audit fix --force` berpotensi breaking changes.

## Rekomendasi Lanjutan

Prioritas teknis:

1. Tambahkan proteksi admin untuk mutation kategori jika belum diproteksi.
2. Tambahkan date picker untuk filter periode admin transaksi dan laporan.
3. Tambahkan file sharing native untuk export CSV di Android/iOS.
4. Tambahkan push notification jatuh tempo jika waktu memungkinkan.
5. Tambahkan tabel audit transaksi jika override perlu histori lengkap.
6. Tambahkan pengujian API otomatis untuk borrow, return, history, admin list, report, export, dashboard.
7. Tambahkan dokumentasi endpoint API terpusat.

Prioritas UX:

1. Evaluasi jumlah tab admin pada layar kecil.
2. Tambahkan badge jumlah notifikasi di Home berdasarkan endpoint notifications.
3. Tambahkan shortcut dari dashboard ke action yang paling sering dipakai.
4. Tambahkan state sukses yang lebih informatif setelah override dan export.

## Kesimpulan

Implementasi Person 3 sudah memenuhi scope utama: transaksi dasar, scan QR kamera, riwayat, notifikasi, admin transaksi, laporan/export, dan dashboard admin. Arsitektur yang dipakai sudah cukup maintainable karena ada pemisahan antara route/controller/model di backend serta API/hook/screen di mobile.

Area yang paling penting untuk fase berikutnya bukan menambah fitur inti baru, tetapi memperkuat kualitas operasional: validasi, automated testing, export native, push notification, dan audit trail transaksi.
