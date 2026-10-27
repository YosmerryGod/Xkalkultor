# Exkalt — Kalkulator Harga Jual

Aplikasi web (mobile-first) untuk menghitung harga jual di **ShopeeFood, GrabFood, dan GoFood**
dari harga net: biaya admin → promo marketplace → promo mandiri → diskon coret (selalu terakhir).
Dibangun dengan **React + Next.js (App Router) + Tailwind CSS**.

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build produksi (folder .next/)
npm start        # jalankan hasil build
npm test         # unit test (vitest)
```

## Akun admin

| Username | Password awal |
| -------- | ------------- |
| `admin`  | `123123`      |

Admin bisa menambah/menghapus banner dan promo di Beranda. Pengguna lain mendaftar lewat tombol **Daftar**.

**Ganti password admin** sebelum dipakai serius: hitung SHA-256 dari `exkalt::PASSWORDBARU`, lalu ganti nilai
`passHash` di `src/constants/accounts.js`. Contoh di terminal:

```bash
node -e "console.log(require('crypto').createHash('sha256').update('exkalt::PASSWORDBARU').digest('hex'))"
```

## Struktur

```
src/
├── app/                      titik masuk Next.js (layout.jsx, page.jsx, globals.css)
├── AppRoot.jsx               provider + pemilih tampilan (login / dashboard), dimuat hanya di browser
├── context/AppContext.jsx    seluruh state & handler aplikasi (useApp)
├── services/authService.js   login, daftar, sesi, data per akun
├── utils/
│   ├── calculatePrice.js     logika hitung harga (fungsi murni, ada tes)
│   ├── format.js             parseNum, sapaan, warna badge
│   ├── hash.js               SHA-256 + hash password
│   └── storage.js            pembungkus localStorage yang aman
├── constants/                tema, nilai default, kunci storage, akun admin
├── components/
│   ├── icons/Icons.jsx       ikon SVG
│   └── layout/               Header, BottomNav
└── features/
    ├── auth/                 AuthView (login & daftar)
    ├── dashboard/            DashboardView (kerangka + tab)
    ├── home/                 HomeView
    ├── calculator/           CalculatorView, SettingsSheet (promo)
    └── history/              HistoryView, HistorySearchModal
```

## Cara hitung harga

Setiap langkah memakai **harga terbaru sebagai net baru**, lalu dicari harga yang perlu ditampilkan:

1. Harga net + biaya admin: `net / (1 - fee%) + fixed`. Contoh: 13.000 → 16.250 (admin 3.250).
2. Urutan: **paket promo** → promo tunggal (sesuai daftar) → **diskon coret, selalu terakhir**. Tiap promo dihitung dari harga terbaru:
   - persentase: `harga / (1 - diskon% x subsidi%)`, contoh 16.250 dengan promo 10% → 18.055,56
   - nominal: `harga + diskon x subsidi%`
   - maks. diskon membatasi nilai diskon.
   - minimal belanja <= harga terbaru: pakai rumus di atas.
   - minimal belanja > harga terbaru: diskon dihitung pada nilai min belanja, lalu dibagi
     `a = min belanja / harga terbaru`. Contoh: min 25.000, diskon 10% → 2.777,78; harga terbaru 12.500
     → a = 2 → ditambahkan 1.388,89.
3. Promo kedua dihitung dari hasil promo pertama, dan seterusnya.
4. **Paket promo** bersifat branch: semua promo di dalam paket dihitung dari harga terbaru yang sama, lalu hanya
   nilai **terbesar** yang ditambahkan. Item diskon coret di dalam paket tetap dihitung di tahap terakhir.

## Promo per marketplace

Saat menambah promo, pilih **Berlaku hanya di ShopeeFood / GrabFood / GoFood** atau **Berlaku di semua marketplace**
(bawaan: marketplace yang sedang dipilih). Daftar promo di pengaturan hanya menampilkan promo untuk marketplace
yang sedang dipilih, dan perhitungan hanya memakai promo yang berlaku untuk marketplace itu. Promo lama yang
dibuat sebelum fitur ini tetap berlaku di semua marketplace.

## Catatan keamanan

Semua data (akun, riwayat, pengaturan) disimpan di **localStorage browser**. Cukup untuk pemakaian pribadi,
tetapi tidak aman untuk produksi: kode dan data bisa dibaca siapa pun yang membuka browser. Untuk dipakai
online secara serius, pindahkan autentikasi dan penyimpanan ke backend. Semua akses data sudah terpusat di
`services/authService.js` dan `utils/storage.js`, jadi penggantiannya cukup di dua tempat itu.
