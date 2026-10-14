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
        'fixed top-0 left-0 right-0 z-40 glass-nav px-3 sm:px-4 py-2.5 sm:py-3 transition-transform duration-300 flex items-center justify-between',
        showControls ? 'translate-y-0' : '-translate-y-full'
      ]"
    >
      <div class="flex items-center space-x-2 sm:space-x-3 min-w-0">
        <NuxtLink 
          :to="`/webtoon/${manga.slug || manga.id}`" 
          class="p-2 rounded-xl bg-night-850 hover:bg-night-800 text-night-300 hover:text-white transition-colors shrink-0"
          title="Back to Webtoon details"
        >
          <ArrowLeft class="w-4 h-4 sm:w-5 sm:h-5" />
        </NuxtLink>

        <div class="min-w-0">
          <NuxtLink :to="`/webtoon/${manga.slug || manga.id}`" class="text-[11px] sm:text-xs text-night-400 hover:text-romance-400 truncate max-w-[130px] sm:max-w-md block">
            {{ manga.title }}
          </NuxtLink>
          <div class="text-xs sm:text-base font-semibold text-white truncate max-w-[150px] sm:max-w-md" :title="`Read ${manga.title} Chapter ${currentChapter.number} Online`">
            Read {{ manga.title }} Chapter {{ currentChapter.number }} Online
          </div>
        </div>
      </div>

      <!-- Center / Right Top Controls -->
      <div class="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
        <!-- Width toggle dropdown/buttons (Desktop only) -->
        <div class="hidden md:flex items-center bg-night-900 rounded-xl p-1 border border-night-800 text-xs">
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

        <!-- Fullscreen toggle button (sm+ only) -->
        <button 
          @click="toggleFullscreen"
          class="hidden sm:inline-flex p-2 rounded-xl bg-night-850 hover:bg-night-800 border border-night-800 text-night-200 hover:text-white transition-colors"
          :title="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (F)'"
        >
          <Minimize v-if="isFullscreen" class="w-4 h-4 text-night-300 hover:text-white" />
          <Maximize v-else class="w-4 h-4 text-night-300 hover:text-white" />
        </button>

        <!-- Chapter drawer toggle -->
        <button 
          @click="showChapterMenu = !showChapterMenu"
          class="p-2 rounded-xl bg-night-850 hover:bg-night-800 border border-night-800 text-night-200 hover:text-romance-400 transition-colors flex items-center space-x-1.5 text-xs font-medium"
        >
          <ListOrdered class="w-4 h-4 text-romance-400" />
          <span class="hidden md:inline">Chapters</span>
        </button>

        <!-- Bookmark toggle button -->
        <button 
          @click="toggleBookmark(manga)"
          :class="[
            'p-2 rounded-xl border transition-colors flex items-center space-x-1.5 text-xs font-medium',
            isBookmarked(manga.id || manga.slug)
              ? 'bg-romance-600/20 border-romance-500 text-romance-300'
              : 'bg-night-850 hover:bg-night-800 border-night-800 text-night-200 hover:text-romance-400'
          ]"
          :title="isBookmarked(manga.id || manga.slug) ? 'Remove from Bookmarks' : 'Save to Bookmarks'"
        >
          <Bookmark :class="['w-4 h-4', isBookmarked(manga.id || manga.slug) ? 'fill-romance-400 text-romance-400' : '']" />
          <span class="hidden md:inline">{{ isBookmarked(manga.id || manga.slug) ? 'Saved' : 'Save' }}</span>
        </button>
      </div>
    </header>

    <!-- Main Webtoon Strip (Continuous Vertical Reader) -->
    <main 
      @click="toggleControls"
      :class="['w-full transition-all duration-300 mx-auto px-0 pt-14 pb-28', readerWidth]"
    >
      <!-- Chapter Title Header (SEO H1 & Reader Banner) -->
      <div class="w-full text-center py-4 px-4 mb-4 bg-night-900/60 border border-night-800/80 rounded-2xl">
        <NuxtLink :to="`/webtoon/${manga.slug || manga.id}`" class="text-xs text-romance-400 hover:underline font-medium inline-block mb-1">
          {{ manga.title }}
        </NuxtLink>
        <h1 class="text-base sm:text-xl font-serif font-bold text-white tracking-wide">
          Read {{ manga.title }} Chapter {{ currentChapter.number }} Online
        </h1>
        <p class="text-[11px] sm:text-xs text-night-400 mt-1">
          Enjoy reading <span class="text-night-200 font-medium">{{ manga.title }}</span> Chapter {{ currentChapter.number }} in high definition with English translation on RomanceToon.
        </p>
      </div>

      <!-- Global alert when any page fails to load -->
      <div 
        v-if="failedCount > 0"
        class="sticky top-16 z-30 mx-4 my-3 p-3 rounded-2xl bg-rose-950/90 border border-rose-500/50 backdrop-blur-md flex items-center justify-between text-xs shadow-lg animate-fade-in"
      >
        <div class="flex items-center space-x-2 text-rose-200">
          <AlertCircle class="w-4 h-4 text-rose-400 shrink-0" />
          <span>{{ failedCount }} {{ failedCount === 1 ? 'page' : 'pages' }} failed to load due to connection timeout.</span>
        </div>
        <button 
          @click.stop="retryAllBrokenImages"
          class="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center space-x-1.5 shrink-0 transition-colors shadow-sm"
        >
          <RefreshCw class="w-3 h-3" />
          <span>Reload All</span>
        </button>
      </div>

      <div v-if="pages && pages.length > 0" class="flex flex-col items-center">
        <!-- Webtoon continuous pages without gaps -->
        <div 
          v-for="(page, idx) in pages" 
          :key="`${page.page}_${retryCounters[idx] || 0}`"
          class="relative w-full bg-night-900 border-none m-0 p-0 leading-none"
        >
          <!-- Broken Page Fallback Card -->
          <div 
            v-if="failedImages[idx]" 
            class="w-full min-h-[280px] sm:min-h-[360px] flex flex-col items-center justify-center p-6 bg-night-950/90 border border-night-800 text-center space-y-3.5 my-1"
          >
            <div class="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertCircle class="w-6 h-6" />
            </div>
            <div class="space-y-1">
              <h4 class="text-sm font-semibold text-white">Page {{ idx + 1 }} failed to load</h4>
              <p class="text-xs text-night-400 max-w-xs mx-auto">
                Slow connection or temporary network timeout while fetching image.
              </p>
            </div>
            <button 
              @click.stop="retryImage(idx)"
              class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-romance-600 to-rose-500 hover:from-romance-500 hover:to-rose-400 text-white text-xs font-semibold shadow-glow-pink flex items-center space-x-2 transition-all transform hover:scale-105 active:scale-95"
            >
              <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isRetrying[idx] }" />
              <span>Reload Page {{ idx + 1 }}</span>
            </button>
          </div>

          <!-- Page Image -->
          <img 
            v-else
            :src="getImageUrl(page.url, idx)" 
            :alt="`Page ${page.page}`"
            :loading="idx < 2 ? 'eager' : 'lazy'"
            decoding="async"
            @error="onImageError(idx)"
            @load="onImageLoad(idx)"
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
        <NuxtLink :to="`/webtoon/${manga.slug || manga.id}`" class="px-5 py-2.5 rounded-xl bg-romance-600 text-white font-medium text-xs">
          Return to Webtoon Details
        </NuxtLink>
      </div>

      <!-- End of chapter section -->
      <div class="mt-8 sm:mt-12 p-5 sm:p-10 rounded-2xl bg-night-900 border border-night-800 text-center space-y-4 sm:space-y-5 mx-3 sm:mx-4" @click.stop>
        <Heart class="w-7 h-7 sm:w-8 sm:h-8 text-romance-400 fill-romance-500/20 mx-auto animate-pulse" />
        <h3 class="text-base sm:text-lg font-serif font-bold text-white">You've reached the end of Chapter {{ currentChapter.number }}</h3>
        <p class="text-xs text-night-400 max-w-md mx-auto">
          Loved this chapter? Support RomanceToon by leaving a bookmark or reading the next installment!
        </p>

        <!-- Keyboard navigation tip (Desktop only) -->
        <div class="hidden sm:inline-flex items-center space-x-2 text-[11px] text-night-400 bg-night-950/60 px-3 py-1 rounded-lg border border-night-800">
          <span>Keyboard shortcut: Press</span>
          <kbd class="px-1.5 py-0.5 rounded bg-night-800 border border-night-700 font-mono text-[10px] text-romance-300">←</kbd>
          <span>for Previous or</span>
          <kbd class="px-1.5 py-0.5 rounded bg-night-800 border border-night-700 font-mono text-[10px] text-romance-300">→</kbd>
          <span>for Next Chapter</span>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2">
          <NuxtLink 
            v-if="prevChapter" 
            :to="`/webtoon/${manga.slug || manga.id}/chapter-${prevChapter.number}`"
            class="px-4 sm:px-5 py-2.5 rounded-xl bg-night-850 hover:bg-night-800 border border-night-700 text-night-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <ChevronLeft class="w-4 h-4" />
            <span>Prev Chapter</span>
          </NuxtLink>

          <NuxtLink 
            v-if="nextChapter" 
            :to="`/webtoon/${manga.slug || manga.id}/chapter-${nextChapter.number}`"
            class="px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-romance-600 to-rose-500 hover:from-romance-500 hover:to-rose-400 text-white text-xs font-semibold shadow-glow-pink flex items-center space-x-1.5 transition-all"
          >
            <span>Next Chapter</span>
            <ChevronRight class="w-4 h-4" />
          </NuxtLink>

          <NuxtLink 
            v-else
            :to="`/webtoon/${manga.slug || manga.id}`"
            class="px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-romance-600 to-rose-500 hover:from-romance-500 hover:to-rose-400 text-white text-xs font-semibold shadow-glow-pink flex items-center space-x-1.5 transition-all"
          >
            <BookOpen class="w-4 h-4" />
            <span>Webtoon Details</span>
          </NuxtLink>
        </div>
      </div>

      <!-- You May Also Like Section (اسفل قارء الفصل) -->
      <div class="mt-8 sm:mt-12 mx-3 sm:mx-4" @click.stop>
        <RecommendedManga 
          :currentManga="manga" 
          :limit="4"
          gridCols="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
        />
      </div>
    </main>

    <!-- Floating Bottom Navigation Bar -->
    <footer 
      :class="[
        'fixed bottom-0 left-0 right-0 z-40 glass-nav px-3 sm:px-4 py-2.5 sm:py-3 transition-transform duration-300 flex items-center justify-between',
        showControls ? 'translate-y-0' : 'translate-y-full'
      ]"
    >
      <!-- Prev Chapter Button -->
      <NuxtLink 
        v-if="prevChapter"
        :to="`/webtoon/${manga.slug || manga.id}/chapter-${prevChapter.number}`"
        class="px-3 sm:px-4 py-2 rounded-xl bg-night-850 hover:bg-night-800 border border-night-800 text-night-200 hover:text-white text-xs font-medium flex items-center space-x-1.5 transition-colors"
        title="Previous Chapter"
      >
        <ChevronLeft class="w-4 h-4" />
        <span class="hidden sm:inline">Ch. {{ prevChapter.number }}</span>
      </NuxtLink>
      <div v-else class="w-10 sm:w-20"></div>

      <!-- Quick chapter selector button -->
      <div class="flex items-center space-x-2 sm:space-x-3">
        <button 
          @click="showChapterMenu = !showChapterMenu"
          class="px-3 sm:px-4 py-2 rounded-xl bg-night-900 border border-night-800 text-white font-medium text-xs hover:border-romance-500/60 transition-colors flex items-center space-x-1.5 sm:space-x-2"
        >
          <span>Chapter {{ currentChapter.number }}</span>
          <ChevronUp class="w-3.5 h-3.5 text-romance-400" />
        </button>

        <span class="text-xs text-night-400 font-mono hidden sm:inline">
          {{ Math.round(scrollProgress) }}%
        </span>

        <!-- Keyboard arrows indicator pill (Desktop only) -->
        <span class="hidden lg:inline text-[10px] text-night-500 font-mono">
          [← / → keys]
        </span>
      </div>

      <!-- Next Chapter Button -->
      <NuxtLink 
        v-if="nextChapter"
        :to="`/webtoon/${manga.slug || manga.id}/chapter-${nextChapter.number}`"
        class="px-3 sm:px-4 py-2 rounded-xl bg-romance-600 hover:bg-romance-500 text-white text-xs font-medium shadow-glow-pink flex items-center space-x-1.5 transition-colors"
        title="Next Chapter"
      >
        <span class="hidden sm:inline">Ch. {{ nextChapter.number }}</span>
        <ChevronRight class="w-4 h-4" />
      </NuxtLink>
      <div v-else class="w-10 sm:w-20"></div>
    </footer>

    <!-- Floating Scroll To Top Button -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-6 scale-90"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-6 scale-90"
    >
      <button 
        v-if="showScrollTop"
        @click="scrollToTop"
        class="fixed bottom-20 right-4 sm:right-6 z-40 p-3 sm:p-3.5 rounded-full bg-gradient-to-tr from-romance-600 to-rose-500 text-white shadow-lg shadow-romance-500/25 hover:shadow-romance-500/40 hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20 group backdrop-blur-md"
        aria-label="Scroll to top"
        title="Scroll to top"
      >
        <ChevronUp class="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-y-0.5 transition-transform" />
      </button>
    </transition>

    <!-- Chapter Selector Bottom Sheet / Modal -->
    <div 
      v-if="showChapterMenu" 
      class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      @click.self="showChapterMenu = false"
    >
      <div class="w-full sm:max-w-md max-h-[85vh] rounded-t-3xl sm:rounded-3xl glass-panel p-5 sm:p-6 flex flex-col space-y-4 shadow-2xl border border-white/10 animate-fade-in">
        <div class="flex items-center justify-between pb-3 border-b border-night-800">
          <div>
            <h3 class="font-serif font-bold text-base sm:text-lg text-white">Select Chapter</h3>
            <p class="text-xs text-night-400 truncate max-w-[240px]">{{ manga.title }}</p>
          </div>
          <button @click="showChapterMenu = false" class="p-2 rounded-lg text-night-400 hover:text-white hover:bg-night-850">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="overflow-y-auto space-y-2 pr-1 custom-scroll">
          <NuxtLink 
            v-for="ch in mangaChapters" 
            :key="ch.number"
            :to="`/webtoon/${manga.slug || manga.id}/chapter-${ch.number}`"
            @click="showChapterMenu = false"
            :class="[
              'p-3 rounded-xl border flex items-center justify-between text-xs transition-colors',
              Number(ch.number) === Number(currentChapter.number)
                ? 'bg-romance-600/20 border-romance-500 text-white font-bold' 
                : 'bg-night-900 border-night-800 text-night-300 hover:bg-night-850 hover:text-white'
            ]"
          >
            <div class="flex items-center space-x-2">
              <span class="w-7 h-7 rounded-lg bg-night-800 flex items-center justify-center font-mono text-[11px] text-romance-300">
                {{ ch.number }}
              </span>
              <span class="truncate max-w-[200px]">{{ ch.title || `Read ${manga.title} Chapter ${ch.number} Online` }}</span>
            </div>
            <span class="text-[10px] text-night-400">{{ ch.releaseDate }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { Manga, Chapter, ChapterPage } from '~/data/mangas'
import { 
  ArrowLeft, ChevronLeft, ChevronRight, ChevronUp, 
  ListOrdered, Heart, X, BookOpen, Bookmark, AlertCircle, RefreshCw,
  Maximize, Minimize 
} from '@lucide/vue'
import { useReadingTracker } from '~/composables/useReadingTracker'
import RecommendedManga from '~/components/RecommendedManga.vue'

const props = defineProps<{
  manga: Manga
  currentChapter: Chapter
}>()

const { recordHistory, isBookmarked, toggleBookmark } = useReadingTracker()

const showControls = ref(true)
const showChapterMenu = ref(false)
const readerWidth = ref('max-w-[800px]')
const scrollProgress = ref(0)
let lastScrollY = 0

// Fullscreen state
const isFullscreen = ref(false)
const toggleFullscreen = () => {
  if (typeof document === 'undefined') return
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {})
    isFullscreen.value = true
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {})
      isFullscreen.value = false
    }
  }
}

const onFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// Broken images tracking and retry state
const failedImages = ref<Record<number, boolean>>({})
const retryCounters = ref<Record<number, number>>({})
const isRetrying = ref<Record<number, boolean>>({})

const failedCount = computed(() => {
  return Object.values(failedImages.value).filter(Boolean).length
})

// Reset retry state and scroll position whenever chapter changes
watch(() => props.currentChapter?.number, () => {
  failedImages.value = {}
  retryCounters.value = {}
  isRetrying.value = {}
  scrollProgress.value = 0
  if (process.client) {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
  if (props.manga && props.currentChapter) {
    recordHistory(props.manga, props.currentChapter)
  }
})

const getImageUrl = (url: string, idx: number) => {
  if (!url) return ''
  const retryCount = retryCounters.value[idx] || 0
  if (retryCount === 0) return url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}_retry=${retryCount}`
}

const onImageError = (idx: number) => {
  failedImages.value[idx] = true
  isRetrying.value[idx] = false
}

const onImageLoad = (idx: number) => {
  failedImages.value[idx] = false
  isRetrying.value[idx] = false
}

const retryImage = (idx: number) => {
  isRetrying.value[idx] = true
  retryCounters.value[idx] = (retryCounters.value[idx] || 0) + 1
  failedImages.value[idx] = false
}

const retryAllBrokenImages = () => {
  for (const idxStr of Object.keys(failedImages.value)) {
    const idx = parseInt(idxStr, 10)
    if (failedImages.value[idx]) {
      retryImage(idx)
    }
  }
}

// Current chapter pages
const pages = computed<ChapterPage[]>(() => {
  if (props.currentChapter?.pages && Array.isArray(props.currentChapter.pages)) {
    return props.currentChapter.pages
      .map((p: any, idx: number) => {
        const rawUrl = typeof p === 'string' ? p : p?.url
        if (!rawUrl || typeof rawUrl !== 'string') return null
        const trimmed = rawUrl.trim()
        if (!trimmed) return null
        const cleanUrl = (trimmed.startsWith('http://') || trimmed.startsWith('https://')) 
          ? trimmed 
          : `https://${trimmed.replace(/^\/+/, '')}`
        return {
          page: (typeof p === 'object' && p?.page) ? p.page : idx + 1,
          url: cleanUrl
        }
      })
      .filter((p): p is ChapterPage => Boolean(p && p.url))
  }
  return []
})

