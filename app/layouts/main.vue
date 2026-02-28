<template>
  <div class="min-h-screen flex flex-col bg-linear-to-br from-indigo-500 via-purple-500 to-purple-600">
    <Header />

    <main class="flex-1 container mx-auto px-4 py-8 pt-18">
      <slot />
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">

</script>
