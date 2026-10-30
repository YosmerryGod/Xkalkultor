# Exkalt — Kalkulator Harga Jual

Aplikasi kalkulator harga jual mobile-first untuk ShopeeFood, GrabFood, dan GoFood. Dibangun dengan Next.js App Router, React, Tailwind CSS, dan Neon PostgreSQL.

## Menjalankan aplikasi

```bash
npm install
npm run dev
```

Perintah lain:

```bash
npm run build
npm start
npm test
```

## Konfigurasi database Neon

Tambahkan environment variable berikut di Vercel (**Settings → Environment Variables**) dan di file `.env.local` untuk pengembangan lokal:

```env
POSTGRES_URL=postgresql://...
```

Gunakan connection string Neon dari dashboard. Jangan pernah memasukkan connection string ke kode frontend, commit ke Git, atau membagikannya di chat.

Setelah dependency terpasang dan environment variable tersedia, jalankan migrasi:

```bash
npm run db:migrate
```

Migrasi membuat tabel akun, session, pengaturan, menu, riwayat, promo, konten beranda, dan snapshot data akun. Perintah migrasi aman dijalankan ulang karena menggunakan `IF NOT EXISTS`.

## Membuat akun admin pertama

Jangan gunakan password admin bawaan dari versi localStorage lama. Buat admin baru menggunakan environment variable:

Linux/macOS:

```bash
export ADMIN_EMAIL="admin@domainanda.com"
export ADMIN_PASSWORD="gunakan-password-acak-minimal-12-karakter"
export ADMIN_FIRST_NAME="Admin"
export ADMIN_STORE_NAME="Exkalt Admin"
npm run db:seed-admin
```

PowerShell:

```powershell
$env:ADMIN_EMAIL="admin@domainanda.com"
$env:ADMIN_PASSWORD="gunakan-password-acak-minimal-12-karakter"
$env:ADMIN_FIRST_NAME="Admin"
$env:ADMIN_STORE_NAME="Exkalt Admin"
npm run db:seed-admin
```

Script tidak mengubah akun yang sudah ada. Simpan kredensial admin dengan aman.

## API yang tersedia

| Method | Endpoint | Kegunaan |
| --- | --- | --- |
| GET | `/api/health` | Memeriksa koneksi API dan database |
| POST | `/api/auth/register` | Mendaftarkan akun |
| POST | `/api/auth/login` | Login dan membuat session |
| GET | `/api/auth/me` | Memeriksa session aktif |
| POST | `/api/auth/logout` | Mencabut session |
| GET | `/api/user/data` | Mengambil data kalkulator akun |
| PUT | `/api/user/data` | Menyimpan data kalkulator akun |

Session menggunakan cookie `httpOnly`, token acak, dan hash token di database. Password disimpan dengan scrypt dan salt unik.

## Struktur penting

```
src/
├── app/api/             API Route Handlers
├── db/schema.sql        Skema PostgreSQL
├── lib/
│   ├── auth.js          Password hashing dan session token
│   ├── db.js            Koneksi Neon
│   └── session.js       Validasi session server
├── context/             State aplikasi dan sinkronisasi data
├── features/            Tampilan auth, kalkulator, beranda, riwayat
└── utils/               Perhitungan harga dan utilitas
scripts/
├── migrate.js           Menjalankan skema database
└── seed-admin.js        Membuat admin pertama
```

## Aplikasi Android APK

Panduan membuat APK Android menggunakan Trusted Web Activity (Bubblewrap) tersedia di [android/README.md](android/README.md). Package ID aplikasi adalah `com.xkalkultor.app`.

## Catatan migrasi dari versi lama

Versi lama menyimpan akun, session, dan data aplikasi di localStorage. Versi backend ini memindahkan autentikasi dan data kalkulator akun ke PostgreSQL. Akun lama tidak otomatis menjadi akun database karena password lama memakai hash client-side yang tidak layak dipakai sebagai kredensial produksi. Buat akun baru atau lakukan migrasi akun secara terkontrol.

Preferensi tampilan lokal seperti tema masih disimpan di browser. Jangan menghapus data browser lama sampai data yang ingin dipertahankan sudah dipindahkan.

## Perhitungan harga

Setiap langkah memakai harga terbaru sebagai net baru, lalu menghitung harga tampil:

1. Harga net + biaya admin.
2. Promo marketplace dan promo mandiri sesuai urutan.
3. Diskon coret dihitung paling akhir.

Rincian rumus dan contoh perhitungan ada di `src/utils/calculatePrice.js`.
