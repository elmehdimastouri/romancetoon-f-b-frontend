import fs from 'fs'
import path from 'path'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Natural sorting helper function
 * Correctly orders: '1.webp', '2.webp', '10.webp', 'image-01.png', 'page_003.webp'
 */
/**
 * Smart manga page number extractor & comparator
 * Accurately sorts any filename style: '01.webp', '003.webp', 'image-02.png', 'page_10.webp'
 */
function extractPageNumber(filename) {
  const match = filename.match(/(\d+)(?!.*\d)/) // extracts last/main number sequence
  return match ? parseInt(match[1], 10) : 0
}

function smartPageCompare(a, b) {
  const numA = extractPageNumber(a)
  const numB = extractPageNumber(b)
  if (numA !== numB) {
    return numA - numB
  }
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}


// Supported image extensions
const VALID_EXTENSIONS = new Set(['.webp', '.png', '.jpg', '.jpeg'])

async function runImporter() {
  const args = process.argv.slice(2)
  const isDryRun = args.includes('--dry-run')
  const customDataPath = args.find(a => !a.startsWith('--')) || process.env.DATA_SOURCE_DIR || './data'

  console.log('====================================================')
  console.log('       RomanceToon Chapter & Cloudflare R2 Importer')
  console.log('====================================================')
  console.log(`[*] Target directory: ${customDataPath}`)
  console.log(`[*] Mode: ${isDryRun ? 'DRY-RUN (Scan and verify only, no upload)' : 'LIVE (Ready for Cloudflare R2 upload)'}`)

  const targetDir = path.resolve(customDataPath)
  if (!fs.existsSync(targetDir)) {
    console.warn(`[!] Warning: Directory "${targetDir}" not found yet.`)
    console.log(`[i] Place your manga folders inside "${targetDir}" as:`)
    console.log(`    data/manga_611ac7d4f93e7/1/01.webp`)
    console.log(`    data/manga_611ac7d4f93e7/2/01.webp`)
    return
  }

  // Setup R2 S3 Client if configured
  let s3Client = null
  const r2Account = process.env.R2_ACCOUNT_ID
  const r2Key = process.env.R2_ACCESS_KEY_ID
  const r2Secret = process.env.R2_SECRET_ACCESS_KEY
  const r2Bucket = process.env.R2_BUCKET_NAME || 'romancetoon-chapters'
  const cdnDomain = process.env.R2_PUBLIC_DOMAIN || 'https://cdn.romancetoon.com'

  if (!isDryRun && r2Account && r2Key && r2Secret) {
    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${r2Account}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2Key,
        secretAccessKey: r2Secret
      }
    })
    console.log('[+] Cloudflare R2 client connected successfully.')
  } else if (!isDryRun) {
    console.log('[i] R2 credentials not set in .env. Running in manifest simulation mode.')
  }

  const mangaDirs = fs.readdirSync(targetDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

  console.log(`[+] Found ${mangaDirs.length} manga folder(s).`)

  const summary = []

  for (const mangaFolder of mangaDirs) {
    console.log(`\n----------------------------------------------------`)
    console.log(`[Manga] Processing: ${mangaFolder}`)
    const mangaPath = path.join(targetDir, mangaFolder)

    const chapterDirs = fs.readdirSync(mangaPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .sort(smartPageCompare) // Sort chapter '1', '2', ..., '10'

    console.log(`  -> Found ${chapterDirs.length} chapters: [${chapterDirs.slice(0, 5).join(', ')}${chapterDirs.length > 5 ? '...' : ''}]`)

    const mangaData = {
      manga_id: mangaFolder,
      chapters_count: chapterDirs.length,
      chapters: []
    }

    for (const chapterFolder of chapterDirs) {
      const chapterPath = path.join(mangaPath, chapterFolder)
      const allFiles = fs.readdirSync(chapterPath)
      
      // Filter images and sort naturally
      const imageFiles = allFiles
        .filter(file => VALID_EXTENSIONS.has(path.extname(file).toLowerCase()))
        .sort(smartPageCompare)

      console.log(`   [Ch. ${chapterFolder}] Found ${imageFiles.length} pages. (First: ${imageFiles[0]}, Last: ${imageFiles[imageFiles.length - 1]})`)

      const pagesList = []

      for (let i = 0; i < imageFiles.length; i++) {
        const originalFileName = imageFiles[i]
        const ext = path.extname(originalFileName).toLowerCase()
        const standardizedName = `${String(i + 1).padStart(3, '0')}${ext}`
        const r2KeyPath = `${mangaFolder}/${chapterFolder}/${standardizedName}`
        const publicUrl = `${cdnDomain}/${r2KeyPath}`

        // Upload to R2 if enabled
        if (s3Client && !isDryRun) {
          const filePath = path.join(chapterPath, originalFileName)
          const fileBuffer = fs.readFileSync(filePath)
          const contentType = ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : 'image/jpeg'

          await s3Client.send(new PutObjectCommand({
            Bucket: r2Bucket,
            Key: r2KeyPath,
            Body: fileBuffer,
            ContentType: contentType,
            CacheControl: 'public, max-age=31536000, immutable'
          }))
        }

        pagesList.push({
          page: i + 1,
          original_name: originalFileName,
          standardized_name: standardizedName,
          r2_path: r2KeyPath,
          url: publicUrl
        })
      }

      mangaData.chapters.push({
        chapter_number: chapterFolder,
        pages_count: pagesList.length,
        pages: pagesList
      })
    }

    summary.push(mangaData)
  }

  // Save generated manifest
  const outputPath = path.join(targetDir, 'romancetoon_manifest.json')
  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2), 'utf-8')
  console.log(`\n====================================================`)
  console.log(`[✔] Successfully generated manifest: ${outputPath}`)
  console.log(`====================================================`)
}

runImporter().catch(err => {
  console.error('[!] Error in importer:', err)
})
