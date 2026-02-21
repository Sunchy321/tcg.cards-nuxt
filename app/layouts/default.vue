<template lang="pug">
div.min-h-screen.flex.flex-col
  header.bg-white.shadow-sm
    div.container.mx-auto.px-4.py-4
      //- 在这里添加导航栏内容
      h1.text-2xl.font-bold {{ appName }}

  main.flex-1.container.mx-auto.px-4.py-8
    slot

  footer.bg-gray-50.border-t
    div.container.mx-auto.px-4.py-4.text-center.text-sm.text-gray-600
      //- 在这里添加页脚内容
      p &copy; {{ currentYear }} All rights reserved.
</template>

<script setup lang="ts">
const appName = 'My App'
const currentYear = new Date().getFullYear()
</script>
