import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { loadData, saveData } from './database.js'
import { initMySQL, getPool, getStatus } from './mysql.js'
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({ origin: '*' }))
app.use(express.json())

// Initialize MySQL
initMySQL().then(connected => {
  if (connected) {
    console.log('[✔] RomanceToon is now using Hostinger MySQL Database.')
  } else {
    console.log('[i] RomanceToon is using fallback persistent JSON database.')
  }
})

// Smart natural sorting helper
function smartPageCompare(a, b) {
  const getNum = str => {
    const m = str.match(/(\d+)(?!.*\d)/)
    return m ? parseInt(m[1], 10) : 0
  }
  const numA = getNum(a)
  const numB = getNum(b)
  return numA !== numB ? numA - numB : a.localeCompare(b, undefined, { numeric: true })
}

// ---------------------------------------------------------------------------
// 1. Health check & Root info
// ---------------------------------------------------------------------------
app.get('/', (req, res) => {
  const dbStatus = getStatus()
  res.json({
    status: 'online',
    app: 'RomanceToon Backend API',
    version: '1.0.0',
    database: {
      type: dbStatus.isMysqlConnected ? 'MySQL (Hostinger)' : 'Persistent JSON',
      connected: dbStatus.isMysqlConnected,
      name: dbStatus.config.database
    },
    documentation: {
      db_check: 'GET /api/db-check',
      mangas: 'GET /api/mangas',
      manga_detail: 'GET /api/mangas/:id',
      chapter_detail: 'GET /api/mangas/:id/chapters/:chapterNumber',
      add_manga: 'POST /api/mangas',
      add_chapter: 'POST /api/mangas/:id/chapters',
      sync_r2: 'POST /api/r2/sync-chapter'
    }
  })
})

// Endpoint to verify Database connection status
app.get('/api/db-check', async (req, res) => {
  const status = getStatus()
  if (status.isMysqlConnected) {
    try {
      const pool = getPool()
      const [rows] = await pool.query('SELECT DATABASE() as db, NOW() as server_time')
      return res.json({
        success: true,
        message: 'MySQL is CONNECTED and active on Hostinger!',
        database_name: rows[0].db,
        server_time: rows[0].server_time,
        status
      })
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message, status })
    }
  }

  res.json({
    success: true,
    message: 'Backend is active using persistent local engine (MySQL credentials available in mysql.js)',
    status
  })
})

// ---------------------------------------------------------------------------
// 2. Manga Endpoints
// ---------------------------------------------------------------------------

// Get all mangas (with optional search and genre filter)
app.get('/api/mangas', async (req, res) => {
  const status = getStatus()

  // If MySQL is active
  if (status.isMysqlConnected) {
    try {
      const pool = getPool()
      const [rows] = await pool.query('SELECT * FROM mangas ORDER BY created_at DESC')
      const mangas = rows.map(r => ({
        ...r,
        alternativeTitles: r.alternative_titles ? JSON.parse(r.alternative_titles) : [],
        genres: r.genres ? JSON.parse(r.genres) : []
      }))
      return res.json({ success: true, count: mangas.length, data: mangas })
    } catch (err) {
      console.error('MySQL query error, fallback to memory:', err)
    }
  }

  // Fallback engine
  const db = loadData()
  let list = db.mangas || []

  const { genre, search } = req.query
  if (genre && genre !== 'All') {
    list = list.filter(m => m.genres && m.genres.includes(genre))
  }
  if (search) {
    const q = search.toLowerCase()
    list = list.filter(m => 
      m.title.toLowerCase().includes(q) || 
      (m.synopsis && m.synopsis.toLowerCase().includes(q))
    )
  }

  res.json({
    success: true,
    count: list.length,
    data: list
  })
})

// Get single manga by ID or Slug
app.get('/api/mangas/:id', async (req, res) => {
  const status = getStatus()

  if (status.isMysqlConnected) {
    try {
      const pool = getPool()
      const [rows] = await pool.query('SELECT * FROM mangas WHERE id = ? OR slug = ?', [req.params.id, req.params.id])
      if (rows.length > 0) {
        const manga = rows[0]
        const [chapRows] = await pool.query('SELECT * FROM chapters WHERE manga_id = ? ORDER BY chapter_number ASC', [manga.id])
        manga.alternativeTitles = manga.alternative_titles ? JSON.parse(manga.alternative_titles) : []
        manga.genres = manga.genres ? JSON.parse(manga.genres) : []
        manga.chapters = chapRows.map(c => ({
          id: c.chapter_number.toString(),
          number: c.chapter_number,
          title: c.title,
          releaseDate: c.release_date,
          views: c.views,
          pagesCount: c.pages_count,
          pages: c.pages_json ? JSON.parse(c.pages_json) : []
        }))
        return res.json({ success: true, data: manga })
      }
    } catch (err) {
      console.error('MySQL query error:', err)
    }
  }

  const db = loadData()
  const manga = (db.mangas || []).find(m => m.id === req.params.id || m.slug === req.params.id)

  if (!manga) {
    return res.status(404).json({ success: false, message: 'Manga not found' })
  }

  res.json({
    success: true,
    data: manga
  })
})

