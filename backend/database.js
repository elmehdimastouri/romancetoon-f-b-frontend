import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_FILE = path.join(__dirname, 'database.json')

// Initial default seed dataset
const DEFAULT_DATA = {
  mangas: [
    {
      id: 'manga_611ac7d4f93e7',
      slug: 'secret-sweetheart-of-the-tycoon',
      title: 'Secret Sweetheart of the Tycoon',
      alternativeTitles: ['The Billionaire\'s Hidden Rose', 'Tycoon\'s Beloved Contract Wife'],
      cover: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      banner: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1920&q=80',
      synopsis: 'To save her family from bankruptcy, Seraphina agreed to a one-year marriage of convenience with Damian Thorne, the coldest CEO in the capital. She expected indifference, but discovered deep warmth beneath his icy exterior.',
      author: 'Clara Delacroix',
      artist: 'Studio Rosebloom',
      genres: ['Romance', 'CEO & Drama', 'Contract Marriage', 'Contemporary'],
      rating: 4.9,
      ratingCount: '48.2K',
      status: 'Ongoing',
      views: '1.4M',
      bookmarks: '124K',
      badge: 'HOT',
      createdAt: new Date().toISOString(),
      chapters: [
        {
          id: '1',
          number: 1,
          title: 'Chapter 1: The Midnight Contract',
          releaseDate: '3 days ago',
          views: '142K',
          pagesCount: 6,
          pages: [
            { page: 1, url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=85', width: 900, height: 1350 },
            { page: 2, url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=900&q=85', width: 900, height: 1400 },
            { page: 3, url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=85', width: 900, height: 1350 },
            { page: 4, url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=85', width: 900, height: 1350 },
            { page: 5, url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85', width: 900, height: 1400 },
            { page: 6, url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=85', width: 900, height: 1350 }
          ]
        },
        {
          id: '2',
          number: 2,
          title: 'Chapter 2: His Unspoken Rules',
          releaseDate: '2 days ago',
          views: '118K',
          pagesCount: 5,
          pages: []
        }
      ]
    }
  ]
}

export function loadData() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      saveData(DEFAULT_DATA)
      return DEFAULT_DATA
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch (err) {
    console.error('Error loading database, resetting to default:', err)
    return DEFAULT_DATA
  }
}

export function saveData(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (err) {
    console.error('Error saving database:', err)
    return false
  }
}
