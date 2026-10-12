import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'u192061012_romancetoon',
  password: process.env.DB_PASSWORD || process.env.DB_PASS || '123698745.0aZ',
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
