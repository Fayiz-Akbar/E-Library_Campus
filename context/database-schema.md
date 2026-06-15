# Database Schema

Database menggunakan PostgreSQL melalui Supabase. Schema dibuat otomatis oleh `elibrary-backend/src/config/db.js` saat backend start.

## Koneksi

Backend membaca koneksi dari environment variable:

```env
DATABASE_URL=postgresql://...
```

Koneksi memakai SSL:

```js
ssl: {
  rejectUnauthorized: false
}
```

## Tabel `users`

Menyimpan akun mahasiswa dan admin.

```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Field penting:

- `id`: primary key.
- `name`: nama user.
- `email`: email unik untuk login.
- `password`: hash password.
- `role`: `student` atau `admin`.
- `status`: `active` atau `suspended`.
- `created_at`: waktu dibuat.
- `updated_at`: waktu update.

Aturan:

- Email harus unik.
- Password tidak boleh dikirim kembali ke client.
- User suspended tidak boleh login.

## Tabel `categories`

Menyimpan kategori buku.

```sql
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Field penting:

- `id`: primary key.
- `name`: nama kategori.
- `created_at`: waktu dibuat.

## Tabel `books`

Menyimpan data katalog buku.

```sql
CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(150) NOT NULL,
    publisher VARCHAR(150),
    isbn VARCHAR(50),
    summary TEXT,
    cover_image VARCHAR(255),
    stock INT NOT NULL DEFAULT 1,
    available_stock INT NOT NULL DEFAULT 1,
    qr_code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Field penting:

- `category_id`: relasi ke `categories.id`, bisa `null`.
- `title`: judul buku.
- `author`: penulis buku.
- `publisher`: penerbit.
- `isbn`: nomor ISBN.
- `summary`: ringkasan buku.
- `cover_image`: URL/base64/path cover tergantung implementasi UI.
- `stock`: total stok.
- `available_stock`: stok tersedia.
- `qr_code`: token/data QR buku.

Aturan:

- `title`, `author`, dan `stock` wajib saat membuat buku.
- `available_stock` pada insert awal harus sama dengan `stock`.
- Saat kategori dihapus, buku tidak ikut terhapus; `category_id` menjadi `null`.

## Tabel `transactions`

Menyimpan transaksi peminjaman dan pengembalian buku.

```sql
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    book_id INT REFERENCES books(id) ON DELETE CASCADE,
    borrow_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    return_date TIMESTAMP,
    fine_amount DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'borrowed',
    override_note TEXT,
    overridden_at TIMESTAMP,
    overridden_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Field penting:

- `user_id`: peminjam.
- `book_id`: buku yang dipinjam.
- `borrow_date`: tanggal pinjam.
- `due_date`: tanggal jatuh tempo.
- `return_date`: tanggal kembali, null jika belum kembali.
- `fine_amount`: nominal denda.
- `status`: status transaksi.
- `override_note`: catatan admin saat override status transaksi.
- `overridden_at`: waktu admin melakukan override.
- `overridden_by`: admin yang melakukan override.

Target status yang disarankan:

- `borrowed`: sedang dipinjam.
- `returned`: sudah dikembalikan.
- `overdue`: terlambat.
- `lost`: buku dilaporkan hilang oleh admin.
- `damaged`: buku dilaporkan rusak oleh admin.

Status kode aktual:

- Tabel dibuat otomatis.
- Model, controller, dan route transaksi dasar sudah aktif untuk borrow, return, history, dan stats.
- Endpoint admin transaksi dan override status sudah aktif.
- Query borrow/return memakai SQL transaction dan row locking agar update stok atomic.

Index transaksi:

```sql
CREATE INDEX IF NOT EXISTS idx_transactions_user_id
  ON transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_book_id
  ON transactions(book_id);

CREATE INDEX IF NOT EXISTS idx_transactions_status
  ON transactions(status);

CREATE INDEX IF NOT EXISTS idx_transactions_active_user_book
  ON transactions(user_id, book_id, status)
  WHERE status IN ('borrowed', 'overdue');
```

## Relasi

```text
categories 1 --- * books
users      1 --- * transactions
books      1 --- * transactions
```

## Query Pattern

Kode menggunakan parameterized query:

```js
db.query('SELECT * FROM users WHERE email = $1', [email])
```

Pertahankan pola ini untuk mencegah SQL injection.

## Catatan Migration

Saat ini schema dibuat langsung dari `initDatabase`. Jika project tumbuh, pertimbangkan migration formal agar perubahan schema bisa dilacak dan dijalankan berurutan.
