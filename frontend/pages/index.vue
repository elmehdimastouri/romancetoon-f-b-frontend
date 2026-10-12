<template>
  <div>
    <!-- Hero Banner for Featured Romance -->
    <HeroBanner :featured="featuredManga" />

    <!-- Genre Filter Pills -->
    <div class="mb-10 flex items-center space-x-2 overflow-x-auto pb-2 custom-scroll">
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

    <!-- Section: Latest Romance Updates -->
    <section class="space-y-6">
      <div class="flex items-center justify-between pb-4 border-b border-night-850">
        <div class="flex items-center space-x-2.5">
          <div class="w-2.5 h-6 rounded-full bg-gradient-to-b from-romance-500 to-rose-600"></div>
          <h2 class="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
            Latest Romance Releases
          </h2>
        </div>
        <span class="text-xs text-night-400 font-medium">Updated minutes ago</span>
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

    <!-- Section: Popular Romance Webtoons -->
    <section class="mt-16 space-y-6">
      <div class="flex items-center justify-between pb-4 border-b border-night-850">
        <div class="flex items-center space-x-2.5">
          <div class="w-2.5 h-6 rounded-full bg-gradient-to-b from-amber-500 to-rose-500"></div>
          <h2 class="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
            Trending & Most Loved
          </h2>
        </div>
        <NuxtLink to="/popular" class="text-xs text-romance-400 hover:text-romance-300 font-semibold flex items-center space-x-1">
          <span>Explore All</span>
          <ChevronRight class="w-3.5 h-3.5" />
        </NuxtLink>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
        <MangaCard 
          v-for="manga in popularMangas" 
          :key="`pop-${manga.id}`" 
          :manga="manga" 
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { sampleMangas } from '~/data/mangas'
import { ChevronRight } from '@lucide/vue'

const featuredManga = sampleMangas[0]
const selectedGenre = ref('All Romance')

const filterGenres = [
  'All Romance',
  'CEO & Drama',
  'Historical',
  'Villainess',
  'Cozy Fantasy',
  'Contract Marriage'
]

const filteredMangas = computed(() => {
  if (selectedGenre.value === 'All Romance') {
    return sampleMangas
  }
  return sampleMangas.filter(m => m.genres.includes(selectedGenre.value))
})

const popularMangas = computed(() => {
  return [...sampleMangas].sort((a, b) => b.rating - a.rating)
})
</script>
