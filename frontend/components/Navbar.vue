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
          
          <!-- Desktop Search input with Live Autocomplete Dropdown -->
          <div ref="searchContainer" class="relative hidden sm:block w-44 md:w-60 lg:w-72">
            <div class="relative">
              <input 
                v-model="searchQuery"
                @focus="isFocused = true; loadCatalogIfNeeded()"
                @keyup.enter="handleSearch"
                @keydown.esc="closeSearch"
                type="text" 
                placeholder="Search romance webtoon..." 
                class="w-full bg-night-900/90 border border-night-800 rounded-full py-1.5 pl-9 pr-8 text-xs text-night-100 placeholder-night-400 focus:outline-none focus:border-romance-500/70 focus:ring-1 focus:ring-romance-500/50 transition-all"
              />
              <Search class="w-4 h-4 text-night-400 absolute left-3 top-2 pointer-events-none" />
              <button 
                v-if="searchQuery" 
                @click="searchQuery = ''; isFocused = false"
                class="absolute right-2.5 top-2 text-night-400 hover:text-white"
                type="button"
                title="Clear"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Instant Live Autocomplete Dropdown -->
            <transition name="dropdown">
              <div 
                v-if="showDropdown"
                class="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-night-900/95 backdrop-blur-xl border border-night-750/90 rounded-2xl shadow-2xl p-2 z-50 overflow-hidden"
              >
                <div class="px-2.5 py-1.5 text-[11px] font-semibold tracking-wider text-night-400 uppercase flex items-center justify-between border-b border-night-800/80 mb-1">
                  <span>Suggested Titles</span>
                  <span v-if="searchResults.length" class="text-romance-400 font-mono">{{ searchResults.length }} matches</span>
                </div>

                <!-- Loading State -->
                <div v-if="isLoadingCatalog" class="p-6 text-center text-xs text-romance-400 animate-pulse">
                  Searching webtoons...
                </div>

                <!-- Search Results List -->
                <div v-else-if="searchResults.length > 0" class="space-y-1 max-h-[360px] overflow-y-auto custom-scroll">
                  <NuxtLink 
                    v-for="manga in searchResults" 
                    :key="manga.id"
                    :to="`/webtoon/${manga.slug || manga.id}`"
                    @click="closeSearch"
                    class="flex items-center space-x-3 p-2 rounded-xl hover:bg-night-800/90 transition-all group"
                  >
                    <!-- Thumbnail Cover -->
                    <div class="w-10 h-14 rounded-lg overflow-hidden bg-night-950 shrink-0 border border-white/10 group-hover:border-romance-500/50 transition-colors">
                      <img 
                        :src="manga.cover" 
                        :alt="manga.title" 
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    </div>

                    <!-- Details -->
                    <div class="flex-1 min-w-0">
                      <h4 class="text-xs sm:text-sm font-semibold text-white group-hover:text-romance-300 transition-colors truncate">
                        {{ manga.title }}
                      </h4>
                      <div class="flex items-center space-x-2 mt-0.5 text-[11px] text-night-400">
                        <span class="flex items-center space-x-1 text-amber-400 font-medium">
                          <Star class="w-3 h-3 fill-amber-400" />
                          <span>{{ Number(manga.rating || 5.0).toFixed(1) }}</span>
                        </span>
                        <span v-if="manga.status" class="text-emerald-400 font-medium">• {{ manga.status }}</span>
                        <span v-if="manga.genres && manga.genres.length" class="truncate">• {{ manga.genres.slice(0, 2).join(', ') }}</span>
                      </div>
                    </div>

                    <ChevronRight class="w-4 h-4 text-night-500 group-hover:text-romance-400 transform group-hover:translate-x-0.5 transition-all shrink-0" />
                  </NuxtLink>
                </div>

                <!-- Empty State -->
                <div v-else class="p-5 text-center space-y-1.5">
                  <p class="text-xs text-night-300 font-medium">No titles matching "{{ searchQuery }}"</p>
                  <p class="text-[11px] text-night-500">Press Enter to search all keywords & genres</p>
                </div>

                <!-- Footer View All Action -->
                <button
                  @click="handleSearch"
                  class="w-full mt-1 pt-2 border-t border-night-800/80 px-3 py-2 text-xs font-semibold text-romance-400 hover:text-romance-300 hover:bg-night-850/60 rounded-xl flex items-center justify-between transition-colors"
                >
                  <span>View all results for "{{ searchQuery }}"</span>
                  <ArrowRight class="w-3.5 h-3.5" />
                </button>
              </div>
            </transition>
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
      <div v-if="mobileMenuOpen" class="md:hidden py-4 border-t border-night-800 space-y-3">
        <!-- Mobile Search Input with Instant Results -->
        <div class="relative px-2">
          <div class="relative">
            <input 
              v-model="searchQuery"
              @focus="loadCatalogIfNeeded"
              @keyup.enter="handleSearch"
              type="text" 
              placeholder="Search romance titles..." 
              class="w-full bg-night-900 border border-night-800 rounded-xl py-2 pl-9 pr-8 text-sm text-night-100 placeholder-night-400 focus:outline-none focus:border-romance-500"
            />
            <Search class="w-4 h-4 text-night-400 absolute left-3 top-2.5 pointer-events-none" />
            <button 
              v-if="searchQuery" 
              @click="searchQuery = ''"
              class="absolute right-2.5 top-2.5 text-night-400 hover:text-white"
              type="button"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Mobile Autocomplete Suggestions List -->
          <div v-if="searchQuery.trim()" class="mt-2 bg-night-900/95 border border-night-800 rounded-xl p-2 space-y-1">
            <div v-if="searchResults.length > 0">
              <NuxtLink 
                v-for="manga in searchResults.slice(0, 4)" 
                :key="manga.id"
                :to="`/webtoon/${manga.slug || manga.id}`"
                @click="closeSearch(); mobileMenuOpen = false"
                class="flex items-center space-x-3 p-2 rounded-lg hover:bg-night-800 transition-colors"
              >
                <img :src="manga.cover" :alt="manga.title" class="w-8 h-11 object-cover rounded shrink-0" />
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-semibold text-white truncate">{{ manga.title }}</div>
                  <div class="text-[10px] text-night-400 flex items-center space-x-1.5 mt-0.5">
                    <span class="text-amber-400">★ {{ Number(manga.rating || 5.0).toFixed(1) }}</span>
                    <span>• {{ manga.status }}</span>
                  </div>
                </div>
              </NuxtLink>

              <button 
                @click="handleSearch"
                class="w-full pt-2 border-t border-night-800 text-xs font-medium text-romance-400 text-center py-1.5 block"
              >
                View all results for "{{ searchQuery }}" →
              </button>
            </div>
            <div v-else class="text-xs text-night-400 text-center py-3">
              No titles found. Press Enter to search.
            </div>
          </div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Heart, Compass, Sparkles, Flame, Search, Bookmark, History, Menu, X, Star, ChevronRight, ArrowRight } from '@lucide/vue'
