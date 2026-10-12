# RomanceToon (https://romancetoon.com)

A high-performance, modern romance webtoon & manhwa platform built with **Nuxt 3**, **Tailwind CSS**, and **Cloudflare R2** object storage.

---

## 📁 Project Architecture

```
romance b and f/
├── frontend/                     # Nuxt 3 Romantic Web Application
│   ├── assets/css/main.css       # Romantic dark & eye-comfort styles
│   ├── components/               # Navbar, HeroBanner, MangaCard, WebtoonReader
│   ├── data/mangas.ts            # Manga & chapter models
│   ├── layouts/                  # Default & Fullscreen Reader layouts
│   └── pages/
│       ├── index.vue             # Homepage (Discover & Latest releases)
│       ├── genres.vue            # Romance tropes & categories
│       ├── popular.vue           # Most loved & top ranked titles
│       ├── manga/[id]/index.vue  # Manga details & chapter list
│       └── manga/[id]/chapter/[chapterId].vue  # Continuous Webtoon Reader
│
└── backend/                      # Chapter Importer & Cloudflare R2 Uploader
    ├── data/                     # Drop your folders here (e.g. data/manga_xxx/1/)
    ├── importer.js               # Smart natural-sort page reader & R2 uploader
    └── .env.example              # Cloudflare R2 credentials template
```

---

## 🚀 How to Run the Website Locally

1. Open your terminal in `frontend/`
2. Start the app:
   ```bash
   node .output/server/index.mjs
   ```
   Or for live development editing:
   ```bash
   npm run dev
   ```
3. Open your browser at: **[http://localhost:3000](http://localhost:3000)**

---

## 📦 How to Import Chapters & Upload to Cloudflare R2

1. Place your manga folders inside `backend/data/` or any custom path:
   ```
   backend/data/manga_611ac7d4f93e7/
   ├── 1/
   │   ├── 01.webp
   │   ├── image-02.png
   │   └── 003.webp
   └── 2/
       └── ...
   ```
2. **Dry Run (Scan, verify page order, and generate manifest without uploading):**
   ```bash
   cd backend
   npm run test-scan
   ```
3. **Live Upload to Cloudflare R2:**
   - Copy `.env.example` to `.env` and fill in your Cloudflare R2 credentials.
   - Run:
     ```bash
     npm run import
     ```
