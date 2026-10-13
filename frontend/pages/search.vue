<template>
  <div class="space-y-8 max-w-7xl mx-auto py-4">
    <!-- Search Header & Input Box -->
    <div class="pb-6 border-b border-night-850 space-y-4">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-romance-600 to-rose-400 flex items-center justify-center shadow-glow-pink">
          <Search class="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Search Webtoons
          </h1>
          <p class="text-xs sm:text-sm text-night-400 mt-0.5">
            Find your favorite romance titles, authors, and tropes.
          </p>
        </div>
      </div>

      <!-- Live Search Input -->
      <div class="relative max-w-2xl">
        <input 
          v-model="searchTerm" 
          @input="onSearchInput"
          type="text" 
          placeholder="Search by title, alternative name, author, or genre..." 
          class="w-full bg-night-900 border border-night-800 rounded-2xl py-3.5 pl-11 pr-10 text-sm text-white placeholder-night-500 focus:outline-none focus:border-romance-500/70 focus:ring-1 focus:ring-romance-500/40 shadow-inner"
          autofocus
        />
        <Search class="w-5 h-5 text-night-400 absolute left-3.5 top-3.5 pointer-events-none" />
        <button 
          v-if="searchTerm" 
          @click="searchTerm = ''; onSearchInput()"
          class="absolute right-3.5 top-3.5 text-night-400 hover:text-white"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Stats / Active Query Info -->
    <div v-if="!isLoading" class="flex items-center justify-between text-xs text-night-400 px-1">
      <div>
        <span v-if="searchTerm.trim()">
          Results for <span class="text-romance-300 font-semibold">"{{ searchTerm }}"</span>:
          <span class="ml-1 font-mono font-bold text-white">{{ filteredResults.length }}</span> titles found
        </span>
        <span v-else>
          Showing all available romance titles (<span class="font-mono font-bold text-white">{{ allMangas.length }}</span>)
        </span>
      </div>

      <NuxtLink to="/genres" class="text-romance-400 hover:underline flex items-center space-x-1">
        <span>Browse by genre</span>
      </NuxtLink>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      <div v-for="i in 10" :key="i" class="aspect-[3/4] rounded-2xl bg-night-900/60 animate-pulse border border-night-800"></div>
    </div>

    <!-- Results Grid -->
    <div v-else-if="filteredResults.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
      <MangaCard 
        v-for="manga in filteredResults" 
        :key="manga.id" 
        :manga="manga" 
      />
    </div>

    <!-- Empty Search Results State -->
    <div v-else class="text-center py-20 px-4 rounded-3xl glass-panel border border-night-800/80 max-w-xl mx-auto space-y-5">
      <div class="w-16 h-16 rounded-3xl bg-romance-600/10 border border-romance-500/20 flex items-center justify-center mx-auto text-romance-400 shadow-glow-pink">
        <SearchX class="w-8 h-8" />
      </div>
      <div class="space-y-2">
        <h3 class="text-xl font-serif font-bold text-white">
          No Titles Found for "{{ searchTerm }}"
        </h3>
        <p class="text-xs sm:text-sm text-night-400 max-w-md mx-auto leading-relaxed">
          We couldn't find any webtoon matching your search. Try searching for different keywords or explore our romance genres.
        </p>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button 
          @click="searchTerm = ''; onSearchInput()"
          class="px-5 py-2.5 rounded-xl bg-night-850 hover:bg-night-800 border border-night-800 text-xs font-medium text-white transition-colors"
        >
          Clear Search
        </button>
        <NuxtLink 
          to="/genres"
          class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-romance-600 to-rose-500 hover:from-romance-500 text-white font-semibold text-xs shadow-glow-pink transition-transform transform hover:-translate-y-0.5"
        >
          Explore All Genres
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, X, SearchX } from '@lucide/vue'
import { useRomanceApi } from '~/composables/useApi'

const route = useRoute()
const router = useRouter()
const { fetchMangas } = useRomanceApi()

const allMangas = ref<any[]>([])
const isLoading = ref(true)
const searchTerm = ref((route.query.q as string) || '')

const loadData = async () => {
  isLoading.value = true
  allMangas.value = await fetchMangas()
  isLoading.value = false
}

onMounted(() => {
  loadData()
})

// Sync when URL query changes
watch(() => route.query.q, (newQ) => {
  searchTerm.value = (newQ as string) || ''
})

const onSearchInput = () => {
  // Update URL without full reload
  router.replace({
    query: searchTerm.value.trim() ? { q: searchTerm.value.trim() } : {}
  })
}

const filteredResults = computed(() => {
  const q = searchTerm.value.toLowerCase().trim()
  if (!q) return allMangas.value

  return allMangas.value.filter(m => {
    const titleMatch = m.title && m.title.toLowerCase().includes(q)
    const authorMatch = m.author && m.author.toLowerCase().includes(q)
    const artistMatch = m.artist && m.artist.toLowerCase().includes(q)
    const genresMatch = Array.isArray(m.genres) && m.genres.some((g: string) => g.toLowerCase().includes(q))
    const altMatch = Array.isArray(m.alternativeTitles) && m.alternativeTitles.some((alt: string) => alt.toLowerCase().includes(q))
    return titleMatch || authorMatch || artistMatch || genresMatch || altMatch
  })
})

useHead(() => ({
  title: searchTerm.value ? `Search: "${searchTerm.value}" | RomanceToon` : 'Search Romance Webtoons | RomanceToon',
  meta: [
    { name: 'description', content: 'Search across thousands of romance manhwa and webtoon chapters.' }
  ]
}))
</script>
