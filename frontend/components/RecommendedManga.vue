<template>
  <section v-if="recommendations.length > 0" class="space-y-4 sm:space-y-6 pt-6 sm:pt-10 border-t border-night-850/80">
    <!-- Section Header -->
    <div class="flex items-center justify-between pb-3 sm:pb-4 border-b border-night-850/60">
      <div class="flex items-center space-x-2.5 sm:space-x-3">
        <div class="w-2.5 h-6 rounded-full bg-gradient-to-b from-romance-500 to-rose-600"></div>
        <div class="flex items-center space-x-2">
          <Sparkles class="w-4 h-4 sm:w-5 sm:h-5 text-romance-400" />
          <h2 class="font-serif text-lg sm:text-2xl font-bold text-white tracking-wide">
            {{ title }}
          </h2>
        </div>
      </div>
      <span class="text-xs text-night-400 font-medium">
        {{ recommendations.length }} {{ recommendations.length === 1 ? 'Title' : 'Titles' }}
      </span>
    </div>

    <!-- Recommendations Grid -->
    <div :class="gridClasses">
      <MangaCard 
        v-for="rec in recommendations" 
        :key="rec.id || rec.slug" 
        :manga="rec" 
      />
    </div>
  </section>

  <!-- Skeleton Loader while fetching mangas -->
  <div v-else-if="isLoading" class="space-y-4 pt-6 sm:pt-10 border-t border-night-850/80">
    <div class="h-6 w-48 bg-night-900 rounded-lg animate-pulse"></div>
    <div :class="gridClasses">
      <div v-for="i in (limit || 4)" :key="i" class="h-64 rounded-2xl bg-night-900/50 animate-pulse border border-night-800"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Sparkles } from '@lucide/vue'
import { useRomanceApi } from '~/composables/useApi'
import MangaCard from '~/components/MangaCard.vue'

const props = withDefaults(defineProps<{
  currentManga?: any
  title?: string
  limit?: number
  gridCols?: string
}>(), {
  title: 'You May Also Like',
  limit: 6,
  gridCols: ''
})

const { fetchMangas } = useRomanceApi()
const allMangas = useState<any[]>('global_mangas_list', () => [])
const isLoading = ref(false)

const loadMangas = async () => {
  if (allMangas.value.length === 0) {
    isLoading.value = true
    try {
      const data = await fetchMangas()
      if (Array.isArray(data)) {
        allMangas.value = data
      }
    } catch (e) {
      console.error('Error fetching mangas for recommendations:', e)
    } finally {
      isLoading.value = false
    }
  }
}

onMounted(() => {
  loadMangas()
})

// Compute recommended mangas based on similarity
const recommendations = computed(() => {
  if (!allMangas.value || allMangas.value.length === 0 || !props.currentManga) {
    return []
  }

  const current = props.currentManga
  const currentId = String(current.id || '')
  const currentSlug = String(current.slug || '')

  // Normalize current genres
  const currentGenres: string[] = Array.isArray(current.genres)
    ? current.genres.map((g: string) => String(g).toLowerCase().trim())
    : []

  // Filter out current manga
  const candidates = allMangas.value.filter((m: any) => {
    if (!m) return false
    const mId = String(m.id || '')
    const mSlug = String(m.slug || '')
    if (mId && mId === currentId) return false
    if (currentSlug && mSlug && mSlug === currentSlug) return false
    return true
  })

  // Score each candidate by similarity
  const scored = candidates.map((m: any) => {
    let score = 0
    const mGenres: string[] = Array.isArray(m.genres)
      ? m.genres.map((g: string) => String(g).toLowerCase().trim())
      : []

    // 1. Shared genres (10 points per matching genre)
    let matchingGenresCount = 0
    for (const g of currentGenres) {
      if (mGenres.includes(g)) {
        matchingGenresCount++
        score += 10
      }
    }

    // 2. Same author / artist bonus
    if (current.author && m.author && current.author.toLowerCase().trim() === m.author.toLowerCase().trim()) {
      score += 5
    }
    if (current.artist && m.artist && current.artist.toLowerCase().trim() === m.artist.toLowerCase().trim()) {
      score += 3
    }

    // 3. Rating weight
    if (m.rating) {
      score += Number(m.rating) * 1.5
    }

    // 4. Views weight (slight boost for popular works)
    if (m.views) {
      score += Math.min(Number(m.views) / 1000, 3)
    }

    // 5. Featured / Badge bonus
    if (m.badge === 'HOT' || m.badge === 'TRENDING') {
      score += 2
    }

    return {
      manga: m,
      score,
      matchingGenresCount
    }
  })

  // Sort by score descending (most similar first)
  scored.sort((a, b) => b.score - a.score)

  // Take top items up to props.limit
  return scored.slice(0, props.limit).map(s => s.manga)
})

const gridClasses = computed(() => {
  if (props.gridCols) return props.gridCols
  return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4.5'
})
</script>
