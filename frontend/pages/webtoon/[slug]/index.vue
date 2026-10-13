<template>
  <div v-if="manga" class="space-y-12">
    <!-- Header Banner Backdrop -->
    <div class="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 h-64 sm:h-80 overflow-hidden">
      <img 
        :src="manga.banner || manga.cover" 
        :alt="manga.title" 
        class="w-full h-full object-cover object-center filter blur-md brightness-40 scale-110"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/70 to-transparent"></div>
    </div>

    <!-- Main Info Container -->
    <div class="relative -mt-36 sm:-mt-48 z-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
      
      <!-- Left Column: Cover & Quick Stats -->
      <div class="space-y-4 flex flex-col items-center md:items-start">
        <div class="w-56 sm:w-64 md:w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-night-800 bg-night-900 relative group">
          <img 
            :src="manga.cover" 
            :alt="manga.title" 
            class="w-full h-full object-cover"
          />
          <div v-if="manga.badge" class="absolute top-3 left-3">
            <span class="px-2.5 py-1 rounded-md text-xs font-bold bg-romance-600 text-white uppercase shadow-md">
              {{ manga.badge }}
            </span>
          </div>
        </div>

        <!-- Action Buttons (Clean SEO URLs & Tracking) -->
        <div class="w-full space-y-2">
          <!-- Continue Reading from last visited chapter if history exists -->
          <NuxtLink 
            v-if="userHistory"
            :to="`/webtoon/${manga.slug || manga.id}/chapter-${userHistory.chapterNumber}`"
            class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-romance-600 to-rose-500 hover:from-romance-500 hover:to-rose-400 text-white font-semibold text-sm shadow-glow-pink flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
          >
            <Play class="w-4 h-4 fill-white" />
            <span>Continue Reading (Ch. {{ userHistory.chapterNumber }})</span>
          </NuxtLink>

          <!-- Read First Chapter -->
          <NuxtLink 
            v-if="publishedChapters.length > 0"
            :to="`/webtoon/${manga.slug || manga.id}/chapter-${publishedChapters[0].number}`"
            :class="[
              'w-full py-2.5 px-4 rounded-xl font-medium text-xs flex items-center justify-center space-x-2 transition-all',
              !userHistory 
                ? 'bg-gradient-to-r from-romance-600 to-rose-500 hover:from-romance-500 hover:to-rose-400 text-white font-semibold shadow-glow-pink' 
                : 'bg-night-900 hover:bg-night-850 text-night-200 border border-night-800'
            ]"
          >
            <BookOpen class="w-4 h-4" />
            <span>Read First (Ch. {{ publishedChapters[0].number }})</span>
          </NuxtLink>

          <!-- Read Latest Chapter -->
          <NuxtLink 
            v-if="latestChapter && (!userHistory || userHistory.chapterNumber !== latestChapter.number)"
            :to="`/webtoon/${manga.slug || manga.id}/chapter-${latestChapter.number}`"
            class="w-full py-2 px-4 rounded-xl bg-night-900 hover:bg-night-850 text-night-300 hover:text-white border border-night-800 font-medium text-xs flex items-center justify-center space-x-2 transition-colors"
          >
            <span>Read Latest (Ch. {{ latestChapter.number }})</span>
          </NuxtLink>

          <!-- Bookmark Toggle Button -->
          <button 
            @click="toggleBookmark(manga)"
            :class="[
              'w-full py-2.5 px-4 rounded-xl border font-medium text-xs flex items-center justify-center space-x-2 transition-all',
              isBookmarked(manga.id || manga.slug)
                ? 'bg-romance-600/20 border-romance-500 text-romance-300 shadow-sm'
                : 'bg-night-900 hover:bg-night-850 border-night-800 text-night-200 hover:text-white'
            ]"
          >
            <Bookmark :class="['w-4 h-4', isBookmarked(manga.id || manga.slug) ? 'fill-romance-400 text-romance-400' : 'text-night-400']" />
            <span>{{ isBookmarked(manga.id || manga.slug) ? 'In Bookmarks' : 'Add to Bookmarks' }}</span>
            <span v-if="manga.bookmarks" class="ml-1 px-1.5 py-0.5 rounded-md bg-night-950/60 border border-white/5 text-[10px] font-mono text-night-300">
              {{ formatViews(manga.bookmarks) }}
            </span>
          </button>
        </div>

        <!-- Meta Details Card -->
        <div class="w-full p-4 rounded-2xl glass-panel space-y-3 text-xs">
          <div class="flex justify-between py-1 border-b border-night-800">
            <span class="text-night-400">Author:</span>
            <span class="text-white font-medium">{{ manga.author }}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-night-800">
            <span class="text-night-400">Artist:</span>
            <span class="text-white font-medium">{{ manga.artist }}</span>
          </div>
          <div v-if="manga.releaseYear" class="flex justify-between py-1 border-b border-night-800">
            <span class="text-night-400">Release Year:</span>
            <span class="text-white font-medium">{{ manga.releaseYear }}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-night-800">
            <span class="text-night-400">Status:</span>
            <span class="text-emerald-400 font-medium">{{ manga.status }}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-night-800">
            <span class="text-night-400">Bookmarks:</span>
            <span class="text-romance-300 font-medium">{{ formatViews(manga.bookmarks || '0') }}</span>
          </div>
          <div class="flex justify-between py-1">
            <span class="text-night-400">Views:</span>
            <span class="text-white font-medium">{{ formatViews(manga.views) }}</span>
          </div>
        </div>
      </div>

      <!-- Right Column: Title, Synopsis, Chapters -->
      <div class="md:col-span-2 lg:col-span-3 space-y-8">
        
        <!-- Title & Rating -->
        <div class="space-y-4 text-center md:text-left">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
            {{ manga.title }}
          </h1>

          <p v-if="manga.alternativeTitles && manga.alternativeTitles.length" class="text-xs text-night-400 italic">
            Also known as: {{ manga.alternativeTitles.join(' • ') }}
          </p>

          <div class="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
            <div class="flex items-center space-x-1.5 text-amber-400 font-bold bg-night-900 px-3 py-1.5 rounded-xl border border-night-800 text-sm shadow-sm">
              <Star class="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{{ Number(manga.rating || 5.0).toFixed(1) }}</span>
              <span class="text-night-400 font-normal text-xs">({{ manga.ratingCount || '1' }} {{ Number(manga.ratingCount || 1) === 1 ? 'rating' : 'ratings' }})</span>
            </div>

            <NuxtLink 
              v-for="genre in manga.genres" 
              :key="genre"
              :to="`/genres/${slugifyGenre(genre)}/`"
              class="px-3 py-1.5 rounded-xl bg-night-900 border border-night-800 text-night-200 text-xs font-medium hover:border-romance-500/60 hover:text-romance-300 transition-colors"
            >
              {{ genre }}
            </NuxtLink>
          </div>

          <!-- Interactive User Rating Card -->
          <div class="p-3.5 rounded-2xl bg-night-900/90 border border-night-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
            <div class="flex flex-col sm:flex-row items-center gap-3">
              <span class="text-xs font-medium text-night-300">
                {{ userRating ? 'Your Rating:' : 'Rate this Webtoon:' }}
              </span>

              <!-- 5 Stars with hover & click feedback -->
              <div class="flex items-center space-x-1" @mouseleave="hoverRating = 0">
                <button
                  v-for="starIndex in 5"
                  :key="starIndex"
                  type="button"
                  :disabled="isSubmittingRating"
                  @mouseenter="hoverRating = starIndex"
                  @click="handleRate(starIndex)"
                  class="p-1 rounded-lg transition-transform transform hover:scale-125 active:scale-95 focus:outline-none disabled:opacity-50 group"
                  :title="`Rate ${starIndex} out of 5 stars`"
                >
                  <Star 
                    :class="[
                      'w-5 h-5 transition-colors duration-150',
                      (hoverRating ? starIndex <= hoverRating : (userRating ? starIndex <= userRating : false))
                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                        : 'text-night-700 hover:text-amber-400/50'
                    ]"
                  />
                </button>
              </div>

              <!-- Rating verbal text -->
              <span class="text-xs font-medium text-amber-400 min-w-[90px] text-center sm:text-left">
                <template v-if="hoverRating">
                  {{ ratingLabels[hoverRating] }}
                </template>
                <template v-else-if="userRating">
                  {{ ratingLabels[userRating] }}
                </template>
                <template v-else>
                  <span class="text-night-500 font-normal">Click to vote</span>
                </template>
              </span>
            </div>

            <!-- Feedback message -->
            <div v-if="ratingStatusMessage" class="flex items-center space-x-1.5 text-xs text-emerald-400 font-medium">
              <Check class="w-4 h-4 text-emerald-400" />
              <span>{{ ratingStatusMessage }}</span>
            </div>
            <div v-else-if="userRating" class="text-[11px] text-night-500 hidden sm:block">
              Click another star to update your vote
            </div>
          </div>
        </div>

        <!-- Synopsis -->
        <div class="p-6 rounded-2xl glass-panel space-y-3">
          <h3 class="font-serif font-bold text-lg text-white flex items-center space-x-2">
            <Heart class="w-4 h-4 text-romance-400" />
            <span>Synopsis</span>
          </h3>
          <p class="text-night-300 text-sm sm:text-base leading-relaxed">
            {{ manga.synopsis }}
          </p>
        </div>

        <!-- Chapters List Section -->
        <div class="space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-night-850">
            <div class="flex items-center space-x-2">
              <ListOrdered class="w-5 h-5 text-romance-400" />
              <h2 class="font-serif text-xl font-bold text-white">Chapters ({{ publishedChapters.length }})</h2>
            </div>
            
            <input 
              v-model="chapterSearch" 
              type="text" 
              placeholder="Search chapter..."
              class="bg-night-900 border border-night-800 rounded-xl px-3 py-1.5 text-xs text-night-100 placeholder-night-500 focus:outline-none focus:border-romance-500 w-36 sm:w-48"
            />
          </div>

          <!-- Clean SEO Chapter Links -->
          <div v-if="filteredChapters.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NuxtLink 
              v-for="ch in filteredChapters" 
              :key="ch.number"
              :to="`/webtoon/${manga.slug || manga.id}/chapter-${ch.number}`"
              class="p-4 rounded-xl bg-night-900 hover:bg-night-850 border border-night-800/80 hover:border-romance-500/50 flex items-center justify-between group transition-all"
            >
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-lg bg-night-800 group-hover:bg-romance-600/20 group-hover:text-romance-400 text-night-300 flex items-center justify-center font-mono text-xs font-bold transition-colors">
                  {{ ch.number }}
                </div>
                <div>
                  <h4 class="text-xs sm:text-sm font-semibold text-night-100 group-hover:text-romance-300 transition-colors line-clamp-1">
                    {{ ch.title || `Chapter ${ch.number}` }}
                  </h4>
                  <p class="text-[10px] text-night-400 mt-0.5 flex items-center space-x-1.5">
                    <span>{{ ch.releaseDate || 'Published' }}</span>
                    <span v-if="ch.views" class="text-night-500">• {{ formatViews(ch.views) }} views</span>
                  </p>
                </div>
              </div>

              <div class="flex items-center space-x-2 text-night-400 group-hover:text-romance-400">
                <ChevronRight class="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </NuxtLink>
          </div>

          <div v-else class="p-8 rounded-2xl bg-night-900/60 border border-night-800 text-center text-xs text-night-400">
            No published chapters available yet for this title.
          </div>
        </div>

      </div>
    </div>
  </div>

  <div v-else-if="isLoading" class="min-h-[400px] flex items-center justify-center">
    <div class="text-romance-400 animate-pulse text-sm">Loading webtoon details...</div>
  </div>

  <div v-else class="min-h-[400px] flex items-center justify-center text-center">
    <div>
      <p class="text-night-400">Webtoon not found</p>
      <NuxtLink to="/" class="mt-4 inline-block text-romance-400 hover:underline text-sm">Return to RomanceToon Home</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRomanceApi, slugifyGenre } from '~/composables/useApi'
