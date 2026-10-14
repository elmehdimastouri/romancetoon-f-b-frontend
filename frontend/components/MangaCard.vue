<template>
  <div class="group flex flex-col rounded-2xl bg-night-900/40 hover:bg-night-900/80 border border-night-800/60 hover:border-romance-500/40 p-2 sm:p-2.5 transition-all duration-300 hover:shadow-glow-pink transform hover:-translate-y-1">
    
    <!-- 1. Cover image container -->
    <NuxtLink :to="`/webtoon/${manga.slug || manga.id}`" class="block relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-night-950 shadow-md">
      <img 
        :src="manga.cover" 
        :alt="manga.title" 
        loading="lazy"
        class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
      />

      <!-- Subtle dark gradient at bottom of cover -->
      <div class="absolute inset-0 bg-gradient-to-t from-night-950/70 via-transparent to-transparent opacity-60"></div>

      <!-- Badge (COLOR / HOT / TRENDING) at Bottom-Left of Cover (as seen in reference design) -->
      <div v-if="manga.badge" class="absolute bottom-2 left-2 z-10 pointer-events-none">
        <span 
          :class="[
            'px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black tracking-wider uppercase shadow-md flex items-center space-x-1',
            manga.badge === 'HOT' ? 'bg-rose-600 text-white' :
            manga.badge === 'TRENDING' ? 'bg-amber-400 text-black' :
            manga.badge === 'COLOR' ? 'bg-amber-400 text-black' :
            'bg-amber-400 text-black'
          ]"
        >
          <span v-if="manga.badge === 'COLOR'">🎨</span>
          <span>{{ manga.badge }}</span>
        </span>
      </div>

      <!-- Rating on Top-Left -->
      <div v-if="manga.rating" class="absolute top-2 left-2 flex items-center space-x-1 px-1.5 sm:px-2 py-0.5 rounded-md bg-night-950/80 backdrop-blur-md border border-white/10 text-amber-400 text-[10px] sm:text-xs font-semibold z-10 pointer-events-none">
        <Star class="w-3 h-3 fill-amber-400" />
        <span>{{ Number(manga.rating).toFixed(1) }}</span>
      </div>

      <!-- Bookmark button on Top-Right -->
      <button 
        @click.stop.prevent="toggleBookmark(manga)"
        :class="[
          'absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-md transition-all shadow-md z-20',
          isBookmarked(manga.id || manga.slug)
            ? 'bg-romance-600 text-white'
            : 'bg-night-950/80 text-night-300 hover:text-white hover:bg-romance-600/80'
        ]"
        :title="isBookmarked(manga.id || manga.slug) ? 'Remove from Bookmarks' : 'Save to Bookmarks'"
      >
        <Bookmark :class="['w-3.5 h-3.5', isBookmarked(manga.id || manga.slug) ? 'fill-white' : '']" />
      </button>
    </NuxtLink>

    <!-- 2. Manhwa Title (Centered under the image) -->
    <div class="my-2 px-1">
      <NuxtLink :to="`/webtoon/${manga.slug || manga.id}`" class="block group/title">
        <h3 class="font-serif font-bold text-xs sm:text-sm text-white text-center line-clamp-2 min-h-[2rem] sm:min-h-[2.4rem] flex items-center justify-center leading-snug group-hover/title:text-romance-300 transition-colors">
          {{ manga.title }}
        </h3>
      </NuxtLink>
    </div>

    <!-- 3. The Last Two Chapters (Stacked rows under the title) -->
    <div class="space-y-1.5 w-full mt-auto">
      <template v-if="latestTwoChapters.length > 0">
        <NuxtLink 
          v-for="ch in latestTwoChapters" 
          :key="ch.number"
          :to="`/webtoon/${manga.slug || manga.id}/chapter-${ch.number}`"
          class="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-night-850 hover:bg-night-800 border border-night-800/80 hover:border-romance-500/50 flex items-center justify-between text-xs transition-colors group/ch"
          :title="`Read Chapter ${ch.number}`"
        >
          <!-- Left: Chapter Number -->
          <span class="font-semibold text-night-100 group-hover/ch:text-romance-300 truncate">
            Ch. {{ ch.number }}
          </span>

          <!-- Right: Release Date / Time ago -->
          <span class="text-[10px] sm:text-[11px] text-night-400 font-normal shrink-0 ml-2">
            {{ formatChapterTime(ch.releaseDate) }}
          </span>
        </NuxtLink>
      </template>

      <!-- Fallback when no published chapters yet -->
      <div v-else class="w-full py-2 px-3 rounded-xl bg-night-850/50 border border-night-800/40 text-center text-[11px] text-night-500 font-medium">
        Coming Soon
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Manga } from '~/data/mangas'
import { Star, Bookmark } from '@lucide/vue'
import { useReadingTracker } from '~/composables/useReadingTracker'

const props = defineProps<{
  manga: Manga
}>()

const { isBookmarked, toggleBookmark } = useReadingTracker()

// Extract the last two published chapters in descending order (e.g. Ch. 71, then Ch. 70)
const latestTwoChapters = computed(() => {
  if (!props.manga.chapters || props.manga.chapters.length === 0) return []
  const valid = props.manga.chapters.filter((c: any) => c.isPublished !== false)
  if (valid.length === 0) return []
  // Sort ascending by chapter number
  const sorted = [...valid].sort((a, b) => Number(a.number) - Number(b.number))
  // Take last 2 and reverse to show highest (newest) on top
  return sorted.slice(-2).reverse()
})

// Format time string to match the reference design (e.g. "35 minutes", "1 hour", "7 days", "1 week")
function formatChapterTime(dateStr?: string): string {
  if (!dateStr) return ''
  const trimmed = dateStr.trim()
  
  // If already relative ending with "ago" (e.g. "35 minutes ago" -> "35 minutes")
  if (/ago$/i.test(trimmed)) {
    return trimmed.replace(/\s+ago$/i, '').trim()
  }

  // Common relative words
  if (['yesterday', 'today', 'published'].includes(trimmed.toLowerCase())) {
    return trimmed
  }

  // If it's a date timestamp (e.g. "2026-10-14")
  const date = new Date(trimmed)
  if (!isNaN(date.getTime())) {
    const diffMs = Date.now() - date.getTime()
    if (diffMs > 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      const diffWeeks = Math.floor(diffDays / 7)
      
      if (diffMins < 60) return `${diffMins <= 1 ? '1 minute' : `${diffMins} minutes`}`
      if (diffHours < 24) return `${diffHours <= 1 ? '1 hour' : `${diffHours} hours`}`
      if (diffDays < 7) return `${diffDays <= 1 ? '1 day' : `${diffDays} days`}`
      return `${diffWeeks <= 1 ? '1 week' : `${diffWeeks} weeks`}`
    }
  }

  return trimmed
}
</script>
