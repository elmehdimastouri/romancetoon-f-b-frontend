<template>
  <div class="space-y-8 max-w-7xl mx-auto py-4">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-night-850">
      <div>
        <div class="flex items-center space-x-3 mb-2">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-romance-600 to-rose-400 flex items-center justify-center shadow-glow-pink">
            <History class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              سجل القراءة <span class="text-romance-400 font-sans text-xl sm:text-2xl font-normal">/ Reading History</span>
            </h1>
            <p class="text-xs sm:text-sm text-night-400 mt-0.5">
              يتم حفظ آخر فصل قرأته تلقائياً على جهازك لتتمكن من إكمال القراءة فوراً من حيث توقفت.
            </p>
          </div>
        </div>
      </div>

      <!-- Action items (Search & Clear) -->
      <div v-if="history.length > 0" class="flex flex-wrap items-center gap-2.5">
        <!-- Search inside history -->
        <div class="relative w-full sm:w-48 md:w-56">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="بحث في السجل..." 
            class="w-full bg-night-900 border border-night-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-night-500 focus:outline-none focus:border-romance-500/70"
          />
          <Search class="w-4 h-4 text-night-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <!-- Clear all history button -->
        <button 
          @click="confirmClear"
          class="px-3.5 py-2 rounded-xl bg-night-900 hover:bg-rose-950/40 text-night-400 hover:text-rose-400 border border-night-800 hover:border-rose-900/50 text-xs font-medium transition-colors flex items-center space-x-1.5"
          title="مسح سجل القراءة بالكامل"
        >
          <Trash2 class="w-3.5 h-3.5" />
          <span>مسح السجل</span>
        </button>
      </div>
    </div>

    <!-- Stats Bar -->
    <div v-if="history.length > 0" class="flex items-center justify-between text-xs text-night-400 px-1">
      <div class="flex items-center space-x-2">
        <span class="px-2.5 py-0.5 rounded-full bg-romance-600/20 text-romance-300 font-mono font-semibold border border-romance-500/30">
          {{ filteredHistory.length }}
        </span>
        <span>عمل قيد المتابعة</span>
      </div>

      <div class="text-[11px] text-night-500">
        يتم التحديث تلقائياً بمجرد فتح أي فصل
      </div>
    </div>

    <!-- History List / Grid -->
    <div v-if="filteredHistory.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div 
        v-for="item in filteredHistory" 
        :key="item.id"
        class="group flex rounded-2xl bg-night-900 border border-night-800/80 hover:border-romance-500/50 p-3 sm:p-4 gap-4 transition-all duration-300 hover:shadow-glow-pink relative"
      >
        <!-- Cover thumbnail -->
        <NuxtLink 
          :to="`/webtoon/${item.slug || item.id}`"
          class="w-24 sm:w-28 aspect-[3/4] rounded-xl overflow-hidden bg-night-950 shrink-0 relative group-hover:scale-102 transition-transform"
        >
          <img 
            :src="item.cover" 
            :alt="item.title" 
            loading="lazy"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </NuxtLink>

        <!-- Information & Actions -->
        <div class="flex flex-col justify-between flex-1 min-w-0">
          <div class="space-y-1.5">
            <!-- Title & Remove button -->
            <div class="flex items-start justify-between gap-2">
              <NuxtLink :to="`/webtoon/${item.slug || item.id}`" class="block min-w-0">
                <h3 class="font-serif font-bold text-sm sm:text-base text-white hover:text-romance-400 transition-colors truncate">
                  {{ item.title }}
                </h3>
              </NuxtLink>

              <button 
                @click.stop.prevent="removeFromHistory(item.id)"
                class="p-1 rounded-lg text-night-500 hover:text-rose-400 hover:bg-night-800 transition-colors shrink-0"
                title="حذف من السجل"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>

            <!-- Chapter progress tag -->
            <div class="flex flex-wrap items-center gap-2 pt-1">
              <span class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-romance-600/20 border border-romance-500/40 text-romance-300 font-mono text-xs font-bold">
                <BookOpen class="w-3.5 h-3.5" />
                <span>آخر فصل: {{ item.chapterNumber }}</span>
              </span>

              <span class="text-[11px] text-night-400 flex items-center space-x-1">
                <Clock class="w-3 h-3 text-night-500" />
                <span>{{ formatTimeAgo(item.lastReadAt) }}</span>
              </span>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="flex items-center gap-2 pt-3 border-t border-night-800/60 mt-2">
            <!-- Direct Continue Reading button -->
            <NuxtLink 
              :to="`/webtoon/${item.slug || item.id}/chapter-${item.chapterNumber}`"
              class="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-romance-600 to-rose-500 hover:from-romance-500 hover:to-rose-400 text-white font-semibold text-xs shadow-glow-pink flex items-center justify-center space-x-1.5 transition-all transform hover:-translate-y-0.5"
            >
              <Play class="w-3.5 h-3.5 fill-white" />
              <span>متابعة القراءة (فصل {{ item.chapterNumber }})</span>
            </NuxtLink>

            <!-- Details button -->
            <NuxtLink 
              :to="`/webtoon/${item.slug || item.id}`"
              class="py-2 px-3 rounded-xl bg-night-850 hover:bg-night-800 border border-night-800 text-night-300 hover:text-white text-xs font-medium transition-colors"
              title="صفحة المانهوا"
            >
              <span>التفاصيل</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-20 px-4 rounded-3xl glass-panel border border-night-800/80 max-w-xl mx-auto space-y-5">
      <div class="w-16 h-16 rounded-3xl bg-romance-600/10 border border-romance-500/20 flex items-center justify-center mx-auto text-romance-400 shadow-glow-pink">
        <Clock class="w-8 h-8" />
      </div>
      <div class="space-y-2">
        <h3 class="text-xl font-serif font-bold text-white">
          سجل القراءة فارغ حتى الآن
        </h3>
        <p class="text-xs sm:text-sm text-night-400 max-w-md mx-auto leading-relaxed">
          بمجرد فتح أي فصل من فصول الويبتون أو المانهوا، سيتم حفظ مكان توقفك هنا تلقائياً حتى يسهل عليك إكمال القراءة بنقرة واحدة بدون أي عناء.
        </p>
      </div>
      <div>
        <NuxtLink 
          to="/"
          class="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-romance-600 to-rose-500 hover:from-romance-500 hover:to-rose-400 text-white font-semibold text-xs shadow-glow-pink transition-transform transform hover:-translate-y-0.5"
        >
          <Sparkles class="w-4 h-4" />
          <span>ابدأ قراءة مانهوا الآن</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { History, Clock, BookOpen, Play, Trash2, Search, Sparkles } from '@lucide/vue'
import { useReadingTracker } from '~/composables/useReadingTracker'

useHead({
  title: 'سجل القراءة | RomanceToon',
  meta: [
    { name: 'description', content: 'سجل القراءة لمتابعة فصول المانهوا والويبتون من حيث توقفت.' }
  ]
})

const { history, removeFromHistory, clearHistory, formatTimeAgo } = useReadingTracker()

const searchQuery = ref('')

const confirmClear = () => {
  if (confirm('هل أنت متأكد من رغبتك في مسح سجل القراءة بالكامل؟')) {
    clearHistory()
  }
}

const filteredHistory = computed(() => {
  if (!searchQuery.value.trim()) return history.value
  const q = searchQuery.value.toLowerCase().trim()
  return history.value.filter(h => h.title.toLowerCase().includes(q))
})
</script>
