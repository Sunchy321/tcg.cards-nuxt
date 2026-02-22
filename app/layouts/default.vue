<template>
  <div class="min-h-screen flex flex-col bg-linear-to-br">
    <Header />

    <main class="flex-1 flex items-center justify-center px-4 py-8">
      <slot />
    </main>

    <!-- <footer class="bg-gray-50 border-t">
            <div class="container mx-auto px-4 py-4 text-center text-sm text-gray-600">
                <p>&copy; {{ currentYear }} All rights reserved.</p>
            </div>
        </footer> -->
  </div>
</template>

<script setup lang="ts">
const appName = 'My App';
const currentYear = new Date().getFullYear();
</script>
