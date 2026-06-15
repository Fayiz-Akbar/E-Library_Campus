# UI Design Guidelines

## Prinsip Desain

E-Library Campus adalah aplikasi operasional kampus. UI harus terasa modern, rapi, mudah dipindai, dan efisien. Hindari tampilan yang terlalu dekoratif jika mengganggu alur utama seperti cari buku, login, kelola data, atau scan QR.

Target platform:

- Android.
- iOS.
- Web melalui React Native Web.

Desain harus fleksibel untuk berbagai ukuran layar, dari HP kecil, tablet, sampai web desktop.

## Tema Warna

Gunakan token warna dari:

```text
elibrary-mobile/src/constants/colors.js
```

Palet utama:

```js
primary: '#7C3AED'
primaryDark: '#5B21B6'
primaryLight: '#C4B5FD'
secondary: '#A78BFA'
background: '#FFFFFF'
surface: '#F5F3FF'
textPrimary: '#1E1B2E'
textSecondary: '#6B7280'
textOnPrimary: '#FFFFFF'
border: '#E5E7EB'
success: '#10B981'
warning: '#F59E0B'
danger: '#EF4444'
info: '#3B82F6'
```

Panduan:

- `primary`: tombol utama, tab aktif, header penting.
- `surface`: card/list item ringan.
- `success`: status tersedia/berhasil.
- `warning`: mendekati jatuh tempo.
- `danger`: terlambat, gagal, denda, suspend.
- `info`: informasi netral.

## Layout Responsif

Setiap screen wajib memakai ukuran dari viewport saat render, bukan nilai statis saat file di-import. Di React Native/Expo gunakan `useWindowDimensions`, lalu hitung ulang jumlah kolom, lebar card, dan max width saat ukuran layar berubah.

Helper responsif project berada di:

```text
elibrary-mobile/src/utils/responsive.js
```

Gunakan helper ini untuk:

- `getResponsiveContentStyle(width, maxWidth)`: membatasi konten agar tidak terlalu lebar di web.
- `getHorizontalPadding(width)`: menentukan padding horizontal sesuai ukuran layar.
- `getCatalogColumns(width)`: menentukan jumlah kolom katalog.
- `getGridItemWidth(...)`: menghitung lebar card grid.

### Mobile

- Gunakan `SafeAreaView` atau padding yang aman untuk notch/status bar.
- Konten utama harus scrollable jika melebihi tinggi layar.
- Tombol utama minimal mudah disentuh, target sentuh ideal sekitar 44px atau lebih.
- Hindari teks terlalu kecil; body text ideal 14-16.
- Bottom tab harus tetap jelas dan tidak menutupi konten.
- Gunakan single column untuk form, profil, detail buku, dan list utama.

### Tablet

- Batasi lebar konten form agar tidak melebar berlebihan.
- List dapat memakai grid 2 kolom bila ruang cukup.
- Detail buku bisa menampilkan cover dan metadata berdampingan jika lebar mencukupi.
- Gunakan 3 kolom untuk katalog jika ruang cukup.

### Web/Desktop

- Gunakan max width untuk konten utama agar tidak terlalu menyebar.
- Untuk halaman admin, gunakan layout yang lebih padat dan mudah dipindai.
- List/table admin harus mendukung scan cepat: nama, status, role, action.
- Jangan mengandalkan hover saja; action tetap harus bisa dipakai di touch device.
- Header boleh full-width, tetapi isi header seperti search bar dan title harus berada dalam constrained container.
- Form login/register idealnya `maxWidth` 520-560.
- Konten student umum idealnya `maxWidth` 960-980.
- Konten admin idealnya `maxWidth` 980-1080.
- Katalog desktop dapat memakai 4-5 kolom, bukan 2 kolom tetap.
- Cover detail buku harus punya ukuran maksimum agar tidak membesar mengikuti layar desktop.

## Breakpoint Konseptual

React Native tidak memakai CSS breakpoint murni, tetapi gunakan `useWindowDimensions` bila layout perlu beradaptasi.

Panduan ukuran:

