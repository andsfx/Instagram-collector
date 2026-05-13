# Requirements Document

## Introduction

Dokumen ini menangkap hasil audit terhadap Instagram tracker dashboard dan menerjemahkannya menjadi kumpulan requirement peningkatan yang terukur. Ruang lingkup audit mencakup pipeline data (SocialBlade + Apify), kalkulator metrik (`calc-instagram-metrics.js`), React_Dashboard sebagai satu-satunya frontend production setelah migrasi selesai (`dashboard-react/` React/TypeScript), folder `dashboard/` yang tersisa sebagai artefak historis dan source `dashboard/data.json` untuk Dashboard_Runtime_API, serverless API `dashboard-react/api/dashboard-data.ts`, modul auth client-side legacy (`dashboard/js/auth.js`) yang sudah tidak di-serve, schema data (`dashboard-react/src/data/schema.ts`), serta konfigurasi deploy Vercel.

Framing audit ini berfokus pada cleanup artefak legacy dan prevent regresi, bukan lagi konsolidasi dua frontend paralel.

Temuan audit utama meliputi:

1. Legacy folder `dashboard/` masih ada di repo meskipun tidak di-serve ke production, berpotensi menyesatkan developer baru dan memperlebar permukaan audit (antara lain karena `dashboard/vercel.json`, `dashboard/js/auth.js`, dan aset HTML/JS legacy masih hidup di tree).
2. `auth.js` legacy mengandalkan hashing JavaScript custom dan storage di `localStorage`/`sessionStorage`, dengan kredensial default `admin/admin`, dan oleh developernya sendiri ditandai sebagai "bukan security boundary yang kuat". Risiko eksploitasi aktif sudah hilang karena Auth_Module tidak lagi di-serve ke production, tetapi kode tersebut masih ada di repo dan perlu dihapus agar tidak menyesatkan developer baru serta tidak mudah ditemukan via git history search.
3. Runtime data endpoint mem-fetch JSON dari `raw.githubusercontent.com` tanpa validasi skema di sisi server, sedangkan validasi skema (Zod) hanya dijalankan di client.
4. Kesegaran data bergantung pada field `generated_at` / `latest.date` tanpa mekanisme alert staleness dan tanpa health check.
5. Schema dashboard mengandung banyak field opsional dengan sinonim (`carousel`/`carousels`, `image`/`images`) yang diakomodasi di adapter tetapi tidak dinormalisasi di builder.
6. Kalkulasi Engagement Rate di `calc-instagram-metrics.js` tidak terlindungi terhadap edge case `followers = 0`, `posts_count = 0`, dan tipe post tidak dikenal.
7. Observability terbatas: tidak ada endpoint health, metric log terstruktur, atau surfaced error telemetry di frontend.
8. Accessibility tertutup sebagian di React (skip link, sr-only) tetapi belum divalidasi secara sistematis.

Peningkatan yang didokumentasikan di sini bersifat preskriptif dan terukur, mengikuti EARS pattern dan INCOSE quality rules.

## Glossary

- **IG_Tracker_System**: Keseluruhan sistem Instagram tracker yang mencakup pipeline pengumpulan data, kalkulator metrik, builder payload dashboard, serverless API, dan frontend dashboard.
- **Data_Pipeline**: Serangkaian skrip koleksi (SocialBlade, Apify) dan transform (`scripts/transform`, `scripts/export/build-dashboard-data.js`) yang menghasilkan `dashboard/data.json`.
- **Metric_Calculator**: Modul `calc-instagram-metrics.js` yang menghitung avg likes, avg comments, engagement rate, dan content breakdown per akun.
- **Dashboard_Payload**: File JSON `dashboard/data.json` sesuai schema v2 yang menjadi sumber tunggal untuk seluruh UI dashboard.
- **Payload_Parser**: Modul validasi yang memeriksa kesesuaian `Dashboard_Payload` dengan schema v2 (saat ini `dashboardSchema` di `dashboard-react/src/data/schema.ts` dan `validateDashboardRaw` di legacy).
- **Payload_Serializer**: Builder `scripts/export/build-dashboard-data.js` yang memproduksi `Dashboard_Payload` dari sumber Supabase/JSON mentah.
- **Dashboard_Runtime_API**: Endpoint serverless `/api/dashboard-data` di `dashboard-react/api/dashboard-data.ts` yang menyajikan `Dashboard_Payload` ke frontend.
- **React_Dashboard**: Aplikasi frontend di `dashboard-react/` (Vite + React + Tailwind).
- **Legacy_Dashboard**: Folder `dashboard/` di repo — sudah tidak di-serve ke production; menyisakan artefak kode (HTML + vanilla JS modul) dan file `dashboard/data.json` sebagai snapshot data historis yang masih dipakai Dashboard_Runtime_API.
- **Auth_Module**: Modul `dashboard/js/auth.js` yang menyediakan login demo berbasis `localStorage`; status saat ini tidak di-serve ke production (hanya tersisa di repo sebagai artefak legacy).
- **Freshness_Monitor**: Komponen yang menilai dan menampilkan status kesegaran data berdasarkan `generated_at` dan `latest.date`.
- **Observability_Layer**: Mekanisme log terstruktur, metric counter, health endpoint, dan error reporting.
- **Property_Test**: Test berbasis property (misal fast-check) yang memverifikasi invariant/round-trip/metamorphic property.
- **Staleness_Threshold**: Batas waktu maksimum antara `generated_at` dan waktu request sebelum data dianggap basi (default 24 jam WIB).
- **ER**: Engagement Rate, didefinisikan sebagai `((avg_likes + avg_comments) / followers) * 100` dalam satuan persen.
- **Account_Config**: File `config/accounts.json` yang berisi daftar akun yang dipantau beserta baseline followers.
- **Post_Type**: Salah satu dari set `{reels, carousel, image, video}` sesuai klasifikasi di `calc-instagram-metrics.js`.

