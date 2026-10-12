<template>
  <div class="space-y-8">
    <div class="pb-4 border-b border-night-850">
      <h1 class="font-serif text-3xl font-bold text-white">Romance Genres & Categories</h1>
      <p class="text-xs text-night-400 mt-1">Browse our collection categorized by your favorite romantic tropes</p>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <div 
        v-for="cat in romanceCategories" 
        :key="cat.name"
        class="p-5 rounded-2xl glass-panel hover:border-romance-500/50 transition-all cursor-pointer group space-y-2"
      >
        <div class="w-10 h-10 rounded-xl bg-night-800 group-hover:bg-romance-600/20 text-romance-400 flex items-center justify-center transition-colors">
          <Heart class="w-5 h-5 fill-romance-500/30" />
        </div>
        <h3 class="font-serif font-bold text-base text-white group-hover:text-romance-300 transition-colors">
          {{ cat.name }}
        </h3>
        <p class="text-[11px] text-night-400 leading-relaxed">{{ cat.desc }}</p>
        <span class="inline-block text-[10px] text-romance-400 font-semibold pt-1">{{ cat.count }} Titles</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Heart } from '@lucide/vue'

const romanceCategories = [
  { name: 'Historical Romance', desc: 'Dukes, ballrooms, royalty, and period romance adventures.', count: '42' },
  { name: 'CEO & Drama', desc: 'Billionaires, contract marriages, and contemporary office secrets.', count: '38' },
  { name: 'Villainess Reincarnation', desc: 'Strong female leads rewriting their destiny away from death.', count: '55' },
  { name: 'Cozy & Slow Burn', desc: 'Warm coffee shops, magical encounters, and sweet gentle love.', count: '29' },
  { name: 'Fantasy & Magic', desc: 'Dragons, enchanted roses, and archmages bound by destiny.', count: '47' },
  { name: 'Enemies to Lovers', desc: 'Intense banter and rivalry that inevitably melts into deep devotion.', count: '34' }
]
</script>
