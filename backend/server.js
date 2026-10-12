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
app.use(express.json({ limit: '10mb' }))

// Initialize MySQL
initMySQL().then(connected => {
  if (connected) {
    console.log('[✔] RomanceToon is now using Hostinger MySQL Database.')
  } else {
    console.log('[i] RomanceToon is using fallback persistent JSON database.')
  }
})

// Natural sort helper function
function smartNaturalCompare(a, b) {
  const getNum = str => {
    const m = str.match(/(\d+)(?!.*\d)/)
    return m ? parseInt(m[1], 10) : 0
  }
  const numA = getNum(a)
  const numB = getNum(b)
  return numA !== numB ? numA - numB : a.localeCompare(b, undefined, { numeric: true })
}

// R2 S3 Client helper
function getR2Client() {
  const r2Account = process.env.R2_ACCOUNT_ID
  const r2Key = process.env.R2_ACCESS_KEY_ID
  const r2Secret = process.env.R2_SECRET_ACCESS_KEY

  if (!r2Account || !r2Key || !r2Secret) {
    return null
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${r2Account}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: r2Key,
      secretAccessKey: r2Secret
    }
  })
}

// ---------------------------------------------------------------------------
// 1. Health check & Root info
// ---------------------------------------------------------------------------
app.get('/', (req, res) => {
  const dbStatus = getStatus()
  res.json({
    status: 'online',
    app: 'RomanceToon Backend API - Advanced Publisher Edition',
    version: '1.2.0',
    database: {
      type: dbStatus.isMysqlConnected ? 'MySQL (Hostinger)' : 'Persistent JSON',
      connected: dbStatus.isMysqlConnected,
      name: dbStatus.config.database
    }
  })
})

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
    message: 'Backend is active using persistent local engine',
    status
  })
})