## Requirements

### Requirement 1: Cleanup Legacy Dashboard Artefak

**User Story:** Sebagai maintainer, saya ingin menghapus artefak Legacy_Dashboard dari repo dan memastikan tidak ada referensi aktif ke sana, sehingga tidak ada developer yang secara tidak sengaja memperbaiki atau men-deploy kode legacy.

#### Acceptance Criteria

1. THE IG_Tracker_System SHALL menyatakan React_Dashboard sebagai satu-satunya frontend production, dan tidak mengizinkan deployment baru yang men-serve konten frontend dari folder `dashboard/`.
2. WHEN audit cleanup dijalankan, THE IG_Tracker_System SHALL menghasilkan laporan yang memisahkan file di folder `dashboard/` menjadi dua daftar: file yang masih dipakai oleh pipeline atau Dashboard_Runtime_API (contoh: `dashboard/data.json`) dan file yang dapat dihapus, dengan setiap entri mencantumkan path file dan alasan klasifikasinya.
3. IF sebuah file di `dashboard/js/`, `dashboard/index.html`, atau aset frontend legacy lainnya tidak terdaftar sebagai dependency pipeline atau Dashboard_Runtime_API pada laporan cleanup, THEN THE IG_Tracker_System SHALL menandai file tersebut sebagai kandidat hapus di laporan cleanup.
4. THE IG_Tracker_System SHALL menghapus `dashboard/js/auth.js` beserta seluruh referensi kredensial default `admin/admin` dari repo sebelum tag rilis berikutnya; IF berkas tersebut dipindahkan ke folder arsip yang ditandai non-executable alih-alih dihapus, THEN kredensial default `admin/admin` di dalam berkas tersebut SHALL tetap dihapus sebelum pemindahan sehingga tidak ada credential literal yang tersisa di working tree.
5. THE IG_Tracker_System SHALL menghapus `dashboard/vercel.json` atau mengosongkan isinya sehingga tidak ada konfigurasi Vercel aktif yang men-deploy folder legacy.
6. IF `dashboard/data.json` masih dipakai Dashboard_Runtime_API sebagai sumber atau fallback data, THEN THE IG_Tracker_System SHALL memindahkan file tersebut ke lokasi yang tidak menyiratkan frontend (misal `data/dashboard-snapshot.json`) atau mendokumentasikan secara eksplisit di `docs/final-architecture.md` bahwa folder `dashboard/` bukan lagi frontend tetapi sumber data snapshot.
7. WHEN developer membuka pull request yang memodifikasi file di `dashboard/js/`, THE IG_Tracker_System SHALL menampilkan peringatan dari CI atau pre-commit hook yang menyatakan folder tersebut deprecated dan mengarahkan developer untuk melakukan perubahan di `dashboard-react/`.

### Requirement 2: Kontrak Data Dashboard Terunifikasi

**User Story:** Sebagai developer frontend, saya ingin kontrak `Dashboard_Payload` didefinisikan secara eksplisit dan dishare antara Payload_Serializer, Dashboard_Runtime_API, dan React_Dashboard, sehingga tidak ada drift antara produsen dan konsumen data.

#### Acceptance Criteria

