<template>
  <div v-if="manga && currentChapter">
    <WebtoonReader 
      :manga="manga" 
      :currentChapter="currentChapter" 
    />
  </div>
  <div v-else-if="isLoading" class="min-h-screen flex items-center justify-center bg-night-950">
    <div class="text-center space-y-3">
      <div class="w-10 h-10 border-4 border-romance-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-romance-300 text-xs font-medium">Loading chapter pages...</p>
    </div>
  </div>
  <div v-else class="min-h-screen flex items-center justify-center text-center p-6 bg-night-950">
    <div class="max-w-md p-8 rounded-3xl glass-panel space-y-4 border border-night-800">
      <h3 class="font-serif text-lg font-bold text-white">Chapter Not Found</h3>
      <p class="text-night-400 text-xs">
        Chapter "{{ chapterNumber }}" for "{{ slug }}" could not be loaded or has not been published yet.
      </p>
      <NuxtLink :to="`/webtoon/${slug}`" class="inline-block px-5 py-2.5 rounded-xl bg-romance-600 text-white text-xs font-semibold">
        Back to Webtoon Index
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRomanceApi } from '~/composables/useApi'
import { useReadingTracker } from '~/composables/useReadingTracker'
import { useSeo } from '~/composables/useSeo'

definePageMeta({
  layout: 'reader'
})

const route = useRoute()
const { SITE_NAME, cleanDescription, getCanonicalUrl, getComicIssueSchema, getBreadcrumbSchema } = useSeo()

const slug = computed(() => {
  const s = route.params.slug
  return (Array.isArray(s) ? s[0] : s) || ''
})

const rawChapter = computed(() => {
  const c = route.params.chapterId
  return (Array.isArray(c) ? c[0] : c) || ''
})

// Extract chapter number cleanly: "chapter-1" -> "1", or "chapter-1.5" -> "1.5"
const chapterNumber = computed(() => {
  const str = rawChapter.value
  if (!str) return ''
  const match = str.match(/(\d+(?:\.\d+)?)/)
  return match ? match[1] : str
})

const { fetchChapter, recordView } = useRomanceApi()
const { recordHistory } = useReadingTracker()

const { data: chapterData, status } = await useAsyncData(
  () => `chapter-${slug.value}-${chapterNumber.value}`,
  async () => {
    if (!slug.value || !chapterNumber.value) return null
    return await fetchChapter(slug.value, chapterNumber.value)
  },
  { watch: [slug, chapterNumber] }
)

const manga = computed(() => {
  const m = chapterData.value?.manga
  if (m && !m.cover) {
    const catalog = useState<any[]>('global_mangas_list', () => []).value
    const found = catalog.find((c: any) => c && (c.id === m.id || c.slug === m.slug || c.slug === slug.value))
    if (found && found.cover) {
      m.cover = found.cover
    }
  }
  return m || null
})

const currentChapter = computed(() => chapterData.value?.chapter || null)
const isLoading = computed(() => status.value === 'pending')

const trackClientReading = () => {
  if (process.client && manga.value && currentChapter.value) {
    recordHistory(manga.value, currentChapter.value)
    recordView(manga.value.id, currentChapter.value.number)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
}

onMounted(() => {
  trackClientReading()
})

watch(() => currentChapter.value, () => {
  trackClientReading()
})

useHead(() => {
  if (!manga.value || !currentChapter.value) {
    return {
      title: `Read Chapter ${chapterNumber.value} Online - ${SITE_NAME}`,
      meta: [{ name: 'robots', content: 'noindex, follow' }]
    }
  }

  const m = manga.value
  const c = currentChapter.value
  const chapterHeading = `Read ${m.title} Chapter ${c.number} Online`
  const pageTitle = `${chapterHeading} - ${SITE_NAME}`
  const pageDesc = cleanDescription(
    `Read ${m.title} Chapter ${c.number} online in English with full-color HD pages. Next chapter and all episodes available at RomanceToon.`
  )
  const canonicalUrl = getCanonicalUrl(`/webtoon/${m.slug || m.id}/chapter-${c.number}`)
  const coverImage = m.cover || 'https://romancetoon.com/icon-512.png'

  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: m.title, path: `/webtoon/${m.slug || m.id}` },
    { name: chapterHeading, path: `/webtoon/${m.slug || m.id}/chapter-${c.number}` }
  ])

  const chapterSchema = getComicIssueSchema(m, c)
  if (chapterSchema) {
    chapterSchema.name = chapterHeading
  }

  return {
    title: pageTitle,
    meta: [
      { name: 'description', content: pageDesc },
      { name: 'keywords', content: `${m.title} chapter ${c.number}, read ${m.title} ${c.number}, ${m.title} ch ${c.number}, ${m.title} manga online` },
      { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
      // Open Graph
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:type', content: 'article' },
      { property: 'og:title', content: pageTitle },
      { property: 'og:description', content: pageDesc },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:image', content: coverImage },
      { property: 'og:locale', content: 'en_US' },
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@RomanceToon' },
      { name: 'twitter:title', content: pageTitle },
      { name: 'twitter:description', content: pageDesc },
      { name: 'twitter:image', content: coverImage }
    ],
    link: [
      { rel: 'canonical', href: canonicalUrl }
    ],
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(breadcrumbs)
      },
      ...(chapterSchema ? [{
        type: 'application/ld+json',
        children: JSON.stringify(chapterSchema)
      }] : [])
    ]
  }
})
</script>
