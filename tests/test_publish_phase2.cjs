const assert = require('assert')

console.log('[TEST] Phase 2: Chapter Publishing Error Handling & Multi-Status Tests')

function simulatePublishChapters({ mangaId, chapters, poolMock, mangaDb }) {
  if (!mangaId || !Array.isArray(chapters) || chapters.length === 0) {
    return {
      status: 400,
      body: { success: false, message: 'mangaId and a non-empty chapters array are required.' }
    }
  }

  const manga = (mangaDb.mangas || []).find(m => m.id === mangaId)
  if (poolMock) {
    const exists = poolMock.hasManga(mangaId)
    if (!exists) {
      return { status: 404, body: { success: false, message: `Target manga with id "${mangaId}" does not exist in MySQL.` } }
    }
  } else if (!manga) {
    return { status: 404, body: { success: false, message: `Target manga with id "${mangaId}" not found in database.` } }
  }

  const succeededChapters = []
  const failedChapters = []
  let publishedCount = 0
  let draftCount = 0

  for (const ch of chapters) {
    const chapterNumber = Number(ch.chapterNumber)
    if (isNaN(chapterNumber) || chapterNumber < 0) {
      failedChapters.push({
        chapterNumber: ch.chapterNumber,
        error: 'Invalid chapter number (must be a valid non-negative number)'
      })
      continue
    }

    const isPublished = ch.status === 'published'
    const pagesCount = (ch.pages && ch.pages.length) || 0
    const title = ch.title || `Chapter ${chapterNumber}`

    let mysqlSuccess = true
    if (poolMock) {
      try {
        poolMock.insertChapter({ mangaId, chapterNumber, title, pagesCount, isPublished })
      } catch (err) {
        mysqlSuccess = false
        failedChapters.push({ chapterNumber, error: err.message })
      }
    }

    if (mysqlSuccess) {
      if (isPublished) publishedCount++
      else draftCount++

      succeededChapters.push({
        chapterNumber,
        status: ch.status || (isPublished ? 'published' : 'draft'),
        pagesCount
      })
    }
  }

  if (succeededChapters.length === 0) {
    return {
      status: 500,
      body: {
        success: false,
        message: `Failed to save all ${failedChapters.length} chapters to database. Uploaded files remain intact in Cloudflare R2 and can be retried safely. Details: ${failedChapters.map(f => `Ch.${f.chapterNumber} (${f.error})`).join('; ')}`,
        summary: { total: chapters.length, succeeded: 0, failed: failedChapters.length },
        succeededChapters: [],
        failedChapters
      }
    }
  }

  if (failedChapters.length > 0) {
    return {
      status: 207,
      body: {
        success: false,
        partial: true,
        message: `Partially saved: ${succeededChapters.length} chapters saved successfully, but ${failedChapters.length} chapters failed. Uploaded files remain safe in R2. Failed chapters: ${failedChapters.map(f => `Ch.${f.chapterNumber}`).join(', ')}`,
        summary: { total: chapters.length, succeeded: succeededChapters.length, failed: failedChapters.length },
        succeededChapters,
        failedChapters
      }
    }
  }

  return {
    status: 200,
    body: {
      success: true,
      message: `All ${succeededChapters.length} chapters saved successfully (${publishedCount} published, ${draftCount} saved as drafts).`,
      summary: { total: chapters.length, succeeded: succeededChapters.length, failed: 0 },
      succeededChapters,
      failedChapters: []
    }
  }
}

// Test 1: Empty or missing chapters
console.log('Test 1: Empty chapters array should return 400')
const res1 = simulatePublishChapters({ mangaId: 'manga_1', chapters: [], mangaDb: { mangas: [{ id: 'manga_1' }] } })
assert.strictEqual(res1.status, 400)
assert.strictEqual(res1.body.success, false)
console.log('✔ Test 1 passed: 400 on empty chapters')

// Test 2: Target manga not found
console.log('Test 2: Non-existent manga should return 404')
const res2 = simulatePublishChapters({ mangaId: 'manga_999', chapters: [{ chapterNumber: 1 }], mangaDb: { mangas: [] } })
assert.strictEqual(res2.status, 404)
console.log('✔ Test 2 passed: 404 on unknown manga')

// Test 3: Total DB failure should return 500 and NOT false success
console.log('Test 3: Total DB failure should return 500')
const failPool = {
  hasManga: () => true,
  insertChapter: () => { throw new Error('Deadlock / Connection lost') }
}
const res3 = simulatePublishChapters({
  mangaId: 'manga_1',
  chapters: [{ chapterNumber: 1 }, { chapterNumber: 2 }],
  poolMock: failPool,
  mangaDb: { mangas: [{ id: 'manga_1' }] }
})
assert.strictEqual(res3.status, 500)
assert.strictEqual(res3.body.success, false)
assert.strictEqual(res3.body.summary.succeeded, 0)
assert.strictEqual(res3.body.summary.failed, 2)
assert.ok(res3.body.message.includes('Uploaded files remain intact in Cloudflare R2'))
console.log('✔ Test 3 passed: 500 returned on DB failure, R2 preservation noted')

// Test 4: Partial failure returns 207 Multi-Status
console.log('Test 4: Partial failure should return 207 Multi-Status')
const partialPool = {
  hasManga: () => true,
  insertChapter: ({ chapterNumber }) => {
    if (chapterNumber === 2) throw new Error('ER_LOCK_WAIT_TIMEOUT')
  }
}
const res4 = simulatePublishChapters({
  mangaId: 'manga_1',
  chapters: [{ chapterNumber: 1, status: 'published' }, { chapterNumber: 2, status: 'published' }],
  poolMock: partialPool,
  mangaDb: { mangas: [{ id: 'manga_1' }] }
})
assert.strictEqual(res4.status, 207)
assert.strictEqual(res4.body.partial, true)
assert.strictEqual(res4.body.summary.succeeded, 1)
assert.strictEqual(res4.body.summary.failed, 1)
assert.strictEqual(res4.body.failedChapters[0].chapterNumber, 2)
console.log('✔ Test 4 passed: 207 Multi-Status returned on partial failure')

// Test 5: Full success returns 200
console.log('Test 5: Full success should return 200')
const successPool = {
  hasManga: () => true,
  insertChapter: () => {}
}
const res5 = simulatePublishChapters({
  mangaId: 'manga_1',
  chapters: [{ chapterNumber: 1, status: 'published' }, { chapterNumber: 2, status: 'draft' }],
  poolMock: successPool,
  mangaDb: { mangas: [{ id: 'manga_1' }] }
})
assert.strictEqual(res5.status, 200)
assert.strictEqual(res5.body.success, true)
assert.strictEqual(res5.body.summary.succeeded, 2)
assert.strictEqual(res5.body.summary.failed, 0)
console.log('✔ Test 5 passed: 200 OK returned on success')

console.log('All Phase 2 tests passed successfully!')