1. THE IG_Tracker_System SHALL mendefinisikan schema v2 `Dashboard_Payload` sebagai satu file schema kanonik tunggal yang dikonsumsi oleh Payload_Serializer, Dashboard_Runtime_API, dan Payload_Parser, dengan setiap field mendeklarasikan tipe data, status required/optional, dan batasan nilai yang dapat divalidasi secara otomatis.
2. WHEN sebuah run selesai dengan status sukses, THE Payload_Serializer SHALL menghasilkan `Dashboard_Payload` yang memuat field `generated_at` (timestamp ISO 8601 UTC), `generated_at_wib` (timestamp ISO 8601 zona Asia/Jakarta), `version` (integer positif), `sources` (daftar sumber data dengan minimal 1 entri), `accounts` (daftar akun dengan minimal 1 entri), `latest.date` (tanggal ISO 8601), `latest[account]` (satu entri per akun yang tercantum di `accounts`), `history`, `growth`, dan `rankings`.
3. WHEN Payload_Parser menerima `Dashboard_Payload` yang tidak memenuhi schema kanonik, THE Payload_Parser SHALL menolak payload tersebut dan mengembalikan daftar error dimana setiap entri berisi path field yang gagal (notasi dot-path) dan alasan kegagalan yang dapat dipetakan ke aturan schema.
4. THE Payload_Serializer SHALL menormalisasi nama field content breakdown menjadi set tunggal `{reels, carousels, images, videos}` pada setiap output, sehingga Payload_Parser menolak payload yang mengandung sinonim atau nama field content breakdown di luar set tersebut.
5. FOR ALL `Dashboard_Payload` yang valid menurut schema kanonik, THE IG_Tracker_System SHALL menjamin bahwa parsing dengan Payload_Parser kemudian serialisasi kembali ke JSON kemudian parsing ulang menghasilkan struktur domain yang setara secara field-by-field (nilai primitif identik, kumpulan dengan anggota dan urutan yang sama).
6. WHEN schema `Dashboard_Payload` berubah secara tidak kompatibel, THE Payload_Serializer SHALL menaikkan nilai `version` menjadi nilai yang lebih besar dari versi sebelumnya, dan IF Payload_Parser menerima payload dengan nilai `version` yang tidak termasuk dalam daftar versi yang didukung, THEN THE Payload_Parser SHALL menolak payload tersebut dan mengembalikan error yang menyebutkan versi diterima dan versi yang didukung.
7. THE IG_Tracker_System SHALL menyertakan dokumentasi schema kanonik pada lokasi `docs/dashboard-data-schema.md` yang untuk setiap field mencantumkan nama, tipe, status required/optional, dan batasan nilai yang sama persis dengan yang dideklarasikan di file schema kode.
8. WHEN file schema kode `Dashboard_Payload` dimodifikasi, THE IG_Tracker_System SHALL memblokir proses build atau commit jika `docs/dashboard-data-schema.md` tidak ikut diperbarui sehingga sinkronisasi antara kode dan dokumentasi selalu terjaga.

### Requirement 3: Kalkulator Metrik yang Akurat dan Aman

**User Story:** Sebagai analis, saya ingin angka metrik yang ditampilkan dashboard akurat dan tidak pernah `NaN`/`Infinity`, sehingga insight yang diambil dapat diandalkan.

#### Acceptance Criteria

1. THE Metric_Calculator SHALL menghitung `engagement_rate` dengan formula `((avg_likes + avg_comments) / followers) * 100` dan membulatkan hasil akhir ke 2 desimal menggunakan pembulatan half-up.
2. IF `followers` bukan bilangan bulat positif berhingga (yaitu bernilai 0, negatif, null, NaN, Infinity, atau bukan angka), THEN THE Metric_Calculator SHALL mengembalikan `engagement_rate` sebagai `null` dan tidak melakukan operasi pembagian.
3. IF daftar posts yang dianalisis berjumlah 0, THEN THE Metric_Calculator SHALL mengembalikan `avg_likes`, `avg_comments`, dan `engagement_rate` sebagai `null` dan `posts_analyzed` sebagai 0.
4. WHEN Metric_Calculator memproses post dengan `type` di luar set terdaftar `{reels, carousel, image, video}`, THE Metric_Calculator SHALL mencatat pesan peringatan ke stderr yang mengindikasikan tipe tidak dikenal, mengelompokkan post tersebut sebagai `unknown`, dan melanjutkan pemrosesan tanpa menghentikan run.
5. THE Metric_Calculator SHALL menghitung `total_likes` dan `total_comments` sebagai penjumlahan entri yang merupakan angka berhingga non-negatif (bukan null, bukan NaN, bukan Infinity, dan bukan nilai non-numerik), dan mengabaikan entri selain itu tanpa menggagalkan run.
6. WHEN setidaknya satu post memiliki nilai `likes` numerik valid, THE Metric_Calculator SHALL menghasilkan `avg_likes` yang berada di interval tertutup `[min(likes_valid), max(likes_valid)]` dari posts valid (invariant property).
7. THE Metric_Calculator SHALL memastikan jumlah counter `reels + carousel + image + video + unknown` sama dengan `posts_analyzed` pada setiap run (invariant property).
8. WHEN input posts dan parameter `followers` yang identik diproses dua kali berturut-turut, THE Metric_Calculator SHALL menghasilkan dua file output JSON yang identik secara byte-per-byte (determinism/idempotence property).
9. IF argumen command line `<account>` atau `<followers>` tidak diberikan, kosong, atau gagal divalidasi sebagai (a) string non-kosong untuk `<account>` atau (b) bilangan bulat positif berhingga untuk `<followers>`, THEN THE Metric_Calculator SHALL menampilkan pesan usage ke stderr dan keluar dengan exit code 1.
10. THE Metric_Calculator SHALL menjamin bahwa nilai numerik pada output (`avg_likes`, `avg_comments`, `engagement_rate`, `total_likes`, `total_comments`) tidak pernah berupa `NaN` atau `Infinity`; jika perhitungan tidak dapat dilakukan, field tersebut SHALL bernilai `null`.

