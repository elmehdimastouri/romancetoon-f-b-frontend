<template>
  <div class="group flex flex-col rounded-xl sm:rounded-2xl bg-night-900 border border-night-800/80 hover:border-romance-500/50 overflow-hidden transition-all duration-300 hover:shadow-glow-pink transform hover:-translate-y-1">
    <!-- Cover image container with aspect ratio -->
    <div class="relative aspect-[3/4] overflow-hidden bg-night-950">
      <img 
        :src="manga.cover" 
        :alt="manga.title" 
        loading="lazy"
        class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
      />

      <!-- Romantic gradient overlay at bottom of cover -->
      <div class="absolute inset-0 bg-gradient-to-t from-night-950 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>

      <!-- Badge (HOT / TRENDING) at Top Left -->
      <div v-if="manga.badge" class="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 pointer-events-none">
        <span 
          :class="[
            'px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold tracking-wider uppercase backdrop-blur-md shadow-sm',
            manga.badge === 'HOT' ? 'bg-rose-600/90 text-white' :
            manga.badge === 'TRENDING' ? 'bg-amber-600/90 text-white' :
            'bg-violet-600/90 text-white'
          ]"
        >
          {{ manga.badge }}
        </span>
      </div>

      <!-- Rating on Top Right -->
      <div class="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 flex items-center space-x-1 px-1.5 sm:px-2 py-0.5 rounded-md bg-night-950/80 backdrop-blur-md border border-white/10 text-amber-400 text-[10px] sm:text-xs font-semibold z-10 pointer-events-none">
        <Star class="w-3 h-3 fill-amber-400" />
        <span>{{ Number(manga.rating || 5.0).toFixed(1) }}</span>
      </div>

      <!-- Views indicator at Bottom Left -->
      <div class="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5 flex items-center space-x-1 text-[10px] sm:text-[11px] text-night-300 font-medium z-10 pointer-events-none bg-night-950/70 px-1.5 py-0.5 rounded-md backdrop-blur-sm border border-white/5">
        <Eye class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-romance-400" />
        <span>{{ formatViews(manga.views) }}</span>
      </div>

      <!-- Bookmark quick toggle at Bottom Right -->
      <button 
        @click.stop.prevent="toggleBookmark(manga)"
        :class="[
          'absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 p-1.5 rounded-lg backdrop-blur-md transition-all shadow-sm z-20',
          isBookmarked(manga.id || manga.slug)
            ? 'bg-romance-600 text-white'
            : 'bg-night-950/80 text-night-300 hover:text-white hover:bg-romance-600/80'
        ]"
        :title="isBookmarked(manga.id || manga.slug) ? 'Remove from Bookmarks' : 'Save to Bookmarks'"
      >
        <Bookmark :class="['w-3 h-3 sm:w-3.5 sm:h-3.5', isBookmarked(manga.id || manga.slug) ? 'fill-white' : '']" />
      </button>

      <!-- Quick read button on cover hover (desktop only) -->
      <div class="hidden sm:flex absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-night-950/40 backdrop-blur-[2px]">
        <NuxtLink 
          :to="userHistory ? `/webtoon/${manga.slug || manga.id}/chapter-${userHistory.chapterNumber}` : `/webtoon/${manga.slug || manga.id}/chapter-1`"
          class="px-4 py-2 rounded-xl bg-romance-600 hover:bg-romance-500 text-white text-xs font-semibold shadow-glow-pink flex items-center space-x-1.5 transition-all transform scale-95 group-hover:scale-100"
        >
          <BookOpen class="w-3.5 h-3.5" />
          <span>{{ userHistory ? `Continue Ch. ${userHistory.chapterNumber}` : 'Read Ch. 1' }}</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Details block -->
    <div class="p-2.5 sm:p-3.5 flex flex-col flex-1 justify-between gap-1.5 sm:gap-2.5">
      <div>
        <NuxtLink :to="`/webtoon/${manga.slug || manga.id}`" class="block">
          <h3 class="font-serif font-bold text-xs sm:text-sm md:text-base text-night-100 group-hover:text-romance-400 transition-colors line-clamp-2 leading-tight">
            {{ manga.title }}
          </h3>
        </NuxtLink>
        <p class="text-[10px] sm:text-[11px] text-night-400 line-clamp-1 mt-1">
          {{ manga.genres && manga.genres.slice(0, 2).join(' • ') }}
        </p>
      </div>

      <!-- Latest chapter link -->
      <div v-if="latestChapter" class="pt-1.5 sm:pt-2 border-t border-night-800/60 flex items-center justify-between text-[11px] sm:text-xs">
        <NuxtLink 
          :to="`/webtoon/${manga.slug || manga.id}/chapter-${latestChapter.number}`"
          class="text-night-300 hover:text-romance-300 transition-colors font-medium flex items-center space-x-1 truncate"
        >
          <span class="truncate">Ch. {{ latestChapter.number }}</span>
        </NuxtLink>
        <span class="text-[9px] sm:text-[10px] text-night-500 shrink-0">{{ latestChapter.releaseDate }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Manga } from '~/data/mangas'
import { Star, Eye, BookOpen, Bookmark } from '@lucide/vue'
import { useReadingTracker } from '~/composables/useReadingTracker'
import { formatViews } from '~/utils/formatters'

const props = defineProps<{
  manga: Manga
}>()

const { isBookmarked, toggleBookmark, getHistoryForManga } = useReadingTracker()

const userHistory = computed(() => {
  return getHistoryForManga(props.manga.id) || getHistoryForManga(props.manga.slug)
})

const latestChapter = computed(() => {
  return props.manga.chapters && props.manga.chapters.length > 0
    ? props.manga.chapters[props.manga.chapters.length - 1]
    : null
})
</script>
