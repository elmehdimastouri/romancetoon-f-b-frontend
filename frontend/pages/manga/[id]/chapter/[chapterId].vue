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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRomanceApi } from '~/composables/useApi'

definePageMeta({
  layout: 'reader'
})

const route = useRoute()
const mangaId = computed(() => route.params.id as string)
const chapterNumber = computed(() => route.params.chapterId as string)
const { fetchChapter } = useRomanceApi()

const manga = ref<any>(null)
const currentChapter = ref<any>(null)
const isLoading = ref(true)

onMounted(async () => {
  isLoading.value = true
  const data = await fetchChapter(mangaId.value, chapterNumber.value)
  if (data) {
    manga.value = data.manga
    currentChapter.value = data.chapter
  }
  isLoading.value = false
})

useHead(() => ({
  title: currentChapter.value && manga.value 
    ? `${manga.value.title} - Chapter ${currentChapter.value.number} | RomanceToon`
    : 'Read Chapter | RomanceToon'
}))
</script>
