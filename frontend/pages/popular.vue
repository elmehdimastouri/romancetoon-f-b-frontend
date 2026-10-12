<template>
  <div class="space-y-8">
    <div class="pb-4 border-b border-night-850">
      <h1 class="font-serif text-3xl font-bold text-white">Most Loved Romance Webtoons</h1>
      <p class="text-xs text-night-400 mt-1">Ranked by reader ratings, bookmarks, and total views</p>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
      <MangaCard 
        v-for="manga in sortedMangas" 
        :key="manga.id" 
        :manga="manga" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { sampleMangas } from '~/data/mangas'

const sortedMangas = computed(() => {
  return [...sampleMangas].sort((a, b) => b.rating - a.rating)
})
</script>