### Requirement 4: Pemantauan Kesegaran Data

**User Story:** Sebagai operator, saya ingin tahu kapan data dashboard terakhir di-generate dan apakah sudah basi, sehingga saya dapat men-trigger ulang pipeline sebelum stakeholder melihat data usang.

#### Acceptance Criteria

1. THE Freshness_Monitor SHALL menampilkan `generated_at_wib` (format `YYYY-MM-DD HH:mm` pada zona WIB/UTC+07:00) dan `latest.date` (format `YYYY-MM-DD`) dari `Dashboard_Payload` pada area header React_Dashboard sepanjang sesi pengguna aktif.
2. WHEN selisih antara waktu sistem client saat request dilakukan dan `generated_at` berada pada rentang lebih besar dari 24 jam hingga kurang dari atau sama dengan 48 jam, THE Freshness_Monitor SHALL menampilkan indikator status dengan label teks `stale` serta warna latar peringatan yang secara visual berbeda dari status `fresh` dengan rasio kontras minimal 3:1 terhadap teks indikator.
3. WHEN selisih antara waktu sistem client saat request dilakukan dan `generated_at` melebihi 48 jam, THE Freshness_Monitor SHALL menampilkan indikator status dengan label teks `critical` serta warna latar yang secara visual berbeda dari status `fresh` maupun `stale` dengan rasio kontras minimal 3:1 terhadap teks indikator.
4. WHILE indikator status bernilai `critical`, THE Freshness_Monitor SHALL menampilkan tombol `Retry` yang ketika ditekan oleh pengguna memicu permintaan ulang ke Dashboard_Runtime_API yang melewati cache client, menampilkan indikator loading selama maksimal 15 detik, dan memperbarui indikator kesegaran setelah respons diterima atau timeout tercapai.
5. IF Dashboard_Runtime_API tidak memberikan respons dalam 10 detik atau mengembalikan status HTTP non-2xx, THEN THE Freshness_Monitor SHALL tetap menampilkan indikator status berdasarkan `generated_at` terakhir dari payload yang telah di-cache di client dan menandai sumber data sebagai `cached`.
6. IF Dashboard_Runtime_API tidak dapat dihubungi sesuai kriteria pada kriteria 5 dan tidak tersedia payload cached di client, THEN THE Freshness_Monitor SHALL menampilkan indikator status `unavailable` disertai pesan error yang mengindikasikan data tidak dapat dimuat dan menyediakan tombol `Retry`.
7. THE Dashboard_Runtime_API SHALL mengekspos endpoint health `/api/health` yang mengembalikan objek JSON `{status, generated_at, age_seconds, accounts_count}` di mana `status` bernilai salah satu dari `fresh` (age_seconds ≤ 86400), `stale` (86400 < age_seconds ≤ 172800), atau `critical` (age_seconds > 172800), berdasarkan payload upstream terbaru.
8. IF Dashboard_Runtime_API gagal mem-fetch payload dari sumber primer karena timeout melebihi 10 detik, error jaringan, atau status HTTP non-2xx, THEN THE Dashboard_Runtime_API SHALL mencatat kegagalan di log terstruktur dan mencoba sumber fallback secara berurutan hingga maksimal 3 percobaan.
9. IF seluruh percobaan fallback Dashboard_Runtime_API gagal sesuai batas pada kriteria 8, THEN THE Dashboard_Runtime_API SHALL mengembalikan HTTP 502 dengan body JSON berisi field `error` yang mendeskripsikan penyebab kegagalan tanpa memuat konten selain JSON.
10. IF Dashboard_Runtime_API berhasil mem-fetch payload tetapi payload tidak dapat diparsing sebagai JSON, THEN THE Dashboard_Runtime_API SHALL mengembalikan HTTP 422 dengan body JSON berisi field `error` deskriptif, tanpa menyisipkan konten HTML.
11. THE Freshness_Monitor SHALL menampilkan source label `sources.stats` dan `sources.engagement` dari `Dashboard_Payload` pada area header React_Dashboard sehingga pengguna mengetahui asal data.

