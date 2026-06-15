# Fix Bug - Web Refresh Selalu Logout

Tanggal: 2026-06-15 15:26 WIB

## Ringkasan Masalah

Pada versi web, setelah user berhasil login lalu browser di-refresh, aplikasi kembali ke flow auth/onboarding sehingga user harus login ulang.

## Dampak

- User web kehilangan sesi secara visual setiap refresh.
- Token sebenarnya bisa saja masih tersimpan di storage, tetapi navigasi mengarah ke screen login/onboarding.
- Pengalaman pengguna buruk karena harus login ulang walaupun sesi masih valid.

## Penyebab

Session disimpan dan dimuat oleh `AuthContext` melalui AsyncStorage:

```text
elibrary-mobile/src/context/AuthContext.js
```

Namun `SplashScreen` sebelumnya menentukan arah navigasi dari `route.params`:

```js
const { isLoggedIn, isAdmin } = route.params || {};
```

Pada browser refresh, `SplashScreen` dibuka ulang tanpa `route.params`. Akibatnya:

- `isLoggedIn` menjadi `undefined`.
- Splash menganggap user belum login.
- App diarahkan ke `Onboarding`.
- User terlihat seperti logout.

## File yang Diperbaiki

```text
elibrary-mobile/src/screens/auth/SplashScreen.js
```

## Kode Sebelum

```js
export default function SplashScreen({ navigation, route }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      const { isLoggedIn, isAdmin } = route.params || {};

      if (isLoggedIn) {
        navigation.replace(isAdmin ? 'AdminTabs' : 'MainTabs');
      } else {
        navigation.replace('Onboarding');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation, route.params, fadeAnim, scaleAnim]);
}
```

## Kode Sesudah

```js
import { useAuth } from '../../hooks/useAuth';

export default function SplashScreen({ navigation }) {
  const { isLoadingSession, isLoggedIn, isAdmin } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (isLoadingSession) return undefined;

    const timer = setTimeout(() => {
      if (isLoggedIn) {
        navigation.replace(isAdmin ? 'AdminTabs' : 'MainTabs');
      } else {
        navigation.replace('Onboarding');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation, isLoadingSession, isLoggedIn, isAdmin, fadeAnim, scaleAnim]);
}
```

## Alur Setelah Perbaikan

1. User login.
2. `AuthContext` menyimpan token dan data user ke AsyncStorage.
3. Browser di-refresh.
4. `AuthProvider` menjalankan `loadStoredSession`.
5. `SplashScreen` menunggu `isLoadingSession` selesai.
6. Jika token tersimpan:
   - Admin diarahkan ke `AdminTabs`.
   - Student diarahkan ke `MainTabs`.
7. Jika token tidak ada:
   - User diarahkan ke `Onboarding`.

## Cara Pengujian Web

### Skenario Student

1. Jalankan backend.
2. Jalankan Expo web.
3. Login sebagai student.
4. Pastikan masuk ke halaman mahasiswa.
5. Refresh browser.

Expected result:

- User tidak kembali ke Login.
- Setelah Splash, user tetap masuk ke `MainTabs`.

### Skenario Admin

1. Login sebagai admin.
2. Pastikan masuk ke halaman admin.
3. Refresh browser.

Expected result:

- User tidak kembali ke Login.
- Setelah Splash, user tetap masuk ke `AdminTabs`.

### Skenario Logout

1. Login sebagai user.
2. Tekan logout.
3. Refresh browser.

Expected result:

- User tetap logout.
- App masuk ke Onboarding/Login.

## Catatan Teknis

- Sumber kebenaran session adalah `AuthContext`, bukan `route.params`.
- `route.params` tidak cocok untuk status session yang harus bertahan setelah refresh web.
- `SplashScreen` harus menunggu `isLoadingSession === false` sebelum memutuskan navigasi.
