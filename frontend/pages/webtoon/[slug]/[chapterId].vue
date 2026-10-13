<template>
  <div v-if="manga && currentChapter">
    <WebtoonReader 
      :manga="manga" 
      :currentChapter="currentChapter" 
    />
  </div>
  <div v-else-if="isLoading" class="min-h-screen flex items-center justify-center bg-night-950">
    <div class="text-center space-y-3">
      <div class="w-10 h-10 border-4 border-romance-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-romance-300 text-xs font-mono">Loading chapter from Cloudflare R2...</p>
    </div>
  </div>
  <div v-else class="min-h-screen flex items-center justify-center text-center p-6 bg-night-950">
    <div class="max-w-md p-8 rounded-3xl glass-panel space-y-4 border border-night-800">
      <h3 class="font-serif text-lg font-bold text-white">Chapter Not Found</h3>
      <p class="text-night-400 text-xs">
        Chapter "{{ chapterNumber }}" for "{{ slug }}" could not be loaded or has not been published yet.
      </p>
      <NuxtLink :to="`/webtoon/${slug}`" class="inline-block px-5 py-2.5 rounded-xl bg-romance-600 text-white text-xs font-semibold">
        Back to Webtoon Index
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRomanceApi } from '~/composables/useApi'
import { useReadingTracker } from '~/composables/useReadingTracker'

definePageMeta({
  layout: 'reader'
})

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const rawChapter = computed(() => route.params.chapterId as string)

// Extract chapter number cleanly: "chapter-1" -> "1", or raw "1"
const chapterNumber = computed(() => {
  const match = rawChapter.value.match(/(\d+)/)
  return match ? match[1] : rawChapter.value
})

const { fetchChapter } = useRomanceApi()
const { recordHistory } = useReadingTracker()

const manga = ref<any>(null)
const currentChapter = ref<any>(null)
const isLoading = ref(true)

onMounted(async () => {
  isLoading.value = true
  const data = await fetchChapter(slug.value, chapterNumber.value)
  if (data) {
    manga.value = data.manga
    currentChapter.value = data.chapter
    // Automatically record reading progress into local storage history
    recordHistory(data.manga, data.chapter)
  }
  isLoading.value = false
})

useHead(() => ({
  title: currentChapter.value && manga.value 
    ? `${manga.value.title} - Chapter ${currentChapter.value.number} | RomanceToon`
    : `Read Chapter ${chapterNumber.value} | RomanceToon`
}))
</script>
