const assert = require('assert')

console.log('[TEST] Phase 3: Unicode & Unique Slug Generation Tests')

function generateUnicodeSlug(title, fallbackId = '') {
  if (!title || typeof title !== 'string') {
    return `manga-${fallbackId || Date.now().toString(36)}`
  }

  const clean = title.trim().toLowerCase()
  let slug = clean.replace(/[^\p{L}\p{N}]+/gu, '-')
  slug = slug.replace(/^-+|-+$/g, '')

  if (!slug) {
    slug = `manga-${fallbackId || Date.now().toString(36)}`
  }

  return slug.slice(0, 200)
}

function resolveUniqueMangaSlug(baseSlug, mangaId, existingSlugs) {
  let candidate = baseSlug
  let counter = 1

  while (true) {
    if (!existingSlugs.has(candidate)) {
      existingSlugs.add(candidate)
      return candidate
    }
    counter++
    candidate = `${baseSlug}-${counter}`.slice(0, 255)
  }
}

// Test 1: Latin Title
console.log('Test 1: Latin title slug generation')
const slugLatin = generateUnicodeSlug('Solo Leveling Season 2!', 'id1')
assert.strictEqual(slugLatin, 'solo-leveling-season-2')
console.log('✔ Test 1 passed: Latin title produces clean slug')

// Test 2: Arabic Title
console.log('Test 2: Arabic title slug generation')
const slugArabic = generateUnicodeSlug('سحر الإمبراطورة 2026', 'id2')
assert.strictEqual(slugArabic, 'سحر-الإمبراطورة-2026')
console.log('✔ Test 2 passed: Arabic title produces clean Unicode slug')

// Test 3: Korean Title
console.log('Test 3: Korean title slug generation')
const slugKorean = generateUnicodeSlug('나 혼자만 레벨업', 'id3')
assert.strictEqual(slugKorean, '나-혼자만-레벨업')
console.log('✔ Test 3 passed: Korean title produces clean Unicode slug')

// Test 4: Japanese Title
console.log('Test 4: Japanese title slug generation')
const slugJapanese = generateUnicodeSlug('進撃の巨人', 'id4')
assert.strictEqual(slugJapanese, '進撃の巨人')
console.log('✔ Test 4 passed: Japanese title produces clean Unicode slug')

// Test 5: Symbols only
console.log('Test 5: Symbols-only title fallback')
const slugSymbols = generateUnicodeSlug('!@#$%^&*()_+{}[]:;<>?,./', 'xyz123')
assert.strictEqual(slugSymbols, 'manga-xyz123')
assert.notStrictEqual(slugSymbols, '')
console.log('✔ Test 5 passed: Symbols-only falls back safely to manga-id')

// Test 6: Duplicate handling
console.log('Test 6: Duplicate collision handling')
const existingSlugs = new Set()
const slug1 = resolveUniqueMangaSlug(generateUnicodeSlug('سحر الإمبراطورة', '1'), '1', existingSlugs)
const slug2 = resolveUniqueMangaSlug(generateUnicodeSlug('سحر الإمبراطورة', '2'), '2', existingSlugs)
const slug3 = resolveUniqueMangaSlug(generateUnicodeSlug('سحر الإمبراطورة', '3'), '3', existingSlugs)

assert.strictEqual(slug1, 'سحر-الإمبراطورة')
assert.strictEqual(slug2, 'سحر-الإمبراطورة-2')
assert.strictEqual(slug3, 'سحر-الإمبراطورة-3')
console.log('✔ Test 6 passed: Duplicate slugs resolved cleanly with numeric increments')

// Test 7: Existing slug preservation
console.log('Test 7: Existing English slug compatibility')
const existingTitle = 'Secret Sweetheart of the Tycoon'
const generated = generateUnicodeSlug(existingTitle, '123')
assert.strictEqual(generated, 'secret-sweetheart-of-the-tycoon')
console.log('✔ Test 7 passed: Preserves existing URL structure exactly')

console.log('All Phase 3 tests passed successfully!')
