# RomanceToon (https://romancetoon.com)

A high-performance romance webtoon & manhwa platform built with **Nuxt 3**, **Tailwind CSS**, **Node.js / Express**, **MySQL**, and **Cloudflare R2** object storage.

---

## 📁 Project Architecture

```
romance b and f/
├── frontend/                     # Nuxt 3 Frontend Web Application
│   ├── assets/css/main.css       # Romantic dark theme & typography
│   ├── components/               # Navbar, HeroBanner, MangaCard, WebtoonReader, etc.
│   ├── composables/              # useApi.ts (SSR-compatible API client)
│   ├── pages/                    # File-based routing
│   │   ├── index.vue             # Homepage (Discover & Latest releases)
│   │   ├── genres.vue            # Genre & trope explorer
│   │   ├── popular.vue           # Most popular titles
│   │   └── webtoon/
│   │       └── [slug]/
│   │           ├── index.vue     # Manga details & chapter list (SSR useAsyncData)
│   │           └── [chapterId].vue # Continuous vertical Webtoon Reader
│   ├── server/routes/
│   │   └── sitemap.xml.ts        # Dynamic XML sitemap generator
│   ├── nuxt.config.ts            # Nuxt configuration & pre-rendering routes
│   └── .env.example              # Frontend environment template
│
├── backend/                      # Express REST API & Chapter Management
│   ├── server.js                 # Production Express API server
│   ├── mysql.js                  # MySQL database connection pool & schema init
│   ├── importer.js               # CLI batch chapter uploader to Cloudflare R2
│   ├── .env.example              # Backend environment template
│   └── package.json
│
└── tests/                        # Automated Security & Integration Test Suites
    ├── run_all.cjs               # Master test runner
    ├── test_auth_phase1.cjs      # Phase 1: Authentication & Secrets verification
    ├── test_publish_phase2.cjs   # Phase 2: Chapter publishing & HTTP 207 Multi-Status
    ├── test_slug_phase3.cjs      # Phase 3: Unicode slugs (Arabic, Korean, Japanese, Latin)
    └── test_ratelimit_phase4.cjs # Phase 4: Rate limiting & Cloudflare proxy isolation
```

---

## 🛠️ Security & Reliability Enhancements

The platform has been hardened across 5 distinct phases:

1. **Authentication & Secret Hardening (Phase 1):**
   - Zero hardcoded fallback credentials.
   - Server refuses to boot in production (`NODE_ENV=production`) if `ADMIN_PASSWORD` (< 8 chars) or `AUTH_SECRET` (< 16 chars) are missing or weak.
   - Constant-time timing safe comparison (`crypto.timingSafeEqual`) to prevent timing side-channel attacks.

2. **Publishing Fault-Tolerance (Phase 2):**
   - `POST /api/r2/publish-chapters` returns precise HTTP status codes: `200 OK` (all succeeded), `207 Multi-Status` (partial success), and `500` (all failed).
   - MySQL query errors are never disguised as false positives.
   - Uploaded Cloudflare R2 files are preserved in place on database failures, enabling safe retry without duplication.

3. **Unicode & Collision-Resistant Slugs (Phase 3):**
   - Full Unicode support across Arabic, Korean, Japanese, and Latin titles using regex `\p{L}` and `\p{N}`.
   - Automatic collision avoidance (`slug`, `slug-2`, `slug-3`) to prevent unique key violations.
   - Preserves all pre-existing published URLs and English slugs.

4. **Edge Rate Limiting & Proxy IP Defense (Phase 4):**
   - Express proxy trust configured securely to `'loopback'`.
   - Real client IPs are resolved via trusted Cloudflare edge header (`CF-Connecting-IP`), preventing rate limit bypass via spoofed `X-Forwarded-For`.
   - Isolated rate counters for separate users behind the same edge proxy.

