# Panduan UI: mengikuti gutsai.id

Arahan pemilik produk: tampilan aedoxy.com **semirip mungkin dengan [gutsai.id](https://gutsai.id/)**. Karena itu, dokumen ini sengaja tidak memakai saran "hindari tampilan template" dari skill frontend-design. Arahan pemilik yang berlaku.

**Perubahan 2026-11-15:** hero, ringkasan (statistik + provider), section Platform, dan halaman `/models` sengaja **dibuat berbeda** dari referensi (`01`, `02`, `03`, `12`). Isi kontennya tetap, layoutnya baru (lihat baris 3–5 dan bagian `/models` di bawah). Token warna dan tipografi tidak berubah.

Nilai di bawah diukur pada 2026-11-01 dari halaman live (computed style + sampel piksel dari screenshot 1440×900). Screenshot ada di `ui-reference/`, urut dari atas ke bawah halaman.

## Batas peniruan

Tiru layout, ritme, tipografi, palet, komponen, dan pola interaksinya. **Jangan salin** hal-hal berikut:
- Logo dan nama Guts AI.
- Ilustrasi pixel-art/dither (hutan, awan, patung). Buat aset sendiri dengan gaya serupa, misalnya pola dither dari gambar milik sendiri, SVG noise, atau ilustrasi berlisensi.
- Teks marketing kata per kata.
- Angka statistik mereka. Semua angka di aedoxy harus berasal dari data sendiri.

## Token

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `--bg` | `#f5f6f4` | Latar halaman (abu kehijauan sangat terang) |
| `--bg-alt` | `#eff2ef` | Latar section selang-seling (Rankings) |
| `--surface` | `#ffffff` / `#fafbfb` | Kartu, panel kode |
| `--fg` | `#162022` (judul `#03080a`) | Teks utama |
| `--fg-soft` | `#374151` | Teks isi |
| `--muted` | `#4b5563` | Paragraf sekunder |
| `--faint` | `#6b7280` | Label kecil, meta |
| `--line` | `rgba(3,8,10,.08)` | Border kartu, garis pemisah section (`#d3d6d2` saat di-render) |
| `--line-strong` | `rgba(3,8,10,.16)` | Border tombol sekunder |
| `--primary` | `#187565` | Tombol utama ("Get API Key"), link, eyebrow, angka sukses |
| `--primary-tint` | `#ddf1ec` | Bar pengumuman, chip sukses |
| `--grad-from` → `--grad-to` | `#208a7c` → `#5075ce` | Gradien teks baris kedua hero, border kartu yang disorot |
| `--illus` | `#2a6c5f` | Warna dasar panel ilustrasi dither |
| `--dark` | `#0f1416` | Section gelap (Billing) |
| `--dark-accent` | `#5eead4`-ish (teal terang) | Aksen di section gelap |
| `--accent-warm` | `#d66b3d` | Fokus ring (`rgba(214,107,61,.4)`) dan badge kecil |
| `--success` / `--danger` / `--warn` | `#16a34a` / `#dc2626` / `#8f6000` | Status |
| Shadow kartu | `0 1px 3px rgba(0,0,0,.04), 0 1px 2px rgba(0,0,0,.02)` | Kartu. Hover: `0 4px 12px rgba(0,0,0,.05)` |
| Tinggi header | 80px | |

Mode gelap ada (tombol tema di header). Turunkan token gelap dari `--dark` dan uji kontras AA.

## Tipografi

- **Sans: Geist** (computed `font-family` body dan h1). Pakai paket `geist` (`next/font`).
- **Mono: Geist Mono** untuk kode, angka teknis, eyebrow, label tabel, chip meta.
- H1 hero: 60px, weight 500, `letter-spacing: -0.04em` (-2.4px). Baris kedua memakai gradien `--grad-from → --grad-to`.
- H2 section: sekitar 48px, weight 500, tracking rapat. Baris kedua berwarna `--muted` (pola "Kalimat utama. / kalimat lanjutan." dalam dua warna).
- Eyebrow: mono, 12–13px, huruf besar, tracking lebar, warna `--primary` ("PLATFORM", "RELIABILITY", "FAQ").
- Isi: 17–18px, line-height sekitar 1.6, warna `--muted`.
- Angka besar statistik: sekitar 72px, weight 500, tracking sangat rapat, tanda "+" berwarna `--primary`.

## Layout

- Kontainer 1280px (padding 80px pada viewport 1440). Section dipisah garis tipis `--line` selebar penuh, dengan padding vertikal sekitar 120px.
- Radius: kartu 16–20px, tombol 8px, chip/pill penuh.
- Tombol utama: latar `--primary`, teks putih, weight 600, tinggi 52px di hero dan 40px di header, ikon ↗ kecil. Tombol sekunder: latar `--surface`, border `--line-strong`.

## Urutan section landing (sesuai screenshot)

| # | Section | File referensi | Versi Aedoxy |
|---|---|---|---|
| 1 | Bar pengumuman (latar `--primary-tint`, badge "NEW" hijau, tombol tutup) | `01-hero.png` | Promo/paket baru dari data admin |
| 2 | Header: logo kiri, nav tengah (Models, Pricing, Docs), tombol tema + CTA kanan. Sticky dengan border bawah saat scroll | `01-hero.png` | Nav: Models, Pricing, Docs. CTA "Mulai" / "Dashboard" |
| 3 | Hero terpusat: baris harga (link ke `#paket`), H1 dua baris dengan logo provider di dalam kalimat, paragraf, 2 tombol, baris metode bayar. Di bawahnya bingkai teal lebar (cahaya dari atas) berisi satu jendela: daftar model kiri, kode bertab (python/node/curl, Salin) tengah, contoh respons kanan | `01-hero.png` (sengaja berbeda) | Metode bayar: QRIS, Virtual Account. Model dari `/api/pricing` |
| 4 | Ringkasan: kiri daftar angka (label + keterangan kiri, angka besar kanan), kanan indeks provider (kartu logo + nama + jumlah model, link ke `/models`). Tanpa marquee | `02-section-0.png` (sengaja berbeda) | Hanya angka nyata (jumlah model, provider). Sembunyikan baris yang datanya belum ada |
| 5 | Platform: kolom kiri sticky (H2 + paragraf), kanan empat baris fitur, masing-masing teks + gambarnya sendiri (daftar model, contoh paket, harga flat, diagram alur request ke provider). Tanpa bento | `02`–`04` (sengaja berbeda) | Klaim hanya yang benar-benar dijalankan |
| 6 | Reliability: judul tengah, diagram routing interaktif (tab Availability/Cost/Latency), latar titik-titik | `04-section-2.png` | Opsional di v1. Bila dipakai, tandai sebagai ilustrasi |
| 7 | Rankings: latar `--bg-alt`, kiri judul, kanan tabel 3 model teratas (kartu pertama ber-border gradien) | `05-section-3.png` | Dari log pemakaian console (P2). Sembunyikan bila belum ada data |
| 8 | Get started: 3 langkah dengan nomor + garis progres + estimasi waktu, masing-masing dengan kartu demo | `06-section-4.png` | Daftar → Pilih paket & bayar QRIS → Buat API key |
| 9 | Integrations: daftar agent kiri (Claude Code aktif), terminal kanan dengan tombol traffic light | `07-section-5.png` | Base URL `https://ai.aedoxy.com` |
| 10 | Section gelap: langkah bernomor + kartu ber-border gradien (rincian biaya) | `08`–`09` | Diganti **cara kerja kredit paket**: beli paket → kredit masuk → pemakaian memotong kredit → sisa hangus saat masa aktif habis |
| 11 | FAQ: kiri judul + tombol chat, kanan accordion bernomor | `09`–`10` | Pertanyaan tentang paket, penggantian paket, kredit hangus, QRIS |
| 12 | CTA besar: kartu lebar ber-border gradien, judul raksasa, ilustrasi kanan | `10-section-8.png` | |
| 13 | Footer: wordmark raksasa abu `#d9dbd8` selebar halaman, copyright + link legal | `11-footer.png` | Wordmark "aedoxy" |

## Halaman `/models` (`12-models.png`)

Sejak 2026-11-15 layoutnya sengaja berbeda dari referensi:

- Header halaman: jumlah model dan provider dalam satu baris mono di atas H1 "Katalog model", paragraf; catatan cara membaca harga di `Alert` sebelah kanan.
- Sidebar kiri (sticky di ≥ lg): search (hint `/`) dan daftar provider (logo, nama, jumlah model) sebagai filter. Di bawah lg daftar ini diganti dropdown provider.
- Toolbar di atas hasil: kemampuan, status, urutan, toggle USD/IDR, lalu baris "N dari M model" (`aria-live`).
- Per provider satu kartu: header (logo, nama, "N model · mulai $x / 1M"), lalu tabel lebar tetap (Model + status, Context, Kemampuan, Resmi, Biaya kredit, ≈ Output per paket) di ≥ xl, atau kartu per model di bawah xl.
- Konversi Rp mengikuti F04: hanya untuk harga resmi provider.

## Panel user dan admin

Pakai token dan komponen yang sama: kartu putih, border `--line`, label mono, angka besar tracking rapat. Struktur dashboard bisa mengikuti shadcn (sidebar + konten), dengan gaya mengikuti token di atas.

## Cangkang console

Dipakai oleh panel user (`src/app/(panel)`) dan admin (`src/app/(admin)/admin`) lewat `src/components/console/console-shell.tsx`. Pola tata letak dari shadcn dashboard (lihat `THIRD_PARTY_NOTICES.md`), warna tetap token Aedoxy.

- **Sidebar inset**, bisa diciutkan ke ikon (`collapsible="icon"`). Latar `--sidebar` = `--bg-alt` (sedikit lebih gelap dari area konten `--bg`). Item aktif berupa pil `--surface` dengan garis tipis `--line`. Status buka/tutup disimpan di cookie `sidebar_state`.
- **Header**: tombol sidebar, judul halaman (dari konfigurasi menu menurut path), lalu di kanan tombol cari (Ctrl/Cmd+K, hanya item menu peran itu) dan tombol tema.
- **Grup menu**: konfigurasi bertipe di `src/navigation/user-nav.ts` dan `admin-nav.ts`. Tambah halaman baru dengan menambah item di sana; tes memastikan setiap `href` punya `page.tsx`. Item ber-sub-menu terbuka otomatis bila salah satu anaknya aktif, dan menjadi dropdown saat sidebar diciutkan.
- **Kartu footer** (hilang saat diciutkan): user melihat paket aktif dan sisa waktu, admin melihat pool tersedia. Di bawahnya `NavUser` (avatar inisial, dropdown akun, keluar).
- **Konten**: `<main id="main">` di dalam `SidebarInset`, padding `p-4 md:p-6`. Jangan membungkus lagi dengan `container-x`.
- **Primitif halaman**: `PageHeader` (eyebrow, h1, deskripsi, aksi), `SectionCard`/`InfoRow` (judul di kiri, isi di kanan), `TableCard` (tabel dalam kartu, scroll di dalam kartu) di `src/components/console/`, dan `Card` di `src/components/ui/card.tsx`. Halaman memakai `space-y-6` dan lebar penuh; batasi `max-w` hanya untuk teks panjang.
- **Gerbang**: seluruh cangkang dirender hanya setelah `requireSession`/`requireAdmin` selesai. `ShellFallback` sengaja netral (tanpa label menu, nama, atau teks per peran).
- Pasangan teks sidebar lolos kontras AA di terang dan gelap karena memakai token yang sama dengan konten.

## Gerak

- Elemen muncul saat di-scroll (fade + naik sedikit). Inilah sebabnya screenshot full-page tanpa scroll terlihat kosong.
- Hero masuk sekali saat halaman dimuat (CSS saja). Diagram alur request menjalankan satu denyut 3 detik, lalu berulang hanya saat di-hover. Kartu provider naik 2px saat hover.
- Kursor berkedip di demo respons hero dan terminal.
- Semua animasi wajib menghormati `prefers-reduced-motion`. Konten harus tetap terlihat walau JavaScript gagal: jangan mulai dari `opacity: 0` tanpa fallback.
