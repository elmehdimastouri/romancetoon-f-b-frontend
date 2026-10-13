import { ref } from 'vue'

export interface BookmarkItem {
  id: string
  slug: string
  title: string
  cover: string
  author?: string
  status?: string
  rating?: string | number
  genres?: string[]
  latestChapter?: number | string
  addedAt: number
}

export interface HistoryItem {
  id: string
  slug: string
  title: string
  cover: string
  chapterNumber: number | string
  chapterTitle?: string
  lastReadAt: number
  totalChapters?: number
}

const STORAGE_KEY_BOOKMARKS = 'romancetoon_bookmarks_v1'
const STORAGE_KEY_HISTORY = 'romancetoon_history_v1'

export function useReadingTracker() {
  const bookmarks = useState<BookmarkItem[]>('romance_bookmarks', () => [])
  const history = useState<HistoryItem[]>('romance_history', () => [])
  const isInitialized = useState<boolean>('romance_tracker_init', () => false)

  // Initialize from LocalStorage on client mount
  const init = () => {
    if (process.server || isInitialized.value) return

    try {
      const storedBookmarks = localStorage.getItem(STORAGE_KEY_BOOKMARKS)
      if (storedBookmarks) {
        bookmarks.value = JSON.parse(storedBookmarks)
      }
    } catch (e) {
      console.warn('Failed to parse bookmarks from localStorage:', e)
    }

    try {
      const storedHistory = localStorage.getItem(STORAGE_KEY_HISTORY)
      if (storedHistory) {
        history.value = JSON.parse(storedHistory)
      }
    } catch (e) {
      console.warn('Failed to parse history from localStorage:', e)
    }

    isInitialized.value = true
  }

  // Ensure init runs if client
  if (process.client && !isInitialized.value) {
    init()
  }

  // Persistence helpers
  const saveBookmarksToStorage = () => {
    if (process.client) {
      try {
        localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(bookmarks.value))
      } catch (e) {
        console.error('Failed to save bookmarks to localStorage:', e)
      }
    }
  }

  const saveHistoryToStorage = () => {
    if (process.client) {
      try {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history.value))
      } catch (e) {
        console.error('Failed to save history to localStorage:', e)
      }
    }
  }

  // ----------------------------------------------------
  // BOOKMARKS LOGIC
  // ----------------------------------------------------
  const isBookmarked = (idOrSlug?: string): boolean => {
    if (!idOrSlug) return false
    return bookmarks.value.some(b => b.id === idOrSlug || b.slug === idOrSlug)
  }

  const toggleBookmark = (manga: any) => {
    if (!manga) return
    const id = manga.id || manga.slug
    const slug = manga.slug || manga.id

    if (isBookmarked(id) || isBookmarked(slug)) {
      removeBookmark(id)
      return false // removed
    } else {
      addBookmark(manga)
      return true // added
    }
  }

  const addBookmark = (manga: any) => {
    if (!manga) return
    const id = (manga.id || manga.slug || '').toString()
    const slug = (manga.slug || manga.id || '').toString()

    // Avoid duplicates
    bookmarks.value = bookmarks.value.filter(b => b.id !== id && b.slug !== slug)

    let latestChapter: number | string | undefined = undefined
    if (manga.chapters && Array.isArray(manga.chapters) && manga.chapters.length > 0) {
      const last = manga.chapters[manga.chapters.length - 1]
      latestChapter = last.number || last.chapter_number
    }

    const item: BookmarkItem = {
      id,
      slug,
      title: manga.title || 'Untitled',
      cover: manga.cover || '',
      author: manga.author || '',
      status: manga.status || 'Ongoing',
      rating: manga.rating || '5.0',
      genres: Array.isArray(manga.genres) ? manga.genres : [],
      latestChapter,
      addedAt: Date.now()
    }

    bookmarks.value.unshift(item)
    saveBookmarksToStorage()
  }

  const removeBookmark = (idOrSlug: string) => {
    if (!idOrSlug) return
    bookmarks.value = bookmarks.value.filter(b => b.id !== idOrSlug && b.slug !== idOrSlug)
    saveBookmarksToStorage()
  }

  const clearBookmarks = () => {
    bookmarks.value = []
    saveBookmarksToStorage()
  }

  // ----------------------------------------------------
  // READING HISTORY LOGIC
  // ----------------------------------------------------
  const recordHistory = (manga: any, chapter: any) => {
    if (!manga || !chapter) return
    const id = (manga.id || manga.slug || '').toString()
    const slug = (manga.slug || manga.id || '').toString()

    // Clean chapter number
    let chNum: number | string = chapter.number || chapter.id || 1
    if (typeof chNum === 'string') {
      const match = chNum.match(/(\d+)/)
      if (match) chNum = parseInt(match[1], 10)
    }

    const chapterTitle = chapter.title || `Chapter ${chNum}`

    // Remove existing history item for this manga so we can place it at the very top
    history.value = history.value.filter(h => h.id !== id && h.slug !== slug)

    const item: HistoryItem = {
      id,
      slug,
      title: manga.title || 'Untitled',
      cover: manga.cover || '',
      chapterNumber: chNum,
      chapterTitle,
      lastReadAt: Date.now(),
      totalChapters: Array.isArray(manga.chapters) ? manga.chapters.length : undefined
    }

    history.value.unshift(item)
    // Keep reasonable max history limit (e.g. 100 items)
    if (history.value.length > 100) {
      history.value = history.value.slice(0, 100)
    }

    saveHistoryToStorage()
  }

  const getHistoryForManga = (idOrSlug: string): HistoryItem | undefined => {
    if (!idOrSlug) return undefined
    return history.value.find(h => h.id === idOrSlug || h.slug === idOrSlug)
  }

  const removeFromHistory = (idOrSlug: string) => {
    if (!idOrSlug) return
    history.value = history.value.filter(h => h.id !== idOrSlug && h.slug !== idOrSlug)
    saveHistoryToStorage()
  }

  const clearHistory = () => {
    history.value = []
    saveHistoryToStorage()
  }

  // Relative time helper
  const formatTimeAgo = (timestamp: number): string => {
    const diffMs = Date.now() - timestamp
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'الآن / Just now'
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`
    if (diffHours < 24) return `منذ ${diffHours} ساعة`
    if (diffDays === 1) return 'أمس / Yesterday'
    if (diffDays < 30) return `منذ ${diffDays} يوم`
    return new Date(timestamp).toLocaleDateString()
  }

  return {
    bookmarks,
    history,
    init,
    // Bookmarks
    isBookmarked,
    toggleBookmark,
    addBookmark,
    removeBookmark,
    clearBookmarks,
    // History
    recordHistory,
    getHistoryForManga,
    removeFromHistory,
    clearHistory,
    formatTimeAgo
  }
}