import { useReadingTracker } from '~/composables/useReadingTracker'
import { useRomanceApi } from '~/composables/useApi'

const searchQuery = ref('')
const mobileMenuOpen = ref(false)
const isFocused = ref(false)
const searchContainer = ref<HTMLElement | null>(null)

const { bookmarks, history } = useReadingTracker()
const { fetchMangas } = useRomanceApi()

const catalog = useState<any[]>('romance_catalog', () => [])
const isLoadingCatalog = ref(false)

const loadCatalogIfNeeded = async () => {
  if (catalog.value.length === 0 && !isLoadingCatalog.value) {
    isLoadingCatalog.value = true
    try {
      catalog.value = await fetchMangas()
    } catch (e) {
      console.warn('Failed to load catalog for navbar search:', e)
    } finally {
      isLoadingCatalog.value = false
    }
  }
}

const searchResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return catalog.value
    .filter((m: any) => {
      const titleMatch = m.title && m.title.toLowerCase().includes(q)
      const altMatch = Array.isArray(m.alternativeTitles) && m.alternativeTitles.some((t: string) => t.toLowerCase().includes(q))
      const authorMatch = m.author && m.author.toLowerCase().includes(q)
      const genreMatch = Array.isArray(m.genres) && m.genres.some((g: string) => g.toLowerCase().includes(q))
      return titleMatch || altMatch || authorMatch || genreMatch
    })
    .slice(0, 5)
})

const showDropdown = computed(() => {
  return isFocused.value && searchQuery.value.trim().length > 0
})

const closeSearch = () => {
  isFocused.value = false
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim()
    closeSearch()
    mobileMenuOpen.value = false
    navigateTo(`/search?q=${encodeURIComponent(q)}`)
  }
}

const handleClickOutside = (e: MouseEvent) => {
  if (searchContainer.value && !searchContainer.value.contains(e.target as Node)) {
    isFocused.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
  loadCatalogIfNeeded()
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>
