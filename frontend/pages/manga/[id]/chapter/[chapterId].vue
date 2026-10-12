<template>
  <div v-if="manga && currentChapter">
    <WebtoonReader 
      :manga="manga" 
      :currentChapter="currentChapter" 
    />
  </div>
  <div v-else class="min-h-screen flex items-center justify-center text-center p-6 bg-night-950">
    <div class="space-y-4">
      <p class="text-night-400">Chapter not found</p>
      <NuxtLink to="/" class="px-5 py-2.5 rounded-xl bg-romance-600 text-white text-xs font-semibold">
        Return to RomanceToon Home
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { sampleMangas } from '~/data/mangas'

// Set custom layout for reader (no standard header/footer interfering with full-bleed webtoon reading)
definePageMeta({
  layout: 'reader'
})

const route = useRoute()
const mangaId = computed(() => route.params.id as string)
const chapterId = computed(() => route.params.chapterId as string)

const manga = computed(() => {
  return sampleMangas.find(m => m.id === mangaId.value || m.slug === mangaId.value) || sampleMangas[0]
})

const currentChapter = computed(() => {
  if (!manga.value) return null
  return manga.value.chapters.find(c => c.id === chapterId.value || c.number.toString() === chapterId.value) || manga.value.chapters[0]
})

// Dynamic title for SEO and browser tab
useHead(() => ({
  title: currentChapter.value && manga.value 
    ? `${manga.value.title} - Chapter ${currentChapter.value.number} | RomanceToon`
    : 'Read Chapter | RomanceToon'
}))
</script>
