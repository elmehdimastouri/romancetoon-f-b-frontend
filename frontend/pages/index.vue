<template>
  <div class="space-y-12">
    <!-- Hero Banner for Featured Romance (if any published) -->
    <HeroBanner v-if="featuredManga" :featured="featuredManga" />

    <!-- Genre Filter Pills -->
    <div v-if="mangas.length > 0" class="flex items-center space-x-2 overflow-x-auto pb-2 custom-scroll">
      <button 
        v-for="genre in filterGenres" 
        :key="genre"
        @click="selectedGenre = genre"
        :class="[
          'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border',
          selectedGenre === genre
            ? 'bg-romance-600 border-romance-500 text-white shadow-glow-pink'
            : 'bg-night-900 border-night-800 text-night-300 hover:text-white hover:border-night-700'
        ]"
      >
        {{ genre }}
      </button>
    </div>

    <!-- Section: Latest Romance Releases -->
    <section v-if="filteredMangas.length > 0" class="space-y-6">
      <div class="flex items-center justify-between pb-4 border-b border-night-850">
        <div class="flex items-center space-x-2.5">
          <div class="w-2.5 h-6 rounded-full bg-gradient-to-b from-romance-500 to-rose-600"></div>
          <h2 class="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
            Latest Romance Releases
          </h2>
        </div>
        <span class="text-xs text-night-400 font-medium">{{ filteredMangas.length }} Titles</span>
      </div>

      <!-- Manga Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
        <MangaCard 
          v-for="manga in filteredMangas" 
          :key="manga.id" 
          :manga="manga" 
        />
      </div>
    </section>

    <!-- Visitor-facing Empty State -->
    <div v-else-if="!isLoading" class="min-h-[380px] p-8 rounded-3xl glass-panel text-center flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto my-12 border border-white/10 shadow-2xl">
      <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-romance-600/30 to-rose-500/20 border border-romance-500/40 flex items-center justify-center text-romance-400">
        <Heart class="w-8 h-8 fill-romance-500/30 animate-pulse" />
      </div>
      <h3 class="font-serif text-2xl font-bold text-white">New Romance Releases Coming Soon</h3>
      <p class="text-xs sm:text-sm text-night-400 leading-relaxed max-w-md">
        We are preparing captivating romance manhwas and love stories for you. Check back shortly for the latest releases!
      </p>
      <button 
        v-if="selectedGenre !== 'All Romance'" 
        @click="selectedGenre = 'All Romance'"
        class="mt-2 px-5 py-2.5 rounded-xl bg-night-850 hover:bg-night-800 text-romance-300 border border-night-800 text-xs font-medium transition-colors"
      >
        Show All Romance Titles
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
      <div v-for="i in 4" :key="i" class="h-64 rounded-2xl bg-night-900/60 animate-pulse border border-night-800"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRomanceApi } from '~/composables/useApi'
import { Heart } from '@lucide/vue'

const { fetchMangas } = useRomanceApi()

const mangas = ref<any[]>([])
const isLoading = ref(true)
const selectedGenre = ref('All Romance')

const filterGenres = [
  'All Romance',
  'CEO & Drama',
  'Historical',
  'Villainess',
  'Cozy Fantasy',
  'Contract Marriage'
]

const loadMangas = async () => {
  isLoading.value = true
  mangas.value = await fetchMangas()
  isLoading.value = false
}

onMounted(() => {
  loadMangas()
})

const featuredManga = computed(() => {
  return mangas.value.length > 0 ? mangas.value[0] : null
})

const filteredMangas = computed(() => {
  if (selectedGenre.value === 'All Romance') {
    return mangas.value
  }
  return mangas.value.filter(m => m.genres && m.genres.includes(selectedGenre.value))
})
</script>