// Safe list of manga chapters sorted in correct ascending order
const mangaChapters = computed(() => {
  if (props.manga && props.manga.chapters && props.manga.chapters.length > 0) {
    return props.manga.chapters
      .filter((c: any) => c.isPublished !== false)
      .slice()
      .sort((a: any, b: any) => Number(a.number) - Number(b.number))
  }
  return [props.currentChapter]
})

// Previous & Next chapters (handling number vs string types safely)
const currentIndex = computed(() => {
  const curNum = Number(props.currentChapter.number)
  const curId = String(props.currentChapter.id || props.currentChapter.number)
  return mangaChapters.value.findIndex(c => 
    Number(c.number) === curNum || 
    String(c.id) === curId ||
    String(c.number) === curId
  )
})

const prevChapter = computed(() => {
  if (currentIndex.value > 0) {
    return mangaChapters.value[currentIndex.value - 1]
  }
  return null
})

const nextChapter = computed(() => {
  if (currentIndex.value >= 0 && currentIndex.value < mangaChapters.value.length - 1) {
    return mangaChapters.value[currentIndex.value + 1]
  }
  return null
})

const goToChapter = (chap: any) => {
  if (!chap) return
  const slug = props.manga.slug || props.manga.id
  navigateTo(`/webtoon/${slug}/chapter-${chap.number}`)
}

