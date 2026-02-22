<template>
  <div class="min-h-screen flex flex-col bg-linear-to-br">
    <Header />

    <main class="flex-1 flex items-center justify-center px-4 py-8">
      <slot />
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">

</script>
