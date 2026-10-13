<template>
  <div 
    v-if="currentManga"
    class="relative overflow-hidden rounded-3xl bg-night-950 border border-night-800/80 shadow-2xl group mb-10 transition-all duration-500 hover:border-romance-500/40"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Background Backdrop with Dynamic Atmosphere & Romantic Gradients -->
    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <transition name="fade" mode="out-in">
        <img 
          :key="currentManga.id"
          :src="currentManga.banner || currentManga.cover" 
          :alt="currentManga.title"
          class="w-full h-full object-cover object-center filter blur-[5px] brightness-[0.35] scale-105 transition-transform duration-1000 transform group-hover:scale-100"
        />
      </transition>

      <!-- Eye-Comfort Layered Gradients for Contrast & Atmosphere -->
      <div class="absolute inset-0 bg-gradient-to-r from-night-950 via-night-950/85 to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-night-950 via-transparent to-night-950/40"></div>
      <div class="absolute inset-0 bg-gradient-to-tr from-romance-950/30 via-transparent to-rose-950/20 mix-blend-color-dodge"></div>
    </div>

    <!-- Main Content Container -->
    <div class="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 min-h-[460px]">
      
      <!-- Left Column: Series Info & Action Buttons -->
      <div class="w-full lg:max-w-2xl space-y-4 text-center lg:text-left">
        
        <!-- Header Pill & Badges -->
        <div class="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r from-romance-600/30 to-rose-500/20 border border-romance-500/40 text-romance-300 text-xs font-semibold backdrop-blur-md shadow-sm">
            <Sparkles class="w-3.5 h-3.5 text-romance-400 animate-pulse" />
            <span>Spotlight Romance of the Week</span>
          </div>

          <span 
            v-if="currentManga.badge"
            :class="[
              'px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase backdrop-blur-md border shadow-sm',
              currentManga.badge === 'HOT' ? 'bg-rose-600/30 border-rose-500/50 text-rose-300' :
              currentManga.badge === 'TRENDING' ? 'bg-amber-600/30 border-amber-500/50 text-amber-300' :
              'bg-violet-600/30 border-violet-500/50 text-violet-300'
            ]"
          >
            {{ currentManga.badge }}
          </span>

          <span 
            v-if="currentManga.status"
            class="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
          >
            {{ currentManga.status }}
          </span>
        </div>

        <!-- Title -->
        <div class="space-y-1">
          <NuxtLink :to="`/webtoon/${currentManga.slug || currentManga.id}`" class="inline-block group-hover:text-romance-300 transition-colors">
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-white leading-[1.15] drop-shadow-md">
              {{ currentManga.title }}
            </h1>
          </NuxtLink>

          <p v-if="currentManga.alternativeTitles && currentManga.alternativeTitles.length" class="text-xs text-night-400 italic line-clamp-1">
            Also known as: {{ currentManga.alternativeTitles.join(' • ') }}
          </p>
        </div>

        <!-- Live Metrics & Genre Tags -->
        <div class="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs">
          <!-- Star Rating -->
          <div class="flex items-center space-x-1 text-amber-400 font-bold bg-night-900/90 px-3 py-1 rounded-xl border border-night-800 shadow-sm">
            <Star class="w-3.5 h-3.5 fill-amber-400" />
            <span>{{ Number(currentManga.rating || 5.0).toFixed(1) }}</span>
            <span class="text-night-400 font-normal text-[11px]">({{ currentManga.ratingCount || '1' }})</span>
          </div>

          <!-- Total Views -->
          <div class="flex items-center space-x-1 text-night-300 font-medium bg-night-900/90 px-3 py-1 rounded-xl border border-night-800 shadow-sm">
            <Eye class="w-3.5 h-3.5 text-romance-400" />
            <span>{{ formatViews(currentManga.views) }} views</span>
          </div>

          <!-- Public Bookmarks -->
          <div class="flex items-center space-x-1 text-night-300 font-medium bg-night-900/90 px-3 py-1 rounded-xl border border-night-800 shadow-sm">
            <Bookmark class="w-3.5 h-3.5 text-romance-400 fill-romance-400/30" />
            <span>{{ formatViews(currentManga.bookmarks) }} saves</span>
          </div>

          <!-- Genre Tags -->
          <span 
            v-for="genre in (currentManga.genres || []).slice(0, 3)" 
            :key="genre"
            class="px-2.5 py-1 rounded-xl bg-night-900/80 border border-night-800 text-night-300 hover:border-romance-500/40 transition-colors"
          >
            {{ genre }}
          </span>
        </div>

        <!-- Synopsis Excerpt -->
        <p class="text-night-300 text-sm sm:text-base line-clamp-3 leading-relaxed max-w-xl mx-auto lg:mx-0">
          {{ currentManga.synopsis }}
        </p>

        <!-- Call-to-Action Buttons -->
        <div class="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-3">
          <!-- Read / Continue Button -->
          <NuxtLink 
            :to="readTargetUrl"
            class="px-6 py-3 rounded-xl bg-gradient-to-r from-romance-600 to-rose-500 hover:from-romance-500 hover:to-rose-400 text-white font-bold text-xs sm:text-sm shadow-glow-pink flex items-center space-x-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <BookOpen class="w-4 h-4" />
            <span>{{ userHistory ? `Continue (Ch. ${userHistory.chapterNumber})` : 'Start Reading (Ch. 1)' }}</span>
          </NuxtLink>

          <!-- Quick Bookmark Button -->
          <button 
            @click="toggleBookmark(currentManga)"
            :class="[
              'px-4 py-3 rounded-xl border font-semibold text-xs sm:text-sm flex items-center space-x-2 transition-all',
              isBookmarked(currentManga.id || currentManga.slug)
                ? 'bg-romance-600/25 border-romance-500 text-romance-300 shadow-sm'
                : 'bg-night-900/90 hover:bg-night-850 border-night-800 text-night-200 hover:text-white'
            ]"
            :title="isBookmarked(currentManga.id || currentManga.slug) ? 'Remove from Bookmarks' : 'Save to Bookmarks'"
          >
            <Bookmark :class="['w-4 h-4', isBookmarked(currentManga.id || currentManga.slug) ? 'fill-romance-400 text-romance-400' : 'text-night-400']" />
            <span>{{ isBookmarked(currentManga.id || currentManga.slug) ? 'In Bookmarks' : 'Bookmark' }}</span>
          </button>

          <!-- View Details Button -->
          <NuxtLink 
            :to="`/webtoon/${currentManga.slug || currentManga.id}`"
            class="px-4 py-3 rounded-xl bg-night-900/90 hover:bg-night-850 text-night-200 hover:text-white border border-night-800 font-medium text-xs sm:text-sm flex items-center space-x-2 transition-colors"
          >
            <Info class="w-4 h-4 text-romance-400" />
            <span>Details</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Right Column: 3D Floating Portrait Poster Cover -->
      <div class="relative shrink-0">
        <NuxtLink :to="`/webtoon/${currentManga.slug || currentManga.id}`" class="block group/cover relative">
          <!-- Ambient Glow behind the cover card -->
          <div class="absolute -inset-2 bg-gradient-to-tr from-romance-600/40 via-rose-500/20 to-purple-600/30 rounded-3xl blur-xl opacity-75 group-hover/cover:opacity-100 transition-opacity duration-500"></div>

          <!-- Cover Image Frame with 3D feel -->
          <div class="relative w-48 sm:w-56 md:w-64 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl bg-night-900 transform transition-transform duration-500 group-hover/cover:scale-[1.03] group-hover/cover:-rotate-1">
            <img 
              :src="currentManga.cover" 
              :alt="currentManga.title" 
              class="w-full h-full object-cover object-center"
            />
            
            <!-- Shading overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-night-950 via-transparent to-transparent opacity-60"></div>

            <!-- Chapter pill on bottom of cover -->
            <div class="absolute bottom-3 inset-x-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-night-950/85 backdrop-blur-md border border-white/10 text-xs text-white">
              <span class="font-medium text-[11px] text-romance-300">
                {{ latestChapterText }}
              </span>
              <Play class="w-3 h-3 text-romance-400 fill-romance-400" />
            </div>
          </div>
        </NuxtLink>
      </div>

    </div>

    <!-- Carousel Footer Navigation (Visible when more than 1 featured title) -->
    <div 
      v-if="slides.length > 1" 
      class="relative z-20 px-6 sm:px-10 pb-6 flex items-center justify-between border-t border-white/5 pt-4 bg-night-950/40 backdrop-blur-sm"
    >
      <!-- Indicator Dots -->
      <div class="flex items-center space-x-2">
        <button
          v-for="(slide, idx) in slides"
          :key="slide.id || idx"
          @click="goToSlide(idx)"
          class="transition-all duration-300 h-2 rounded-full focus:outline-none"
          :class="currentIndex === idx ? 'w-8 bg-gradient-to-r from-romance-500 to-rose-400' : 'w-2 bg-night-700 hover:bg-night-600'"
          :title="slide.title"
        ></button>
      </div>

      <!-- Slide Counter & Arrow Controls -->
      <div class="flex items-center space-x-3">
        <span class="text-xs font-mono text-night-400 font-semibold tracking-wider">
          <span class="text-white">{{ (currentIndex + 1).toString().padStart(2, '0') }}</span>
          <span class="text-night-600"> / </span>
          <span>{{ slides.length.toString().padStart(2, '0') }}</span>
        </span>

        <div class="flex items-center space-x-1.5">
          <button 
            @click="prevSlide" 
            class="p-2 rounded-xl bg-night-900/90 hover:bg-night-850 text-night-300 hover:text-white border border-night-800 transition-colors focus:outline-none"
            title="Previous Spotlight Webtoon"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button 
            @click="nextSlide" 
            class="p-2 rounded-xl bg-night-900/90 hover:bg-night-850 text-night-300 hover:text-white border border-night-800 transition-colors focus:outline-none"
            title="Next Spotlight Webtoon"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Sparkles, Star, BookOpen, Info, Bookmark, ChevronLeft, ChevronRight, Play, Eye } from '@lucide/vue'
