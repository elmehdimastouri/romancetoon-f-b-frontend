<template>
  <GenreView :current-slug="genreSlug" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import GenreView from '~/components/GenreView.vue'

const route = useRoute()

const genreSlug = computed(() => {
  const param = route.params.slug
  if (Array.isArray(param)) {
    return param[0] || ''
  }
  return param || ''
})
</script>