### Requirement 5: Keamanan dan Autentikasi

**User Story:** Sebagai pemilik data, saya ingin dashboard tidak bergantung pada auth client-side yang lemah dan tidak membocorkan kredensial default, sehingga akses terhadap tampilan internal terlindungi.

#### Acceptance Criteria

1. THE IG_Tracker_System SHALL menghapus kredensial default `admin/admin` dan logika hashing password hardcoded dari Auth_Module pada repo; karena Auth_Module sudah tidak di-serve dari production, kriteria ini bertujuan mencegah developer baru menganggap kode tersebut aktif dan mencegah kebocoran kredensial melalui git history search.
2. WHERE React_Dashboard di masa depan memerlukan auth untuk area tertentu (contoh tampilan internal atau admin), THE IG_Tracker_System SHALL menggunakan penyedia auth server-side (misal Supabase Auth atau Vercel Password Protection) alih-alih mengembalikan pola auth client-side berbasis `localStorage` seperti pada Auth_Module legacy.
3. THE Dashboard_Runtime_API SHALL memvalidasi `Dashboard_Payload` terhadap schema kanonik sebelum meneruskannya ke client, dan SHALL menolak payload yang gagal validasi dengan HTTP 502.
4. IF request HTTP method ke Dashboard_Runtime_API bukan `GET`, THEN THE Dashboard_Runtime_API SHALL mengembalikan HTTP 405 dengan header `Allow: GET`.
5. THE Dashboard_Runtime_API SHALL menyetel header `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, dan `Referrer-Policy: strict-origin-when-cross-origin` pada setiap response sukses.
6. THE IG_Tracker_System SHALL tidak mengekspos `SUPABASE_SERVICE_ROLE_KEY`, `APIFY_TOKEN`, atau secret lain di bundle frontend atau di `Dashboard_Payload`.
7. WHEN secret leakage check dijalankan terhadap `Dashboard_Payload` dan artefak build frontend, THE IG_Tracker_System SHALL mencatat peringatan untuk setiap kecocokan pola JWT, API key Apify, atau URL Supabase service role, dan tetap membolehkan deployment berlanjut.
8. THE React_Dashboard SHALL menyetel Content Security Policy yang minimal memuat `default-src 'self'`, `script-src 'self'`, `style-src 'self' 'unsafe-inline'`, dan daftar whitelist CDN yang dipakai.
9. WHEN deployment production React_Dashboard di-trigger, THE IG_Tracker_System SHALL memblokir deployment tersebut sampai secret leakage check pada kriteria 7 selesai dijalankan tanpa menghasilkan kecocokan pola secret di `Dashboard_Payload` maupun artefak build frontend.

### Requirement 6: Observability dan Error Handling

**User Story:** Sebagai engineer on-call, saya ingin melihat log terstruktur dan notifikasi error terpusat, sehingga dapat mendiagnosis kegagalan pipeline dan dashboard secara cepat.

#### Acceptance Criteria

1. THE Dashboard_Runtime_API SHALL menulis log terstruktur format JSON untuk setiap request dengan field minimal `timestamp`, `level`, `event`, `duration_ms`, `upstream_source`, dan `status_code`.
2. WHEN Payload_Serializer gagal membangun `Dashboard_Payload`, THE Payload_Serializer SHALL menulis log error berisi nama tahap yang gagal dan keluar dengan exit code non-zero.
3. WHEN React_Dashboard menangkap error yang tidak terduga di render tree, THE React_Dashboard SHALL menampilkan UI fallback `ErrorState` dan mencatat error ke console dengan tag `dashboard.error`.
4. THE React_Dashboard SHALL menampilkan status refresh (`live`, `cached`, `loading`) yang konsisten antara `RefreshIndicator`, `FreshnessPanel`, dan tombol refresh di header.
5. WHEN retry di-trigger dari UI, THE React_Dashboard SHALL membatalkan request inflight sebelumnya dan memulai request baru, dengan catatan bahwa state `isLoading` dan `isRefreshing` tidak boleh bernilai true secara bersamaan untuk retry yang sama.
6. IF React_Dashboard gagal membatalkan request inflight saat retry di-trigger, THEN THE React_Dashboard SHALL menunda pembuatan request baru sampai request sebelumnya selesai, sehingga hanya satu request aktif pada satu waktu.
7. IF Dashboard_Runtime_API mengembalikan status non-2xx, THEN THE React_Dashboard SHALL menampilkan pesan error yang memuat kode HTTP dan opsi retry, tanpa menampilkan stack trace internal.
8. THE Observability_Layer SHALL menyediakan dashboard log (Vercel log explorer atau setara) yang dapat diakses tanpa memerlukan deploy baru.

### Requirement 7: Performance Dashboard

**User Story:** Sebagai pengguna dashboard, saya ingin halaman memuat cepat dan interaksi terasa responsif, sehingga saya dapat menelusuri metrik tanpa menunggu lama.

#### Acceptance Criteria

1. WHEN React_Dashboard dimuat pertama kali pada koneksi 4G referensi (10 Mbps, RTT 70 ms), THE React_Dashboard SHALL menyelesaikan Largest Contentful Paint dalam waktu kurang dari 2500 ms.
2. THE React_Dashboard SHALL memuat modul `HeadToHead`, `HeatmapPresentation`, `QuickVisual`, dan `FeaturedGrowthChart` melalui code splitting `React.lazy` agar tidak termasuk bundle initial.
3. WHEN pengguna berpindah antar section di `SectionNav`, THE React_Dashboard SHALL menyelesaikan transisi dalam waktu kurang dari 150 ms untuk section yang sudah termount.
4. THE Dashboard_Runtime_API SHALL merespons dalam waktu kurang dari 800 ms untuk 95 persen request pada kondisi cache Vercel warm.
5. THE Dashboard_Runtime_API SHALL menyetel header `Cache-Control: public, s-maxage=60, stale-while-revalidate=300` untuk response sukses.
6. THE React_Dashboard SHALL membatasi ukuran bundle initial (JS + CSS, di-gzip) maksimum 250 KB.
7. WHEN chart Recharts dirender dengan lebih dari 90 data point, THE React_Dashboard SHALL menggunakan pendekatan virtualisasi atau downsampling agar tidak memblok main thread lebih dari 50 ms per render.
8. WHERE jumlah data point chart Recharts kurang dari atau sama dengan 90, THE React_Dashboard SHALL tetap membolehkan penggunaan virtualisasi untuk alasan konsistensi, tanpa wajib memenuhi batas 50 ms per render.

### Requirement 8: Accessibility

**User Story:** Sebagai pengguna yang mengandalkan keyboard atau screen reader, saya ingin semua fitur dashboard dapat saya akses, sehingga tidak ada informasi yang terkunci di balik interaksi mouse saja.

#### Acceptance Criteria

1. WHEN pengguna mengaktifkan skip link melalui keyboard (Tab untuk fokus lalu Enter), THE React_Dashboard SHALL memindahkan fokus keyboard ke konten utama `#dashboard-main` dan menjadikan skip link terlihat secara visual selama menerima fokus.
2. THE React_Dashboard SHALL memastikan seluruh elemen interaktif (tombol, select, tab nav, link) dapat dioperasikan hanya dengan keyboard menggunakan Tab, Shift+Tab, Enter, Space, dan Arrow keys sesuai peran ARIA masing-masing, dengan urutan fokus yang mengikuti urutan visual dari kiri-ke-kanan dan atas-ke-bawah.
3. THE React_Dashboard SHALL menampilkan indikator fokus visual (outline atau ring) dengan kontras minimal 3:1 terhadap latar pada setiap elemen interaktif yang sedang menerima fokus keyboard.
4. THE React_Dashboard SHALL menyertakan label teks yang dapat dibaca screen reader pada setiap indikator status (fresh, cached, stale, error), terlepas dari apakah warna juga digunakan, sehingga status selalu terbaca tanpa bergantung pada persepsi warna.
5. THE React_Dashboard SHALL memastikan kontras warna teks terhadap latar minimal 4.5:1 untuk teks normal (kurang dari 18pt reguler atau kurang dari 14pt bold) dan 3:1 untuk teks besar (18pt reguler ke atas atau 14pt bold ke atas) pada tema terang maupun tema gelap.
6. WHEN modal atau panel overlay terbuka, THE React_Dashboard SHALL menahan fokus di dalam overlay menggunakan focus trap sampai overlay ditutup, dan mengizinkan pengguna menutup overlay dengan menekan tombol Escape.
7. WHEN modal atau panel overlay ditutup, THE React_Dashboard SHALL mengembalikan fokus keyboard ke elemen pemicu (trigger) yang sebelumnya membuka overlay tersebut.
8. THE React_Dashboard SHALL memberi atribut `aria-label` pada tombol icon-only (contoh: toggle tema, refresh, toggle nav) yang berisi frasa singkat menjelaskan aksi tombol tanpa mengulang nama icon.
9. IF gambar atau icon bersifat dekoratif (tidak menyampaikan informasi tambahan di luar teks sekitarnya), THEN THE React_Dashboard SHALL menyetel `aria-hidden="true"` atau `alt=""` sehingga tidak dibaca oleh screen reader.