// Endpoint to diagnose and test Cloudflare R2 connection
app.get('/api/r2-check', async (req, res) => {
  const s3 = getR2Client()
  const r2Bucket = process.env.R2_BUCKET_NAME || 'romancetoon-chapters'
  const r2Account = process.env.R2_ACCOUNT_ID
  const hasAccessKey = Boolean(process.env.R2_ACCESS_KEY_ID)
  const hasSecretKey = Boolean(process.env.R2_SECRET_ACCESS_KEY)

  if (!s3) {
    return res.status(400).json({
      success: false,
      message: 'Cloudflare R2 keys missing in Hostinger Environment Variables!',
      diagnostics: {
        has_account_id: Boolean(r2Account),
        has_access_key: hasAccessKey,
        has_secret_key: hasSecretKey,
        bucket_name: r2Bucket
      }
    })
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: r2Bucket,
      MaxKeys: 15
    })
    const response = await s3.send(command)
    const sampleKeys = (response.Contents || []).map(o => o.Key)

    res.json({
      success: true,
      message: 'Cloudflare R2 is CONNECTED and responding!',
      bucket: r2Bucket,
      total_sample_files_found: sampleKeys.length,
      sample_keys: sampleKeys
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Failed to connect to R2 bucket "${r2Bucket}": ${err.message}`,
      hint: 'Please check your R2 Token permissions (must be Object Read & Write) and correct Bucket Name.'
    })
  }
})

// ---------------------------------------------------------------------------
// 2. Manga CRUD Endpoints
// ---------------------------------------------------------------------------

// List all mangas
app.get('/api/mangas', async (req, res) => {
  const status = getStatus()

  if (status.isMysqlConnected) {
    try {
      const pool = getPool()
      const [rows] = await pool.query('SELECT * FROM mangas ORDER BY created_at DESC')
      const mangas = await Promise.all(rows.map(async r => {
        const [chRows] = await pool.query('SELECT chapter_number, title, release_date, is_published, status FROM chapters WHERE manga_id = ? ORDER BY chapter_number ASC', [r.id])
        return {
          ...r,
          releaseYear: r.release_year,
          r2FolderId: r.r2_folder_id,
          alternativeTitles: r.alternative_titles ? JSON.parse(r.alternative_titles) : [],
          genres: r.genres ? JSON.parse(r.genres) : [],
          chapters: chRows.map(c => ({
            id: c.chapter_number.toString(),
            number: c.chapter_number,
            title: c.title,
            releaseDate: c.release_date,
            isPublished: Boolean(c.is_published),
            status: c.status
          }))
        }
      }))
      return res.json({ success: true, count: mangas.length, data: mangas })
    } catch (err) {
      console.error('MySQL query error:', err)
    }
  }

  const db = loadData()
  res.json({ success: true, count: (db.mangas || []).length, data: db.mangas || [] })
})

// Get single manga with chapters
app.get('/api/mangas/:id', async (req, res) => {
  const status = getStatus()
  const idOrSlug = req.params.id

  if (status.isMysqlConnected) {
    try {
      const pool = getPool()
      const [rows] = await pool.query('SELECT * FROM mangas WHERE id = ? OR slug = ?', [idOrSlug, idOrSlug])
      if (rows.length > 0) {
        const manga = rows[0]
        const [chapRows] = await pool.query('SELECT * FROM chapters WHERE manga_id = ? ORDER BY chapter_number ASC', [manga.id])
        manga.releaseYear = manga.release_year
        manga.r2FolderId = manga.r2_folder_id
        manga.alternativeTitles = manga.alternative_titles ? JSON.parse(manga.alternative_titles) : []
        manga.genres = manga.genres ? JSON.parse(manga.genres) : []
        manga.chapters = chapRows.map(c => ({
          id: c.chapter_number.toString(),
          number: c.chapter_number,
          title: c.title,
          releaseDate: c.release_date,
          views: c.views,
          pagesCount: c.pages_count,
          isPublished: Boolean(c.is_published),
          status: c.status,
          pages: c.pages_json ? JSON.parse(c.pages_json) : []
        }))
        return res.json({ success: true, data: manga })
      }
    } catch (err) {
      console.error('MySQL query error:', err)
    }
  }

  const db = loadData()
  const manga = (db.mangas || []).find(m => m.id === idOrSlug || m.slug === idOrSlug)
  if (!manga) return res.status(404).json({ success: false, message: 'Manga not found' })

  res.json({ success: true, data: manga })
})

// Create new manga
app.post('/api/mangas', async (req, res) => {
  const { 
    title, alternativeTitles, r2FolderId, cover, banner, 
    synopsis, author, artist, releaseYear, status: mangaStatus, 
    genres, badge 
  } = req.body

  if (!title) {
    return res.status(400).json({ success: false, message: 'Title is required' })
  }

  const id = `manga_${Date.now().toString(16)}`
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const altList = alternativeTitles ? (Array.isArray(alternativeTitles) ? alternativeTitles : alternativeTitles.split(',').map(s => s.trim())) : []
  const genreList = genres || ['Romance']
  const year = releaseYear || '2026'
  const state = mangaStatus || 'Ongoing'

  const status = getStatus()
  if (status.isMysqlConnected) {
    try {
      const pool = getPool()
      await pool.query(
        `INSERT INTO mangas (id, slug, title, alternative_titles, r2_folder_id, cover, banner, synopsis, author, artist, release_year, status, genres, badge)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, slug, title, JSON.stringify(altList), r2FolderId || '', 
          cover || '', banner || cover || '', synopsis || '', 
          author || 'Unknown', artist || 'Unknown', year, state, 
          JSON.stringify(genreList), badge || 'NEW'
        ]
      )
    } catch (err) {
      console.error('MySQL insert error:', err)
      return res.status(500).json({ success: false, message: err.message })
    }
  }

  // Also sync to local database.json
  const db = loadData()
  const newManga = {
    id, slug, title, alternativeTitles: altList, r2FolderId: r2FolderId || '',
    cover: cover || '', banner: banner || cover || '', synopsis: synopsis || '',
    author: author || 'Unknown', artist: artist || 'Unknown', releaseYear: year,
    status: state, genres: genreList, rating: 5.0, ratingCount: '1',
    views: '0', bookmarks: '0', badge: badge || 'NEW',
    createdAt: new Date().toISOString(), chapters: []
  }
  db.mangas.unshift(newManga)
  saveData(db)

  res.status(201).json({ success: true, message: 'Manga created successfully', data: newManga })
})

