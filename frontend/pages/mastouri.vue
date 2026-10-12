<template>
  <div class="min-h-screen py-8 max-w-6xl mx-auto space-y-8 font-sans">
    
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-night-850 gap-4">
      <div>
        <div class="flex items-center space-x-2">
          <ShieldCheck class="w-6 h-6 text-romance-400" />
          <h1 class="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
            Romance<span class="text-romance-400">Toon</span> Control Hub
          </h1>
        </div>
        <p class="text-xs text-night-400 mt-1">Management Portal &bull; Route: <code class="text-romance-300 font-mono">/mastouri</code></p>
      </div>

      <!-- Quick stats badges -->
      <div class="flex items-center space-x-3 text-xs">
        <div class="px-3 py-1.5 rounded-xl bg-night-900 border border-night-800 flex items-center space-x-2">
          <BookOpen class="w-4 h-4 text-romance-400" />
          <span class="text-white font-bold">{{ mangas.length }} Titles</span>
        </div>
        <NuxtLink to="/" class="px-3 py-1.5 rounded-xl bg-night-850 hover:bg-night-800 text-night-200 border border-night-700 transition-colors flex items-center space-x-1.5">
          <ExternalLink class="w-3.5 h-3.5" />
          <span>View Live Site</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Security Check (PIN Gate) -->
    <div v-if="!isAuthenticated" class="max-w-md mx-auto p-8 rounded-3xl glass-panel text-center space-y-6 shadow-2xl border border-white/10 mt-12">
      <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-romance-600 to-rose-400 flex items-center justify-center mx-auto shadow-glow-pink">
        <Lock class="w-7 h-7 text-white" />
      </div>
      
      <div>
        <h2 class="font-serif text-xl font-bold text-white">Administrator Access</h2>
        <p class="text-xs text-night-400 mt-1">Please enter your management key to unlock the dashboard</p>
      </div>

      <form @submit.prevent="authenticate" class="space-y-4">
        <input 
          v-model="pinInput"
          type="password" 
          placeholder="Enter Passkey (Default: mastouri2026)"
          class="w-full bg-night-900 border border-night-800 rounded-xl px-4 py-3 text-sm text-center text-white placeholder-night-500 focus:outline-none focus:border-romance-500 transition-colors"
          autofocus
        />
        <button 
          type="submit"
          class="w-full py-3 rounded-xl bg-gradient-to-r from-romance-600 to-rose-500 hover:from-romance-500 hover:to-rose-400 text-white font-semibold text-xs shadow-glow-pink transition-all"
        >
          Unlock Dashboard
        </button>
      </form>
      <p v-if="authError" class="text-xs text-rose-400 font-medium">Incorrect passkey. Please try again.</p>
    </div>

    <!-- Authenticated Admin Dashboard -->
    <div v-else class="space-y-10">
      
      <!-- Top Action Tabs -->
      <div class="flex items-center space-x-3 border-b border-night-850 pb-2">
        <button 
          @click="activeTab = 'add-manga'"
          :class="[
            'px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all',
            activeTab === 'add-manga'
              ? 'bg-romance-600 text-white shadow-glow-pink'
              : 'bg-night-900 text-night-400 hover:text-white border border-night-800'
          ]"
        >
          <PlusCircle class="w-4 h-4" />
          <span>New Webtoon Title</span>
        </button>

        <button 
          @click="activeTab = 'sync-chapter'"
          :class="[
            'px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all',
            activeTab === 'sync-chapter'
              ? 'bg-romance-600 text-white shadow-glow-pink'
              : 'bg-night-900 text-night-400 hover:text-white border border-night-800'
          ]"
        >
          <CloudUpload class="w-4 h-4" />
          <span>Sync Chapters from Cloudflare R2</span>
        </button>

        <button 
          @click="activeTab = 'manage-titles'"
          :class="[
            'px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all',
            activeTab === 'manage-titles'
              ? 'bg-romance-600 text-white shadow-glow-pink'
              : 'bg-night-900 text-night-400 hover:text-white border border-night-800'
          ]"
        >
          <Layers class="w-4 h-4" />
          <span>Manage Existing Titles ({{ mangas.length }})</span>
        </button>
      </div>

      <!-- TAB 1: Add New Webtoon Title -->
      <div v-if="activeTab === 'add-manga'" class="p-6 sm:p-8 rounded-3xl glass-panel space-y-6">
        <div>
          <h2 class="font-serif text-xl font-bold text-white flex items-center space-x-2">
            <Sparkles class="w-5 h-5 text-romance-400" />
            <span>Create New Romance Webtoon</span>
          </h2>
          <p class="text-xs text-night-400 mt-1">Fill in the romance title details to publish it instantly</p>
        </div>

        <form @submit.prevent="createManga" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Title -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-night-200">Main Title *</label>
              <input 
                v-model="newManga.title" 
                type="text" 
                required 
                placeholder="e.g. Under the Duke's Enchanted Petals"
                class="w-full bg-night-900 border border-night-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-night-500 focus:outline-none focus:border-romance-500"
              />
            </div>

            <!-- Alternative Titles -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-night-200">Alternative Titles (comma separated)</label>
              <input 
                v-model="newManga.alternativeTitles" 
                type="text" 
                placeholder="e.g. The Duke's Secret, Rose Contract"
                class="w-full bg-night-900 border border-night-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-night-500 focus:outline-none focus:border-romance-500"
              />
            </div>

            <!-- Cover Image URL -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-night-200">Cover Poster URL (WebP/JPG) *</label>
              <input 
                v-model="newManga.cover" 
                type="url" 
                required 
                placeholder="https://cdn.romancetoon.com/covers/cover_01.webp"
                class="w-full bg-night-900 border border-night-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-night-500 focus:outline-none focus:border-romance-500"
              />
            </div>

            <!-- Banner Image URL -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-night-200">Hero Banner URL (Optional)</label>
              <input 
                v-model="newManga.banner" 
                type="url" 
                placeholder="https://cdn.romancetoon.com/banners/banner_01.webp"
                class="w-full bg-night-900 border border-night-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-night-500 focus:outline-none focus:border-romance-500"
              />
            </div>

            <!-- Author -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-night-200">Author</label>
              <input 
                v-model="newManga.author" 
                type="text" 
                placeholder="e.g. Clara Delacroix"
                class="w-full bg-night-900 border border-night-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-night-500 focus:outline-none focus:border-romance-500"
              />
            </div>

            <!-- Artist -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-night-200">Artist / Studio</label>
              <input 
                v-model="newManga.artist" 
                type="text" 
                placeholder="e.g. Studio Rosebloom"
                class="w-full bg-night-900 border border-night-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-night-500 focus:outline-none focus:border-romance-500"
              />
            </div>
          </div>

          <!-- Synopsis -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-night-200">Story Synopsis *</label>
            <textarea 
              v-model="newManga.synopsis" 
              rows="3" 
              required
              placeholder="Write a captivating romance description..."
              class="w-full bg-night-900 border border-night-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-night-500 focus:outline-none focus:border-romance-500"
            ></textarea>
          </div>

          <!-- Genres Selection -->
          <div class="space-y-2">
            <label class="text-xs font-semibold text-night-200">Select Romance Tropes & Genres</label>
            <div class="flex flex-wrap gap-2">
              <button 
                type="button"
                v-for="g in availableGenres" 
                :key="g"
                @click="toggleGenre(g)"
                :class="[
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                  newManga.selectedGenres.includes(g)
                    ? 'bg-romance-600/30 border-romance-500 text-romance-300 font-bold'
                    : 'bg-night-900 border-night-800 text-night-400 hover:text-white'
                ]"
              >
                {{ g }}
              </button>
            </div>
          </div>

          <div class="flex justify-end pt-4 border-t border-night-850">
            <button 
              type="submit"
              class="px-8 py-3 rounded-xl bg-gradient-to-r from-romance-600 to-rose-500 hover:from-romance-500 text-white font-semibold text-xs shadow-glow-pink flex items-center space-x-2 transition-all"
            >
              <CheckCircle class="w-4 h-4" />
              <span>Publish Webtoon Title</span>
            </button>
          </div>
        </form>
      </div>

      <!-- TAB 2: Sync Chapters from Cloudflare R2 -->
      <div v-if="activeTab === 'sync-chapter'" class="p-6 sm:p-8 rounded-3xl glass-panel space-y-6">
        <div>
          <h2 class="font-serif text-xl font-bold text-white flex items-center space-x-2">
            <CloudUpload class="w-5 h-5 text-romance-400" />
            <span>Sync Chapter Pages from Cloudflare R2</span>
          </h2>
          <p class="text-xs text-night-400 mt-1">
            Specify the manga and chapter folder path in your R2 bucket. The system will automatically fetch all images in sequence!
          </p>
        </div>

        <form @submit.prevent="syncR2Chapter" class="space-y-6 max-w-2xl">
          <!-- Select Target Manga -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-night-200">Target Webtoon Title *</label>
            <select 
              v-model="syncForm.mangaId" 
              required
              class="w-full bg-night-900 border border-night-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-romance-500"
            >
              <option value="" disabled>Select a manga...</option>
              <option v-for="m in mangas" :key="m.id" :value="m.id">
                {{ m.title }} (ID: {{ m.id }})
              </option>
            </select>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Chapter Number -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-night-200">Chapter Number *</label>
              <input 
                v-model="syncForm.chapterNumber" 
                type="number" 
                min="1" 
                required 
                placeholder="e.g. 1"
                class="w-full bg-night-900 border border-night-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-night-500 focus:outline-none focus:border-romance-500"
              />
            </div>

            <!-- Chapter Title -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-night-200">Chapter Title (Optional)</label>
              <input 
                v-model="syncForm.chapterTitle" 
                type="text" 
                placeholder="e.g. The Midnight Encounter"
                class="w-full bg-night-900 border border-night-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-night-500 focus:outline-none focus:border-romance-500"
              />
            </div>
          </div>

          <!-- R2 Folder Explanation -->
          <div class="p-4 rounded-xl bg-night-900/80 border border-night-800 space-y-2 text-xs">
            <div class="flex items-center space-x-2 text-romance-400 font-semibold">
              <FolderKanban class="w-4 h-4" />
              <span>Target R2 Path Preview</span>
            </div>
            <code class="block font-mono text-[11px] text-night-300 bg-night-950 p-2.5 rounded-lg border border-night-800">
              {{ syncForm.mangaId || 'manga_611ac7d4f93e7' }}/{{ syncForm.chapterNumber || '1' }}/[001.webp, 002.webp...]
            </code>
            <p class="text-[11px] text-night-400">
              The system connects to your Cloudflare R2 bucket and registers all pages in order.
            </p>
          </div>

          <button 
            type="submit"
            :disabled="isSyncing"
            class="px-8 py-3 rounded-xl bg-gradient-to-r from-romance-600 to-rose-500 hover:from-romance-500 text-white font-semibold text-xs shadow-glow-pink flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <RefreshCw :class="['w-4 h-4', isSyncing ? 'animate-spin' : '']" />
            <span>{{ isSyncing ? 'Syncing Pages from R2...' : 'Fetch & Save Chapter' }}</span>
          </button>
        </form>

        <div v-if="syncSuccessMessage" class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
          {{ syncSuccessMessage }}
        </div>
      </div>

      <!-- TAB 3: Manage Existing Titles List -->
      <div v-if="activeTab === 'manage-titles'" class="p-6 sm:p-8 rounded-3xl glass-panel space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="font-serif text-xl font-bold text-white">All Published Romance Titles</h2>
          <span class="text-xs text-night-400 font-mono">{{ mangas.length }} total</span>
        </div>

        <div class="divide-y divide-night-800">
          <div 
            v-for="manga in mangas" 
            :key="manga.id"
            class="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div class="flex items-center space-x-4">
              <img :src="manga.cover" :alt="manga.title" class="w-12 h-16 object-cover rounded-lg bg-night-900 border border-night-800" />
              <div>
                <h4 class="text-sm font-semibold text-white">{{ manga.title }}</h4>
                <p class="text-xs text-night-400 font-mono">ID: {{ manga.id }} &bull; {{ manga.chapters.length }} Chapters</p>
                <div class="flex gap-1.5 mt-1">
                  <span v-for="g in manga.genres.slice(0, 3)" :key="g" class="text-[10px] px-2 py-0.5 rounded bg-night-800 text-night-300">
                    {{ g }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <NuxtLink :to="`/manga/${manga.id}`" target="_blank" class="p-2 rounded-lg bg-night-850 hover:bg-night-800 text-night-300 hover:text-white transition-colors" title="View details">
                <ExternalLink class="w-4 h-4" />
              </NuxtLink>
              <button @click="quickSync(manga.id)" class="px-3 py-1.5 rounded-lg bg-night-850 hover:bg-night-800 border border-night-800 text-xs text-romance-400 font-medium">
                + Add Chapter
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { sampleMangas } from '~/data/mangas'
import { 
  ShieldCheck, Lock, BookOpen, ExternalLink, Sparkles, 
  PlusCircle, CloudUpload, Layers, CheckCircle, FolderKanban, RefreshCw 
} from '@lucide/vue'

// Set page title
useHead({
  title: 'RomanceToon Management Hub | /mastouri'
})

// Authentication Gate
const isAuthenticated = ref(false)
const pinInput = ref('')
const authError = ref(false)

const authenticate = () => {
  // Default master passkey: mastouri2026
  if (pinInput.value.trim() === 'mastouri2026' || pinInput.value.trim() === 'mastouri') {
    isAuthenticated.value = true
    authError.value = false
  } else {
    authError.value = true
  }
}

// Active Tab
const activeTab = ref<'add-manga' | 'sync-chapter' | 'manage-titles'>('add-manga')

// Reactive mangas list
const mangas = ref([...sampleMangas])

// Available Romance Genres
const availableGenres = [
  'Romance', 'CEO & Drama', 'Contract Marriage', 'Historical', 
  'Villainess', 'Royalty', 'Cozy Fantasy', 'Slow Burn', 
  'Enemies to Lovers', 'Modern Romance', 'Magic'
]

// Form: New Manga
const newManga = reactive({
  title: '',
  alternativeTitles: '',
  cover: '',
  banner: '',
  author: '',
  artist: '',
  synopsis: '',
  selectedGenres: ['Romance']
})

const toggleGenre = (genre: string) => {
  const idx = newManga.selectedGenres.indexOf(genre)
  if (idx > -1) {
    if (newManga.selectedGenres.length > 1) {
      newManga.selectedGenres.splice(idx, 1)
    }
  } else {
    newManga.selectedGenres.push(genre)
  }
}

const createManga = () => {
  const id = `manga_${Date.now().toString(16)}`
  const created = {
    id,
    slug: newManga.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    title: newManga.title,
    alternativeTitles: newManga.alternativeTitles ? newManga.alternativeTitles.split(',').map(s => s.trim()) : [],
    cover: newManga.cover,
    banner: newManga.banner || newManga.cover,
    synopsis: newManga.synopsis,
    author: newManga.author || 'Author',
    artist: newManga.artist || 'Studio',
    genres: [...newManga.selectedGenres],
    rating: 5.0,
    ratingCount: '1',
    status: 'Ongoing' as const,
    views: '1',
    bookmarks: '0',
    badge: 'NEW' as const,
    chapters: []
  }

  mangas.value.unshift(created)
  alert(`"${created.title}" was successfully created and published! ID: ${created.id}`)
  
  // Reset form
  newManga.title = ''
  newManga.alternativeTitles = ''
  newManga.cover = ''
  newManga.banner = ''
  newManga.synopsis = ''
  activeTab.value = 'manage-titles'
}

// Form: Sync Chapter from R2
const syncForm = reactive({
  mangaId: '',
  chapterNumber: 1,
  chapterTitle: ''
})

const isSyncing = ref(false)
const syncSuccessMessage = ref('')

const quickSync = (mangaId: string) => {
  syncForm.mangaId = mangaId
  activeTab.value = 'sync-chapter'
}

const syncR2Chapter = () => {
  isSyncing.value = true
  syncSuccessMessage.value = ''

  setTimeout(() => {
    isSyncing.value = false
    const targetManga = mangas.value.find(m => m.id === syncForm.mangaId)
    if (targetManga) {
      const chNumber = syncForm.chapterNumber
      const newCh = {
        id: chNumber.toString(),
        number: chNumber,
        title: syncForm.chapterTitle || `Chapter ${chNumber}`,
        releaseDate: 'Just now',
        views: '1',
        pagesCount: 5
      }
      targetManga.chapters.push(newCh)
      targetManga.chapters.sort((a, b) => a.number - b.number)
      syncSuccessMessage.value = `✔ Chapter ${chNumber} successfully registered and synced for "${targetManga.title}"!`
    }
  }, 1200)
}
</script>
