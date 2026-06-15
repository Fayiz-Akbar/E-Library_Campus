# Tech Stack

## Backend

Folder:

```text
elibrary-backend/
```

Runtime dan framework:

- Node.js
- Express.js `^5.2.1`
- CommonJS module system

Library utama:

- `pg`: koneksi PostgreSQL/Supabase.
- `dotenv`: membaca environment variable.
- `cors`: mengizinkan akses API dari mobile/web.
- `bcryptjs`: hash dan verifikasi password.
- `jsonwebtoken`: membuat dan memverifikasi JWT.
- `qrcode`: generate QR code.
- `nodemon`: dev server.

Script:

```bash
npm run dev
npm start
```

Environment variable:

```env
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

## Mobile

Folder:

```text
elibrary-mobile/
```

Framework:

- Expo `~54.0.34`
- React `19.1.0`
- React Native `0.81.5`
- React Native Web `^0.21.0`

Library utama:

- `axios`: HTTP client.
- `@react-native-async-storage/async-storage`: penyimpanan token/session.
- `@react-navigation/native`: navigasi.
- `@react-navigation/native-stack`: stack navigation.
- `@react-navigation/bottom-tabs`: tab navigation.
- `expo-image-picker`: pemilihan gambar untuk fitur cover atau upload.
- `expo-status-bar`: status bar Expo.
- `qrcode`: QR helper.

Script:

```bash
npm start
npm run android
npm run ios
npm run web
```

Environment variable:

```env
EXPO_PUBLIC_API_URL=http://<IP_LAPTOP>:3000/api
```

## Database

- PostgreSQL.
- Supabase sebagai managed PostgreSQL.
- Backend memakai Supabase connection string melalui `DATABASE_URL`.

## Tooling

- Git/GitHub.
- Postman atau Insomnia untuk testing API.
- Expo Go untuk testing mobile di HP.
- Android Emulator untuk testing Android.
- Browser untuk testing web melalui Expo.

## Deployment Target

Target PRD:

- Database: Supabase.
- Backend: Render.
- Mobile: Expo Go untuk demo atau build APK untuk Android.

Catatan Render free tier:

- Server dapat sleep setelah idle.
- Request pertama setelah idle dapat terkena cold start.

## Compatibility Notes

- Untuk Expo Go di HP fisik, backend harus memakai IP Wi-Fi laptop yang bisa dijangkau HP.
- `localhost` hanya berlaku untuk proses di mesin yang sama.
- Android Emulator dapat memakai `http://10.0.2.2:3000/api`.
- Web lokal dapat memakai `http://localhost:3000/api`.
- Setelah mengubah `.env` mobile, restart Expo. Jika cache masih lama, gunakan:

```bash
npx expo start -c
```