// Update manga
app.put('/api/mangas/:id', async (req, res) => {
  const { id } = req.params
  const { 
    title, alternativeTitles, r2FolderId, cover, banner, 
    synopsis, author, artist, releaseYear, status: mangaStatus, 
    genres, badge 
  } = req.body

  const altList = alternativeTitles ? (Array.isArray(alternativeTitles) ? alternativeTitles : alternativeTitles.split(',').map(s => s.trim())) : []
  const genreList = genres || ['Romance']

  const status = getStatus()
  if (status.isMysqlConnected) {
    try {
      const pool = getPool()
      await pool.query(
        `UPDATE mangas SET 
          title = COALESCE(?, title),
          alternative_titles = ?,
          r2_folder_id = COALESCE(?, r2_folder_id),
          cover = COALESCE(?, cover),
          banner = COALESCE(?, banner),
          synopsis = COALESCE(?, synopsis),
          author = COALESCE(?, author),
          artist = COALESCE(?, artist),
          release_year = COALESCE(?, release_year),
          status = COALESCE(?, status),
          genres = ?,
          badge = COALESCE(?, badge)
         WHERE id = ?`,
        [
          title, JSON.stringify(altList), r2FolderId, cover, banner, 
          synopsis, author, artist, releaseYear, mangaStatus, 
          JSON.stringify(genreList), badge, id
        ]
      )
    } catch (err) {
      console.error('MySQL update error:', err)
      return res.status(500).json({ success: false, message: err.message })
    }
  }

  const db = loadData()
  const idx = (db.mangas || []).findIndex(m => m.id === id)
  if (idx >= 0) {
    db.mangas[idx] = { ...db.mangas[idx], ...req.body, updatedAt: new Date().toISOString() }
    saveData(db)
  }

  res.json({ success: true, message: 'Manga updated successfully' })
})

// Delete manga (and its chapters)
app.delete('/api/mangas/:id', async (req, res) => {
  const { id } = req.params
  const status = getStatus()

  if (status.isMysqlConnected) {
    try {
      const pool = getPool()
      await pool.query('DELETE FROM chapters WHERE manga_id = ?', [id])
      const [resDel] = await pool.query('DELETE FROM mangas WHERE id = ?', [id])
      if (resDel.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Manga not found' })
      }
    } catch (err) {
      console.error('MySQL delete error:', err)
      return res.status(500).json({ success: false, message: err.message })
    }
  }

  const db = loadData()
  db.mangas = (db.mangas || []).filter(m => m.id !== id)
  saveData(db)

  res.json({ success: true, message: 'Manga and all associated chapters deleted successfully' })
})

// ---------------------------------------------------------------------------
// 3. Cloudflare R2 SCAN & Selective Publishing (Core Feature!)
// ---------------------------------------------------------------------------