import { useReadingTracker } from '~/composables/useReadingTracker'
import { formatViews } from '~/utils/formatters'

const props = withDefaults(defineProps<{
  featured?: any
  items?: any[]
}>(), {
  items: () => []
})

const { isBookmarked, toggleBookmark, getHistoryForManga } = useReadingTracker()

const currentIndex = ref(0)
const isHovered = ref(false)
let autoplayInterval: any = null

const slides = computed(() => {
  if (props.items && props.items.length > 0) {
    return props.items
  }
  return props.featured ? [props.featured] : []
})

const currentManga = computed(() => {
  if (slides.value.length === 0) return null
  return slides.value[currentIndex.value] || slides.value[0]
})

const userHistory = computed(() => {
  if (!currentManga.value) return null
  return getHistoryForManga(currentManga.value.id) || getHistoryForManga(currentManga.value.slug)
})

const readTargetUrl = computed(() => {
  if (!currentManga.value) return '/'
  const slug = currentManga.value.slug || currentManga.value.id
  if (userHistory.value) {
    return `/webtoon/${slug}/chapter-${userHistory.value.chapterNumber}`
  }
  return `/webtoon/${slug}/chapter-1`
})

const latestChapterText = computed(() => {
  if (!currentManga.value || !currentManga.value.chapters || currentManga.value.chapters.length === 0) {
    return 'Chapter 1'
  }
  const last = currentManga.value.chapters[currentManga.value.chapters.length - 1]
  return `Chapter ${last.number || last.id || 1}`
})

const nextSlide = () => {
  if (slides.value.length <= 1) return
  currentIndex.value = (currentIndex.value + 1) % slides.value.length
}

const prevSlide = () => {
  if (slides.value.length <= 1) return
  currentIndex.value = (currentIndex.value - 1 + slides.value.length) % slides.value.length
}

const goToSlide = (index: number) => {
  currentIndex.value = index
}

onMounted(() => {
  autoplayInterval = setInterval(() => {
    if (!isHovered.value && slides.value.length > 1) {
      nextSlide()
    }
  }, 6500)
})

onUnmounted(() => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
