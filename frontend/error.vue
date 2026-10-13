<template>
  <div class="min-h-screen bg-night-950 text-night-100 flex flex-col font-sans selection:bg-romance-600 selection:text-white">
    <!-- Navbar -->
    <Navbar />

    <!-- Error Content -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
      <div class="max-w-xl w-full text-center space-y-6 p-8 sm:p-12 rounded-3xl glass-panel border border-night-800 shadow-2xl relative overflow-hidden">
        
        <!-- Background decorative glow -->
        <div class="absolute -top-24 -left-24 w-48 h-48 bg-romance-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <!-- 404 Badge & Icon -->
        <div class="relative z-10 space-y-3">
          <div class="w-16 h-16 rounded-3xl bg-romance-600/15 border border-romance-500/30 flex items-center justify-center mx-auto text-romance-400 shadow-glow-pink">
            <HeartCrack class="w-8 h-8" />
          </div>
          
          <span class="inline-block px-3 py-1 rounded-full bg-night-900 border border-night-800 text-romance-400 font-mono text-xs font-bold tracking-wider uppercase">
            {{ is404 ? 'Error 404' : `Error ${error.statusCode || 500}` }}
          </span>
        </div>

        <!-- Title & Description -->
        <div class="relative z-10 space-y-2">
          <h1 class="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            {{ is404 ? 'Lost in the Romance' : 'Something Went Wrong' }}
          </h1>
          <p class="text-xs sm:text-sm text-night-400 max-w-md mx-auto leading-relaxed">
            {{ is404 
              ? 'The chapter, webtoon, or page you are looking for might have been moved, renamed, or is temporarily unavailable.' 
              : (error.message || 'An unexpected error occurred while loading this page. Please try again.') 
            }}
          </p>
        </div>

        <!-- Quick Search Form -->
        <div class="relative z-10 max-w-md mx-auto pt-2">
          <form @submit.prevent="handleSearch" class="relative">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search romance webtoons..." 
              class="w-full bg-night-900 border border-night-800 rounded-2xl py-3 pl-10 pr-24 text-xs text-white placeholder-night-500 focus:outline-none focus:border-romance-500/70 focus:ring-1 focus:ring-romance-500/40"
            />
            <Search class="w-4 h-4 text-night-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <button 
              type="submit" 
              class="absolute right-2 top-2 px-3.5 py-1.5 rounded-xl bg-romance-600 hover:bg-romance-500 text-white text-xs font-semibold shadow-glow-pink transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        <!-- Navigation Buttons -->
        <div class="relative z-10 flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-night-850">
          <button 
            @click="handleClearError"
            class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-romance-600 to-rose-500 hover:from-romance-500 hover:to-rose-400 text-white font-semibold text-xs shadow-glow-pink flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
          >
            <Compass class="w-4 h-4" />
            <span>Return to Home</span>
          </button>

          <NuxtLink 
            to="/genres" 
            @click="handleClearErrorOnly"
            class="px-5 py-2.5 rounded-xl bg-night-900 hover:bg-night-850 text-night-200 hover:text-white border border-night-800 text-xs font-medium transition-colors flex items-center space-x-2"
          >
            <Sparkles class="w-4 h-4 text-romance-400" />
            <span>Browse Genres</span>
          </NuxtLink>
        </div>

      </div>
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { HeartCrack, Search, Compass, Sparkles } from '@lucide/vue'
import Navbar from '~/components/Navbar.vue'
import Footer from '~/components/Footer.vue'

const props = defineProps({
  error: {
    type: Object,
    default: () => ({ statusCode: 404, message: 'Page Not Found' })
  }
})

const is404 = computed(() => {
  return Number(props.error?.statusCode) === 404 || !props.error?.statusCode
})

const searchQuery = ref('')

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    clearError({ redirect: `/search?q=${encodeURIComponent(searchQuery.value.trim())}` })
  }
}

const handleClearError = () => {
  clearError({ redirect: '/' })
}

const handleClearErrorOnly = () => {
  clearError()
}

useHead({
  title: is404.value ? '404 - Page Not Found | RomanceToon' : 'Error | RomanceToon'
})
</script>