// Scan R2 bucket for a specific manga folder
app.post('/api/r2/scan-manga', async (req, res) => {
  const { mangaFolder } = req.body

  if (!mangaFolder) {
    return res.status(400).json({ success: false, message: 'mangaFolder (R2 identifier) is required' })
  }

  const s3 = getR2Client()
  if (!s3) {
    return res.status(400).json({
      success: false,
      message: 'Cloudflare R2 credentials (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY) are missing in Hostinger environment variables (.env)'
    })
  }

  const r2Bucket = process.env.R2_BUCKET_NAME || 'romancetoon-chapters'
  const cdnDomain = process.env.R2_PUBLIC_DOMAIN || 'https://cdn.romancetoon.com'

  try {
    // Try multiple prefix possibilities (e.g. "manga_xxx/", "data/manga_xxx/", or raw "manga_xxx")
    const cleanId = mangaFolder.replace(/^\/+|\/+$/g, '')
    const prefixesToTry = [
      `${cleanId}/`,
      `data/${cleanId}/`,
      cleanId
    ]

    let objects = []
    let matchedPrefix = ''

    for (const prefix of prefixesToTry) {
      let isTruncated = true
      let continuationToken = undefined

      while (isTruncated) {
        const command = new ListObjectsV2Command({
          Bucket: r2Bucket,
          Prefix: prefix,
          MaxKeys: 1000,
          ContinuationToken: continuationToken
        })
        const response = await s3.send(command)
        if (response.Contents && response.Contents.length > 0) {
          objects.push(...response.Contents)
          matchedPrefix = prefix
        }
        isTruncated = response.IsTruncated
        continuationToken = response.NextContinuationToken
      }

      if (objects.length > 0) break
    }

    if (objects.length === 0) {
      return res.json({
        success: false,
        message: `No files found in R2 bucket "${r2Bucket}" under prefix "${cleanId}/" or "data/${cleanId}/". Please check your bucket name or folder structure in R2.`
      })
    }

    const validExtensions = new Set(['.webp', '.png', '.jpg', '.jpeg', '.avif'])
    
    // Group files by chapter number
    // Example Key: data/manga_0033902e486f1/1/001.webp
    const chaptersMap = new Map()

    for (const obj of objects) {
      const key = obj.Key
      const ext = key.slice(key.lastIndexOf('.')).toLowerCase()
      if (!validExtensions.has(ext)) continue

      // Remove prefix to get relative path: e.g. "1/001.webp"
      const relative = key.startsWith(matchedPrefix) ? key.slice(matchedPrefix.length) : key
      const parts = relative.replace(/^\/+/, '').split('/')

      if (parts.length >= 2) {
        const chapterFolder = parts[0]
        const filename = parts.slice(1).join('/')

        // Extract chapter number
        const chMatch = chapterFolder.match(/(\d+)/)
        const chapterNumber = chMatch ? parseInt(chMatch[1], 10) : chapterFolder

        if (!chaptersMap.has(chapterNumber)) {
          chaptersMap.set(chapterNumber, {
            chapterNumber,
            folderName: chapterFolder,
            files: []
          })
        }

        chaptersMap.get(chapterNumber).files.push({
          key,
          filename,
          url: `${cdnDomain}/${key}`,
          size: obj.Size
        })
      }
    }

    // Sort chapters naturally (1, 2, 3... 10)
    const sortedChapters = Array.from(chaptersMap.values()).sort((a, b) => {
      return a.chapterNumber - b.chapterNumber
    })

    // Sort pages inside each chapter naturally
    for (const ch of sortedChapters) {
      ch.files.sort((a, b) => smartNaturalCompare(a.filename, b.filename))
      ch.pagesCount = ch.files.length
      ch.samplePage = ch.files[0]?.url || ''
      ch.pages = ch.files.map((f, i) => ({
        page: i + 1,
        url: f.url
      }))
    }

    res.json({
      success: true,
      mangaFolder,
      totalChaptersFound: sortedChapters.length,
      chapters: sortedChapters
    })
  } catch (err) {
    console.error('R2 Scan error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// Publish selected chapters from R2 scan result
app.post('/api/r2/publish-chapters', async (req, res) => {
  const { mangaId, chapters } = req.body

  if (!mangaId || !Array.isArray(chapters)) {
    return res.status(400).json({ success: false, message: 'mangaId and chapters array are required' })
  }

  const status = getStatus()
  const pool = status.isMysqlConnected ? getPool() : null
  const db = loadData()
  const manga = (db.mangas || []).find(m => m.id === mangaId)

  let publishedCount = 0
  let draftCount = 0

  for (const ch of chapters) {
    const chapterNumber = parseInt(ch.chapterNumber, 10)
    const isPublished = ch.status === 'published'
    const pagesCount = (ch.pages && ch.pages.length) || 0
    const title = ch.title || `Chapter ${chapterNumber}`
    const releaseDate = ch.releaseDate || (isPublished ? 'Today' : 'Scheduled')

    if (isPublished) publishedCount++
    else draftCount++

    // 1. Save to MySQL
    if (pool) {
      try {
        await pool.query(
          `INSERT INTO chapters (manga_id, chapter_number, title, release_date, pages_count, pages_json, is_published, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
           title = VALUES(title), release_date = VALUES(release_date), 
           pages_count = VALUES(pages_count), pages_json = VALUES(pages_json), 
           is_published = VALUES(is_published), status = VALUES(status)`,
          [mangaId, chapterNumber, title, releaseDate, pagesCount, JSON.stringify(ch.pages || []), isPublished, ch.status || 'published']
        )
      } catch (err) {
        console.error('MySQL publish chapter error:', err)
      }
    }

    // 2. Save to local fallback
    if (manga) {
      if (!manga.chapters) manga.chapters = []
      const existingIdx = manga.chapters.findIndex(c => c.number === chapterNumber)
      const chData = {
        id: chapterNumber.toString(),
        number: chapterNumber,
        title,
        releaseDate,
        views: '1',
        pagesCount,
        isPublished,
        status: ch.status || 'published',
        pages: ch.pages || []
      }
      if (existingIdx >= 0) manga.chapters[existingIdx] = chData
      else manga.chapters.push(chData)
    }
  }

  if (manga && manga.chapters) {
    manga.chapters.sort((a, b) => a.number - b.number)
    saveData(db)
  }

  res.json({
    success: true,
    message: `Processed ${chapters.length} chapters: (${publishedCount} published, ${draftCount} saved as drafts/scheduled)`
  })
})

// Toggle single chapter status (publish/unpublish)
app.patch('/api/mangas/:id/chapters/:chapterNumber', async (req, res) => {
  const { id, chapterNumber } = req.params
  const { isPublished, status: chapStatus } = req.body
  const chNum = parseInt(chapterNumber, 10)

  const status = getStatus()
  if (status.isMysqlConnected) {
    try {
      const pool = getPool()
      await pool.query(
        `UPDATE chapters SET is_published = ?, status = ? WHERE manga_id = ? AND chapter_number = ?`,
        [Boolean(isPublished), chapStatus || (isPublished ? 'published' : 'draft'), id, chNum]
      )
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message })
    }
  }

  const db = loadData()
  const manga = (db.mangas || []).find(m => m.id === id)
  if (manga && manga.chapters) {
    const ch = manga.chapters.find(c => c.number === chNum)
    if (ch) {
      ch.isPublished = Boolean(isPublished)
      ch.status = chapStatus || (isPublished ? 'published' : 'draft')
      saveData(db)
    }
  }

  res.json({ success: true, message: `Chapter ${chNum} status updated to ${chapStatus || (isPublished ? 'published' : 'draft')}` })
})

// Delete single chapter
app.delete('/api/mangas/:id/chapters/:chapterNumber', async (req, res) => {
  const { id, chapterNumber } = req.params
  const chNum = parseInt(chapterNumber, 10)

  const status = getStatus()
  if (status.isMysqlConnected) {
    try {
      const pool = getPool()
      await pool.query('DELETE FROM chapters WHERE manga_id = ? AND chapter_number = ?', [id, chNum])
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message })
    }
  }

  const db = loadData()
  const manga = (db.mangas || []).find(m => m.id === id)
  if (manga && manga.chapters) {
    manga.chapters = manga.chapters.filter(c => c.number !== chNum)
    saveData(db)
  }

  res.json({ success: true, message: `Chapter ${chNum} deleted successfully` })
})

// ---------------------------------------------------------------------------
// 4. Reader Chapter Endpoint (Public)
// ---------------------------------------------------------------------------
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
              isPublished: Boolean(c.is_published),
              status: c.status,
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
  if (!manga) return res.status(404).json({ success: false, message: 'Manga not found' })

  const chapter = (manga.chapters || []).find(c => c.number === chapterNum || c.id === req.params.chapterNumber)
  if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' })

  res.json({
    success: true,
    manga: { id: manga.id, title: manga.title, slug: manga.slug },
    chapter
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`[✔] RomanceToon API Server running on port ${PORT}`)
  console.log(`[✔] Health check: http://localhost:${PORT}/`)
  console.log(`[✔] Database check: http://localhost:${PORT}/api/db-check`)
})
