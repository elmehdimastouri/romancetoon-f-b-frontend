<template>
  <div class="space-y-8 max-w-7xl mx-auto py-4">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-night-850">
      <div>
        <div class="flex items-center space-x-3 mb-2">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-romance-600 to-rose-400 flex items-center justify-center shadow-glow-pink">
            <Bookmark class="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              My Bookmarks
            </h1>
            <p class="text-xs sm:text-sm text-night-400 mt-0.5">
              Saved locally on your device for quick access anytime — no login or account required.
            </p>
          </div>
        </div>
      </div>

      <!-- Action items (Search & Clear) -->
      <div v-if="bookmarks.length > 0" class="flex flex-wrap items-center gap-2.5">
        <!-- Search inside bookmarks -->
        <div class="relative w-full sm:w-48 md:w-56">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search saved titles..." 
            class="w-full bg-night-900 border border-night-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-night-500 focus:outline-none focus:border-romance-500/70"
          />
          <Search class="w-4 h-4 text-night-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <!-- Sort Select -->
        <select 
          v-model="sortBy"
          class="bg-night-900 border border-night-800 rounded-xl py-2 px-3 text-xs text-night-300 focus:outline-none focus:border-romance-500 cursor-pointer"
        >
          <option value="recent">Recently Added</option>
          <option value="title">Title (A - Z)</option>
          <option value="rating">Top Rated</option>
        </select>

        <!-- Clear all button -->
        <button 
          @click="confirmClear"
          class="px-3.5 py-2 rounded-xl bg-night-900 hover:bg-rose-950/40 text-night-400 hover:text-rose-400 border border-night-800 hover:border-rose-900/50 text-xs font-medium transition-colors flex items-center space-x-1.5"
          title="Clear all bookmarks"
        >
          <Trash2 class="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>
    </div>

    <!-- Stats Bar -->
    <div v-if="bookmarks.length > 0" class="flex items-center justify-between text-xs text-night-400 px-1">
      <div class="flex items-center space-x-2">
        <span class="px-2.5 py-0.5 rounded-full bg-romance-600/20 text-romance-300 font-mono font-semibold border border-romance-500/30">
          {{ filteredBookmarks.length }}
        </span>
        <span>saved {{ filteredBookmarks.length === 1 ? 'title' : 'titles' }}</span>
      </div>

      <div class="text-[11px] text-night-500">
        Saved securely in your browser's local storage
      </div>
    </div>

    <!-- Bookmarks Grid -->
    <div v-if="filteredBookmarks.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      <div 
        v-for="item in filteredBookmarks" 
        :key="item.id"
        class="group flex flex-col rounded-2xl bg-night-900 border border-night-800/80 hover:border-romance-500/50 overflow-hidden transition-all duration-300 hover:shadow-glow-pink relative"
      >
        <!-- Cover image container -->
        <div class="relative aspect-[3/4] overflow-hidden bg-night-950">
          <img 
            :src="item.cover" 
            :alt="item.title" 
            loading="lazy"
            class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />

          <div class="absolute inset-0 bg-gradient-to-t from-night-950 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>

          <!-- Remove from bookmark quick button -->
          <button 
            @click.stop.prevent="removeBookmark(item.id)"
            class="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-night-950/80 hover:bg-rose-600 backdrop-blur-md text-night-300 hover:text-white transition-all shadow-md group/btn"
            title="Remove from Bookmarks"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>

          <!-- Rating -->
          <div v-if="item.rating" class="absolute top-2.5 left-2.5 flex items-center space-x-1 px-2 py-0.5 rounded-md bg-night-950/80 backdrop-blur-md border border-white/10 text-amber-400 text-xs font-semibold">
            <Star class="w-3 h-3 fill-amber-400" />
            <span>{{ item.rating }}</span>
          </div>

          <!-- Last read indicator if exists -->
          <div 
            v-if="getLastRead(item)" 
            class="absolute bottom-2.5 left-2.5 right-2.5 px-2 py-1 rounded-lg bg-night-950/90 backdrop-blur-md border border-romance-500/30 flex items-center justify-between text-[11px]"
          >
            <span class="text-romance-300 font-medium">Progress:</span>
            <span class="text-white font-bold font-mono">Ch. {{ getLastRead(item)?.chapterNumber }}</span>
          </div>
        </div>

        <!-- Details -->
        <div class="p-3.5 flex flex-col flex-1 justify-between gap-3">
          <div>
            <NuxtLink :to="`/webtoon/${item.slug || item.id}`" class="block">
              <h3 class="font-serif font-bold text-sm sm:text-base text-night-100 group-hover:text-romance-400 transition-colors line-clamp-1">
                {{ item.title }}
              </h3>
            </NuxtLink>
            <p v-if="item.genres && item.genres.length" class="text-[11px] text-night-400 line-clamp-1 mt-0.5">
              {{ item.genres.slice(0, 2).join(' • ') }}
            </p>
          </div>

          <!-- Action button: Continue or Read First -->
          <div class="pt-2 border-t border-night-800/60">
            <NuxtLink 
              v-if="getLastRead(item)"
              :to="`/webtoon/${item.slug || item.id}/chapter-${getLastRead(item)?.chapterNumber}`"
              class="w-full py-2 px-3 rounded-xl bg-romance-600 hover:bg-romance-500 text-white text-xs font-semibold shadow-glow-pink flex items-center justify-center space-x-1.5 transition-colors"
            >
              <BookOpen class="w-3.5 h-3.5" />
              <span>Continue Ch. {{ getLastRead(item)?.chapterNumber }}</span>
            </NuxtLink>

            <NuxtLink 
              v-else-if="item.latestChapter"
              :to="`/webtoon/${item.slug || item.id}/chapter-${item.latestChapter}`"
              class="w-full py-2 px-3 rounded-xl bg-night-850 hover:bg-night-800 text-night-200 hover:text-white border border-night-800 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors"
            >
              <BookOpen class="w-3.5 h-3.5" />
              <span>Read Ch. {{ item.latestChapter }}</span>
            </NuxtLink>

            <NuxtLink 
              v-else
              :to="`/webtoon/${item.slug || item.id}`"
              class="w-full py-2 px-3 rounded-xl bg-night-850 hover:bg-night-800 text-night-200 hover:text-white border border-night-800 text-xs font-medium flex items-center justify-center transition-colors"
            >
              <span>View Details</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-20 px-4 rounded-3xl glass-panel border border-night-800/80 max-w-xl mx-auto space-y-5">
      <div class="w-16 h-16 rounded-3xl bg-romance-600/10 border border-romance-500/20 flex items-center justify-center mx-auto text-romance-400 shadow-glow-pink">
        <Bookmark class="w-8 h-8" />
      </div>
      <div class="space-y-2">
        <h3 class="text-xl font-serif font-bold text-white">
          Your Bookmarks List is Empty
        </h3>
        <p class="text-xs sm:text-sm text-night-400 max-w-md mx-auto leading-relaxed">
          You haven't bookmarked any webtoons yet. Browse our romance collection and click the bookmark button on any title to save it here for easy reading.
        </p>
      </div>
      <div>
        <NuxtLink 
          to="/"
          class="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-romance-600 to-rose-500 hover:from-romance-500 hover:to-rose-400 text-white font-semibold text-xs shadow-glow-pink transition-transform transform hover:-translate-y-0.5"
        >
          <Sparkles class="w-4 h-4" />
          <span>Explore Romance Webtoons</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bookmark, Search, Trash2, Star, BookOpen, Sparkles } from '@lucide/vue'
import { useReadingTracker, type BookmarkItem } from '~/composables/useReadingTracker'

useHead({
  title: 'My Bookmarks | RomanceToon',
  meta: [
    { name: 'description', content: 'Your saved romance webtoons and manhwa collection.' }
  ]
})

const { bookmarks, removeBookmark, clearBookmarks, getHistoryForManga } = useReadingTracker()

const searchQuery = ref('')
const sortBy = ref<'recent' | 'title' | 'rating'>('recent')

const getLastRead = (item: BookmarkItem) => {
  return getHistoryForManga(item.id || item.slug)
}

const confirmClear = () => {
  if (confirm('Are you sure you want to clear all saved bookmarks?')) {
    clearBookmarks()
  }
}

const filteredBookmarks = computed(() => {
  let list = [...bookmarks.value]

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(b => 
      b.title.toLowerCase().includes(q) || 
      (b.author && b.author.toLowerCase().includes(q))
    )
  }

  if (sortBy.value === 'title') {
    list.sort((a, b) => a.title.localeCompare(b.title))
  } else if (sortBy.value === 'rating') {
    list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
  } else {
    // recent
    list.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0))
  }

  return list
})
</script>
