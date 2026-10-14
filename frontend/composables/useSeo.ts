export const SITE_URL = 'https://romancetoon.com'
export const SITE_NAME = 'RomanceToon'
export const DEFAULT_OG_IMAGE = 'https://romancetoon.com/favicon.ico'
export const DEFAULT_DESCRIPTION = 'Read captivating romance webtoons, romantic manhwa, sweet love stories, villainess, and historical fantasy manga online in high-definition on RomanceToon.'

export interface SeoOptions {
  title: string
  description?: string
  canonicalPath?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'book'
  keywords?: string | string[]
  robots?: string
  publishedTime?: string
  modifiedTime?: string
  author?: string
  jsonLd?: any | any[]
}

export function useSeo() {
  /**
   * Format text for meta descriptions (150-160 characters max, clean whitespace)
   */
  const cleanDescription = (text?: string, maxLen = 160): string => {
    if (!text) return DEFAULT_DESCRIPTION
    const cleaned = text
      .replace(/<[^>]*>/g, '')
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
    if (cleaned.length <= maxLen) return cleaned
    return cleaned.slice(0, maxLen - 3) + '...'
  }

  /**
   * Generate absolute canonical URL
   */
  const getCanonicalUrl = (path: string = '/'): string => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${SITE_URL}${cleanPath}`
  }

  /**
   * Set complete, reactive SEO meta tags, OpenGraph, Twitter Cards, and JSON-LD schema
   */
  const setPageSeo = (options: SeoOptions) => {
    const title = options.title.includes(SITE_NAME) 
      ? options.title 
      : `${options.title} | ${SITE_NAME}`

    const description = cleanDescription(options.description)
    const canonical = options.canonicalPath ? getCanonicalUrl(options.canonicalPath) : SITE_URL
    const image = options.ogImage || DEFAULT_OG_IMAGE
    const ogType = options.ogType || 'website'
    const robots = options.robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

    const keywords = Array.isArray(options.keywords)
      ? options.keywords.join(', ')
      : (options.keywords || 'romance webtoons, read romance manga online, romantic manhwa, shoujo webtoons, love comics, free manhwa reader, english romance manhwa')

    const meta: any[] = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { name: 'robots', content: robots },
      { name: 'googlebot', content: robots },
      // Open Graph
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:type', content: ogType },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: canonical },
      { property: 'og:image', content: image },
      { property: 'og:image:alt', content: title },
      { property: 'og:locale', content: 'en_US' },
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@RomanceToon' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
      { name: 'twitter:image:alt', content: title }
    ]

    if (options.publishedTime) {
      meta.push({ property: 'article:published_time', content: options.publishedTime })
    }
    if (options.modifiedTime) {
      meta.push({ property: 'article:modified_time', content: options.modifiedTime })
    }
    if (options.author) {
      meta.push({ name: 'author', content: options.author })
      meta.push({ property: 'article:author', content: options.author })
    }

    const link: any[] = [
      { rel: 'canonical', href: canonical }
    ]

    // JSON-LD Scripts
    const script: any[] = []
    if (options.jsonLd) {
      const schemas = Array.isArray(options.jsonLd) ? options.jsonLd : [options.jsonLd]
      schemas.forEach((schema) => {
        if (schema) {
          script.push({
            type: 'application/ld+json',
            children: JSON.stringify(schema)
          })
        }
      })
    }

    useHead({
      title,
      meta,
      link,
      script
    })
  }

  // -------------------------------------------------------------------------
  // Schema.org Structured Data Generators
  // -------------------------------------------------------------------------

  /**
   * WebSite Schema with SearchAction for Google Sitelinks Search Box
   */
  const getWebSiteSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: ['Romance Toon', 'RomanceToon Comics', 'RomanceToon Webtoons'],
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    inLanguage: 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  })

  /**
   * Organization Schema
   */
  const getOrganizationSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.ico`,
    sameAs: []
  })

  /**
   * BreadcrumbList Schema
   */
  const getBreadcrumbSchema = (items: { name: string; path: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: getCanonicalUrl(item.path)
    }))
  })

  /**
   * ComicSeries / CreativeWorkSeries Schema for Manga Details Page
   */
  const getComicSeriesSchema = (manga: any) => {
    if (!manga) return null
    const slug = manga.slug || manga.id
    const publishedChapters = Array.isArray(manga.chapters)
      ? manga.chapters.filter((c: any) => c.isPublished !== false)
      : []

    return {
      '@context': 'https://schema.org',
      '@type': ['CreativeWorkSeries', 'ComicSeries'],
      name: manga.title,
      alternateName: manga.alternativeTitles || [],
      headline: manga.title,
      description: cleanDescription(manga.synopsis, 300),
      image: manga.cover || DEFAULT_OG_IMAGE,
      url: getCanonicalUrl(`/webtoon/${slug}`),
      inLanguage: 'en',
      genre: manga.genres || ['Romance'],
      author: {
        '@type': 'Person',
        name: manga.author || 'RomanceToon Author'
      },
      creator: {
        '@type': 'Person',
        name: manga.artist || manga.author || 'RomanceToon Artist'
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/favicon.ico`
      },
      datePublished: manga.releaseYear ? `${manga.releaseYear}-01-01` : undefined,
      aggregateRating: manga.rating ? {
        '@type': 'AggregateRating',
        ratingValue: Number(manga.rating || 5.0).toFixed(1),
        bestRating: '5',
        worstRating: '1',
        ratingCount: Math.max(Number(manga.ratingCount || 1), 1)
      } : undefined,
      hasPart: publishedChapters.slice(0, 15).map((c: any) => ({
        '@type': 'ComicIssue',
        issueNumber: c.number?.toString(),
        name: c.title || `Chapter ${c.number}`,
        url: getCanonicalUrl(`/webtoon/${slug}/chapter-${c.number}`)
      }))
    }
  }

  /**
   * ComicIssue Schema for Chapter Reader Page
   */
  const getComicIssueSchema = (manga: any, chapter: any) => {
    if (!manga || !chapter) return null
    const slug = manga.slug || manga.id
    const chNum = chapter.number || chapter.id || '1'

    return {
      '@context': 'https://schema.org',
      '@type': 'ComicIssue',
      name: `${manga.title} - Chapter ${chNum}`,
      issueNumber: chNum.toString(),
      url: getCanonicalUrl(`/webtoon/${slug}/chapter-${chNum}`),
      isPartOf: {
        '@type': 'ComicSeries',
        name: manga.title,
        url: getCanonicalUrl(`/webtoon/${slug}`)
      },
      image: manga.cover || DEFAULT_OG_IMAGE,
      inLanguage: 'en',
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL
      }
    }
  }

  /**
   * CollectionPage Schema for Genre & Popular Pages
   */
  const getCollectionSchema = (title: string, description: string, path: string) => ({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description: cleanDescription(description),
    url: getCanonicalUrl(path),
    inLanguage: 'en-US',
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL
    }
  })

  return {
    SITE_URL,
    SITE_NAME,
    DEFAULT_OG_IMAGE,
    DEFAULT_DESCRIPTION,
    cleanDescription,
    getCanonicalUrl,
    setPageSeo,
    getWebSiteSchema,
    getOrganizationSchema,
    getBreadcrumbSchema,
    getComicSeriesSchema,
    getComicIssueSchema,
    getCollectionSchema
  }
}
