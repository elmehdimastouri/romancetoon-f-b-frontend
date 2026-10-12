<template>
  <footer class="mt-24 border-t border-night-850 bg-night-950 py-12 text-night-400">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        
        <!-- Brand Info -->
        <div class="md:col-span-2 space-y-4">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-romance-600 to-rose-400 flex items-center justify-center">
              <Heart class="w-4 h-4 text-white fill-white" />
            </div>
            <span class="font-serif text-xl font-bold text-white">
              Romance<span class="text-romance-400">Toon</span>
            </span>
          </div>
          <p class="text-xs text-night-400 leading-relaxed max-w-sm">
            RomanceToon is dedicated to delivering the highest quality reading experience for romance webtoon and manhwa fans worldwide with eye-comfort dark mode and fast loading speeds.
          </p>
          <div class="text-[11px] text-night-500">
            Domain: <a href="https://romancetoon.com" class="text-romance-400 hover:underline">https://romancetoon.com</a>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="space-y-3">
          <h4 class="text-xs font-semibold text-night-200 uppercase tracking-wider">Navigation</h4>
          <ul class="space-y-2 text-xs">
            <li><NuxtLink to="/" class="hover:text-romance-300 transition-colors">Home & Discover</NuxtLink></li>
            <li><NuxtLink to="/genres" class="hover:text-romance-300 transition-colors">Romance Genres</NuxtLink></li>
            <li><NuxtLink to="/popular" class="hover:text-romance-300 transition-colors">Most Popular</NuxtLink></li>
          </ul>
        </div>

        <!-- Romance Categories -->
        <div class="space-y-3">
          <h4 class="text-xs font-semibold text-night-200 uppercase tracking-wider">Top Genres</h4>
          <ul class="space-y-2 text-xs">
            <li><span class="hover:text-romance-300 transition-colors cursor-pointer">Historical Romance</span></li>
            <li><span class="hover:text-romance-300 transition-colors cursor-pointer">CEO & Contract Marriage</span></li>
            <li><span class="hover:text-romance-300 transition-colors cursor-pointer">Villainess Reincarnation</span></li>
            <li><span class="hover:text-romance-300 transition-colors cursor-pointer">Fantasy Romance</span></li>
          </ul>
        </div>
      </div>

      <div class="pt-8 border-t border-night-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-night-500 gap-4">
        <p>&copy; 2026 RomanceToon. All rights reserved.</p>
        <p class="flex items-center space-x-1">
          <span>Crafted with</span>
          <Heart class="w-3 h-3 text-romance-500 fill-romance-500" />
          <span>for romance storytellers and readers</span>
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { Heart } from '@lucide/vue'
</script>
