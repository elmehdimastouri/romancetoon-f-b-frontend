<template>
  <div class="space-y-8 max-w-7xl mx-auto py-4">
    <!-- Header -->
    <div class="pb-6 border-b border-night-850 space-y-2">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-romance-600 to-rose-400 flex items-center justify-center shadow-glow-pink">
          <Flame class="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Most Loved Romance Webtoons
          </h1>
          <p class="text-xs sm:text-sm text-night-400 mt-0.5">
            Top ranked by reader popularity, views, and ratings.
          </p>
        </div>
      </div>
    </div>

    <!-- Stats Bar -->
    <div v-if="!isLoading && sortedMangas.length > 0" class="flex items-center justify-between text-xs text-night-400 px-1">
      <div>
        Showing <span class="font-mono font-bold text-white">{{ sortedMangas.length }}</span> {{ sortedMangas.length === 1 ? 'title' : 'titles' }} ranked by popularity
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      <div v-for="i in 5" :key="i" class="aspect-[3/4] rounded-2xl bg-night-900/60 animate-pulse border border-night-800"></div>
    </div>

    <!-- Real Manga Cards Grid -->
    <div v-else-if="sortedMangas.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
      <MangaCard 
        v-for="manga in sortedMangas" 
        :key="manga.id" 
        :manga="manga" 
      />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-20 px-4 rounded-3xl glass-panel border border-night-800/80 max-w-xl mx-auto space-y-5">
      <div class="w-16 h-16 rounded-3xl bg-romance-600/10 border border-romance-500/20 flex items-center justify-center mx-auto text-romance-400 shadow-glow-pink">
        <Flame class="w-8 h-8" />
      </div>
      <div class="space-y-2">
        <h3 class="text-xl font-serif font-bold text-white">
          Rankings Coming Soon
        </h3>
        <p class="text-xs sm:text-sm text-night-400 max-w-md mx-auto leading-relaxed">
          As new romance webtoons are released and read, the most popular titles will be highlighted right here.
        </p>
      </div>
      <div>
        <NuxtLink 
          to="/"
          class="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-romance-600 to-rose-500 hover:from-romance-500 text-white font-semibold text-xs shadow-glow-pink transition-transform transform hover:-translate-y-0.5"
        >
          <Sparkles class="w-4 h-4" />
          <span>Discover Romance Webtoons</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Flame, Sparkles } from '@lucide/vue'
import { useRomanceApi } from '~/composables/useApi'
import { useSeo } from '~/composables/useSeo'

const { setPageSeo, getBreadcrumbSchema, getCollectionSchema } = useSeo()

setPageSeo({
  title: 'Most Popular Romance Webtoons & Trending Manhwa',
  description: 'Explore top-ranked and trending romance webtoons, manga, and manhwa voted by readers. Read popular love stories, villainess, and high-rated romance chapters online on RomanceToon.',
  canonicalPath: '/popular',
  keywords: 'popular romance webtoons, top romance manhwa, best romance manga, trending webtoons, read manhwa online',
  ogType: 'website',
  jsonLd: [
    getBreadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Popular', path: '/popular' }
    ]),
    getCollectionSchema(
      'Most Popular Romance Webtoons & Trending Manhwa',
      'Top-ranked and most-read romance webtoons and manhwa ranked by popularity, views, and ratings.',
      '/popular'
    )
  ]
})

const { fetchMangas } = useRomanceApi()

const mangas = ref<any[]>([])
const isLoading = ref(true)

const loadData = async () => {
  isLoading.value = true
  mangas.value = await fetchMangas()
  isLoading.value = false
}

onMounted(() => {
  loadData()
})

// Helper to parse views string like '1.4M', '140K', '500' to a number
const parseViews = (views: string | number | undefined): number => {
  if (!views) return 0
  if (typeof views === 'number') return views
  const v = views.toString().toUpperCase().trim()
  if (v.endsWith('M')) return parseFloat(v) * 1000000
  if (v.endsWith('K')) return parseFloat(v) * 1000
  return parseFloat(v) || 0
}

const sortedMangas = computed(() => {
  return [...mangas.value].sort((a, b) => {
    const viewsA = parseViews(a.views)
    const viewsB = parseViews(b.views)
    if (viewsB !== viewsA) return viewsB - viewsA
    return (Number(b.rating) || 0) - (Number(a.rating) || 0)
  })
})
</script>
