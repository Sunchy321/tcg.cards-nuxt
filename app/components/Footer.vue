<template>
  <footer class="bg-gray-50 border-t">
    <div class="container mx-auto px-4 py-4 text-center text-sm text-gray-600">
      <NuxtLink to="/" class="hover:text-gray-900 transition-colors">
        &copy; {{ currentYear }} All rights reserved.
      </NuxtLink>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear();
</script>
