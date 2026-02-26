<template>
  <div>
    <UButton color="primary" variant="solid">Button</UButton>
  </div>
</template>

<script setup lang="ts">
const i18n = useI18n();
const title = useTitle();
const { setActions } = useActions();
const { randomAction } = useMagicActions();

definePageMeta({
  layout:  'entry',
  actions: [{ id: 'random', icon: 'tabler:arrows-shuffle' }],
});

title.value = i18n.t('magic.$self');

setActions([randomAction]);

</script>

<style lang="scss" scoped>
</style>
