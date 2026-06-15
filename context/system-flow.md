# System Flow

## Flow Startup Mobile

```text
App start
  -> AuthProvider load session from AsyncStorage
  -> RootNavigator checks session
  -> if loading: Splash
  -> if logged in and admin: AdminTabs
  -> if logged in and student: MainTabs
  -> if not logged in: Splash/Onboarding/Login
```

## Flow Register

```text
User opens Register
  -> Fill name, email, password
  -> Mobile calls POST /api/auth/register
  -> Backend validates required fields
  -> Backend checks email uniqueness
  -> Backend hashes password
  -> Backend inserts user with role student
  -> Backend returns user + JWT
  -> Mobile stores token/session
  -> Mobile navigates to student area
```

## Flow Login

```text
User opens Login
  -> Fill email and password
  -> Mobile calls POST /api/auth/login
  -> Backend finds user by email
  -> Backend rejects suspended account
  -> Backend compares password with bcrypt
  -> Backend signs JWT
  -> Mobile stores token/session
  -> Mobile checks role
  -> Student goes to MainTabs
  -> Admin goes to AdminTabs
```

## Flow Profile

```text
User opens Profile
  -> Mobile sends GET /api/auth/profile with Bearer token
  -> Backend verifies JWT
  -> Backend loads user by id
  -> Mobile displays profile
```

Update profile:

```text
User edits profile
  -> Mobile sends PUT /api/auth/profile
  -> Backend validates name and email
  -> Backend checks duplicate email
  -> Backend updates user
  -> Mobile refreshes displayed data
```

## Flow Katalog Buku

```text
Student opens Catalog
  -> Mobile calls GET /api/books
  -> Optional query: search
  -> Optional query: category
  -> Backend queries books joined with categories
  -> Mobile displays list
```

Search/filter:

```text
GET /api/books?search=<keyword>&category=<category_id>
```

## Flow Detail Buku

```text
User selects a book
  -> Mobile navigates to BookDetail
  -> Mobile calls GET /api/books/:id
  -> Backend returns book detail and category name
  -> Mobile displays metadata, summary, stock, and action
```

## Flow Admin Kelola Buku

```text
Admin opens ManageBooks
  -> Mobile fetches books/categories
  -> Admin creates/updates/deletes book
  -> Mobile sends request with Bearer token
  -> Backend verifyToken
  -> Backend isAdmin
  -> Backend validates input
  -> Backend writes database
  -> Mobile refreshes list
```

Endpoint target aktual:

```text
GET    /api/books
GET    /api/books/:id
POST   /api/books
PUT    /api/books/:id
DELETE /api/books/:id
```

## Flow Admin Kelola Anggota

```text
Admin opens ManageUsers
  -> Mobile calls GET /api/users
  -> Backend verifyToken + isAdmin
  -> Admin searches user
  -> Admin toggles status or updates role
  -> Backend prevents admin changing own status/role
  -> Mobile refreshes list
```

Endpoint:

```text
GET /api/users?search=<keyword>
GET /api/users/stats
PUT /api/users/:id/status
PUT /api/users/:id/role
```

## Target Flow Peminjaman QR

Flow aktual:

```text
Student opens Scan QR
  -> Camera scans book QR
  -> Mobile sends borrow request
  -> Backend verifies user token
  -> Backend validates book exists
  -> Backend checks available_stock > 0
  -> Backend creates transaction
  -> Backend decrements available_stock
  -> Mobile shows success
```

## Target Flow Pengembalian QR

Flow aktual:

```text
Student/Admin scans book QR
  -> Mobile sends return request
  -> Backend finds active borrowed transaction
  -> Backend calculates fine if overdue
  -> Backend sets return_date
  -> Backend updates status returned
  -> Backend increments available_stock
  -> Mobile shows return result and fine
```

## Flow Riwayat Peminjaman

```text
Student opens Riwayat
  -> Mobile reads user id from AuthContext
  -> Mobile calls GET /api/transactions/history/:user_id
  -> Optional filter: status=borrowed|returned|overdue
  -> Backend verifies JWT
  -> Backend rejects student accessing another user's history
  -> Backend returns transactions joined with books
  -> Mobile displays status, dates, and fine
```

## Flow Notifikasi Jatuh Tempo

```text
Student opens Notifikasi from Riwayat
  -> Mobile calls GET /api/transactions/notifications
  -> Backend verifies JWT
  -> Backend loads active borrowed/overdue transactions
  -> Backend returns books overdue or due within 2 days
  -> Mobile displays reminder and scan return shortcut
```

## Flow Admin Manajemen Transaksi

```text
Admin opens Transaksi tab
  -> Mobile calls GET /api/transactions with Bearer admin token
  -> Optional filters: status, search, start_date, end_date
  -> Backend verifies JWT and admin role
  -> Backend returns transactions joined with user and book data
  -> Admin opens transaction detail
  -> Admin can override status to lost, damaged, or returned
  -> Mobile sends PUT /api/transactions/:id/override
  -> Backend records override note, time, and admin id
  -> Backend restores stock only when override status is returned from active transaction
  -> Mobile refreshes transaction list
```

## Flow Admin Laporan dan Export

```text
Admin opens Laporan tab
  -> Mobile uses current month as default period
  -> Mobile calls GET /api/transactions/report
  -> Backend verifies JWT and admin role
  -> Backend returns summary and transaction items for the period
  -> Admin changes start_date or end_date
  -> Admin presses Tampilkan to refresh preview
  -> Admin presses Export CSV
  -> Mobile calls GET /api/transactions/export?format=csv
  -> Backend returns text/csv with safe report columns only
  -> Web downloads CSV file; native app shows CSV preview text
```

## Flow API Connectivity Mobile

Mobile membaca base URL dari:

```text
elibrary-mobile/.env
EXPO_PUBLIC_API_URL
```

Untuk HP fisik, gunakan IP Wi-Fi laptop, bukan `localhost` dan bukan IP adapter virtual.

Contoh benar saat konteks dibuat:

```env
EXPO_PUBLIC_API_URL=http://192.168.18.169:3000/api
```
