<template>
  <div class="space-y-8 max-w-7xl mx-auto py-4">
    <!-- Header -->
    <div class="pb-6 border-b border-night-850 space-y-2">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-romance-600 to-rose-400 flex items-center justify-center shadow-glow-pink">
          <Sparkles class="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            {{ activeGenreName ? `${activeGenreName} Romance Webtoons` : 'Romance Genres & Tropes' }}
          </h1>
          <p class="text-xs sm:text-sm text-night-400 mt-0.5">
            {{ activeGenreName ? `Explore the best ${activeGenreName} stories, manga, and manhwa.` : 'Explore webtoons and manhwa categorized by your favorite romantic tropes.' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Dynamic Genre Filter Pills with SEO Links (/genres/drama/) -->
    <div class="-mx-4 px-4 sm:mx-0 sm:px-0 flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
      <!-- "All" Pill -->
      <NuxtLink 
        to="/genres/"
        :class="[
          'shrink-0 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center space-x-1.5',
          !normalizedCurrentSlug
            ? 'bg-romance-600 border-romance-500 text-white shadow-glow-pink'
            : 'bg-night-900 border-night-800 text-night-300 hover:text-white hover:border-night-700'
        ]"
      >
        <span>All</span>
        <span 
          v-if="mangas.length > 0"
          :class="[
            'px-1.5 py-0.2 rounded-full font-mono text-[10px]',
            !normalizedCurrentSlug ? 'bg-white/20 text-white' : 'bg-night-800 text-night-400'
          ]"
        >
          {{ mangas.length }}
        </span>
      </NuxtLink>

      <!-- Category Pills -->
      <NuxtLink 
        v-for="g in genreListWithCounts" 
        :key="g.slug"
        :to="`/genres/${g.slug}/`"
        :class="[
          'shrink-0 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center space-x-1.5',
          normalizedCurrentSlug === g.slug
            ? 'bg-romance-600 border-romance-500 text-white shadow-glow-pink'
            : 'bg-night-900 border-night-800 text-night-300 hover:text-white hover:border-night-700'
        ]"
      >
        <span>{{ g.name }}</span>
        <span 
          v-if="g.count > 0"
          :class="[
            'px-1.5 py-0.2 rounded-full font-mono text-[10px]',
            normalizedCurrentSlug === g.slug ? 'bg-white/20 text-white' : 'bg-night-800 text-night-400'
          ]"
        >
          {{ g.count }}
        </span>
      </NuxtLink>
    </div>

    <!-- Active Genre Info -->
    <div class="flex items-center justify-between text-xs text-night-400 px-1">
      <div>
        Showing <span class="text-romance-300 font-semibold">{{ activeGenreName || 'All Romance' }}</span> titles:
        <span class="ml-1 font-mono font-bold text-white">{{ filteredMangas.length }}</span> {{ filteredMangas.length === 1 ? 'title' : 'titles' }}
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
      <div v-for="i in 5" :key="i" class="aspect-[3/4] rounded-2xl bg-night-900/60 animate-pulse border border-night-800"></div>
    </div>

    <!-- Real Manga Cards Grid -->
    <div v-else-if="filteredMangas.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
      <MangaCard 
        v-for="manga in filteredMangas" 
        :key="manga.id" 
        :manga="manga" 
      />
    </div>

    <!-- Empty State when no real titles exist for this genre -->
    <div v-else class="text-center py-20 px-4 rounded-3xl glass-panel border border-night-800/80 max-w-xl mx-auto space-y-5">
      <div class="w-16 h-16 rounded-3xl bg-romance-600/10 border border-romance-500/20 flex items-center justify-center mx-auto text-romance-400 shadow-glow-pink">
        <Heart class="w-8 h-8 fill-romance-500/30" />
      </div>
      <div class="space-y-2">
        <h3 class="text-xl font-serif font-bold text-white">
          No Titles Found in "{{ activeGenreName || 'Selected Category' }}"
        </h3>
        <p class="text-xs sm:text-sm text-night-400 max-w-md mx-auto leading-relaxed">
          There are currently no webtoons published under this category. Check back soon or browse all our romance titles!
        </p>
      </div>
      <div v-if="normalizedCurrentSlug">
        <NuxtLink 
          to="/genres/"
          class="inline-block px-6 py-2.5 rounded-xl bg-gradient-to-r from-romance-600 to-rose-500 hover:from-romance-500 text-white font-semibold text-xs shadow-glow-pink transition-transform transform hover:-translate-y-0.5"
        >
          View All Romance Titles
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Sparkles, Heart } from '@lucide/vue'
import { useRomanceApi, slugifyGenre } from '~/composables/useApi'
import { useSeo } from '~/composables/useSeo'

const props = defineProps<{
  currentSlug?: string
}>()

const { fetchMangas, fetchGenres } = useRomanceApi()

