import { defineEventHandler, setHeader } from 'h3'
import fs from 'node:fs'
import path from 'node:path'

const SITE_URL = 'https://romancetoon.com'

function escapeXml(unsafe: string): string {
  if (!unsafe) return ''
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function slugifyGenre(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/&/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=14400')

  let API_BASE_URL = 'https://api.romancetoon.com'
  try {
    const config = useRuntimeConfig()
    if (config?.public?.apiBase) {
      API_BASE_URL = config.public.apiBase
    }
  } catch (e) {
    // fallback
  }

  const nowIso = new Date().toISOString()
  const todayDate = nowIso.split('T')[0]

  // Default core routes
  const urls: {
    loc: string
    lastmod?: string
    changefreq?: string
    priority?: string
    image?: { loc: string; title: string }
  }[] = [
    { loc: `${SITE_URL}/`, lastmod: todayDate, changefreq: 'daily', priority: '1.0' },
    { loc: `${SITE_URL}/popular`, lastmod: todayDate, changefreq: 'daily', priority: '0.9' },
    { loc: `${SITE_URL}/genres/`, lastmod: todayDate, changefreq: 'weekly', priority: '0.8' }
  ]

  let mangas: any[] = []
  let genres: any[] = []

  // Fetch live mangas from API
  try {
    const res = await fetch(`${API_BASE_URL}/api/mangas`, { signal: AbortSignal.timeout(5000) })
    const json = await res.json()
    if (json.success && Array.isArray(json.data)) {
      mangas = json.data
    }
  } catch (err) {
    console.warn('[sitemap.xml] Error fetching mangas for sitemap from API:', err)
  }

  // Fallback to local database if API unreachable during offline build
  if (mangas.length === 0) {
    try {
      const candidates = [
        path.resolve(process.cwd(), '../backend/database.json'),
        path.resolve(process.cwd(), 'backend/database.json')
      ]
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          const raw = fs.readFileSync(p, 'utf-8')
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed.mangas)) {
            mangas = parsed.mangas
            break
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // Fetch live genres from API
  try {
    const res = await fetch(`${API_BASE_URL}/api/genres`, { signal: AbortSignal.timeout(4000) })
    const json = await res.json()
    if (json.success && Array.isArray(json.data)) {
      genres = json.data
    }
  } catch (err) {
    // Fallback default genres
    genres = [
      { name: 'Romance', slug: 'romance' },
      { name: 'Drama', slug: 'drama' },
      { name: 'Fantasy', slug: 'fantasy' },
      { name: 'Historical', slug: 'historical' },
      { name: 'Contract Marriage', slug: 'contract-marriage' },
      { name: 'Villainess', slug: 'villainess' }
    ]
  }

  // Also collect genres from mangas if not listed
  const genreSet = new Map<string, string>()
  genres.forEach((g: any) => {
    const s = g.slug || slugifyGenre(g.name)
    if (s) genreSet.set(s, g.name)
  })
  mangas.forEach((m: any) => {
    if (Array.isArray(m.genres)) {
      m.genres.forEach((gName: string) => {
        const s = slugifyGenre(gName)
        if (s && !genreSet.has(s)) {
          genreSet.set(s, gName)
        }
      })
    }
  })

  // Add genre URLs
  for (const [slug] of genreSet.entries()) {
    urls.push({
      loc: `${SITE_URL}/genres/${slug}/`,
      lastmod: todayDate,
      changefreq: 'weekly',
      priority: '0.8'
    })
  }

  // Add Manga Series & Chapter URLs
  mangas.forEach((m: any) => {
    const slug = m.slug || m.id
    if (!slug) return

    // Series main page
    urls.push({
      loc: `${SITE_URL}/webtoon/${slug}`,
      lastmod: todayDate,
      changefreq: 'daily',
      priority: '0.9',
      image: m.cover ? { loc: m.cover, title: m.title } : undefined
    })

    // Chapter pages
    if (Array.isArray(m.chapters)) {
      const published = m.chapters.filter((c: any) => c.isPublished !== false && c.status !== 'draft')
      published.forEach((c: any) => {
        const chNum = c.number || c.id
        if (chNum !== undefined && chNum !== null) {
          urls.push({
            loc: `${SITE_URL}/webtoon/${slug}/chapter-${chNum}`,
            lastmod: todayDate,
            changefreq: 'monthly',
            priority: '0.7'
          })
        }
      })
    }
  })

  // Build XML
  const xmlEntries = urls.map((u) => {
    let xml = `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n`
    if (u.lastmod) xml += `    <lastmod>${u.lastmod}</lastmod>\n`
    if (u.changefreq) xml += `    <changefreq>${u.changefreq}</changefreq>\n`
    if (u.priority) xml += `    <priority>${u.priority}</priority>\n`
    if (u.image) {
      xml += `    <image:image>\n      <image:loc>${escapeXml(u.image.loc)}</image:loc>\n      <image:title>${escapeXml(u.image.title)}</image:title>\n    </image:image>\n`
    }
    xml += `  </url>`
    return xml
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${xmlEntries}
</urlset>`
})