### Requirement 9: Konsistensi UX antar View

**User Story:** Sebagai pengguna dashboard, saya ingin semantic, format angka, dan label status konsisten antar view Overview, Growth, Content, Comparison, Charts, Pattern, dan Recap, sehingga saya tidak bingung membandingkan angka yang sama dengan tampilan berbeda.

#### Acceptance Criteria

1. THE React_Dashboard SHALL memformat semua angka integer dan compact menggunakan utility formatter tunggal (`formatInteger`, `formatCompact`) dan tidak memakai `Number.toLocaleString` ad hoc di komponen.
2. THE React_Dashboard SHALL memformat semua tanggal dengan timezone `Asia/Jakarta` dan locale `id-ID` pada seluruh komponen yang menampilkan tanggal data.
3. THE React_Dashboard SHALL menggunakan palette Instagram brand (`--ig-pink`, `--ig-purple`, `--ig-blue`, `--ig-orange`) secara konsisten antar chart melalui `chart-theme.ts`.
4. WHEN sebuah view menampilkan ranking akun, THE React_Dashboard SHALL menggunakan urutan akun yang sama dengan `rankings.by_followers` kecuali pengguna secara eksplisit mengubah urutan.
5. WHERE sebuah view menampilkan metrik Engagement Rate, THE React_Dashboard SHALL menampilkan satuan persen dengan dua desimal dan sufiks `%`.
6. THE React_Dashboard SHALL menampilkan label state kosong (`empty state`) yang konsisten dengan format `Belum ada data untuk [nama metrik].` pada setiap komponen yang dapat bertemu payload tanpa data.