5. **SSR Pre-rendering & SEO Optimization (Phase 5):**
   - Critical pages converted from client-only `onMounted` fetching to Nuxt `useAsyncData` for server-side rendering and static generation.
   - Generated static pages include rich OpenGraph meta tags, titles, and crawler-friendly internal links.
   - Dynamic `/sitemap.xml` automatically lists all published manga and chapters while excluding unpublished drafts.

---

## 🧪 Running Automated Tests

Run the entire test suite with a single command:

```bash
# From the project root:
node tests/run_all.cjs

# Or from backend/:
cd backend
npm test
```

Each suite tests both successful operations and failure edge cases:
- `test_auth_phase1.cjs`: Rejection of default/weak secrets, production fail-safe, timing-safe signatures.
- `test_publish_phase2.cjs`: 400 empty chapters, 404 missing manga, 207 partial success, 500 error propagation.
- `test_slug_phase3.cjs`: Arabic, Korean, Japanese, Latin, symbols-only fallback, numeric collision increments.
- `test_ratelimit_phase4.cjs`: Cloudflare proxy IP extraction, spoofing immunity, per-IP limit isolation.

---

## 💻 Local Development Setup

### 1. Backend API

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env and supply your MySQL and R2 credentials
# (For local development, ensure DB_HOST, DB_USER, DB_PASSWORD, DB_NAME are valid)

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
# Server will listen on http://localhost:3001
```

### 2. Frontend Web App

```bash
cd frontend

# Copy environment template
cp .env.example .env

# Install dependencies
npm install

# Start Nuxt development server
npm run dev
# App will listen on http://localhost:3000
```

---

## 🚀 Deployment Guide (Hostinger)

RomanceToon is architected for maximum speed, security, and low resource overhead on Hostinger by decoupling the static frontend from the Node.js API.

### A. Frontend Deployment (`romancetoon.com`)

1. **Build Static Pre-rendered Site:**
   ```bash
   cd frontend
   npm run generate
   ```
   This generates ready-to-serve HTML, CSS, JavaScript, and dynamic `sitemap.xml` in `frontend/.output/public/`.

2. **Hostinger Website Type:**
   - In Hostinger hPanel, configure the main domain `romancetoon.com` as a standard **PHP/HTML website** (not Node.js Passenger).
   - This serves your pre-rendered pages directly via LiteSpeed/Nginx with ultra-low TTFB, instant caching, and 0% Node memory footprint.

3. **Upload Files:**
   - Upload the contents of `frontend/.output/public/` directly into the `public_html/` folder of `romancetoon.com`.

### B. Backend Deployment (`api.romancetoon.com`)

1. **Subdomain Setup:**
   - In Hostinger hPanel, create a subdomain: `api.romancetoon.com`.
   - Set the subdomain type to **Node.js Web App**.
   - Node.js Version: **20.x or 22.x**.
   - Application Root: path to your `backend/` folder.
   - Startup File: `server.js`.

2. **Environment Variables on Hostinger:**
   Configure the following in Hostinger hPanel Node.js configuration or in `backend/.env`:
   ```ini
   NODE_ENV=production
   PORT=3001
   ADMIN_USERNAME=your_admin_user
   ADMIN_PASSWORD=your_strong_admin_password
   AUTH_SECRET=your_32_char_random_secret
   DB_HOST=localhost
   DB_USER=your_hostinger_db_user
   DB_PASSWORD=your_hostinger_db_password
   DB_NAME=your_hostinger_db_name
   R2_ACCOUNT_ID=your_cloudflare_account_id
   R2_ACCESS_KEY_ID=your_cloudflare_access_key
   R2_SECRET_ACCESS_KEY=your_cloudflare_secret_key
   R2_BUCKET_NAME=romancetoon-chapters
   R2_PUBLIC_DOMAIN=https://cdn.romancetoon.com
   ```

3. **Install & Restart:**
   - Run `npm install --production` inside `backend/`.
   - Click **Restart** in the Node.js panel.

---

## 📄 License
All rights reserved © RomanceToon.