import { useReadingTracker } from '~/composables/useReadingTracker'
import { Star, BookOpen, Heart, ListOrdered, ChevronRight, Play, Bookmark, Check } from '@lucide/vue'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const { fetchManga, rateManga, fetchMangaRating, recordView } = useRomanceApi()
const { getHistoryForManga, isBookmarked, toggleBookmark, getUserFingerprint, getUserRating, setUserRating } = useReadingTracker()

const manga = ref<any>(null)
const isLoading = ref(true)
const chapterSearch = ref('')

// Interactive Rating States
const hoverRating = ref(0)
const userRating = ref<number | null>(null)
const isSubmittingRating = ref(false)
const ratingStatusMessage = ref('')

const ratingLabels: Record<number, string> = {
  1: '1/5 • Poor',
  2: '2/5 • Fair',
  3: '3/5 • Good',
  4: '4/5 • Very Good',
  5: '5/5 • Masterpiece!'
}

const userHistory = computed(() => {
  if (!manga.value) return null
  return getHistoryForManga(manga.value.id) || getHistoryForManga(manga.value.slug) || getHistoryForManga(slug.value)
})

onMounted(async () => {
  isLoading.value = true
  manga.value = await fetchManga(slug.value)
  isLoading.value = false

  if (manga.value) {
    // 1. Record view count for this title
    recordView(manga.value.id).then((res) => {
      if (res && res.views) {
        manga.value.views = res.views
      }
    })

    // 2. Check local storage first
    const local = getUserRating(manga.value.id) || getUserRating(manga.value.slug) || getUserRating(slug.value)
    if (local) {
      userRating.value = local
    } else {
      // 3. Check remote rating for this client fingerprint
      try {
        const fp = getUserFingerprint()
        const res = await fetchMangaRating(manga.value.id, fp)
        if (res && res.userRating) {
          userRating.value = res.userRating
          setUserRating(manga.value.id, res.userRating)
        }
      } catch (e) {
        // Silent fallback
      }
    }
  }
})

