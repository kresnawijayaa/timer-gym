# SET/30 — Workout Timer

Timer interval olahraga yang dirancang agar tetap jelas saat ponsel diletakkan beberapa meter dari pengguna.

Fokus utama SET/30 adalah angka besar, kontrol yang mudah ditekan, dan peringatan audio-visual yang dapat dipahami tanpa perlu melihat layar dari dekat.

## Fitur

- Countdown default 30 detik dengan pengaturan kelipatan 5 detik.
- Tampilan mobile-first untuk orientasi portrait dan landscape.
- Tombol mulai, jeda, lanjut, dan reset berukuran besar.
- Peringatan bertahap pada 15, 10, dan 5 detik terakhir.
- Bunyi bip yang semakin cepat menjelang waktu habis.
- File audio lokal yang dipreload dan dibuka melalui interaksi pengguna agar lebih andal di Safari iPhone.
- Kedipan hijau, kuning, dan merah yang dapat dimatikan.
- Running text `TIME'S UP` ketika interval selesai.
- Dukungan getaran dan Screen Wake Lock pada browser yang kompatibel.
- Preferensi durasi, suara, dan cahaya tersimpan di perangkat.
- Dukungan `prefers-reduced-motion` untuk mengurangi animasi.
- Dapat dipasang sebagai web app melalui web manifest.

## Menjalankan secara lokal

Repository ini tidak memerlukan instalasi dependency atau proses build.

```powershell
git clone https://github.com/kresnawijayaa/timer-gym.git
cd timer-gym
python -m http.server 8080
```

Buka [http://localhost:8080](http://localhost:8080) di browser.

> Jangan membuka `index.html` langsung melalui protokol `file://`. Browser dapat memblokir web manifest dan beberapa API web karena halaman tidak dijalankan melalui HTTP.

## Deploy ke Vercel

### Vercel Dashboard

1. Pilih **Add New → Project** di Vercel.
2. Import repository `kresnawijayaa/timer-gym`.
3. Pilih **Other** pada Framework Preset.
4. Kosongkan Build Command dan gunakan `.` sebagai Output Directory.
5. Klik **Deploy**.

### Vercel CLI

```powershell
npx vercel
```

Tidak diperlukan environment variable.

## Teknologi

- HTML
- CSS
- JavaScript tanpa framework
- Web Audio API
- Screen Wake Lock API
- Vibration API

## Struktur proyek

```text
.
├── index.html
├── styles.css
├── app.js
├── audio/
│   ├── beep.wav
│   └── finish.wav
├── manifest.webmanifest
└── vercel.json
```

## Dukungan browser

Fungsi timer tetap berjalan pada browser modern. Wake lock, getaran, dan instalasi web app bergantung pada dukungan browser serta sistem operasi perangkat.

## Lisensi

Proyek ini dibuat untuk penggunaan pribadi.