### Requirement 10: Deployment dan Konfigurasi

**User Story:** Sebagai DevOps, saya ingin deployment dashboard deterministik dan konfigurasi tidak duplikat, sehingga rilis dan rollback dapat diprediksi.

#### Acceptance Criteria

1. THE IG_Tracker_System SHALL menyimpan konfigurasi Vercel produksi hanya di `dashboard-react/vercel.json`, dan file `dashboard/vercel.json` SHALL dihapus atau dikosongkan isinya agar tidak ada konfigurasi Vercel kedua yang tertinggal di repo.
2. THE Dashboard_Runtime_API SHALL membaca URL sumber data upstream dari environment variable `DASHBOARD_DATA_URL` dan tidak menghardcode URL repository.
3. WHEN `DASHBOARD_DATA_URL` tidak tersedia, THE Dashboard_Runtime_API SHALL menggunakan URL default yang didokumentasikan di `dashboard-react/README.md`.
4. IF `npm run build` di `dashboard-react/` menghasilkan error TypeScript atau Vite, THEN THE IG_Tracker_System SHALL menggagalkan seluruh pipeline build (exit non-zero) tanpa membolehkan komponen lain menyelesaikan build secara terpisah.
5. THE IG_Tracker_System SHALL menjalankan `npm test` (root) yang mengeksekusi smoke test dashboard dan test Vitest React sebagai prasyarat sebelum merge ke branch utama.
6. WHEN rilis baru di-deploy ke production, THE IG_Tracker_System SHALL menyertakan informasi commit SHA di response header `X-Dashboard-Commit` dari Dashboard_Runtime_API.
7. THE IG_Tracker_System SHALL menyimpan daftar akun Instagram yang dipantau hanya di `config/accounts.json` dan tidak menduplikasi daftar tersebut di kode lain.

### Requirement 11: Data Pipeline Reliability

**User Story:** Sebagai operator pipeline, saya ingin pipeline harian menghasilkan `Dashboard_Payload` yang valid, atau gagal dengan laporan yang jelas, sehingga saya dapat memperbaiki masalah sumber data sebelum dashboard terganggu.

#### Acceptance Criteria

