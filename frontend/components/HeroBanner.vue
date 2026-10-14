<template>
  <div 
    v-if="currentManga"
    class="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-night-950 border border-night-800/80 shadow-2xl group mb-6 sm:mb-10 transition-all duration-500 hover:border-romance-500/30"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Background Backdrop with Soft Gradients for Eye-Comfort -->
    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <transition name="fade" mode="out-in">
        <img 
          :key="currentManga.id"
          :src="currentManga.banner || currentManga.cover" 
          :alt="currentManga.title" 
          class="w-full h-full object-cover object-center filter blur-[12px] brightness-[0.22] scale-105 transition-transform duration-1000 transform group-hover:scale-100"
        />
      </transition>

      <!-- Eye-Comfort Dark Layered Gradients -->
      <div class="absolute inset-0 bg-gradient-to-r from-night-950 via-night-950/90 to-night-950/40"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-night-950 via-transparent to-night-950/50"></div>
    </div>

    <!-- Mobile Layout (lg:hidden): Compact, Side-by-Side, Eye-Comfort -->
    <div class="relative z-10 p-3.5 sm:p-5 lg:hidden space-y-3">
      <!-- Top Row: Cover on Left + Essential Info on Right -->
      <div class="flex items-start gap-3 sm:gap-4">
        <!-- Thumbnail Cover -->
        <NuxtLink 
          :to="`/webtoon/${currentManga.slug || currentManga.id}`" 
          class="shrink-0 w-24 sm:w-28 aspect-[3/4] rounded-xl overflow-hidden border border-white/10 shadow-lg bg-night-900 relative group/mcover"
        >
          <img 
            :src="currentManga.cover" 
            :alt="currentManga.title" 
            class="w-full h-full object-cover object-center"
          />
        </NuxtLink>

        <!-- Right Text Info (Left-aligned, comfortable reading flow) -->
        <div class="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
          <div>
            <!-- Main Title -->
            <NuxtLink :to="`/webtoon/${currentManga.slug || currentManga.id}`" class="block">
              <h1 class="text-base sm:text-lg font-serif font-bold text-white leading-snug line-clamp-2 hover:text-romance-300 transition-colors">
                {{ currentManga.title }}
              </h1>
            </NuxtLink>

            <!-- Rating & Top Genres Badge Row -->
            <div class="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px]">
              <!-- Star Rating -->
              <div class="flex items-center space-x-1 text-amber-400 font-bold bg-night-900/90 px-2 py-0.5 rounded-lg border border-white/10">
                <Star class="w-3 h-3 fill-amber-400" />
                <span>{{ Number(currentManga.rating || 5.0).toFixed(1) }}</span>
              </div>

              <!-- Top 2 Genres -->
              <NuxtLink 
                v-for="genre in (currentManga.genres || []).slice(0, 2)" 
                :key="genre"
                :to="`/genres/${slugifyGenre(genre)}/`"
                class="px-2 py-0.5 rounded-lg bg-night-900/70 border border-white/10 text-night-300 hover:text-white transition-colors"
              >
                {{ genre }}
              </NuxtLink>
            </div>
          </div>

          <!-- Synopsis: 2 lines max, soft night-300 text -->
          <p class="text-xs text-night-300/90 leading-relaxed line-clamp-2 font-normal mt-1.5">
            {{ currentManga.synopsis }}
          </p>
        </div>
      </div>

      <!-- Action Buttons Row (1 Row, Perfectly balanced) -->
      <div class="flex items-center gap-2 pt-0.5">
        <!-- Continue / Start Reading Button -->
        <NuxtLink 
          :to="readTargetUrl"
          class="flex-1 py-2 sm:py-2.5 px-3 rounded-xl bg-gradient-to-r from-romance-600 to-rose-500 hover:from-romance-500 hover:to-rose-400 text-white font-bold text-xs shadow-glow-pink flex items-center justify-center space-x-1.5 transition-all active:scale-[0.98]"
        >
          <BookOpen class="w-3.5 h-3.5 shrink-0" />
          <span class="truncate">{{ userHistory ? `Continue (Ch. ${userHistory.chapterNumber})` : 'Start Reading' }}</span>
        </NuxtLink>

        <!-- Bookmark Button -->
        <button 
          @click="toggleBookmark(currentManga)"
          :class="[
            'px-3 py-2 sm:py-2.5 rounded-xl border font-semibold text-xs flex items-center space-x-1 transition-all shrink-0',
            isBookmarked(currentManga.id || currentManga.slug)
              ? 'bg-romance-600/25 border-romance-500 text-romance-300'
              : 'bg-night-900/80 hover:bg-night-850 border-white/10 text-night-200 hover:text-white'
          ]"
          :title="isBookmarked(currentManga.id || currentManga.slug) ? 'Remove Bookmark' : 'Bookmark'"
        >
          <Bookmark :class="['w-3.5 h-3.5', isBookmarked(currentManga.id || currentManga.slug) ? 'fill-romance-400 text-romance-400' : 'text-night-400']" />
          <span>{{ isBookmarked(currentManga.id || currentManga.slug) ? 'Saved' : 'Save' }}</span>
        </button>

        <!-- Details Button -->
        <NuxtLink 
          :to="`/webtoon/${currentManga.slug || currentManga.id}`"
          class="px-3 py-2 sm:py-2.5 rounded-xl bg-night-900/80 hover:bg-night-850 text-night-200 hover:text-white border border-white/10 font-medium text-xs flex items-center space-x-1 transition-colors shrink-0"
          title="Details"
        >
          <Info class="w-3.5 h-3.5 text-romance-400" />
          <span>Details</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Desktop Layout (hidden lg:flex): Clean, Spacious 3D Artwork (Preserved) -->
    <div class="relative z-10 p-8 lg:p-10 hidden lg:flex flex-row items-center justify-between gap-12 min-h-[400px]">
      
      <!-- Text Column: Essential Details Only -->
      <div class="w-full max-w-2xl space-y-4 text-left order-1">
        
        <!-- 1. Main Title (الاسم الرئيسي) -->
        <NuxtLink :to="`/webtoon/${currentManga.slug || currentManga.id}`" class="inline-block group/title">
          <h1 class="text-3xl lg:text-5xl font-serif font-black text-white leading-tight drop-shadow-md group-hover/title:text-romance-300 transition-colors">
            {{ currentManga.title }}
          </h1>
        </NuxtLink>

        <!-- 2. Rating & Genres (التقييم والتصنيفات) -->
        <div class="flex flex-wrap items-center justify-start gap-2 pt-0.5 text-xs">
          <!-- Star Rating -->
          <div class="flex items-center space-x-1.5 text-amber-400 font-bold bg-night-900/80 px-2.5 py-1 rounded-xl border border-white/10 shadow-sm">
            <Star class="w-3.5 h-3.5 fill-amber-400" />
            <span>{{ Number(currentManga.rating || 5.0).toFixed(1) }}</span>
          </div>

          <!-- Genre Tags -->
          <NuxtLink 
            v-for="genre in (currentManga.genres || []).slice(0, 3)" 
            :key="genre"
            :to="`/genres/${slugifyGenre(genre)}/`"
            class="px-3 py-1 rounded-xl bg-night-900/60 hover:bg-night-850 border border-white/10 text-night-300 hover:text-white transition-colors"
          >
            {{ genre }}
          </NuxtLink>
        </div>

        <!-- 3. Synopsis (نبذة عن القصة) -->
        <p class="text-night-300 text-sm lg:text-base leading-relaxed line-clamp-3 max-w-xl mx-0 font-normal">
          {{ currentManga.synopsis }}
        </p>

        <!-- 4. Action Buttons (Continue, Bookmark, Details) -->
        <div class="flex items-center justify-start gap-3 pt-2 w-full">
          <!-- Continue / Start Reading Button -->
          <NuxtLink 
            :to="readTargetUrl"
            class="px-6 py-3 rounded-xl bg-gradient-to-r from-romance-600 to-rose-500 hover:from-romance-500 hover:to-rose-400 text-white font-bold text-sm shadow-glow-pink flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <BookOpen class="w-4 h-4 shrink-0" />
            <span>{{ userHistory ? `Continue (Ch. ${userHistory.chapterNumber})` : 'Start Reading' }}</span>
          </NuxtLink>

          <!-- Bookmark Button -->
          <button 
            @click="toggleBookmark(currentManga)"
            :class="[
              'px-4 py-3 rounded-xl border font-semibold text-sm flex items-center space-x-1.5 transition-all shrink-0',
              isBookmarked(currentManga.id || currentManga.slug)
                ? 'bg-romance-600/25 border-romance-500 text-romance-300 shadow-sm'
                : 'bg-night-900/80 hover:bg-night-850 border-white/10 text-night-200 hover:text-white'
            ]"
            :title="isBookmarked(currentManga.id || currentManga.slug) ? 'Remove from Bookmarks' : 'Save to Bookmarks'"
          >
            <Bookmark :class="['w-4 h-4', isBookmarked(currentManga.id || currentManga.slug) ? 'fill-romance-400 text-romance-400' : 'text-night-400']" />
            <span>{{ isBookmarked(currentManga.id || currentManga.slug) ? 'Bookmarked' : 'Bookmark' }}</span>
          </button>

          <!-- Details Button -->
          <NuxtLink 
            :to="`/webtoon/${currentManga.slug || currentManga.id}`"
            class="px-4 py-3 rounded-xl bg-night-900/80 hover:bg-night-850 text-night-200 hover:text-white border border-white/10 font-medium text-sm flex items-center space-x-1.5 transition-colors shrink-0"
            title="View Details"
          >
            <Info class="w-4 h-4 text-romance-400" />
            <span>Details</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Poster Cover (Clean 3D Framed Artwork) -->
      <div class="relative shrink-0 order-2">
        <NuxtLink :to="`/webtoon/${currentManga.slug || currentManga.id}`" class="block group/cover relative">
          <!-- Subtle Romantic Glow behind cover -->
          <div class="absolute -inset-2 bg-gradient-to-tr from-romance-600/30 via-rose-500/20 to-purple-600/20 rounded-3xl blur-xl opacity-75 group-hover/cover:opacity-100 transition-opacity duration-500"></div>

          <!-- Cover Image Frame with subtle 3D feel -->
          <div class="relative w-56 lg:w-64 aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-night-900 transform transition-transform duration-500 group-hover/cover:scale-[1.02]">
            <img 
              :src="currentManga.cover" 
              :alt="currentManga.title" 
              class="w-full h-full object-cover object-center"
            />
          </div>
        </NuxtLink>
      </div>

    </div>

    <!-- Carousel Footer Navigation -->
    <div 
      v-if="slides.length > 1" 
      class="relative z-20 px-4 sm:px-10 pb-4 sm:pb-6 flex items-center justify-between border-t border-white/5 pt-3 sm:pt-4 bg-night-950/40 backdrop-blur-sm"
    >
      <!-- Indicator Dots -->
      <div class="flex items-center space-x-2">
        <button
          v-for="(slide, idx) in slides"
          :key="slide.id || idx"
          @click="goToSlide(idx)"
          class="transition-all duration-300 h-1.5 sm:h-2 rounded-full focus:outline-none"
          :class="currentIndex === idx ? 'w-7 sm:w-8 bg-gradient-to-r from-romance-500 to-rose-400' : 'w-2 bg-night-700 hover:bg-night-600'"
          :title="slide.title"
        ></button>
      </div>

      <!-- Slide Counter & Arrow Controls -->
      <div class="flex items-center space-x-3">
        <span class="text-xs font-mono text-night-400 font-medium">
          <span class="text-white">{{ (currentIndex + 1).toString().padStart(2, '0') }}</span>
          <span class="text-night-600"> / </span>
          <span>{{ slides.length.toString().padStart(2, '0') }}</span>
        </span>

        <div class="flex items-center space-x-1.5">
          <button 
            @click="prevSlide" 
            class="p-2 rounded-xl bg-night-900/90 hover:bg-night-850 text-night-300 hover:text-white border border-night-800 transition-colors focus:outline-none"
            title="Previous"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button 
            @click="nextSlide" 
            class="p-2 rounded-xl bg-night-900/90 hover:bg-night-850 text-night-300 hover:text-white border border-night-800 transition-colors focus:outline-none"
            title="Next"
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
import { Star, BookOpen, Info, Bookmark, ChevronLeft, ChevronRight } from '@lucide/vue'
import { useReadingTracker } from '~/composables/useReadingTracker'
import { slugifyGenre } from '~/composables/useApi'

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