// Keyboard Navigation (ArrowLeft = Prev, ArrowRight = Next, F = Fullscreen, Esc = Close Drawer)
const handleKeydown = (e: KeyboardEvent) => {
  const target = e.target as HTMLElement
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
    return
  }

  if (e.key === 'ArrowRight') {
    if (nextChapter.value) {
      e.preventDefault()
      goToChapter(nextChapter.value)
    }
  } else if (e.key === 'ArrowLeft') {
    if (prevChapter.value) {
      e.preventDefault()
      goToChapter(prevChapter.value)
    }
  } else if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault()
    toggleFullscreen()
  } else if (e.key === 'Escape' && showChapterMenu.value) {
    showChapterMenu.value = false
  }
}

const showScrollTop = ref(false)

const toggleControls = () => {
  showControls.value = !showControls.value
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const handleScroll = () => {
  const currentScrollY = window.scrollY
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight
  
  if (maxScroll > 0) {
    scrollProgress.value = Math.min(100, Math.max(0, (currentScrollY / maxScroll) * 100))
  }

  // Show floating "Scroll to top" button when user scrolls down 300px
  showScrollTop.value = currentScrollY > 300

  // Auto hide controls when scrolling down fast, show when scrolling up
  if (currentScrollY > lastScrollY + 40 && currentScrollY > 100) {
    showControls.value = false
  } else if (currentScrollY < lastScrollY - 20) {
    showControls.value = true
  }

  lastScrollY = currentScrollY
}

onMounted(() => {
  if (props.manga && props.currentChapter) {
    recordHistory(props.manga, props.currentChapter)
  }
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('keydown', handleKeydown)
  document.addEventListener('fullscreenchange', onFullscreenChange)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
})
</script>
