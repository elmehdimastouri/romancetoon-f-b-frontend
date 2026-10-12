<template>
  <div class="relative min-h-screen bg-night-950 text-night-100 flex flex-col items-center select-none" ref="readerRoot">
    
    <!-- Top Reading Progress Bar -->
    <div class="fixed top-0 left-0 right-0 h-1 bg-night-900 z-50">
      <div 
        class="h-full bg-gradient-to-r from-romance-600 to-rose-400 transition-all duration-150"
        :style="{ width: `${scrollProgress}%` }"
      ></div>
    </div>

    <!-- Floating Top Bar (Controls) -->
    <header 
      :class="[
        'fixed top-0 left-0 right-0 z-40 glass-nav px-4 py-3 transition-transform duration-300 flex items-center justify-between',
        showControls ? 'translate-y-0' : '-translate-y-full'
      ]"
    >
      <div class="flex items-center space-x-3">
        <NuxtLink 
          :to="`/manga/${manga.id}`" 
          class="p-2 rounded-xl bg-night-850 hover:bg-night-800 text-night-300 hover:text-white transition-colors"
          title="Back to Manga details"
        >
          <ArrowLeft class="w-5 h-5" />
        </NuxtLink>

        <div>
          <NuxtLink :to="`/manga/${manga.id}`" class="text-xs text-night-400 hover:text-romance-400 truncate max-w-[200px] sm:max-w-md block">
            {{ manga.title }}
          </NuxtLink>
          <h2 class="text-sm sm:text-base font-semibold text-white truncate max-w-[220px] sm:max-w-md">
            {{ currentChapter.title || `Chapter ${currentChapter.number}` }}
          </h2>
        </div>
      </div>

      <!-- Center / Right Top Controls -->
      <div class="flex items-center space-x-2">
        <!-- Width toggle dropdown/buttons -->
        <div class="hidden sm:flex items-center bg-night-900 rounded-xl p-1 border border-night-800 text-xs">
          <button 
            @click="readerWidth = 'max-w-[650px]'"
            :class="['px-2.5 py-1 rounded-lg transition-colors', readerWidth === 'max-w-[650px]' ? 'bg-romance-600 text-white font-semibold' : 'text-night-400 hover:text-white']"
            title="Mobile Width (650px)"
          >
            Compact
          </button>
          <button 
            @click="readerWidth = 'max-w-[800px]'"
            :class="['px-2.5 py-1 rounded-lg transition-colors', readerWidth === 'max-w-[800px]' ? 'bg-romance-600 text-white font-semibold' : 'text-night-400 hover:text-white']"
            title="Standard Webtoon Width (800px)"
          >
            Standard
          </button>
          <button 
            @click="readerWidth = 'max-w-full'"
            :class="['px-2.5 py-1 rounded-lg transition-colors', readerWidth === 'max-w-full' ? 'bg-romance-600 text-white font-semibold' : 'text-night-400 hover:text-white']"
            title="Full Width"
          >
            Full
          </button>
        </div>

        <!-- Chapter drawer toggle -->
        <button 
          @click="showChapterMenu = !showChapterMenu"
          class="p-2 rounded-xl bg-night-850 hover:bg-night-800 border border-night-800 text-night-200 hover:text-romance-400 transition-colors flex items-center space-x-1.5 text-xs font-medium"
        >
          <ListOrdered class="w-4 h-4 text-romance-400" />
          <span class="hidden md:inline">Chapters</span>
        </button>
      </div>
    </header>

    <!-- Main Webtoon Strip (Continuous Vertical Reader) -->
    <main 
      @click="toggleControls"
      :class="['w-full transition-all duration-300 mx-auto px-0 pt-14 pb-28', readerWidth]"
    >
      <div v-if="pages && pages.length > 0" class="flex flex-col items-center">
        <!-- Webtoon continuous pages without gaps -->
        <div 
          v-for="(page, idx) in pages" 
          :key="page.page"
          class="relative w-full bg-night-900 border-none m-0 p-0 leading-none"
        >
          <img 
            :src="page.url" 
            :alt="`Page ${page.page}`"
            loading="lazy"
            decoding="async"
            class="webtoon-page w-full h-auto block select-none pointer-events-none"
          />

          <!-- Page counter watermark in corner -->
          <div class="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] text-white/70 pointer-events-none font-mono">
            {{ idx + 1 }} / {{ pages.length }}
          </div>
        </div>
      </div>

      <!-- Fallback / Empty state -->
      <div v-else class="min-h-[500px] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <BookOpen class="w-12 h-12 text-romance-400/50 animate-bounce" />
        <p class="text-night-300 text-base">This chapter's pages are being processed or synced.</p>
        <NuxtLink :to="`/manga/${manga.id}`" class="px-5 py-2.5 rounded-xl bg-romance-600 text-white font-medium text-xs">
          Return to Manga Page
        </NuxtLink>
      </div>

      <!-- End of chapter section -->
      <div class="mt-12 p-6 sm:p-10 rounded-2xl bg-night-900 border border-night-800 text-center space-y-5 mx-4">
        <Heart class="w-8 h-8 text-romance-400 fill-romance-500/20 mx-auto animate-pulse" />
        <h3 class="text-lg font-serif font-bold text-white">You've reached the end of Chapter {{ currentChapter.number }}</h3>
        <p class="text-xs text-night-400 max-w-md mx-auto">
          Loved this chapter? Support RomanceToon by leaving a bookmark or reading the next installment!
        </p>

        <div class="flex items-center justify-center gap-3 pt-2">
          <NuxtLink 
            v-if="prevChapter" 
            :to="`/manga/${manga.id}/chapter/${prevChapter.id}`"
            class="px-5 py-2.5 rounded-xl bg-night-850 hover:bg-night-800 border border-night-700 text-night-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <ChevronLeft class="w-4 h-4" />
            <span>Prev Chapter</span>
          </NuxtLink>

          <NuxtLink 
            v-if="nextChapter" 
            :to="`/manga/${manga.id}/chapter/${nextChapter.id}`"
            class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-romance-600 to-rose-500 hover:from-romance-500 hover:to-rose-400 text-white text-xs font-semibold shadow-glow-pink flex items-center space-x-1.5 transition-all"
          >
            <span>Next Chapter</span>
            <ChevronRight class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>
    </main>

    <!-- Floating Bottom Navigation Bar -->
    <footer 
      :class="[
        'fixed bottom-0 left-0 right-0 z-40 glass-nav px-4 py-3 transition-transform duration-300 flex items-center justify-between',
        showControls ? 'translate-y-0' : 'translate-y-full'
      ]"
    >
      <!-- Prev Chapter Button -->
      <NuxtLink 
        v-if="prevChapter"
        :to="`/manga/${manga.id}/chapter/${prevChapter.id}`"
        class="px-4 py-2 rounded-xl bg-night-850 hover:bg-night-800 border border-night-800 text-night-200 hover:text-white text-xs font-medium flex items-center space-x-1.5 transition-colors"
      >
        <ChevronLeft class="w-4 h-4" />
        <span class="hidden sm:inline">Ch. {{ prevChapter.number }}</span>
      </NuxtLink>
      <div v-else class="w-20"></div>

      <!-- Quick chapter selector button -->
      <div class="flex items-center space-x-2">
        <button 
          @click="showChapterMenu = !showChapterMenu"
          class="px-4 py-2 rounded-xl bg-night-900 border border-night-800 text-white font-medium text-xs hover:border-romance-500/60 transition-colors flex items-center space-x-2"
        >
          <span>Chapter {{ currentChapter.number }}</span>
          <ChevronUp class="w-3.5 h-3.5 text-romance-400" />
        </button>

        <span class="text-xs text-night-400 font-mono hidden sm:inline">
          {{ Math.round(scrollProgress) }}%
        </span>
      </div>

      <!-- Next Chapter Button -->
      <NuxtLink 
        v-if="nextChapter"
        :to="`/manga/${manga.id}/chapter/${nextChapter.id}`"
        class="px-4 py-2 rounded-xl bg-romance-600 hover:bg-romance-500 text-white text-xs font-medium shadow-glow-pink flex items-center space-x-1.5 transition-colors"
      >
        <span class="hidden sm:inline">Ch. {{ nextChapter.number }}</span>
        <ChevronRight class="w-4 h-4" />
      </NuxtLink>
      <div v-else class="w-20"></div>
    </footer>

    <!-- Chapter Selector Modal / Drawer -->
    <div 
      v-if="showChapterMenu" 
      class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="showChapterMenu = false"
    >
      <div class="w-full max-w-md max-h-[80vh] rounded-3xl glass-panel p-6 flex flex-col space-y-4 shadow-2xl border border-white/10">
        <div class="flex items-center justify-between pb-3 border-b border-night-800">
          <div>
            <h3 class="font-serif font-bold text-lg text-white">Select Chapter</h3>
            <p class="text-xs text-night-400">{{ manga.title }}</p>
          </div>
          <button @click="showChapterMenu = false" class="p-2 rounded-lg text-night-400 hover:text-white hover:bg-night-850">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="overflow-y-auto space-y-2 pr-1 custom-scroll">
          <NuxtLink 
            v-for="ch in manga.chapters" 
            :key="ch.id"
            :to="`/manga/${manga.id}/chapter/${ch.id}`"
            @click="showChapterMenu = false"
            :class="[
              'p-3 rounded-xl border flex items-center justify-between text-xs transition-colors',
              ch.id === currentChapter.id 
                ? 'bg-romance-600/20 border-romance-500 text-white font-bold' 
                : 'bg-night-900 border-night-800 text-night-300 hover:bg-night-850 hover:text-white'
            ]"
          >
            <div class="flex items-center space-x-2">
              <span class="w-7 h-7 rounded-lg bg-night-800 flex items-center justify-center font-mono text-[11px] text-romance-300">
                {{ ch.number }}
              </span>
              <span class="truncate max-w-[200px]">{{ ch.title || `Chapter ${ch.number}` }}</span>
            </div>
            <span class="text-[10px] text-night-400">{{ ch.releaseDate }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Manga, Chapter, ChapterPage } from '~/data/mangas'
