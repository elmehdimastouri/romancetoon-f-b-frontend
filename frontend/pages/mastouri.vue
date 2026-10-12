<template>
  <div class="min-h-screen py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
    
    <!-- Top Header Bar -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-night-850 gap-4">
      <div>
        <div class="flex items-center space-x-2.5">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-romance-600 to-rose-400 flex items-center justify-center shadow-glow-pink">
            <ShieldCheck class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
              Romance<span class="text-romance-400">Toon</span> Publisher Suite
            </h1>
          </div>
        </div>
        <p class="text-xs text-night-400 mt-1">Connected Live to: <code class="text-emerald-400 font-mono">https://api.romancetoon.com</code></p>
      </div>

      <!-- Action items & Live Site link -->
      <div class="flex items-center space-x-3 text-xs">
        <div class="px-3 py-1.5 rounded-xl bg-night-900 border border-night-800 flex items-center space-x-2">
          <BookOpen class="w-4 h-4 text-romance-400" />
          <span class="text-white font-bold">{{ mangas.length }} Live Titles</span>
        </div>
        <NuxtLink to="/" target="_blank" class="px-3.5 py-1.5 rounded-xl bg-night-850 hover:bg-night-800 text-night-200 border border-night-700 transition-colors flex items-center space-x-1.5">
          <ExternalLink class="w-3.5 h-3.5" />
          <span>View Live Site</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Security Check Gate (Passkey) -->
    <div v-if="!isAuthenticated" class="max-w-md mx-auto p-8 rounded-3xl glass-panel text-center space-y-6 shadow-2xl border border-white/10 mt-16">
      <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-romance-600 to-rose-500 flex items-center justify-center mx-auto shadow-glow-pink">
        <Lock class="w-8 h-8 text-white" />
      </div>
      
      <div>
        <h2 class="font-serif text-xl font-bold text-white">Publisher Access Required</h2>
        <p class="text-xs text-night-400 mt-1">Please enter your passkey to manage romance titles</p>
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
          Unlock Publisher Suite
        </button>
      </form>
      <p v-if="authError" class="text-xs text-rose-400 font-medium">Incorrect passkey. Please try again.</p>
    </div>

    <!-- Main Publisher Suite Dashboard -->
    <div v-else class="space-y-8">
      
      <!-- Navigation Tabs -->
      <div class="flex flex-wrap items-center gap-2 border-b border-night-850 pb-3">
        <button 
          @click="activeTab = 'create'"
          :class="[
            'px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all',
            activeTab === 'create'
              ? 'bg-romance-600 text-white shadow-glow-pink'
              : 'bg-night-900 text-night-400 hover:text-white border border-night-800'
          ]"
        >
          <PlusCircle class="w-4 h-4" />
          <span>{{ editingMangaId ? 'Edit Title Details' : 'New Webtoon Title' }}</span>
        </button>

        <button 
          @click="activeTab = 'scan'"
          :class="[
            'px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all',
            activeTab === 'scan'
              ? 'bg-romance-600 text-white shadow-glow-pink'
              : 'bg-night-900 text-night-400 hover:text-white border border-night-800'
          ]"
        >
          <SearchCode class="w-4 h-4 text-romance-300" />
          <span>Scan Cloudflare R2 & Selective Publishing</span>
        </button>

        <button 
          @click="activeTab = 'manage'"
          :class="[
            'px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all',
            activeTab === 'manage'
              ? 'bg-romance-600 text-white shadow-glow-pink'
              : 'bg-night-900 text-night-400 hover:text-white border border-night-800'
          ]"
        >
          <Layers class="w-4 h-4" />
          <span>Manage Titles ({{ mangas.length }})</span>
        </button>
      </div>

      <!-- TAB 1: Create or Edit Romance Title -->
      <div v-if="activeTab === 'create'" class="p-6 sm:p-8 rounded-3xl glass-panel space-y-6">
        <div class="flex items-center justify-between pb-4 border-b border-night-850">
          <div>
            <h2 class="font-serif text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <Sparkles class="w-5 h-5 text-romance-400" />
              <span>{{ editingMangaId ? 'Edit Webtoon Details' : 'Publish New Romance Webtoon' }}</span>
            </h2>
            <p class="text-xs text-night-400 mt-1">Configure metadata to save directly to your live MySQL database</p>
          </div>

          <button 
            v-if="editingMangaId" 
            @click="cancelEdit"
            class="px-3.5 py-1.5 rounded-xl bg-night-850 hover:bg-night-800 text-xs text-night-300 hover:text-white border border-night-700"
          >
            Cancel Edit
          </button>
        </div>

        <form @submit.prevent="handleSaveManga" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <!-- Main Title -->
            <div class="space-y-1.5 lg:col-span-2">
              <label class="text-xs font-semibold text-night-200">Main Title (اسم العمل الخاص) *</label>
              <input 
                v-model="form.title" 
                type="text" 
                required 
                placeholder="e.g. Under the Duke's Enchanted Petals"
                class="w-full bg-night-900 border border-night-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-night-500 focus:outline-none focus:border-romance-500"
              />
            </div>

            <!-- R2 Manga Folder ID -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-romance-300 flex items-center space-x-1">
                <span>R2 Folder ID (معرف المانجا في R2) *</span>
              </label>
              <input 
                v-model="form.r2FolderId" 
                type="text" 
                placeholder="e.g. manga_611ac7d4f93e7"
                class="w-full bg-night-900 border border-romance-500/40 rounded-xl px-4 py-2.5 text-xs text-white placeholder-night-500 font-mono focus:outline-none focus:border-romance-500"
              />
            </div>

            <!-- Alternative Titles -->
            <div class="space-y-1.5 lg:col-span-2">
              <label class="text-xs font-semibold text-night-200">Alternative Titles (أسماء بديلة - مفصولة بفواصل)</label>
              <input 
                v-model="form.alternativeTitles" 
                type="text" 
                placeholder="e.g. The Duke's Secret Garden, Rose Contract Wife"
                class="w-full bg-night-900 border border-night-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-night-500 focus:outline-none focus:border-romance-500"
              />
            </div>

            <!-- Release Year -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-night-200">Release Year (سنة الإصدار)</label>
              <input 
                v-model="form.releaseYear" 
                type="text" 
                placeholder="e.g. 2026"
                class="w-full bg-night-900 border border-night-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-night-500 focus:outline-none focus:border-romance-500"
              />
            </div>

            <!-- Author -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-night-200">Author (المؤلف)</label>
              <input 
                v-model="form.author" 
                type="text" 
                placeholder="e.g. Clara Delacroix"
                class="w-full bg-night-900 border border-night-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-night-500 focus:outline-none focus:border-romance-500"
              />
            </div>

            <!-- Artist -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-night-200">Artist (الرسام)</label>
              <input 
                v-model="form.artist" 
                type="text" 
                placeholder="e.g. Studio Rosebloom"
                class="w-full bg-night-900 border border-night-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-night-500 focus:outline-none focus:border-romance-500"
              />
            </div>

            <!-- Status -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-night-200">Status (الحالة)</label>
              <select 
                v-model="form.status" 
                class="w-full bg-night-900 border border-night-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-romance-500"
              >
                <option value="Ongoing">Ongoing (مستمر)</option>
                <option value="Completed">Completed (مكتمل)</option>
                <option value="Hiatus">Hiatus (متوقف مؤقتاً)</option>
              </select>
            </div>

            <!-- Cover Image URL -->
            <div class="space-y-1.5 lg:col-span-2">
              <label class="text-xs font-semibold text-night-200">Cover URL (رابط الغلاف من R2 أو خارجي) *</label>
              <input 
                v-model="form.cover" 
                type="url" 
                required 
                placeholder="https://cdn.romancetoon.com/covers/duke_cover.webp"
                class="w-full bg-night-900 border border-night-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-night-500 focus:outline-none focus:border-romance-500"
              />
            </div>

            <!-- Badge -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-night-200">Badge (شارة العمل)</label>
              <select 
                v-model="form.badge" 
                class="w-full bg-night-900 border border-night-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-romance-500"
              >
                <option value="NEW">NEW</option>
                <option value="HOT">HOT</option>
                <option value="TRENDING">TRENDING</option>
                <option value="EXCLUSIVE">EXCLUSIVE</option>
              </select>
            </div>
          </div>

          <!-- Banner URL -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-night-200">Hero Banner URL (رابط البانر العريض - اختياري)</label>
            <input 
              v-model="form.banner" 
              type="url" 
              placeholder="https://cdn.romancetoon.com/banners/duke_banner.webp"
              class="w-full bg-night-900 border border-night-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-night-500 focus:outline-none focus:border-romance-500"
            />
          </div>

          <!-- Synopsis -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-night-200">Synopsis (النبذة وقصة العمل) *</label>
            <textarea 
              v-model="form.synopsis" 
              rows="3" 
              required
              placeholder="Write an enchanting story description..."
              class="w-full bg-night-900 border border-night-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-night-500 focus:outline-none focus:border-romance-500"
            ></textarea>
          </div>

          <!-- Genres Selection -->
          <div class="space-y-2">
            <label class="text-xs font-semibold text-night-200">Genres & Tropes (التصنيفات الرومانسية)</label>
            <div class="flex flex-wrap gap-2">
              <button 
                type="button"
                v-for="g in availableGenres" 
                :key="g"
                @click="toggleGenre(g)"
                :class="[
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                  form.selectedGenres.includes(g)
                    ? 'bg-romance-600/30 border-romance-500 text-romance-300 font-bold'
                    : 'bg-night-900 border-night-800 text-night-400 hover:text-white'
                ]"
              >
                {{ g }}
              </button>
            </div>
          </div>

          <!-- Submit Buttons -->
          <div class="flex items-center justify-between pt-4 border-t border-night-850">
            <p class="text-xs text-night-400">Saves directly to Hostinger MySQL Database.</p>
            <button 
              type="submit"
              :disabled="isSubmitting"
              class="px-8 py-3 rounded-xl bg-gradient-to-r from-romance-600 to-rose-500 hover:from-romance-500 text-white font-semibold text-xs shadow-glow-pink flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <CheckCircle class="w-4 h-4" />
              <span>{{ isSubmitting ? 'Saving to Database...' : (editingMangaId ? 'Save Changes' : 'Publish Romance Title') }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- TAB 2: Scan R2 & Selective Publishing -->
      <div v-if="activeTab === 'scan'" class="p-6 sm:p-8 rounded-3xl glass-panel space-y-6">
        <div class="border-b border-night-850 pb-4">
          <h2 class="font-serif text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
            <SearchCode class="w-6 h-6 text-romance-400" />
            <span>Scan Cloudflare R2 & Selective Chapter Publishing</span>
          </h2>
          <p class="text-xs text-night-400 mt-1">
            Connects to your Cloudflare R2 bucket, lists all discovered chapter folders, and lets you choose what to publish now and what to keep as drafts!
          </p>
        </div>

        <!-- Scan Form Input -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-night-900/90 border border-night-800">
          <div class="space-y-1.5 md:col-span-1">
            <label class="text-xs font-semibold text-night-200">1. Target Manga Title</label>
            <select 
              v-model="scanTargetMangaId" 
              class="w-full bg-night-950 border border-night-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-romance-500"
            >
              <option value="" disabled>Select a manga...</option>
              <option v-for="m in mangas" :key="m.id" :value="m.id">
                {{ m.title }}
              </option>
            </select>
          </div>

          <div class="space-y-1.5 md:col-span-1">
            <label class="text-xs font-semibold text-night-200">2. R2 Folder Identifier (مُعرف المجلد)</label>
            <input 
              v-model="scanMangaFolder" 
              type="text" 
              placeholder="e.g. manga_611ac7d4f93e7"
              class="w-full bg-night-950 border border-night-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-night-500 font-mono focus:outline-none focus:border-romance-500"
            />
          </div>

          <div class="flex items-end md:col-span-1">
            <button 
              @click="handleScanR2" 
              :disabled="isScanning || !scanMangaFolder"
              class="w-full py-2.5 px-6 rounded-xl bg-gradient-to-r from-romance-600 to-rose-500 hover:from-romance-500 text-white font-semibold text-xs shadow-glow-pink flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <RefreshCw :class="['w-4 h-4', isScanning ? 'animate-spin' : '']" />
              <span>{{ isScanning ? 'Scanning Cloudflare R2...' : 'Scan Cloudflare R2' }}</span>
            </button>
          </div>
        </div>

        <!-- Scan Results & Selective Publishing Table -->
        <div v-if="scannedChapters.length > 0" class="space-y-4 pt-4 border-t border-night-850">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 class="font-serif text-lg font-bold text-white flex items-center space-x-2">
                <span>Discovered {{ scannedChapters.length }} Chapters in Cloudflare R2</span>
              </h3>
              <p class="text-xs text-night-400">Choose the publishing status for each chapter below:</p>
            </div>

            <!-- Quick Batch Selectors -->
            <div class="flex items-center space-x-2 text-xs">
              <button 
                @click="setAllChaptersStatus('published')" 
                class="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors font-medium"
              >
                Publish All
              </button>
              <button 
                @click="setAllChaptersStatus('draft')" 
                class="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors font-medium"
              >
                Set All as Drafts
              </button>
            </div>
          </div>

          <!-- Chapters List Table -->
          <div class="overflow-x-auto rounded-2xl border border-night-800 bg-night-900/60">
            <table class="w-full text-left text-xs text-night-200">
              <thead class="bg-night-950 text-night-400 font-semibold border-b border-night-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th class="p-3.5">Chapter</th>
                  <th class="p-3.5">Pages Detected</th>
                  <th class="p-3.5">Chapter Title</th>
                  <th class="p-3.5">Publishing Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-night-800">
                <tr v-for="ch in scannedChapters" :key="ch.chapterNumber" class="hover:bg-night-850/50 transition-colors">
                  <td class="p-3.5 font-bold text-white font-mono flex items-center space-x-2">
                    <span class="w-7 h-7 rounded-lg bg-night-800 text-romance-300 flex items-center justify-center text-xs">
                      {{ ch.chapterNumber }}
                    </span>
                    <span>Chapter {{ ch.chapterNumber }}</span>
                  </td>
                  <td class="p-3.5 font-mono text-night-300">
                    {{ ch.pagesCount }} Pages (WebP)
                  </td>
                  <td class="p-3.5">
                    <input 
                      v-model="ch.title" 
                      type="text" 
                      placeholder="e.g. Midnight Encounter"
                      class="bg-night-950 border border-night-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-romance-500 w-48"
                    />
                  </td>
                  <td class="p-3.5">
                    <div class="flex items-center space-x-2">
                      <label :class="['px-3 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-all', ch.status === 'published' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-night-950 text-night-400 border-night-800']">
                        <input type="radio" :name="`status-${ch.chapterNumber}`" value="published" v-model="ch.status" class="hidden" />
                        <span>✅ Publish Now</span>
                      </label>
                      <label :class="['px-3 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-all', ch.status === 'draft' ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-night-950 text-night-400 border-night-800']">
                        <input type="radio" :name="`status-${ch.chapterNumber}`" value="draft" v-model="ch.status" class="hidden" />
                        <span>⏳ Draft / Later</span>
                      </label>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Save Chapters Action Button -->
          <div class="flex items-center justify-between pt-4">
            <p class="text-xs text-night-400">
              Only chapters marked with <span class="text-emerald-400 font-semibold">Publish Now</span> will be visible to readers on the website.
            </p>
            <button 
              @click="handleSaveScannedChapters" 
              :disabled="isSavingChapters"
              class="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-white font-semibold text-xs shadow-lg flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <CheckCircle class="w-4 h-4" />
              <span>{{ isSavingChapters ? 'Saving to Database...' : 'Save & Publish Selected Chapters' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 3: Manage Existing Titles List & Deletions -->
      <div v-if="activeTab === 'manage'" class="p-6 sm:p-8 rounded-3xl glass-panel space-y-6">
        <div class="flex items-center justify-between pb-4 border-b border-night-850">
          <div>
            <h2 class="font-serif text-xl sm:text-2xl font-bold text-white">All Published Titles (Live MySQL)</h2>
            <p class="text-xs text-night-400 mt-1">Delete works, scan new chapters from R2, or edit title metadata</p>
          </div>
          <span class="text-xs text-night-400 font-mono">{{ mangas.length }} titles registered</span>
        </div>

        <div v-if="mangas.length > 0" class="divide-y divide-night-800">
          <div 
            v-for="manga in mangas" 
            :key="manga.id"
            class="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <!-- Manga info preview -->
            <div class="flex items-start space-x-4">
              <img :src="manga.cover" :alt="manga.title" class="w-14 h-20 object-cover rounded-xl bg-night-900 border border-night-800 shadow-md shrink-0" />
              <div class="space-y-1">
                <div class="flex items-center space-x-2">
                  <h4 class="text-sm font-semibold text-white">{{ manga.title }}</h4>
                  <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {{ manga.status }}
                  </span>
                  <span v-if="manga.releaseYear" class="text-[10px] px-1.5 py-0.5 rounded bg-night-800 text-night-300 font-mono">
                    {{ manga.releaseYear }}
                  </span>
                </div>
                
                <p class="text-xs text-night-400">
                  <span class="font-mono text-romance-300">R2 ID: {{ manga.r2FolderId || manga.id }}</span>
                  &bull;
                  <span>{{ (manga.chapters && manga.chapters.length) || 0 }} Chapters</span>
                  &bull;
                  <span>Author: {{ manga.author }}</span>
                </p>

                <div class="flex flex-wrap gap-1.5 pt-0.5">
                  <span v-for="g in manga.genres.slice(0, 4)" :key="g" class="text-[10px] px-2 py-0.5 rounded bg-night-800 text-night-300">
                    {{ g }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Manga Actions -->
            <div class="flex items-center space-x-2 self-end md:self-center">
              <!-- Scan R2 for this Manga -->
              <button 
                @click="startScanForManga(manga)" 
                class="px-3 py-1.5 rounded-lg bg-romance-600/20 hover:bg-romance-600/30 border border-romance-500/40 text-xs text-romance-300 font-medium flex items-center space-x-1"
                title="Scan Cloudflare R2 for this manga's chapters"
              >
                <SearchCode class="w-3.5 h-3.5" />
                <span>Scan R2</span>
              </button>

              <!-- Edit details -->
              <button 
                @click="editManga(manga)"
                class="p-2 rounded-lg bg-night-850 hover:bg-night-800 text-night-300 hover:text-white border border-night-800 transition-colors"
                title="Edit title details"
              >
                <Pencil class="w-4 h-4" />
              </button>

              <!-- View page -->
              <NuxtLink 
                :to="`/manga/${manga.id}`" 
                target="_blank" 
                class="p-2 rounded-lg bg-night-850 hover:bg-night-800 text-night-300 hover:text-white border border-night-800 transition-colors" 
                title="View Live"
              >
                <ExternalLink class="w-4 h-4" />
              </NuxtLink>

              <!-- Delete Manga Permanently -->
              <button 
                @click="handleDeleteManga(manga)"
                class="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                title="Delete title permanently from database"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div v-else class="p-8 text-center text-xs text-night-400 border border-night-800 rounded-2xl bg-night-900/40">
          No titles found in MySQL database. Use the "New Webtoon Title" tab to publish your first work!
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRomanceApi } from '~/composables/useApi'
import { 
  ShieldCheck, Lock, BookOpen, ExternalLink, Sparkles, 
  PlusCircle, Layers, CheckCircle, SearchCode, RefreshCw, 
  Pencil, Trash2 
} from '@lucide/vue'

useHead({
  title: 'RomanceToon Publisher Suite | /mastouri'
})

const { 
  fetchMangas, createManga, updateManga, 
  deleteManga, scanR2, publishChapters 
} = useRomanceApi()

// Authentication Gate
const isAuthenticated = ref(false)
const pinInput = ref('')
const authError = ref(false)

const authenticate = () => {
  if (pinInput.value.trim() === 'mastouri2026' || pinInput.value.trim() === 'mastouri') {
    isAuthenticated.value = true
    authError.value = false
    loadLiveMangas()
  } else {
    authError.value = true
  }
}

// Active Tab
const activeTab = ref<'create' | 'scan' | 'manage'>('manage')

// Live Mangas list from MySQL
const mangas = ref<any[]>([])
const isSubmitting = ref(false)

const loadLiveMangas = async () => {
  mangas.value = await fetchMangas()
}

onMounted(() => {
  // If already authenticated in session
  if (isAuthenticated.value) {
    loadLiveMangas()
  }
})

// Available romance genres
const availableGenres = [
  'Romance', 'CEO & Drama', 'Contract Marriage', 'Historical', 
  'Villainess', 'Royalty', 'Cozy Fantasy', 'Slow Burn', 
  'Enemies to Lovers', 'Modern Romance', 'Magic'
]

// Manga Create / Edit Form
const editingMangaId = ref<string | null>(null)
const form = reactive({
  title: '',
  alternativeTitles: '',
  r2FolderId: '',
  releaseYear: '2026',
  author: '',
  artist: '',
  status: 'Ongoing' as const,
  cover: '',
  banner: '',
  synopsis: '',
  badge: 'NEW' as const,
  selectedGenres: ['Romance']
})

const toggleGenre = (genre: string) => {
  const idx = form.selectedGenres.indexOf(genre)
  if (idx > -1) {
    if (form.selectedGenres.length > 1) {
      form.selectedGenres.splice(idx, 1)
    }
  } else {
    form.selectedGenres.push(genre)
  }
}

const editManga = (manga: any) => {
  editingMangaId.value = manga.id
  form.title = manga.title
  form.alternativeTitles = (manga.alternativeTitles || []).join(', ')
  form.r2FolderId = manga.r2FolderId || manga.id
  form.releaseYear = manga.releaseYear || '2026'
  form.author = manga.author || ''
  form.artist = manga.artist || ''
  form.status = manga.status || 'Ongoing'
  form.cover = manga.cover
  form.banner = manga.banner
  form.synopsis = manga.synopsis
  form.badge = manga.badge || 'NEW'
  form.selectedGenres = Array.isArray(manga.genres) && manga.genres.length ? [...manga.genres] : ['Romance']
  activeTab.value = 'create'
}

const cancelEdit = () => {
  editingMangaId.value = null
  resetForm()
  activeTab.value = 'manage'
}

const resetForm = () => {
  form.title = ''
  form.alternativeTitles = ''
  form.r2FolderId = ''
  form.releaseYear = '2026'
  form.author = ''
  form.artist = ''
  form.cover = ''
  form.banner = ''
  form.synopsis = ''
  form.selectedGenres = ['Romance']
}

// Save Manga directly to MySQL Database
const handleSaveManga = async () => {
  isSubmitting.value = true

  const payload = {
    title: form.title,
    alternativeTitles: form.alternativeTitles,
    r2FolderId: form.r2FolderId,
    releaseYear: form.releaseYear,
    author: form.author,
    artist: form.artist,
    status: form.status,
    cover: form.cover,
    banner: form.banner || form.cover,
    synopsis: form.synopsis,
    genres: form.selectedGenres,
    badge: form.badge
  }

  try {
    if (editingMangaId.value) {
      await updateManga(editingMangaId.value, payload)
      alert(`✔ Updated "${form.title}" in MySQL successfully!`)
      editingMangaId.value = null
    } else {
      await createManga(payload)
      alert(`✔ Published "${form.title}" to MySQL successfully!`)
    }

    await loadLiveMangas()
    resetForm()
    activeTab.value = 'manage'
  } catch (err: any) {
    alert(`Error saving manga: ${err.message}`)
  } finally {
    isSubmitting.value = false
  }
}

// Delete Manga permanently from MySQL Database
const handleDeleteManga = async (manga: any) => {
  if (confirm(`Are you sure you want to permanently delete "${manga.title}" from your database? This will completely remove it from the website.`)) {
    try {
      await deleteManga(manga.id)
      alert(`✔ Permanently deleted "${manga.title}".`)
      await loadLiveMangas()
    } catch (err: any) {
      alert(`Error deleting manga: ${err.message}`)
    }
  }
}

// -------------------------------------------------------------
// Cloudflare R2 Scan & Selective Publishing
// -------------------------------------------------------------
const scanTargetMangaId = ref('')
const scanMangaFolder = ref('')
const isScanning = ref(false)
const isSavingChapters = ref(false)
const scannedChapters = ref<any[]>([])

const startScanForManga = (manga: any) => {
  scanTargetMangaId.value = manga.id
  scanMangaFolder.value = manga.r2FolderId || manga.id
  activeTab.value = 'scan'
  handleScanR2()
}

const handleScanR2 = async () => {
  if (!scanMangaFolder.value) return
  isScanning.value = true
  scannedChapters.value = []

  try {
    const result = await scanR2(scanMangaFolder.value)
    if (result.success && Array.isArray(result.chapters)) {
      scannedChapters.value = result.chapters.map((ch: any) => ({
        ...ch,
        status: 'published' // default to published
      }))
    } else {
      alert(result.message || 'No chapters found or R2 credentials not configured on backend.')
    }
  } catch (err: any) {
    alert(`R2 Scan failed: ${err.message}`)
  } finally {
    isScanning.value = false
  }
}

const setAllChaptersStatus = (status: 'published' | 'draft') => {
  scannedChapters.value.forEach(ch => ch.status = status)
}

const handleSaveScannedChapters = async () => {
  if (!scanTargetMangaId.value) {
    alert('Please select a target manga title from the dropdown.')
    return
  }

  isSavingChapters.value = true

  try {
    const payload = scannedChapters.value.map(ch => ({
      chapterNumber: ch.chapterNumber,
      title: ch.title,
      status: ch.status,
      pages: ch.pages || []
    }))

    const result = await publishChapters(scanTargetMangaId.value, payload)
    if (result.success) {
      alert(result.message || 'Chapters saved successfully to MySQL!')
      await loadLiveMangas()
      activeTab.value = 'manage'
    } else {
      alert(result.message || 'Failed to save chapters.')
    }
  } catch (err: any) {
    alert(`Error saving chapters: ${err.message}`)
  } finally {
    isSavingChapters.value = false
  }
}
</script>
