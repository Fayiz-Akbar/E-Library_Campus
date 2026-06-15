# Person 3 - Scan QR

Branch:

```text
feature/person3-scan-qr
```

## Tujuan Fitur

Membangun fitur scan QR untuk memproses peminjaman dan pengembalian buku dari aplikasi mobile. Screen ini menjadi jembatan antara QR code buku dari Person B dan endpoint transaksi dari Person 3.

## Scope

Frontend mobile:

- Screen Scan QR.
- Toggle mode `Pinjam` dan `Kembalikan`.
- Integrasi kamera.
- Kirim hasil QR ke endpoint borrow/return.
- Tampilkan hasil sukses/gagal.
- Fallback input manual untuk web atau emulator yang tidak mendukung kamera.

Backend:

- Memakai endpoint dari branch `feature/person3-transaction-backend`.

## Branch Dependency

Branch ini bergantung pada:

```text
feature/person3-transaction-backend
```

Endpoint yang harus sudah ada:

```text
POST /api/transactions/borrow
POST /api/transactions/return
```

## File yang Dibuat atau Diubah

Frontend:

```text
elibrary-mobile/src/screens/student/ScanQRScreen.js
elibrary-mobile/src/hooks/useQRScanner.js
elibrary-mobile/src/api/transactionApi.js
elibrary-mobile/App.js
```

Opsional:

```text
elibrary-mobile/src/components/QRScannerOverlay.js
```

## Library

Target PRD menyebut:

```text
react-native-vision-camera
```

Namun karena project menggunakan Expo, pastikan compatibility lebih dulu. Jika Expo Go tidak mendukung library tertentu, fallback yang aman:

- Gunakan scanner yang kompatibel dengan Expo.
- Atau sediakan input manual QR token untuk demo web.

## Flow User

### Scan untuk Pinjam

1. User membuka tab/screen `Scan QR`.
2. User memilih mode `Pinjam`.
3. Aplikasi meminta izin kamera.
4. User scan QR buku.
5. Aplikasi membaca `qr_code`.
6. Aplikasi mengirim request:

```text
POST /api/transactions/borrow
```

7. Backend membuat transaksi.
8. Aplikasi menampilkan pesan sukses.
9. Aplikasi memberi opsi:
   - Lihat Riwayat.
   - Scan Lagi.
   - Kembali ke Home.

### Scan untuk Kembalikan

1. User membuka screen `Scan QR`.
2. User memilih mode `Kembalikan`.
3. User scan QR buku.
4. Aplikasi mengirim request:

```text
POST /api/transactions/return
```

5. Backend menutup transaksi dan menghitung denda.
6. Aplikasi menampilkan hasil:
   - Buku berhasil dikembalikan.
   - Denda jika ada.
   - Status transaksi.

## State UI

Screen harus menangani:

- Loading saat memproses QR.
- Permission camera belum diberikan.
- Permission camera ditolak.
- QR tidak valid.
- Buku tidak ditemukan.
- Stok habis.
- User tidak punya transaksi aktif saat mode kembali.
- Sukses pinjam.
- Sukses kembali.

## Fallback Web

Karena web sering tidak stabil untuk scan kamera, sediakan fallback:

```text
Input manual QR code/token buku
```

Flow fallback:

1. User pilih mode.
2. User paste/ketik QR token.
3. User tekan tombol `Proses`.
4. Aplikasi memanggil endpoint yang sama.

## Data Request

Untuk hasil scan QR:

```json
{
  "qr_code": "BOOK-QR-TOKEN"
}
```

Untuk fallback detail buku:

```json
{
  "book_id": 1
}
```

## UI Guidelines

- Toggle mode gunakan segmented control: `Pinjam` / `Kembalikan`.
- Area scanner harus punya frame yang jelas.
- Tombol proses manual hanya muncul pada fallback/manual mode.
- Cegah double submit setelah QR berhasil terbaca.
- Tampilkan pesan yang jelas, bukan raw error API.
- Screen harus responsif untuk Android, iOS, dan web.

