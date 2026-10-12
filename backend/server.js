import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { loadData, saveData } from './database.js'
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({ origin: '*' }))
app.use(express.json())

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
  res.json({
    status: 'online',
    app: 'RomanceToon Backend API',
    version: '1.0.0',
    documentation: {
      mangas: 'GET /api/mangas',
      manga_detail: 'GET /api/mangas/:id',
      chapter_detail: 'GET /api/mangas/:id/chapters/:chapterNumber',
      add_manga: 'POST /api/mangas',
      add_chapter: 'POST /api/mangas/:id/chapters',
      sync_r2: 'POST /api/r2/sync-chapter'
    }
  })
})

// ---------------------------------------------------------------------------
// 2. Manga Endpoints
// ---------------------------------------------------------------------------

// Get all mangas (with optional search and genre filter)
app.get('/api/mangas', (req, res) => {
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
app.get('/api/mangas/:id', (req, res) => {
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
app.post('/api/mangas', (req, res) => {
  const { title, cover, banner, synopsis, author, artist, genres, badge } = req.body

  if (!title) {
    return res.status(400).json({ success: false, message: 'Title is required' })
  }

  const db = loadData()
  const newManga = {
    id: `manga_${Date.now().toString(16)}`,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    title,
    cover: cover || '',
    banner: banner || cover || '',
    synopsis: synopsis || '',
    author: author || 'Unknown',
    artist: artist || 'Unknown',
    genres: genres || ['Romance'],
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

// Update manga
app.put('/api/mangas/:id', (req, res) => {
  const db = loadData()
  const index = (db.mangas || []).findIndex(m => m.id === req.params.id)

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Manga not found' })
  }

  db.mangas[index] = { ...db.mangas[index], ...req.body, updatedAt: new Date().toISOString() }
  saveData(db)

  res.json({
    success: true,
    message: 'Manga updated successfully',
    data: db.mangas[index]
  })
})

// Delete manga
app.delete('/api/mangas/:id', (req, res) => {
  const db = loadData()
  const initialLength = db.mangas.length
  db.mangas = db.mangas.filter(m => m.id !== req.params.id)

  if (db.mangas.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Manga not found' })
  }

  saveData(db)
  res.json({ success: true, message: 'Manga deleted successfully' })
})

// ---------------------------------------------------------------------------
// 3. Chapter Endpoints (Webtoon Reader Data)
// ---------------------------------------------------------------------------

// Get single chapter details and pages
app.get('/api/mangas/:id/chapters/:chapterNumber', (req, res) => {
  const db = loadData()
  const manga = (db.mangas || []).find(m => m.id === req.params.id || m.slug === req.params.id)

  if (!manga) {
    return res.status(404).json({ success: false, message: 'Manga not found' })
  }

  const chapterNum = req.params.chapterNumber
  const chapter = (manga.chapters || []).find(c => c.id === chapterNum || c.number.toString() === chapterNum)

  if (!chapter) {
    return res.status(404).json({ success: false, message: 'Chapter not found' })
  }

  res.json({
    success: true,
    manga: { id: manga.id, title: manga.title, slug: manga.slug },
    chapter
  })
})

// Add or update chapter (assign pages from R2 or array)
app.post('/api/mangas/:id/chapters', (req, res) => {
  const { number, title, pages } = req.body
  const chapterNumber = parseInt(number, 10)

  if (isNaN(chapterNumber)) {
    return res.status(400).json({ success: false, message: 'Valid chapter number is required' })
  }

  const db = loadData()
  const manga = (db.mangas || []).find(m => m.id === req.params.id)

  if (!manga) {
    return res.status(404).json({ success: false, message: 'Manga not found' })
  }

  if (!manga.chapters) manga.chapters = []

  // Check if chapter already exists
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

  if (existingIndex >= 0) {
    manga.chapters[existingIndex] = { ...manga.chapters[existingIndex], ...chapterData }
  } else {
    manga.chapters.push(chapterData)
    // Sort chapters by number
    manga.chapters.sort((a, b) => a.number - b.number)
  }

  saveData(db)

  res.status(201).json({
    success: true,
    message: `Chapter ${chapterNumber} saved successfully`,
    chapter: chapterData
  })
})

// ---------------------------------------------------------------------------
// 4. Cloudflare R2 Auto-Sync Endpoint (Optional Power Feature!)
// ---------------------------------------------------------------------------
// You provide mangaId and chapterNumber, it queries R2 to fetch all image keys in that folder!
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

    // Save to Database
    const db = loadData()
    const manga = (db.mangas || []).find(m => m.id === mangaId)
    if (manga) {
      if (!manga.chapters) manga.chapters = []
      const cNum = parseInt(chapterNumber, 10)
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
})
