<template>
  <header class="sticky top-0 z-40 glass-nav transition-all duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 sm:h-20">
        
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center space-x-3 group">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-romance-600 to-rose-400 flex items-center justify-center shadow-glow-pink transition-transform group-hover:scale-105">
            <Heart class="w-5 h-5 text-white fill-white animate-pulse" />
          </div>
          <div>
            <div class="flex items-center space-x-1">
              <span class="font-serif text-2xl font-bold tracking-tight text-white group-hover:text-romance-300 transition-colors">
                Romance<span class="text-romance-400">Toon</span>
              </span>
            </div>
            <p class="text-[10px] uppercase tracking-widest text-romance-300/80 font-medium -mt-1 hidden sm:block">Sweet & Deep Romance Webtoons</p>
          </div>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-1 lg:space-x-2">
          <NuxtLink 
            to="/" 
            class="px-3 py-2 text-sm font-medium rounded-lg text-night-200 hover:text-white hover:bg-night-850/60 transition-colors flex items-center space-x-1.5"
            active-class="text-romance-400 bg-night-850"
          >
            <Compass class="w-4 h-4 text-romance-400" />
            <span>Discover</span>
          </NuxtLink>

          <NuxtLink 
            to="/genres" 
            class="px-3 py-2 text-sm font-medium rounded-lg text-night-200 hover:text-white hover:bg-night-850/60 transition-colors flex items-center space-x-1.5"
            active-class="text-romance-400 bg-night-850"
          >
            <Sparkles class="w-4 h-4 text-romance-400" />
            <span>Genres</span>
          </NuxtLink>

          <NuxtLink 
            to="/popular" 
            class="px-3 py-2 text-sm font-medium rounded-lg text-night-200 hover:text-white hover:bg-night-850/60 transition-colors flex items-center space-x-1.5"
            active-class="text-romance-400 bg-night-850"
          >
            <Flame class="w-4 h-4 text-romance-400" />
            <span>Most Loved</span>
          </NuxtLink>
        </nav>

        <!-- Right Action Items (Search + Bookmarks) -->
        <div class="flex items-center space-x-3">
          <!-- Search input -->
          <div class="relative hidden sm:block w-48 md:w-64">
            <input 
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              type="text" 
              placeholder="Search romance webtoon..." 
              class="w-full bg-night-900/90 border border-night-800 rounded-full py-1.5 pl-9 pr-4 text-xs text-night-100 placeholder-night-400 focus:outline-none focus:border-romance-500/70 focus:ring-1 focus:ring-romance-500/50 transition-all"
            />
            <Search class="w-4 h-4 text-night-400 absolute left-3 top-2 pointer-events-none" />
          </div>

          <!-- Bookmarks button -->
          <button 
            @click="showBookmarkAlert = true"
            class="p-2 rounded-xl bg-night-850/80 border border-night-800 text-night-200 hover:text-romance-400 hover:border-romance-500/40 transition-all flex items-center space-x-1 text-xs"
            title="My Saved Favorites"
          >
            <Bookmark class="w-4 h-4 text-romance-400" />
            <span class="hidden lg:inline text-xs font-medium">Library</span>
          </button>

          <!-- Mobile menu toggle -->
          <button 
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 rounded-xl bg-night-850 text-night-200 hover:text-white"
          >
            <Menu v-if="!mobileMenuOpen" class="w-5 h-5" />
            <X v-else class="w-5 h-5 text-romance-400" />
          </button>
        </div>

      </div>

      <!-- Mobile dropdown menu -->
      <div v-if="mobileMenuOpen" class="md:hidden py-4 border-t border-night-800 space-y-2">
        <div class="relative px-2 pb-2">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search romance titles..." 
            class="w-full bg-night-900 border border-night-800 rounded-lg py-2 pl-9 pr-4 text-sm text-night-100 placeholder-night-400 focus:outline-none focus:border-romance-500"
          />
          <Search class="w-4 h-4 text-night-400 absolute left-5 top-4 pointer-events-none" />
        </div>
        <NuxtLink to="/" @click="mobileMenuOpen = false" class="block px-3 py-2 rounded-lg text-sm text-night-200 hover:bg-night-850 hover:text-white">Discover</NuxtLink>
        <NuxtLink to="/genres" @click="mobileMenuOpen = false" class="block px-3 py-2 rounded-lg text-sm text-night-200 hover:bg-night-850 hover:text-white">All Genres</NuxtLink>
        <NuxtLink to="/popular" @click="mobileMenuOpen = false" class="block px-3 py-2 rounded-lg text-sm text-night-200 hover:bg-night-850 hover:text-white">Most Loved</NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Heart, Compass, Sparkles, Flame, Search, Bookmark, Menu, X } from '@lucide/vue'

const searchQuery = ref('')
const mobileMenuOpen = ref(false)
const showBookmarkAlert = ref(false)

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    navigateTo(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`)
  }
}
</script>