import { 
  ArrowLeft, ChevronLeft, ChevronRight, ChevronUp, 
  ListOrdered, Heart, X, BookOpen 
} from '@lucide/vue'

const props = defineProps<{
  manga: Manga
  currentChapter: Chapter
}>()

const showControls = ref(true)
const showChapterMenu = ref(false)
const readerWidth = ref('max-w-[800px]')
const scrollProgress = ref(0)
let lastScrollY = 0

// Current chapter pages
const pages = computed<ChapterPage[]>(() => {
  if (props.currentChapter.pages && props.currentChapter.pages.length > 0) {
    return props.currentChapter.pages
  }
  // Generate sample pages if not explicitly populated
  return [
    { page: 1, url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=85' },
    { page: 2, url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=900&q=85' },
    { page: 3, url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=85' },
    { page: 4, url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=85' }
  ]
})

// Previous & Next chapters
const currentIndex = computed(() => {
  return props.manga.chapters.findIndex(c => c.id === props.currentChapter.id)
})

const prevChapter = computed(() => {
  if (currentIndex.value > 0) {
    return props.manga.chapters[currentIndex.value - 1]
  }
  return null
})

const nextChapter = computed(() => {
  if (currentIndex.value < props.manga.chapters.length - 1) {
    return props.manga.chapters[currentIndex.value + 1]
  }
  return null
})

const toggleControls = () => {
  showControls.value = !showControls.value
}

const handleScroll = () => {
  const currentScrollY = window.scrollY
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight
  
  if (maxScroll > 0) {
    scrollProgress.value = Math.min(100, Math.max(0, (currentScrollY / maxScroll) * 100))
  }

  // Auto hide controls when scrolling down fast, show when scrolling up
  if (currentScrollY > lastScrollY + 40 && currentScrollY > 100) {
    showControls.value = false
  } else if (currentScrollY < lastScrollY - 20) {
    showControls.value = true
  }

  lastScrollY = currentScrollY
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
