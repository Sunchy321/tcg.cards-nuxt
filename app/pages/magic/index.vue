<template>
  <div class="py-8 flex flex-col gap-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Column 1 -->
      <div class="flex flex-col gap-2">
        <UButton
          to="/magic/format/standard"
          icon="tabler:file-text"
          variant="ghost"
          class="text-white hover:bg-white/20 justify-start"
        >
          {{ $t('magic.format.$self') }}
        </UButton>
        <UButton
          to="/magic/sets"
          icon="tabler:cards"
          variant="ghost"
          class="text-white hover:bg-white/20 justify-start"
        >
          Sets
        </UButton>
      </div>
      <!-- Column 2 -->
      <div class="flex flex-col gap-2">
        <UButton
          to="/magic/rule"
          icon="tabler:book"
          variant="ghost"
          class="text-white hover:bg-white/20 justify-start"
        >
          Rules
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const i18n = useI18n();
const title = useTitle();
const { setActions } = useActions();
const { randomAction } = useMagicActions();

definePageMeta({
  layout:  'entry',
  game:    'magic',
  actions: [{ id: 'random', icon: 'tabler:arrows-shuffle' }],
});

title.value = i18n.t('magic.$self');

setActions([randomAction]);
</script>

<style lang="scss" scoped>
</style>
