import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })
dotenv.config()

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'u192061012_romancetoon',
  password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'u192061012_romancetoon',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

let pool = null
let isMysqlConnected = false

export async function initMySQL() {
  try {
    pool = mysql.createPool(DB_CONFIG)
    if (typeof pool.on === 'function') {
      pool.on('error', (err) => {
        console.warn('[!] MySQL pool notice:', err?.message || err)
        if (err?.code === 'PROTOCOL_CONNECTION_LOST' || err?.code === 'ECONNRESET') {
          isMysqlConnected = false
        }
      })
    }
    const conn = await pool.getConnection()
    console.log('[✔] MySQL Database connected successfully to Hostinger!')
    isMysqlConnected = true

    // 1. Mangas Table with complete metadata (Release year, r2_folder_id, etc.)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS mangas (
        id VARCHAR(64) PRIMARY KEY,
        slug VARCHAR(255) UNIQUE,
        title VARCHAR(255) NOT NULL,
        alternative_titles TEXT,
        r2_folder_id VARCHAR(255),
        cover VARCHAR(500),
        banner VARCHAR(500),
        synopsis TEXT,
        author VARCHAR(100),
        artist VARCHAR(100),
        release_year VARCHAR(20) DEFAULT '2026',
        genres TEXT,
        rating FLOAT DEFAULT 5.0,
        rating_count VARCHAR(50) DEFAULT '1',
        status VARCHAR(50) DEFAULT 'Ongoing',
        views VARCHAR(50) DEFAULT '0',
        bookmarks VARCHAR(50) DEFAULT '0',
        badge VARCHAR(50) DEFAULT 'NEW',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)

    // Upgrade mangas table columns if they were created earlier without them
    try {
      await conn.query(`ALTER TABLE mangas ADD COLUMN r2_folder_id VARCHAR(255) AFTER alternative_titles;`)
    } catch (e) { /* ignore if already exists */ }
    try {
      await conn.query(`ALTER TABLE mangas ADD COLUMN release_year VARCHAR(20) DEFAULT '2026' AFTER artist;`)
    } catch (e) { /* ignore if already exists */ }

    // 2. Chapters Table with status (published, draft, scheduled)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS chapters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        manga_id VARCHAR(64) NOT NULL,
        chapter_number INT NOT NULL,
        title VARCHAR(255),
        release_date VARCHAR(100),
        views VARCHAR(50) DEFAULT '0',
        pages_count INT DEFAULT 0,
        pages_json LONGTEXT,
        is_published BOOLEAN DEFAULT TRUE,
        status VARCHAR(20) DEFAULT 'published',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY manga_chap_unique (manga_id, chapter_number),
        FOREIGN KEY (manga_id) REFERENCES mangas(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)

    try {
      await conn.query(`ALTER TABLE chapters ADD COLUMN is_published BOOLEAN DEFAULT TRUE AFTER pages_json;`)
    } catch (e) { /* ignore if already exists */ }
    try {
      await conn.query(`ALTER TABLE chapters ADD COLUMN status VARCHAR(20) DEFAULT 'published' AFTER is_published;`)
    } catch (e) { /* ignore if already exists */ }

    // 3. Manga Ratings Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS manga_ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        manga_id VARCHAR(64) NOT NULL,
        user_fingerprint VARCHAR(128) NOT NULL,
        rating INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_manga_rating (manga_id, user_fingerprint),
        FOREIGN KEY (manga_id) REFERENCES mangas(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)

    // 4. Manga Bookmarks Table (Public Bookmarks Counter)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS manga_bookmarks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        manga_id VARCHAR(64) NOT NULL,
        user_fingerprint VARCHAR(128) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_manga_bookmark (manga_id, user_fingerprint),
        FOREIGN KEY (manga_id) REFERENCES mangas(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)

    // 5. Custom Genres Table (Add & Remove categories)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS genres (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)

    try {
      const [existingGenres] = await conn.query('SELECT COUNT(*) as cnt FROM genres')
      if (existingGenres[0]?.cnt === 0) {
        const defaultList = [
          ['Romance', 'romance'],
          ['Drama', 'drama'],
          ['Fantasy', 'fantasy'],
          ['Historical', 'historical'],
          ['Contract Marriage', 'contract-marriage'],
          ['Villainess', 'villainess'],
          ['CEO & Drama', 'ceo-drama']
        ]
        for (const [name, slug] of defaultList) {
          await conn.query('INSERT IGNORE INTO genres (name, slug) VALUES (?, ?)', [name, slug])
        }
      }
    } catch (e) { /* ignore */ }

    try {
      const [existingMangas] = await conn.query('SELECT COUNT(*) as cnt FROM mangas')
      if (existingMangas[0]?.cnt === 0) {
        await conn.query(
          `INSERT IGNORE INTO mangas (id, slug, title, alternative_titles, r2_folder_id, cover, banner, synopsis, author, artist, release_year, status, genres, rating, rating_count, views, bookmarks, badge)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'manga_611ac7d4f93e7',
            'secret-sweetheart-of-the-tycoon',
            'Secret Sweetheart of the Tycoon',
            JSON.stringify(['The Billionaire\'s Hidden Rose', 'Tycoon\'s Beloved Contract Wife']),
            'manga_611ac7d4f93e7',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1920&q=80',
            'To save her family from bankruptcy, Seraphina agreed to a one-year marriage of convenience with Damian Thorne, the coldest CEO in the capital. She expected indifference, but discovered deep warmth beneath his icy exterior.',
            'Clara Delacroix',
            'Studio Rosebloom',
            '2026',
            'Ongoing',
            JSON.stringify(['Romance', 'CEO & Drama', 'Contract Marriage', 'Contemporary']),
            4.9,
            '48.2K',
            '1.4M',
            '124K',
            'HOT'
          ]
        )
        const ch1Pages = [
          { page: 1, url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=85' },
          { page: 2, url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=900&q=85' },
          { page: 3, url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=85' },
          { page: 4, url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=85' },
          { page: 5, url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85' },
          { page: 6, url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=85' }
        ]
        await conn.query(
          `INSERT IGNORE INTO chapters (manga_id, chapter_number, title, release_date, views, pages_count, pages_json, is_published, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          ['manga_611ac7d4f93e7', 1, 'Chapter 1: The Midnight Contract', '3 days ago', '142K', 6, JSON.stringify(ch1Pages), 1, 'published']
        )
        await conn.query(
          `INSERT IGNORE INTO chapters (manga_id, chapter_number, title, release_date, views, pages_count, pages_json, is_published, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          ['manga_611ac7d4f93e7', 2, 'Chapter 2: His Unspoken Rules', '2 days ago', '118K', 5, '[]', 1, 'published']
        )
      }
    } catch (e) {
      console.warn('Could not seed default manga:', e.message)
    }

    conn.release()
    return true
  } catch (err) {
    console.warn('[!] MySQL connection notice (will use persistent store if local):', err.message)
    isMysqlConnected = false
    return false
  }
}

export function getPool() {
  return pool
}

export function getStatus() {
  return {
    isMysqlConnected,
    config: {
      host: DB_CONFIG.host,
      database: DB_CONFIG.database,
      user: DB_CONFIG.user
    }
  }
}
