// Central API configuration for RomanceToon
export const API_BASE_URL = 'https://api.romancetoon.com'

export function useRomanceApi() {
  const getApiUrl = (endpoint: string) => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    return `${API_BASE_URL}${cleanEndpoint}`
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

  // Create new manga in live MySQL
  const createManga = async (mangaData: any) => {
    const res = await fetch(getApiUrl('/api/mangas'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mangaData)
    })
    return await res.json()
  }

  // Update existing manga
  const updateManga = async (id: string, mangaData: any) => {
    const res = await fetch(getApiUrl(`/api/mangas/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mangaData)
    })
    return await res.json()
  }

  // Delete manga completely from MySQL
  const deleteManga = async (id: string) => {
    const res = await fetch(getApiUrl(`/api/mangas/${id}`), {
      method: 'DELETE'
    })
    return await res.json()
  }

  // Scan Cloudflare R2 bucket for chapters
  const scanR2 = async (mangaFolder: string) => {
    const res = await fetch(getApiUrl('/api/r2/scan-manga'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mangaFolder })
    })
    return await res.json()
  }

  // Publish selected chapters into MySQL
  const publishChapters = async (mangaId: string, chapters: any[]) => {
    const res = await fetch(getApiUrl('/api/r2/publish-chapters'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mangaId, chapters })
    })
    return await res.json()
  }

  return {
    API_BASE_URL,
    getApiUrl,
    fetchMangas,
    fetchManga,
    fetchChapter,
    createManga,
    updateManga,
    deleteManga,
    scanR2,
    publishChapters
  }
}
