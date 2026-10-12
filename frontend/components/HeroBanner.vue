<template>
  <div class="relative overflow-hidden rounded-3xl glass-panel shadow-soft-card border border-white/10 group mb-12">
    <!-- Background backdrop with romantic gradient overlays -->
    <div class="absolute inset-0 z-0">
      <img 
        :src="featured.banner" 
        :alt="featured.title"
        class="w-full h-full object-cover object-center filter blur-[1px] brightness-50 transform scale-105 group-hover:scale-100 transition-transform duration-1000"
      />
      <!-- Eye-comfort gradients -->
      <div class="absolute inset-0 bg-gradient-to-r from-night-950 via-night-950/80 to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-night-950 via-transparent to-transparent"></div>
      <div class="absolute inset-0 bg-romance-950/20 mix-blend-color"></div>
    </div>

    <!-- Content overlay -->
    <div class="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
      
      <div class="max-w-2xl space-y-4">
        <!-- Badge -->
        <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-romance-600/30 border border-romance-500/50 text-romance-300 text-xs font-semibold backdrop-blur-md">
          <Sparkles class="w-3.5 h-3.5 text-romance-400" />
          <span>Editor's Romance Pick of the Week</span>
        </div>

        <!-- Title -->
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight drop-shadow-md">
          {{ featured.title }}
        </h1>

        <!-- Genre tags & Rating -->
        <div class="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <div class="flex items-center space-x-1 text-amber-400 font-semibold bg-night-900/80 px-2.5 py-1 rounded-lg border border-night-800">
            <Star class="w-4 h-4 fill-amber-400" />
            <span>{{ featured.rating }}</span>
            <span class="text-night-400 text-xs">({{ featured.ratingCount }})</span>
          </div>

          <span 
            v-for="genre in featured.genres" 
            :key="genre"
            class="px-2.5 py-1 rounded-lg bg-night-850/80 border border-night-700/60 text-night-200 text-xs font-medium hover:border-romance-500/50 transition-colors"
          >
            {{ genre }}
          </span>
        </div>

        <!-- Synopsis excerpt -->
        <p class="text-night-300 text-sm sm:text-base line-clamp-3 leading-relaxed">
          {{ featured.synopsis }}
        </p>

        <!-- Action buttons -->
        <div class="flex flex-wrap items-center gap-3 pt-2">
          <NuxtLink 
            :to="`/webtoon/${featured.slug || featured.id}/chapter-1`"
            class="px-6 py-3 rounded-xl bg-gradient-to-r from-romance-600 to-rose-500 hover:from-romance-500 hover:to-rose-400 text-white font-semibold text-sm shadow-glow-pink flex items-center space-x-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <BookOpen class="w-4 h-4" />
            <span>Start Reading (Ch. 1)</span>
          </NuxtLink>

          <NuxtLink 
            :to="`/webtoon/${featured.slug || featured.id}`"
            class="px-5 py-3 rounded-xl bg-night-900/90 hover:bg-night-800 text-night-100 border border-night-700 font-medium text-sm flex items-center space-x-2 transition-colors"
          >
            <Info class="w-4 h-4 text-romance-400" />
            <span>View Details</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Quick stats preview card -->
      <div class="hidden lg:flex flex-col gap-3 p-5 rounded-2xl glass-panel min-w-[220px]">
        <div class="flex items-center justify-between text-xs text-night-400 pb-2 border-b border-night-800">
          <span>Total Views</span>
          <span class="text-night-100 font-bold">{{ featured.views }}</span>
        </div>
        <div class="flex items-center justify-between text-xs text-night-400 pb-2 border-b border-night-800">
          <span>Bookmarks</span>
          <span class="text-romance-300 font-bold">{{ featured.bookmarks }}</span>
        </div>
        <div class="flex items-center justify-between text-xs text-night-400">
          <span>Status</span>
          <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {{ featured.status }}
          </span>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import type { Manga } from '~/data/mangas'
import { Sparkles, Star, BookOpen, Info } from '@lucide/vue'

defineProps<{
  featured: Manga
}>()
</script>
