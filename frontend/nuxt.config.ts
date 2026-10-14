// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  srcDir: '.',
  future: {
    compatibilityVersion: 3
  },
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  app: {
    head: {
      htmlAttrs: {
        lang: 'en',
        dir: 'ltr'
      },
      title: 'RomanceToon - Read Romantic Webtoons & Romance Manga Online',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'RomanceToon is your premier destination for sweet, historical, fantasy, and modern romance webtoons with high-definition chapters and seamless reader.' },
        { name: 'keywords', content: 'romance webtoons, read romance manga online, romantic manhwa, shoujo manga, otome webtoons, love comics, free manhwa reader, romance manhwa english' },
        { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        { name: 'googlebot', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        { name: 'theme-color', content: '#0b0c10' },
        // Open Graph Global
        { property: 'og:site_name', content: 'RomanceToon' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:image', content: 'https://romancetoon.com/favicon.ico' },
        // Twitter Global
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@RomanceToon' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap' }
      ]
    }
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [
        '/sitemap.xml',
        '/robots.txt'
      ]
    }
  },
  css: ['~/assets/css/main.css']
})
