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
            Romance Genres & Tropes
          </h1>
          <p class="text-xs sm:text-sm text-night-400 mt-0.5">
            Explore webtoons and manhwa categorized by your favorite romantic stories.
          </p>
        </div>
      </div>
    </div>

    <!-- Dynamic Genre Filter Pills -->
    <div class="flex items-center space-x-2 overflow-x-auto pb-2 custom-scroll">
      <button 
        v-for="g in availableGenres" 
        :key="g.name"
        @click="selectGenre(g.name)"
        :class="[
          'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center space-x-1.5',
          selectedGenre === g.name
            ? 'bg-romance-600 border-romance-500 text-white shadow-glow-pink'
            : 'bg-night-900 border-night-800 text-night-300 hover:text-white hover:border-night-700'
        ]"
      >
        <span>{{ g.name }}</span>
        <span 
          v-if="g.count > 0"
          :class="[
            'px-1.5 py-0.2 rounded-full font-mono text-[10px]',
            selectedGenre === g.name ? 'bg-white/20 text-white' : 'bg-night-800 text-night-400'
          ]"
        >
          {{ g.count }}
        </span>
      </button>
    </div>

    <!-- Active Genre Info -->
    <div class="flex items-center justify-between text-xs text-night-400 px-1">
      <div>
        Showing <span class="text-romance-300 font-semibold">{{ selectedGenre }}</span> titles:
        <span class="ml-1 font-mono font-bold text-white">{{ filteredMangas.length }}</span> {{ filteredMangas.length === 1 ? 'title' : 'titles' }}
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      <div v-for="i in 5" :key="i" class="aspect-[3/4] rounded-2xl bg-night-900/60 animate-pulse border border-night-800"></div>
    </div>

    <!-- Real Manga Cards Grid -->
    <div v-else-if="filteredMangas.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
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
          No Titles Found in "{{ selectedGenre }}"
        </h3>
        <p class="text-xs sm:text-sm text-night-400 max-w-md mx-auto leading-relaxed">
          There are currently no webtoons published under this category. Check back soon or browse all our romance titles!
        </p>
      </div>
      <div v-if="selectedGenre !== 'All'">
        <button 
          @click="selectGenre('All')"
          class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-romance-600 to-rose-500 hover:from-romance-500 text-white font-semibold text-xs shadow-glow-pink transition-transform transform hover:-translate-y-0.5"
        >
          View All Romance Titles
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Sparkles, Heart } from '@lucide/vue'
import { useRomanceApi } from '~/composables/useApi'

const route = useRoute()
const router = useRouter()
const { fetchMangas } = useRomanceApi()

const mangas = ref<any[]>([])
const isLoading = ref(true)
const selectedGenre = ref((route.query.tag as string) || 'All')

// Standard romance categories list
const baseGenres = [
  'All',
  'Romance',
  'Drama',
  'Fantasy',
  'Historical',
  'CEO & Contract',
  'Villainess',
  'Comedy',
  'Modern Romance'
]

const loadData = async () => {
  isLoading.value = true
  mangas.value = await fetchMangas()
  isLoading.value = false
}

onMounted(() => {
  loadData()
})

watch(() => route.query.tag, (newTag) => {
  if (newTag) {
    selectedGenre.value = newTag as string
  }
})

const selectGenre = (genre: string) => {
  selectedGenre.value = genre
  router.replace({
    query: genre !== 'All' ? { tag: genre } : {}
  })
}

// Compute real counts and list of available genres
const availableGenres = computed(() => {
  // Collect any additional genres present in real mangas
  const dynamicSet = new Set<string>()
  mangas.value.forEach(m => {
    if (Array.isArray(m.genres)) {
      m.genres.forEach((g: string) => dynamicSet.add(g))
    }
  })

  const merged = Array.from(new Set([...baseGenres, ...Array.from(dynamicSet)]))

  return merged.map(name => {
    let count = 0
    if (name === 'All') {
      count = mangas.value.length
    } else {
      count = mangas.value.filter(m => 
        Array.isArray(m.genres) && m.genres.some((g: string) => g.toLowerCase() === name.toLowerCase())
      ).length
    }
    return { name, count }
  })
})

// Filter mangas dynamically based on selected genre
const filteredMangas = computed(() => {
  if (selectedGenre.value === 'All') {
    return mangas.value
  }
  return mangas.value.filter(m => 
    Array.isArray(m.genres) && m.genres.some((g: string) => g.toLowerCase() === selectedGenre.value.toLowerCase())
  )
})

useHead({
  title: 'Romance Genres & Categories | RomanceToon',
  meta: [
    { name: 'description', content: 'Explore romance webtoons categorized by tropes, genres, and themes.' }
  ]
})
</script>
