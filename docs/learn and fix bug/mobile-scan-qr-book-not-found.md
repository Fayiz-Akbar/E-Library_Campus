# Perbaikan Scan QR Buku Tidak Ditemukan

Tanggal: 2026-06-15 19:45 WIB

## Masalah

Saat scan QR dari HP, aplikasi berhasil membaca QR dan mengirim request ke backend, tetapi backend mengembalikan error:

```text
API Error: Request failed with status code 404
API Error Response Data: {"message": "Buku tidak ditemukan.", "success": false}
```

Artinya kamera berhasil scan, tetapi nilai QR yang dikirim tidak cocok dengan data buku di database.

## Penyebab

Ada beberapa ketidakkonsistenan pada alur QR buku:

1. `generateQRCode.js` sebelumnya membuat QR image base64, bukan payload scan yang stabil.
2. `bookController.create` mengirim `qr_code` ke `bookModel.updateBook`, tetapi `bookModel.updateBook` belum menyimpan field `qr_code`.
3. Backend transaksi melakukan pencarian `qr_code` exact match tanpa normalisasi `trim`, sehingga payload dengan spasi/newline bisa gagal ditemukan.
4. Buku lama yang belum punya `qr_code` tidak otomatis dibuatkan QR saat diedit ulang.

## Solusi

Perbaikan dibuat dengan prinsip:

- `books.qr_code` menyimpan payload scan, bukan gambar QR.
- Gambar QR tetap dibuat di UI admin dari payload tersebut.
- Backend transaksi tetap kompatibel dengan format lama:
  - QR berisi angka ID buku.
  - QR berisi JSON `{ "type": "ELIB_BOOK", "id": 1 }`.
  - QR berisi token UUID lama yang cocok dengan `books.qr_code`.
- Payload scan dinormalisasi dengan `trim`.

## File yang Diubah

```text
elibrary-backend/src/utils/generateQRCode.js
elibrary-backend/src/models/bookModel.js
elibrary-backend/src/controllers/bookController.js
elibrary-backend/src/models/transactionModel.js
context/changelog.md
```

## Detail Perubahan

### 1. Payload QR Dibuat Stabil

Sebelumnya util QR membuat gambar base64. Sekarang util membuat payload JSON:

```javascript
const qrPayload = JSON.stringify({
  type: 'ELIB_BOOK',
  id: Number(bookId),
  book_id: Number(bookId),
});
```

Payload ini yang disimpan ke `books.qr_code` dan diubah menjadi QR image oleh UI admin.

### 2. `bookModel.updateBook` Menyimpan `qr_code`

Query update buku sekarang menyertakan:

```sql
qr_code = COALESCE($10, qr_code)
```

Tujuannya:

- Jika controller mengirim QR baru, QR tersimpan.
- Jika tidak ada QR baru, QR lama tidak hilang.

### 3. Buku Lama Bisa Mendapat QR Saat Diedit

Saat admin mengedit buku lama yang belum punya QR, controller membuat payload QR:

```javascript
qr_code: existingBook.qr_code || await generateBookQR(id)
```

### 4. Scan Result Dinormalisasi di Backend Transaksi

Backend transaksi sekarang memakai nilai QR yang sudah di-trim:

```javascript
const normalizedQrCode = typeof qrCode === 'string' ? qrCode.trim() : qrCode;
```

Lalu pencarian buku memakai `normalizedQrCode`.

## Alur Setelah Perbaikan

1. Admin membuat buku baru.
2. Backend membuat buku dan menyimpan payload QR ke `books.qr_code`.
3. Admin membuka QR buku.
4. UI admin menampilkan QR image dari payload `books.qr_code`.
5. Mahasiswa scan QR dari HP.
6. Kamera membaca payload QR.
7. Mobile mengirim payload ke endpoint:

```text
POST /api/transactions/borrow
```

atau:

```text
POST /api/transactions/return
```

8. Backend menemukan buku berdasarkan:
   - ID dari JSON payload, atau
   - exact `qr_code` untuk token lama.

## Cara Pengujian

### Pengujian Buku Baru

1. Login sebagai admin.
2. Buka `Kelola Buku`.
3. Tambahkan buku baru.
4. Buka QR buku tersebut.
5. Login sebagai mahasiswa di HP.
6. Buka `Scan QR`.
7. Scan QR buku.

Expected result:

- Backend tidak lagi mengembalikan `Buku tidak ditemukan`.
- Jika mode `Pinjam`, transaksi berhasil dibuat selama stok tersedia.
- Jika mode `Kembalikan`, buku berhasil dikembalikan jika mahasiswa punya transaksi aktif.

### Pengujian Buku Lama

Jika buku lama belum punya QR:

1. Login sebagai admin.
2. Buka `Kelola Buku`.
3. Edit buku lama.
4. Simpan ulang.
5. Buka QR buku.
6. Scan dari HP.

Expected result:

- Buku lama mendapat payload QR baru.
- Scan QR berhasil menemukan buku.

### Pengujian API Manual

Ambil `qr_code` buku dari response list/detail buku, lalu kirim:

```http
POST http://localhost:3000/api/transactions/borrow
Authorization: Bearer <STUDENT_TOKEN>
Content-Type: application/json

{
  "qr_code": "{\"type\":\"ELIB_BOOK\",\"id\":1,\"book_id\":1}"
}
```

Expected result:

- Jika buku ID 1 ada dan stok tersedia, response `success = true`.
- Jika buku tidak ada, barulah response `404 Buku tidak ditemukan`.

## Catatan Kompatibilitas

Perbaikan ini tetap mendukung QR lama yang berisi token UUID karena backend masih melakukan pencarian exact match ke kolom `books.qr_code`.

Namun untuk data baru, format yang disarankan adalah payload JSON:

```json
{
  "type": "ELIB_BOOK",
  "id": 1,
  "book_id": 1
}
```
