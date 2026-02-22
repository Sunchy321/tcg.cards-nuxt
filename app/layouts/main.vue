<template lang="pug">
div(class="min-h-screen flex flex-col bg-linear-to-br from-indigo-500 via-purple-500 to-purple-600")
  Header

  main(class="flex-1 container mx-auto px-4 py-8")
    slot

  footer(class="bg-gray-50 border-t")
    div(class="container mx-auto px-4 py-4 text-center text-sm text-gray-600")
      //- 在这里添加页脚内容
      p &copy; {{ currentYear }} All rights reserved.
</template>

<script setup lang="ts">
const appName = 'My App'
const currentYear = new Date().getFullYear()
</script>