const handleRate = async (star: number) => {
  if (!manga.value || isSubmittingRating.value) return
  isSubmittingRating.value = true

  const prevRating = userRating.value
  userRating.value = star
  setUserRating(manga.value.id, star)
  if (manga.value.slug) {
    setUserRating(manga.value.slug, star)
  }

  try {
    const fp = getUserFingerprint()
    const res = await rateManga(manga.value.id, star, fp)
    if (res && res.success) {
      if (res.rating !== undefined) manga.value.rating = res.rating
      if (res.ratingCount !== undefined) manga.value.ratingCount = res.ratingCount
      ratingStatusMessage.value = prevRating ? 'Rating updated!' : 'Thank you for rating!'
      setTimeout(() => {
        ratingStatusMessage.value = ''
      }, 3500)
    } else {
      ratingStatusMessage.value = 'Saved!'
      setTimeout(() => {
        ratingStatusMessage.value = ''
      }, 3000)
    }
  } catch (err) {
    console.error('Failed to submit rating:', err)
  } finally {
    isSubmittingRating.value = false
  }
}

const publishedChapters = computed(() => {
  if (!manga.value || !manga.value.chapters) return []
  return manga.value.chapters.filter((c: any) => c.isPublished !== false)
})

const latestChapter = computed(() => {
  return publishedChapters.value.length > 0 
    ? publishedChapters.value[publishedChapters.value.length - 1] 
    : null
})

const filteredChapters = computed(() => {
  if (!chapterSearch.value.trim()) return publishedChapters.value
  const query = chapterSearch.value.toLowerCase()
  return publishedChapters.value.filter((ch: any) => 
    ch.number.toString().includes(query) || 
    (ch.title && ch.title.toLowerCase().includes(query))
  )
})
</script>
