<template>
  <MainLayout>
    <div class="flex items-center justify-center py-8">
      <UInput class="w-[90%] md:w-[75%] mt-50 text-black bg-white rounded-md shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden" size="xl" />
    </div>

    <div class="flex-1 container mx-auto px-4">
      <slot />
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from './main.vue';
</script>