## Acceptance Criteria

- User bisa memilih mode pinjam/kembali.
- User bisa scan QR buku.
- User bisa memakai input manual di web.
- Request borrow/return terkirim ke backend.
- Loading dan error state tampil benar.
- Double scan tidak membuat transaksi dobel.
- Setelah sukses, user bisa menuju riwayat atau scan lagi.

## Cara Pengujian

### Prasyarat

Pastikan:

- Backend transaksi sudah selesai dan berjalan.
- Endpoint borrow dan return bisa dipanggil.
- Mobile app bisa login sebagai student.
- Ada buku yang memiliki `qr_code`.
- Ada buku dengan `available_stock > 0`.

Untuk web atau emulator tanpa kamera, siapkan nilai `qr_code` buku dari API:

```http
GET http://localhost:3000/api/books/1
Authorization: Bearer <TOKEN>
```

Ambil:

```text
data.qr_code
```

### Pengujian via Aplikasi - Mode Pinjam dengan Kamera

Langkah:

1. Login sebagai student.
2. Buka screen `Scan QR`.
3. Pilih mode `Pinjam`.
4. Izinkan akses kamera.
5. Arahkan kamera ke QR buku.
6. Tunggu proses selesai.

Expected result:

- Scanner membaca QR.
- Loading muncul saat request diproses.
- Muncul pesan sukses peminjaman.
- User mendapat opsi menuju Riwayat atau Scan Lagi.
- Jika dicek di riwayat, transaksi muncul dengan status `Dipinjam`.
- Stok buku berkurang 1.

### Pengujian via Aplikasi - Mode Kembalikan dengan Kamera

Kondisi:

- Student sudah punya transaksi aktif untuk buku yang sama.

Langkah:

1. Buka screen `Scan QR`.
2. Pilih mode `Kembalikan`.
3. Scan QR buku yang sedang dipinjam.
4. Tunggu proses selesai.

Expected result:

- Muncul pesan sukses pengembalian.
- Jika ada denda, nominal denda ditampilkan.
- Riwayat berubah menjadi `Dikembalikan`.
- Stok buku bertambah 1.

### Pengujian via Web - Fallback Input Manual

Langkah:

1. Jalankan Expo web.
2. Login sebagai student.
3. Buka screen `Scan QR`.
4. Pilih mode `Pinjam`.
5. Masukkan `qr_code` buku pada input manual.
6. Tekan tombol `Proses`.

Expected result:

- Request dikirim ke endpoint borrow.
- Pesan sukses/error tampil sesuai response.
- Tidak ada error kamera di web.

Ulangi untuk mode `Kembalikan`.

### Pengujian via API - Simulasi Hasil Scan Pinjam

Request:

```http
POST http://localhost:3000/api/transactions/borrow
Authorization: Bearer <STUDENT_TOKEN>
Content-Type: application/json

{
  "qr_code": "BOOK-QR-TOKEN"
}
```

Expected result:

- `success = true`.
- Transaksi dibuat.
- Stok berkurang.

### Pengujian via API - Simulasi Hasil Scan Kembali

Request:

```http
POST http://localhost:3000/api/transactions/return
Authorization: Bearer <STUDENT_TOKEN>
Content-Type: application/json

{
  "qr_code": "BOOK-QR-TOKEN"
}
```

Expected result:

- `success = true`.
- Transaksi aktif ditutup.
- Stok bertambah.

### Pengujian Error State

Uji skenario berikut:

- Kamera ditolak.
- QR kosong.
- QR tidak valid.
- Buku tidak ditemukan.
- Stok habis saat mode pinjam.
- Tidak ada transaksi aktif saat mode kembali.
- Scan QR yang sama dua kali dengan cepat.

Expected result:

- Aplikasi menampilkan pesan yang jelas.
- Tidak terjadi transaksi dobel.
- Tombol/scan dikunci saat request sedang berjalan.
