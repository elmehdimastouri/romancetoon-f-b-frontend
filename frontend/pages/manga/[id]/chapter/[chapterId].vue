<template>
  <div v-if="manga && currentChapter">
    <WebtoonReader 
      :manga="manga" 
      :currentChapter="currentChapter" 
    />
  </div>
  <div v-else-if="isLoading" class="min-h-screen flex items-center justify-center bg-night-950">
    <div class="text-romance-400 animate-pulse text-sm font-medium">Loading chapter pages...</div>
  </div>
  <div v-else class="min-h-screen flex items-center justify-center text-center p-6 bg-night-950">
    <div class="space-y-4">
      <p class="text-night-400">Chapter not found or not published yet</p>
      <NuxtLink to="/" class="px-5 py-2.5 rounded-xl bg-romance-600 text-white text-xs font-semibold">
        Return to RomanceToon Home
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRomanceApi } from '~/composables/useApi'
import { useReadingTracker } from '~/composables/useReadingTracker'

definePageMeta({
  layout: 'reader'
})

const route = useRoute()

const mangaId = computed(() => {
  const m = route.params.id
  return (Array.isArray(m) ? m[0] : m) || ''
})

const rawChapter = computed(() => {
  const c = route.params.chapterId
  return (Array.isArray(c) ? c[0] : c) || ''
})

const chapterNumber = computed(() => {
  const str = rawChapter.value
  if (!str) return ''
  const match = str.match(/(\d+(?:\.\d+)?)/)
  return match ? match[1] : str
})

const { fetchChapter, recordView } = useRomanceApi()
const { recordHistory } = useReadingTracker()

const manga = ref<any>(null)
const currentChapter = ref<any>(null)
const isLoading = ref(true)

const loadChapter = async () => {
  if (!mangaId.value || !chapterNumber.value) {
    isLoading.value = false
    return
  }
  isLoading.value = true
  try {
    const data = await fetchChapter(mangaId.value, chapterNumber.value)
    if (data && data.chapter) {
      manga.value = data.manga
      currentChapter.value = data.chapter
      recordHistory(data.manga, data.chapter)
      recordView(data.manga.id, data.chapter.number)
      if (process.client) {
        window.scrollTo({ top: 0, behavior: 'instant' })
      }
    } else {
      manga.value = null
      currentChapter.value = null
    }
  } catch (err) {
    console.error('Error loading chapter:', err)
    manga.value = null
    currentChapter.value = null
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadChapter()
})

watch(() => [route.params.id, route.params.chapterId], () => {
  loadChapter()
})

useHead(() => ({
  title: currentChapter.value && manga.value 
    ? `${manga.value.title} - Chapter ${currentChapter.value.number} | RomanceToon`
    : 'Read Chapter | RomanceToon',
  meta: [
    { name: 'robots', content: 'noindex, follow' }
  ],
  link: (manga.value && currentChapter.value) ? [
    { rel: 'canonical', href: `https://romancetoon.com/webtoon/${manga.value.slug || manga.value.id}/chapter-${currentChapter.value.number}` }
  ] : []
}))
</script>