// Create new manga
app.post('/api/mangas', async (req, res) => {
  const { title, cover, banner, synopsis, author, artist, genres, badge, alternativeTitles } = req.body

  if (!title) {
    return res.status(400).json({ success: false, message: 'Title is required' })
  }

  const id = `manga_${Date.now().toString(16)}`
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const altList = alternativeTitles ? (Array.isArray(alternativeTitles) ? alternativeTitles : alternativeTitles.split(',').map(s => s.trim())) : []
  const genreList = genres || ['Romance']

  const status = getStatus()
  if (status.isMysqlConnected) {
    try {
      const pool = getPool()
      await pool.query(
        `INSERT INTO mangas (id, slug, title, alternative_titles, cover, banner, synopsis, author, artist, genres, badge)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, slug, title, JSON.stringify(altList), cover || '', banner || cover || '', synopsis || '', author || 'Unknown', artist || 'Unknown', JSON.stringify(genreList), badge || 'NEW']
      )
    } catch (err) {
      console.error('MySQL insert error:', err)
    }
  }

  // Also persist in local engine
  const db = loadData()
  const newManga = {
    id,
    slug,
    title,
    alternativeTitles: altList,
    cover: cover || '',
    banner: banner || cover || '',
    synopsis: synopsis || '',
    author: author || 'Unknown',
    artist: artist || 'Unknown',
    genres: genreList,
    rating: 5.0,
    ratingCount: '1',
    status: 'Ongoing',
    views: '0',
    bookmarks: '0',
    badge: badge || 'NEW',
    createdAt: new Date().toISOString(),
    chapters: []
  }

  db.mangas.unshift(newManga)
  saveData(db)

  res.status(201).json({
    success: true,
    message: 'Manga created successfully',
    data: newManga
  })
})

// ---------------------------------------------------------------------------
// 3. Chapter Endpoints (Webtoon Reader Data)
// ---------------------------------------------------------------------------

// Get single chapter details and pages
app.get('/api/mangas/:id/chapters/:chapterNumber', async (req, res) => {
  const status = getStatus()
  const chapterNum = parseInt(req.params.chapterNumber, 10)

  if (status.isMysqlConnected) {
    try {
      const pool = getPool()
      const [mRows] = await pool.query('SELECT id, title, slug FROM mangas WHERE id = ? OR slug = ?', [req.params.id, req.params.id])
      if (mRows.length > 0) {
        const manga = mRows[0]
        const [cRows] = await pool.query('SELECT * FROM chapters WHERE manga_id = ? AND chapter_number = ?', [manga.id, chapterNum])
        if (cRows.length > 0) {
          const c = cRows[0]
          return res.json({
            success: true,
            manga,
            chapter: {
              id: c.chapter_number.toString(),
              number: c.chapter_number,
              title: c.title,
              releaseDate: c.release_date,
              views: c.views,
              pagesCount: c.pages_count,
              pages: c.pages_json ? JSON.parse(c.pages_json) : []
            }
          })
        }
      }
    } catch (err) {
      console.error('MySQL chapter query error:', err)
    }
  }

  const db = loadData()
  const manga = (db.mangas || []).find(m => m.id === req.params.id || m.slug === req.params.id)

  if (!manga) {
    return res.status(404).json({ success: false, message: 'Manga not found' })
  }

  const chapter = (manga.chapters || []).find(c => c.number === chapterNum || c.id === req.params.chapterNumber)

  if (!chapter) {
    return res.status(404).json({ success: false, message: 'Chapter not found' })
  }

  res.json({
    success: true,
    manga: { id: manga.id, title: manga.title, slug: manga.slug },
    chapter
  })
})

// Add or update chapter
app.post('/api/mangas/:id/chapters', async (req, res) => {
  const { number, title, pages } = req.body
  const chapterNumber = parseInt(number, 10)

  if (isNaN(chapterNumber)) {
    return res.status(400).json({ success: false, message: 'Valid chapter number is required' })
  }

  const status = getStatus()
  if (status.isMysqlConnected) {
    try {
      const pool = getPool()
      await pool.query(
        `INSERT INTO chapters (manga_id, chapter_number, title, release_date, pages_count, pages_json)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         title = VALUES(title), pages_count = VALUES(pages_count), pages_json = VALUES(pages_json)`,
        [req.params.id, chapterNumber, title || `Chapter ${chapterNumber}`, 'Just now', (pages && pages.length) || 0, JSON.stringify(pages || [])]
      )
    } catch (err) {
      console.error('MySQL chapter insert error:', err)
    }
  }

  // Also persist in local engine
  const db = loadData()
  const manga = (db.mangas || []).find(m => m.id === req.params.id)
  if (manga) {
    if (!manga.chapters) manga.chapters = []
    const existingIndex = manga.chapters.findIndex(c => c.number === chapterNumber)
    const chapterData = {
      id: chapterNumber.toString(),
      number: chapterNumber,
      title: title || `Chapter ${chapterNumber}`,
      releaseDate: 'Just now',
      views: '1',
      pagesCount: (pages && pages.length) || 0,
      pages: pages || []
    }
    if (existingIndex >= 0) manga.chapters[existingIndex] = chapterData
    else {
      manga.chapters.push(chapterData)
      manga.chapters.sort((a, b) => a.number - b.number)
    }
    saveData(db)
  }

  res.status(201).json({
    success: true,
    message: `Chapter ${chapterNumber} saved successfully`
  })
})

// ---------------------------------------------------------------------------
// 4. Cloudflare R2 Auto-Sync Endpoint
// ---------------------------------------------------------------------------
app.post('/api/r2/sync-chapter', async (req, res) => {
  const { mangaId, chapterNumber } = req.body

  if (!mangaId || !chapterNumber) {
    return res.status(400).json({ success: false, message: 'mangaId and chapterNumber are required' })
  }

  const r2Account = process.env.R2_ACCOUNT_ID
  const r2Key = process.env.R2_ACCESS_KEY_ID
  const r2Secret = process.env.R2_SECRET_ACCESS_KEY
  const r2Bucket = process.env.R2_BUCKET_NAME || 'romancetoon-chapters'
  const cdnDomain = process.env.R2_PUBLIC_DOMAIN || 'https://cdn.romancetoon.com'

  if (!r2Account || !r2Key || !r2Secret) {
    return res.status(400).json({ 
      success: false, 
      message: 'Cloudflare R2 credentials not configured in backend .env' 
    })
  }

  try {
    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${r2Account}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2Key,
        secretAccessKey: r2Secret
      }
    })

    const prefix = `${mangaId}/${chapterNumber}/`
    const command = new ListObjectsV2Command({
      Bucket: r2Bucket,
      Prefix: prefix
    })

    const response = await s3.send(command)
    const objects = response.Contents || []

    const validExtensions = new Set(['.webp', '.png', '.jpg', '.jpeg'])
    const imageKeys = objects
      .map(o => o.Key)
      .filter(k => {
        const ext = k.slice(k.lastIndexOf('.')).toLowerCase()
        return validExtensions.has(ext)
      })
      .sort(smartPageCompare)

    const pages = imageKeys.map((key, index) => ({
      page: index + 1,
      url: `${cdnDomain}/${key}`
    }))

    // Save to MySQL
    const cNum = parseInt(chapterNumber, 10)
    const status = getStatus()
    if (status.isMysqlConnected) {
      const pool = getPool()
      await pool.query(
        `INSERT INTO chapters (manga_id, chapter_number, title, release_date, pages_count, pages_json)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         pages_count = VALUES(pages_count), pages_json = VALUES(pages_json)`,
        [mangaId, cNum, `Chapter ${cNum}`, 'Just now', pages.length, JSON.stringify(pages)]
      )
    }

    // Save to local engine
    const db = loadData()
    const manga = (db.mangas || []).find(m => m.id === mangaId)
    if (manga) {
      if (!manga.chapters) manga.chapters = []
      const existingIdx = manga.chapters.findIndex(c => c.number === cNum)
      const chObj = {
        id: cNum.toString(),
        number: cNum,
        title: `Chapter ${cNum}`,
        releaseDate: 'Just now',
        views: '1',
        pagesCount: pages.length,
        pages
      }
      if (existingIdx >= 0) manga.chapters[existingIdx] = chObj
      else {
        manga.chapters.push(chObj)
        manga.chapters.sort((a, b) => a.number - b.number)
      }
      saveData(db)
    }

    res.json({
      success: true,
      message: `Synced ${pages.length} pages from Cloudflare R2`,
      pages
    })
  } catch (err) {
    console.error('R2 Sync error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`[✔] RomanceToon API Server running on port ${PORT}`)
  console.log(`[✔] Health check: http://localhost:${PORT}/`)
  console.log(`[✔] Database check: http://localhost:${PORT}/api/db-check`)
})