- `< 480`: mobile kecil, single column.
- `480 - 767`: mobile besar, single column dengan spacing lebih lega.
- `768 - 1023`: tablet, boleh 2 column untuk katalog/detail.
- `>= 1024`: web/desktop, gunakan constrained container dan layout admin lebih padat.

Aturan implementasi:

- Jangan pakai `Dimensions.get('window')` di level module untuk ukuran yang harus responsif.
- Jangan pakai lebar card statis untuk grid katalog.
- Jangan pakai string CSS seperti `calc(...)` pada style React Native karena tidak aman untuk Android/iOS.
- Hitung ukuran numerik dari `useWindowDimensions`.
- Gunakan `maxWidth` + `alignSelf: 'center'` untuk semua konten utama di web.

## Komponen

### Form

- Label jelas.
- Placeholder tidak menggantikan label penting.
- Error ditampilkan dekat field.
- Loading state saat submit.
- Tombol submit disabled saat proses berjalan.

### Button

- Gunakan warna primary untuk aksi utama.
- Gunakan danger hanya untuk aksi destruktif.
- Gunakan outline/secondary untuk aksi batal atau alternatif.
- Teks button harus singkat: `Login`, `Simpan`, `Tambah Buku`, `Hapus`.

### Card Buku

Informasi minimal:

- Judul.
- Penulis.
- Kategori jika ada.
- Stok tersedia.
- Cover atau placeholder.

Card harus tetap rapi jika:

- Judul panjang.
- Cover kosong.
- Stok 0.
- Kategori null.

### Badge Status

Gunakan badge untuk:

- `Tersedia`
- `Dipinjam`
- `Terlambat`
- `Active`
- `Suspended`
- `Admin`
- `Student`

Badge harus memiliki warna dan teks, jangan hanya warna.

### Empty State

Berikan pesan singkat dan action jika relevan.

Contoh:

- Katalog kosong: `Belum ada buku.`
- Search kosong: `Buku tidak ditemukan.`
- Admin buku kosong: `Tambahkan buku pertama.`

### Error State

Tampilkan pesan yang bisa dipahami user.

Hindari menampilkan:

- Stack trace.
- Raw Axios object.
- Pesan database mentah.

## Navigasi

### Guest

Flow:

```text
Splash -> Onboarding -> Login/Register
```

### Student

Tab utama:

- Home.
- Katalog.
- Profil.

Target PRD berikutnya:

- Scan QR.
- Riwayat.
- Notifikasi.

### Admin

Tab utama saat ini:

- Kelola Buku.
- Kelola Anggota.
- Profil Admin.

Target PRD berikutnya:

- Dashboard.
- Transaksi.
- Laporan.

## UX untuk QR

Target PRD:

- Scan screen harus memberi frame/guide yang jelas.
- Berikan state permission camera.
- Berikan instruksi singkat jika kamera belum aktif.
- Setelah scan sukses, cegah double-submit.
- Tampilkan hasil pinjam/kembali dengan status jelas.

Untuk web:

- Jika QR scan camera belum didukung stabil, sediakan fallback input manual token/kode buku untuk testing.

## Accessibility

- Kontras teks harus cukup.
- Jangan menyampaikan status hanya dengan warna.
- Tombol dan input harus punya teks jelas.
- Ukuran tap target harus nyaman.
- Hindari layout yang bergantung pada font scaling tetap.

## Copywriting

Gunakan bahasa Indonesia yang sederhana dan konsisten.

Contoh:

- `Login berhasil`
- `Email atau password salah`
- `Buku tidak ditemukan`
- `Stok tidak tersedia`
- `Data berhasil disimpan`

## Hal yang Harus Dihindari

- Hardcode ukuran yang membuat UI rusak di HP kecil.
- Teks panjang tanpa wrapping.
- Tombol terlalu kecil.
- Warna status tanpa label.
- Form yang tidak menunjukkan loading.
- Aksi delete tanpa konfirmasi.
- Menyembunyikan fitur admin hanya dari UI tanpa validasi backend.
