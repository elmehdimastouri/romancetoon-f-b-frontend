/**
 * Utility functions for formatting numbers, views, and dates across RomanceToon
 */

/**
 * Format view counts into clean, compact, human-readable numbers (e.g., 1.4K, 2.5M, or 350)
 */
export function formatViews(views: string | number | undefined | null): string {
  if (views === undefined || views === null || views === '') return '0'
  
  if (typeof views === 'string') {
    const trimmed = views.trim()
    // Already formatted with K or M
    if (/^[0-9]+(\.[0-9]+)?[KM]$/i.test(trimmed)) {
      return trimmed.toUpperCase()
    }
  }

  const num = typeof views === 'number' ? views : parseFloat(views.toString())
  if (isNaN(num)) return '0'

  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  return num.toLocaleString('en-US')
}

/**
 * Format rating to one decimal place (e.g. 4.9, 5.0)
 */
export function formatRating(rating: string | number | undefined | null): string {
  const num = typeof rating === 'number' ? rating : parseFloat(rating?.toString() || '5.0')
  return (isNaN(num) ? 5.0 : num).toFixed(1)
}
