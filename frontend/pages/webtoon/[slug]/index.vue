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

        <!-- Action Buttons (Clean SEO URLs) -->
        <div class="w-full space-y-2">
          <NuxtLink 
            v-if="publishedChapters.length > 0"
            :to="`/webtoon/${manga.slug || manga.id}/chapter-${publishedChapters[0].number}`"
            class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-romance-600 to-rose-500 hover:from-romance-500 hover:to-rose-400 text-white font-semibold text-sm shadow-glow-pink flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
          >
            <BookOpen class="w-4 h-4" />
            <span>Read First (Ch. {{ publishedChapters[0].number }})</span>
          </NuxtLink>

          <NuxtLink 
            v-if="latestChapter"
            :to="`/webtoon/${manga.slug || manga.id}/chapter-${latestChapter.number}`"
            class="w-full py-3 px-4 rounded-xl bg-night-900 hover:bg-night-850 text-night-200 border border-night-800 font-medium text-xs flex items-center justify-center space-x-2 transition-colors"
          >
            <span>Read Latest (Ch. {{ latestChapter.number }})</span>
          </NuxtLink>
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
          <div class="flex justify-between py-1">
            <span class="text-night-400">Views:</span>
            <span class="text-white font-medium">{{ manga.views || '0' }}</span>
          </div>
        </div>
      </div>

      <!-- Right Column: Title, Synopsis, Chapters -->
      <div class="md:col-span-2 lg:col-span-3 space-y-8">
        
        <!-- Title & Rating -->
        <div class="space-y-3 text-center md:text-left">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
            {{ manga.title }}
          </h1>

          <p v-if="manga.alternativeTitles && manga.alternativeTitles.length" class="text-xs text-night-400 italic">
            Also known as: {{ manga.alternativeTitles.join(' • ') }}
          </p>

          <div class="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
            <div class="flex items-center space-x-1 text-amber-400 font-bold bg-night-900 px-3 py-1 rounded-lg border border-night-800 text-sm">
              <Star class="w-4 h-4 fill-amber-400" />
              <span>{{ manga.rating || '5.0' }}</span>
              <span class="text-night-400 font-normal text-xs">({{ manga.ratingCount || '1' }})</span>
            </div>

            <span 
              v-for="genre in manga.genres" 
              :key="genre"
              class="px-3 py-1 rounded-lg bg-night-900 border border-night-800 text-night-200 text-xs font-medium"
            >
              {{ genre }}
            </span>
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
                  <p class="text-[10px] text-night-400 mt-0.5">{{ ch.releaseDate || 'Published' }}</p>
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
import { useRomanceApi } from '~/composables/useApi'
import { Star, BookOpen, Heart, ListOrdered, ChevronRight } from '@lucide/vue'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const { fetchManga } = useRomanceApi()

const manga = ref<any>(null)
const isLoading = ref(true)
const chapterSearch = ref('')

onMounted(async () => {
  isLoading.value = true
  manga.value = await fetchManga(slug.value)
  isLoading.value = false
})

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
