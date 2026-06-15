# Perbaikan Timeout API di iOS Expo

## Masalah

Aplikasi mobile yang dijalankan di iOS melalui Expo Go tidak bisa login dan menampilkan error:

```text
API Error: timeout of 10000ms exceeded
```

Log Axios menunjukkan aplikasi memakai base URL:

```text
http://172.25.32.1:3000/api
```

Login dari web tetap berhasil karena web berjalan di laptop yang sama, sehingga masih bisa menjangkau alamat lokal/virtual tersebut.

## Penyebab

Alamat `172.25.32.1` berasal dari adapter virtual Windows:

```text
vEthernet (WSL (Hyper-V firewall))
```

Alamat ini bukan IP Wi-Fi laptop pada jaringan lokal. Perangkat iOS yang terhubung melalui Wi-Fi tidak bisa menjangkau IP adapter virtual tersebut, sehingga request ke backend menunggu sampai timeout.

IP Wi-Fi laptop yang benar saat perbaikan dilakukan adalah:

```text
192.168.18.169
```

## Perbaikan

File berikut diperbarui:

```text
elibrary-mobile/.env
```

Dari:

```env
EXPO_PUBLIC_API_URL=http://172.25.32.1:3000/api
```

Menjadi:

```env
EXPO_PUBLIC_API_URL=http://192.168.18.169:3000/api
```

## Langkah Setelah Perbaikan

1. Pastikan backend berjalan:

```bash
cd elibrary-backend
npm run dev
```

2. Restart Expo agar `.env` terbaca ulang:

```bash
cd elibrary-mobile
npm start
```

3. Jika masih memakai cache lama, jalankan:

```bash
npx expo start -c
```

4. Pastikan iPhone dan laptop berada di jaringan Wi-Fi yang sama.
5. Buka ulang aplikasi melalui Expo Go.

## Cara Cek IP yang Benar

Di Windows, jalankan:

```bash
ipconfig
```

Gunakan nilai `IPv4 Address` pada bagian:

```text
Wireless LAN adapter Wi-Fi
```

Jangan gunakan IP dari adapter berikut untuk Expo Go di HP fisik:

```text
vEthernet
WSL
Hyper-V
Tailscale
Bluetooth
169.254.x.x
```

## Catatan

Jika jaringan Wi-Fi berubah, IP laptop dapat berubah juga. Saat itu terjadi, update kembali `EXPO_PUBLIC_API_URL` di `elibrary-mobile/.env`, lalu restart Expo.
