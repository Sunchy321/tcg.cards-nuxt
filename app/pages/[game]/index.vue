<template>
  <div class="flex items-center justify-center h-full py-8">
    <InputGroup class="w-[90%] md:w-[75%] mt-50 text-[150%] md:text-[150%] bg-white h-auto rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden">
      <InputGroupInput class="px-6 py-6" />
    </InputGroup>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const i18n = useI18n();
const title = useTitle();

definePageMeta({
  layout: 'main',
});

title.value = i18n.t(`${route.meta.game!}.$self`);

</script>

<style lang="scss" scoped>
</style>
