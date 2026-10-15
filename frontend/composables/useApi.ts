// Central API configuration for RomanceToon
export const API_BASE_URL = 'https://api.romancetoon.com'

export function slugifyGenre(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/&/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function useRomanceApi() {
  let baseUrl = API_BASE_URL
  try {
    const config = useRuntimeConfig()
    if (config?.public?.apiBase) {
      baseUrl = config.public.apiBase
    }
  } catch (e) {
    // Fallback if called outside Nuxt app context
  }

  const getApiUrl = (endpoint: string) => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    return `${baseUrl}${cleanEndpoint}`
  }

  // Fetch all mangas from live MySQL database
  const fetchMangas = async () => {
    try {
      const res = await fetch(getApiUrl('/api/mangas'))
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        return json.data
      }
      return []
    } catch (err) {
      console.error('Failed to fetch mangas from live API:', err)
      return []
    }
  }

  // Fetch single manga by ID or slug
  const fetchManga = async (id: string) => {
    try {
      const res = await fetch(getApiUrl(`/api/mangas/${id}`))
      const json = await res.json()
      if (json.success && json.data) {
        return json.data
      }
      return null
    } catch (err) {
      console.error(`Failed to fetch manga ${id}:`, err)
      return null
    }
  }

  // Fetch single chapter pages for reader
  const fetchChapter = async (mangaId: string, chapterNumber: string | number) => {
    try {
      const res = await fetch(getApiUrl(`/api/mangas/${mangaId}/chapters/${chapterNumber}`))
      const json = await res.json()
      if (json.success && json.chapter) {
        return { manga: json.manga, chapter: json.chapter }
      }
      return null
    } catch (err) {
      console.error(`Failed to fetch chapter ${chapterNumber}:`, err)
      return null
    }
  }

  const ADMIN_STORAGE_KEY = 'romancetoon_admin_token'
  const ADMIN_USER_KEY = 'romancetoon_admin_user'

  const getAdminToken = (): string => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return sessionStorage.getItem(ADMIN_STORAGE_KEY) || ''
      }
    } catch (e) {
      // ignore
    }
    return ''
  }

  const setAdminToken = (token: string, username?: string) => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem(ADMIN_STORAGE_KEY, token)
        if (username) {
          sessionStorage.setItem(ADMIN_USER_KEY, username)
        }
      }
    } catch (e) {
      // ignore
    }
  }

  const getAdminUser = (): string => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return sessionStorage.getItem(ADMIN_USER_KEY) || 'elmehdi'
      }
    } catch (e) {
      // ignore
    }
    return 'elmehdi'
  }

  const clearAdminToken = () => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem(ADMIN_STORAGE_KEY)
        sessionStorage.removeItem(ADMIN_USER_KEY)
      }
    } catch (e) {
      // ignore
    }
  }

  const getAdminHeaders = () => {
    const token = getAdminToken()
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  }

  // Login with username and password against backend
  const loginAdmin = async (username: string, password: string): Promise<{ success: boolean; token?: string; user?: string; message?: string }> => {
    try {
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const json = await res.json()
      if (json.success && json.token) {
        setAdminToken(json.token, json.user || username)
        return { success: true, token: json.token, user: json.user || username }
      }
      return { success: false, message: json.message || 'Invalid username or password' }
    } catch (err: any) {
      return { success: false, message: 'Server connection error: ' + (err.message || 'Network error') }
    }
  }

  // Verify existing admin session token against backend
  const verifyAdminToken = async (existingToken?: string): Promise<{ success: boolean; user?: string; message?: string }> => {
    const token = existingToken || getAdminToken()
    if (!token) return { success: false, message: 'No active session' }
    try {
      const res = await fetch(getApiUrl('/api/auth/verify'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token })
      })
      const json = await res.json()
      if (json.success) {
        return { success: true, user: json.user }
      }
      clearAdminToken()
      return { success: false, message: json.message || 'Session expired' }
    } catch (err: any) {
      return { success: false, message: 'Network error verifying session' }
    }
  }

  // Backward compatible passkey check
  const verifyPasskey = async (passkey: string): Promise<{ success: boolean; message?: string }> => {
    return await verifyAdminToken(passkey)
  }

  // Create new manga in live MySQL
  const createManga = async (mangaData: any) => {
    const res = await fetch(getApiUrl('/api/mangas'), {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(mangaData)
    })
    return await res.json()
  }

  // Update existing manga
  const updateManga = async (id: string, mangaData: any) => {
    const res = await fetch(getApiUrl(`/api/mangas/${id}`), {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(mangaData)
    })
    return await res.json()
  }

  // Delete manga completely from MySQL
  const deleteManga = async (id: string) => {
    const res = await fetch(getApiUrl(`/api/mangas/${id}`), {
      method: 'DELETE',
      headers: getAdminHeaders()
    })
    return await res.json()
  }

  // Scan Cloudflare R2 bucket for chapters
  const scanR2 = async (mangaFolder: string) => {
    const res = await fetch(getApiUrl('/api/r2/scan-manga'), {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ mangaFolder })
    })
    return await res.json()
  }

  // Publish selected chapters into MySQL
  const publishChapters = async (mangaId: string, chapters: any[]) => {
    const res = await fetch(getApiUrl('/api/r2/publish-chapters'), {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ mangaId, chapters })
    })
    return await res.json()
  }

  // Rate manga (1-5 stars)
  const rateManga = async (mangaId: string, rating: number, userFingerprint?: string) => {
    try {
      const res = await fetch(getApiUrl(`/api/mangas/${mangaId}/rate`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, userFingerprint })
      })
      return await res.json()
    } catch (err) {
      console.error(`Failed to rate manga ${mangaId}:`, err)
      return { success: false, message: 'Network error' }
    }
  }

  // Get current user rating
  const fetchMangaRating = async (mangaId: string, userFingerprint?: string) => {
    try {
      const query = userFingerprint ? `?userFingerprint=${encodeURIComponent(userFingerprint)}` : ''
      const res = await fetch(getApiUrl(`/api/mangas/${mangaId}/rate${query}`))
      return await res.json()
    } catch (err) {
      return null
    }
  }

  // Record view count for manga and optional chapter
  const recordView = async (mangaId: string, chapterNumber?: number | string) => {
    try {
      if (process.client) {
        const sessionKey = chapterNumber 
          ? `view_ch_${mangaId}_${chapterNumber}` 
          : `view_m_${mangaId}`
        const last = sessionStorage.getItem(sessionKey)
        const now = Date.now()
        // 10-minute cooldown per session to avoid counting rapid refreshes
        if (last && now - parseInt(last, 10) < 10 * 60 * 1000) {
          return null
        }
        sessionStorage.setItem(sessionKey, now.toString())
      }

      const res = await fetch(getApiUrl(`/api/mangas/${mangaId}/view`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterNumber })
      })
      return await res.json()
    } catch (err) {
      console.error(`Failed to record view for manga ${mangaId}:`, err)
      return null
    }
  }

  // Toggle/Update public bookmark count
  const updateBookmark = async (mangaId: string, action: 'add' | 'remove' | 'toggle' = 'toggle', userFingerprint?: string) => {
    try {
      const res = await fetch(getApiUrl(`/api/mangas/${mangaId}/bookmark`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userFingerprint })
      })
      return await res.json()
    } catch (err) {
      console.error(`Failed to update bookmark for manga ${mangaId}:`, err)
      return null
    }
  }

  // Fetch all genres
  const fetchGenres = async () => {
    try {
      const res = await fetch(getApiUrl('/api/genres'))
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        return json.data
      }
      return []
    } catch (err) {
      console.error('Failed to fetch genres:', err)
      return []
    }
  }

  // Create new genre
  const createGenre = async (name: string) => {
    try {
      const res = await fetch(getApiUrl('/api/genres'), {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ name })
      })
      return await res.json()
    } catch (err) {
      console.error('Failed to create genre:', err)
      return { success: false, message: 'Network error' }
    }
  }

  // Delete genre
  const deleteGenre = async (slugOrName: string) => {
    try {
      const res = await fetch(getApiUrl(`/api/genres/${encodeURIComponent(slugOrName)}`), {
        method: 'DELETE',
        headers: getAdminHeaders()
      })
      return await res.json()
    } catch (err) {
      console.error('Failed to delete genre:', err)
      return { success: false, message: 'Network error' }
    }
  }

  return {
    API_BASE_URL,
    getApiUrl,
    loginAdmin,
    verifyAdminToken,
    verifyPasskey,
    getAdminToken,
    getAdminUser,
    clearAdminToken,
    fetchMangas,
    fetchManga,
    fetchChapter,
    createManga,
    updateManga,
    deleteManga,
    scanR2,
    publishChapters,
    rateManga,
    fetchMangaRating,
    recordView,
    updateBookmark,
    fetchGenres,
    createGenre,
    deleteGenre,
    slugifyGenre
  }
}
