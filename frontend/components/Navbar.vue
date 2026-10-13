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

        <!-- Right Action Items (Search + Bookmarks + History) -->
        <div class="flex items-center space-x-2 sm:space-x-3">
          <!-- Search input -->
          <div class="relative hidden sm:block w-40 md:w-56 lg:w-64">
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
          <NuxtLink 
            to="/bookmarks"
            class="px-2.5 sm:px-3 py-2 rounded-xl bg-night-850/80 border border-night-800 text-night-200 hover:text-romance-400 hover:border-romance-500/40 transition-all flex items-center space-x-1.5 text-xs font-medium relative group"
            active-class="text-romance-400 border-romance-500/50 bg-night-800"
            title="My Bookmarks"
          >
            <Bookmark class="w-4 h-4 text-romance-400 group-hover:scale-110 transition-transform" />
            <span class="hidden sm:inline">Bookmarks</span>
            <span 
              v-if="bookmarks.length > 0"
              class="ml-1 px-1.5 py-0.2 rounded-full bg-romance-600 text-white font-mono text-[10px] font-bold"
            >
              {{ bookmarks.length }}
            </span>
          </NuxtLink>

          <!-- History button -->
          <NuxtLink 
            to="/history"
            class="px-2.5 sm:px-3 py-2 rounded-xl bg-night-850/80 border border-night-800 text-night-200 hover:text-romance-400 hover:border-romance-500/40 transition-all flex items-center space-x-1.5 text-xs font-medium relative group"
            active-class="text-romance-400 border-romance-500/50 bg-night-800"
            title="Reading History"
          >
            <History class="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
            <span class="hidden sm:inline">History</span>
            <span 
              v-if="history.length > 0"
              class="ml-1 px-1.5 py-0.2 rounded-full bg-night-800 text-romance-300 border border-romance-500/30 font-mono text-[10px] font-bold"
            >
              {{ history.length }}
            </span>
          </NuxtLink>

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
        
        <div class="pt-2 border-t border-night-850/80 space-y-1">
          <NuxtLink 
            to="/bookmarks" 
            @click="mobileMenuOpen = false" 
            class="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-night-200 hover:bg-night-850 hover:text-white"
          >
            <span class="flex items-center space-x-2">
              <Bookmark class="w-4 h-4 text-romance-400" />
              <span>Bookmarks</span>
            </span>
            <span v-if="bookmarks.length > 0" class="text-xs px-2 py-0.5 rounded-full bg-romance-600 text-white font-mono font-bold">
              {{ bookmarks.length }}
            </span>
          </NuxtLink>

          <NuxtLink 
            to="/history" 
            @click="mobileMenuOpen = false" 
            class="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-night-200 hover:bg-night-850 hover:text-white"
          >
            <span class="flex items-center space-x-2">
              <History class="w-4 h-4 text-rose-400" />
              <span>Reading History</span>
            </span>
            <span v-if="history.length > 0" class="text-xs px-2 py-0.5 rounded-full bg-night-800 border border-romance-500/30 text-romance-300 font-mono font-bold">
              {{ history.length }}
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Heart, Compass, Sparkles, Flame, Search, Bookmark, History, Menu, X } from '@lucide/vue'
import { useReadingTracker } from '~/composables/useReadingTracker'

const searchQuery = ref('')
const mobileMenuOpen = ref(false)

const { bookmarks, history } = useReadingTracker()

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    navigateTo(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`)
  }
}
</script>
