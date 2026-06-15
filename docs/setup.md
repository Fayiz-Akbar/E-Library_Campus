# Panduan Setup dan Instalasi E-Library Campus

Dokumen ini menjelaskan langkah instalasi pertama kali dari nol sampai aplikasi **E-Library Campus** bisa dijalankan. Project terdiri dari dua bagian:

- `elibrary-backend`: REST API menggunakan Node.js, Express, JWT, dan PostgreSQL.
- `elibrary-mobile`: aplikasi mobile menggunakan Expo React Native.

## 1. Prasyarat

Pastikan perangkat sudah memiliki:

- Git
- Node.js versi LTS dan npm
- Akun Supabase untuk database PostgreSQL
- Expo Go di HP Android/iOS, atau Android Emulator
- Postman/Insomnia untuk mencoba API
- Koneksi internet untuk instalasi dependency dan akses Supabase

Cek instalasi dasar:

```bash
git --version
node -v
npm -v
```

## 2. Clone atau Buka Project

Jika belum memiliki project di komputer:

```bash
git clone <URL_REPOSITORY>
cd E-Library_Campus
```

Jika project sudah ada, buka folder root:

```bash
cd E-Library_Campus
```

Struktur utama yang dipakai:

```text
E-Library_Campus/
+-- docs/
+-- elibrary-backend/
+-- elibrary-mobile/
```

## 3. Setup Database Supabase

Backend menggunakan PostgreSQL melalui Supabase.

1. Login ke Supabase.
2. Buat project baru.
3. Pilih region terdekat, misalnya Singapore.
4. Setelah project aktif, buka **Project Settings > Database**.
5. Ambil connection string PostgreSQL pada bagian **Connection string**.
6. Gunakan format URI, contoh:

```text
postgresql://postgres.<project-ref>:<password>@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

Simpan connection string tersebut karena akan dipakai sebagai `DATABASE_URL` pada backend.

Catatan: tabel `users`, `categories`, `books`, dan `transactions` akan dibuat otomatis oleh backend saat server pertama kali dijalankan.

## 4. Setup Backend

Masuk ke folder backend:

```bash
cd elibrary-backend
```

Install dependency:

```bash
npm install
```

Buat file `.env` di dalam folder `elibrary-backend`:

```env
PORT=3000
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
JWT_SECRET=ganti_dengan_secret_yang_panjang_dan_acak
```

Keterangan:

- `PORT`: port lokal untuk API backend.
- `DATABASE_URL`: connection string dari Supabase.
- `JWT_SECRET`: secret untuk membuat dan memverifikasi token login.

Jalankan backend:

```bash
npm run dev
```

Jika berhasil, terminal akan menampilkan pesan bahwa server berjalan di port `3000` dan tabel database siap.

Coba akses API:

```text
http://localhost:3000/
```

Response yang diharapkan:

```json
{
  "message": "E-Library API berjalan!"
}
```

## 5. Membuat Akun Admin Pertama

Pastikan backend sudah berhasil terhubung ke database. Dari folder `elibrary-backend`, jalankan:

```bash
node seed-admin.js
```

Script ini akan membuat akun admin default:

```text
Email    : admin@elibrary.com
Password : admin123
```

Gunakan akun ini untuk login sebagai admin di aplikasi mobile.

## 6. Setup Mobile

Buka terminal baru, lalu masuk ke folder mobile:

```bash
cd elibrary-mobile
```

Install dependency:

```bash
npm install
```

Salin file environment:

```bash
copy .env.example .env
```

Atau buat manual file `.env` di folder `elibrary-mobile`.

Isi `.env`:

```env
EXPO_PUBLIC_API_URL=http://<IP_LAPTOP_KAMU>:3000/api
```

Ganti `<IP_LAPTOP_KAMU>` sesuai cara menjalankan aplikasi:

- Expo Go di HP fisik: gunakan IPv4 laptop, contoh `http://192.168.1.5:3000/api`.
- Android Emulator: gunakan `http://10.0.2.2:3000/api`.
- Web browser lokal: bisa gunakan `http://localhost:3000/api`.

Untuk melihat IP laptop di Windows:

```bash
ipconfig
```

Cari bagian Wi-Fi/LAN yang sedang dipakai, lalu ambil nilai **IPv4 Address**.

## 7. Menjalankan Aplikasi Mobile

Dari folder `elibrary-mobile`, jalankan:

```bash
npm start
```

Expo akan membuka QR code di terminal/browser.

Untuk menjalankan di HP:

1. Pastikan HP dan laptop berada di jaringan Wi-Fi yang sama.
2. Buka aplikasi Expo Go.
3. Scan QR code dari terminal/browser Expo.
4. Aplikasi E-Library akan terbuka di HP.

Untuk Android Emulator:

```bash
npm run android
```

Untuk web:

```bash
npm run web
```

## 8. Urutan Menjalankan Project Setiap Hari

Setelah setup pertama selesai, urutan menjalankan project cukup seperti ini.

Terminal 1 untuk backend:

```bash
cd elibrary-backend
npm run dev
```

Terminal 2 untuk mobile:

```bash
cd elibrary-mobile
npm start
```

Pastikan `EXPO_PUBLIC_API_URL` di `elibrary-mobile/.env` masih sesuai dengan alamat backend yang aktif.

## 9. Endpoint Dasar untuk Pengecekan

Base URL backend:

```text
http://localhost:3000/api
```

Endpoint auth:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
PUT  /api/auth/profile
```

Endpoint buku dan kategori:

```text
GET    /api/books
GET    /api/books/:id
POST   /api/books
PUT    /api/books/:id
DELETE /api/books/:id
GET    /api/categories
POST   /api/categories
```

Endpoint yang membutuhkan login harus mengirim header:

```text
Authorization: Bearer <TOKEN_LOGIN>
```

## 10. Troubleshooting

### Backend gagal konek database

Periksa:

- `DATABASE_URL` sudah benar.
- Password database Supabase tidak salah.
- Supabase project masih aktif.
- Koneksi internet tersedia.

### Mobile tidak bisa akses API

Periksa:

- Backend sudah berjalan.
- `EXPO_PUBLIC_API_URL` mengarah ke IP yang benar.
- HP dan laptop berada di jaringan yang sama.
- Firewall Windows tidak memblokir port `3000`.
- Setelah mengubah `.env`, restart Expo dengan menutup proses lalu menjalankan `npm start` lagi.

### Login admin gagal

Periksa:

- Backend sudah berhasil membuat tabel.
- `node seed-admin.js` sudah dijalankan.
- Email dan password sesuai:

```text
admin@elibrary.com
admin123
```

### Port 3000 sudah digunakan

Ubah `PORT` di `elibrary-backend/.env`, misalnya:

```env
PORT=3001
```

Lalu sesuaikan URL mobile:

```env
EXPO_PUBLIC_API_URL=http://<IP_LAPTOP_KAMU>:3001/api
```

## 11. Checklist Setup Selesai

Setup dianggap selesai jika:

- Dependency backend berhasil di-install.
- File `elibrary-backend/.env` sudah dibuat.
- Backend berjalan tanpa error.
- Tabel database berhasil dibuat otomatis.
- Akun admin berhasil dibuat dengan `node seed-admin.js`.
- Dependency mobile berhasil di-install.
- File `elibrary-mobile/.env` sudah berisi URL backend.
- Expo berhasil berjalan.
- Aplikasi mobile bisa login/register dan mengambil data dari backend.
