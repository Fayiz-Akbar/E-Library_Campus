# Changelog

## 2026-06-15 - Responsive UI Flexibility

### Added

- Menambahkan helper responsif `elibrary-mobile/src/utils/responsive.js`.
- Menambahkan aturan responsif yang lebih eksplisit di `context/ui-design-guidelines.md`.

### Changed

- Katalog buku kini memakai `useWindowDimensions` untuk menyesuaikan jumlah kolom di mobile, tablet, dan web.
- Detail buku kini membatasi ukuran cover dan action button agar tidak membesar berlebihan di desktop.
- Home screen kini memakai constrained content width untuk search, summary card, section, dan list.
- Login dan Register kini memakai max width agar form tidak melebar penuh di web.
- Onboarding kini membaca ukuran viewport secara dinamis, bukan `Dimensions.get('window')` statis.
- Profile, Manage Users, dan Manage Books kini memakai constrained content width untuk tampilan web.

### Notes

- Perubahan dibuat agar UI tetap fleksibel di Android, iOS, tablet, dan web.
- Aturan implementasi baru: hindari `Dimensions.get('window')` di level module untuk layout responsif; gunakan `useWindowDimensions`.

## 2026-06-15 - AI Context Documentation

### Added

- Menambahkan dokumentasi konteks AI lengkap untuk project E-Library Campus:
  - `architecture.md`
  - `business-rules.md`
  - `current-progress.md`
  - `database-schema.md`
  - `feature-scope.md`
  - `stakeholders-and-roles.md`
  - `system-flow.md`
  - `tech-stack.md`
  - `ui-design-guidelines.md`

### Notes

- Dokumentasi dibuat berdasarkan `elibrary-backend/PRD.md`, `elibrary-mobile/PRD.md`, dan pengecekan kode aktual.
- `current-progress.md` sengaja membedakan target PRD dengan fitur yang benar-benar terlihat aktif di repository.
- `ui-design-guidelines.md` mencakup konteks responsif untuk Android, iOS, tablet, dan web.

## 2026-06-15

### Fixed

- Memperbaiki konfigurasi API mobile untuk Expo Go di iOS.
- Mengganti `EXPO_PUBLIC_API_URL` dari IP adapter virtual WSL/Hyper-V `172.25.32.1` ke IP Wi-Fi laptop `192.168.18.169`.
- Menambahkan dokumentasi penyebab dan langkah perbaikan timeout API iOS di `ai-context/mobile-ios-api-timeout-fix.md`.

### Notes

- Backend sudah merespons normal di `http://localhost:3000/`.
- Error iOS terjadi karena perangkat fisik tidak bisa mengakses IP adapter virtual laptop.
- Expo perlu direstart setelah perubahan `.env`; gunakan `npx expo start -c` jika masih membaca konfigurasi lama.