1. THE Data_Pipeline SHALL menjalankan langkah collect (SocialBlade + Apify), transform, calculate metrics, dan build `Dashboard_Payload` secara berurutan sesuai `config/pipeline.json`.
2. IF sebuah langkah Data_Pipeline gagal dengan error fatal, THEN THE Data_Pipeline SHALL membatalkan langkah berikutnya dan mempertahankan `Dashboard_Payload` sebelumnya tidak ditimpa.
3. WHEN Data_Pipeline sukses, THE Data_Pipeline SHALL memvalidasi `Dashboard_Payload` yang baru dibuild terhadap schema kanonik sebelum ditulis ke disk.
4. WHEN Data_Pipeline dijalankan untuk semua akun di `Account_Config` yang `enabled = true`, THE Data_Pipeline SHALL menghasilkan entri `latest[account]` untuk setiap akun enabled tersebut.
5. IF sebuah akun di `Account_Config` tidak menghasilkan data post karena actor Apify gagal, THEN THE Data_Pipeline SHALL tetap menyertakan akun tersebut di `accounts[]` dan `latest[account]` dengan field engagement `null`, serta mencatat peringatan.
6. THE Data_Pipeline SHALL menyimpan artefak mentah per akun di `artifacts/instagram/<account>-latest12-full.json` dan hasil metrik di `artifacts/instagram/<account>-metrics.json`.
7. FOR ALL tanggal pada `Dashboard_Payload.history`, tanggal tersebut SHALL unik dan terurut menaik (invariant property).

### Requirement 12: Testing dan Quality Assurance

**User Story:** Sebagai maintainer, saya ingin coverage test yang cukup untuk kalkulasi metrik, parser payload, dan selector frontend, sehingga regresi dapat tertangkap sebelum rilis.

#### Acceptance Criteria

1. THE IG_Tracker_System SHALL menyediakan unit test untuk `calc-instagram-metrics.js` yang mencakup skenario: daftar posts kosong, followers nol, posts dengan tipe tidak dikenal, dan daftar posts normal.
2. THE IG_Tracker_System SHALL menyediakan Property_Test untuk `calc-instagram-metrics.js` yang memverifikasi invariant rata-rata (Requirement 3 butir 6), invariant total post per tipe (Requirement 3 butir 7), dan idempotence (Requirement 3 butir 8).
3. THE IG_Tracker_System SHALL menyediakan Property_Test untuk Payload_Parser yang memverifikasi round-trip (parse → serialize → parse) pada generator payload yang memenuhi schema kanonik.
4. THE IG_Tracker_System SHALL menyediakan test Dashboard_Runtime_API yang mencakup skenario sukses remote, fallback ke local file, payload tidak valid JSON, dan method non-GET.
5. THE IG_Tracker_System SHALL menyediakan test React_Dashboard yang memverifikasi state loading, state error, dan retry flow di `useDashboardData`.
6. WHEN test suite dijalankan melalui `npm test` di root, THE IG_Tracker_System SHALL menyelesaikan seluruh test dalam waktu kurang dari 120 detik pada CI default runner.
7. IF Payload_Parser menolak snapshot `dashboard/data.json` apapun di repo, THEN THE IG_Tracker_System SHALL menggagalkan CI, termasuk pada saat snapshot baru saja diperbarui pada commit yang sama.

### Requirement 13: Dokumentasi Audit dan Perbaikan

**User Story:** Sebagai anggota tim baru, saya ingin menemukan dokumen audit dan panduan perbaikan di satu tempat, sehingga saya dapat memahami state sistem dan prioritas improvement tanpa menelusuri kode.

#### Acceptance Criteria

1. THE IG_Tracker_System SHALL menyediakan dokumen `docs/audit-report.md` yang mencantumkan temuan per domain (cleanup artefak legacy, data pipeline, keamanan, observability, performance, accessibility, UX, deployment) beserta severity (`high`, `medium`, `low`).
2. THE IG_Tracker_System SHALL memetakan setiap temuan ke Requirement di dokumen ini menggunakan id `Requirement N`.
3. WHEN sebuah Requirement selesai dikerjakan, THE IG_Tracker_System SHALL menandai status Requirement tersebut di `docs/audit-report.md` menjadi `done` beserta commit SHA penyelesaian.
4. THE IG_Tracker_System SHALL mendokumentasikan proses menjalankan audit ulang (regenerasi `docs/audit-report.md`) di `docs/daily-operations.md` atau dokumen setara.
5. THE IG_Tracker_System SHALL mendokumentasikan di `docs/dashboard-migration.md` bahwa migrasi React telah selesai per tanggal [TBD], beserta daftar fitur Legacy_Dashboard yang tidak di-port ke React_Dashboard dan alasan setiap fitur tersebut tidak di-port.