const mangas = ref<any[]>([])
const dbGenres = ref<Array<{ name: string, slug: string }>>([])
const isLoading = ref(true)

const normalizedCurrentSlug = computed(() => {
  return (props.currentSlug || '').trim().toLowerCase()
})

const loadData = async () => {
  isLoading.value = true
  try {
    const [mangasData, genresData] = await Promise.all([
      fetchMangas(),
      fetchGenres()
    ])
    mangas.value = mangasData || []
    dbGenres.value = genresData || []
  } catch (err) {
    console.error('Error loading genres data:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
})

// Unified list of genres with real counts
const genreListWithCounts = computed(() => {
  // Use a map keyed by slug to avoid duplicates
  const map = new Map<string, { name: string, slug: string, count: number }>()

  // 1. First add genres registered in database
  for (const g of dbGenres.value) {
    const slug = g.slug || slugifyGenre(g.name)
    if (slug) {
      map.set(slug, {
        name: g.name,
        slug,
        count: 0
      })
    }
  }

  // 2. Discover any genres attached to published mangas
  for (const m of mangas.value) {
    if (Array.isArray(m.genres)) {
      for (const raw of m.genres) {
        if (!raw || typeof raw !== 'string') continue
        const slug = slugifyGenre(raw)
        if (!slug) continue
        if (!map.has(slug)) {
          map.set(slug, {
            name: raw,
            slug,
            count: 0
          })
        }
      }
    }
  }

  // 3. Calculate real counts
  for (const m of mangas.value) {
    if (Array.isArray(m.genres)) {
      const mangaSlugs = new Set(m.genres.map((g: string) => slugifyGenre(g)))
      for (const [slug, item] of map.entries()) {
        if (mangaSlugs.has(slug)) {
          item.count++
        }
      }
    }
  }

  return Array.from(map.values())
})

// Get active genre human name if slug is active
const activeGenreName = computed(() => {
  if (!normalizedCurrentSlug.value) return ''
  const found = genreListWithCounts.value.find(g => g.slug === normalizedCurrentSlug.value)
  if (found) return found.name
  // Capitalize fallback if slug exists
  return normalizedCurrentSlug.value
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
})

// Filter mangas dynamically based on selected genre slug
const filteredMangas = computed(() => {
  if (!normalizedCurrentSlug.value) {
    return mangas.value
  }
  return mangas.value.filter(m => {
    if (!Array.isArray(m.genres)) return false
    return m.genres.some((g: string) => slugifyGenre(g) === normalizedCurrentSlug.value)
  })
})

// Dynamic SEO Head & Structured Data
const { SITE_NAME, cleanDescription, getCanonicalUrl, getCollectionSchema, getBreadcrumbSchema } = useSeo()

useHead(() => {
  const isSpecificGenre = Boolean(normalizedCurrentSlug.value && activeGenreName.value)
  const title = isSpecificGenre
    ? `${activeGenreName.value} Romance Webtoons & Manhwa | ${SITE_NAME}`
    : `Romance Webtoon Genres & Categories | ${SITE_NAME}`
  
  const description = cleanDescription(
    isSpecificGenre
      ? `Explore the best ${activeGenreName.value} romance webtoons, manga, and manhwa. Read top-rated ${activeGenreName.value} love stories and daily chapters on RomanceToon.`
      : 'Explore romance webtoons categorized by tropes, genres, and themes including historical, villainess, fantasy, and contract marriage on RomanceToon.'
  )

  const canonicalPath = isSpecificGenre
    ? `/genres/${normalizedCurrentSlug.value}/`
    : '/genres/'

  const canonical = getCanonicalUrl(canonicalPath)

  const breadcrumbsList = isSpecificGenre
    ? [
        { name: 'Home', path: '/' },
        { name: 'Genres', path: '/genres/' },
        { name: activeGenreName.value, path: canonicalPath }
      ]
    : [
        { name: 'Home', path: '/' },
        { name: 'Genres', path: '/genres/' }
      ]

  const breadcrumbsSchema = getBreadcrumbSchema(breadcrumbsList)
  const collectionSchema = getCollectionSchema(title, description, canonicalPath)

  return {
    title,
    meta: [
      { name: 'description', content: description },
      { name: 'keywords', content: `${activeGenreName.value || 'romance'} webtoons, ${activeGenreName.value || 'romance'} manhwa, romance genres, read manhwa online` },
      { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
      // Open Graph
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: canonical },
      { property: 'og:image', content: 'https://romancetoon.com/icon-512.png' },
      { property: 'og:locale', content: 'en_US' },
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@RomanceToon' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description }
    ],
    link: [
      { rel: 'canonical', href: canonical }
    ],
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(breadcrumbsSchema)
      },
      {
        type: 'application/ld+json',
        children: JSON.stringify(collectionSchema)
      }
    ]
  }
})
</script>
