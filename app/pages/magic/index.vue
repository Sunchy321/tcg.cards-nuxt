<template>
  <div>
    <UButton color="primary" variant="solid">Button</UButton>
  </div>
</template>

<script setup lang="ts">
const { $orpc } = useNuxtApp();
const i18n = useI18n();
const title = useTitle();
const { setActions } = useActions();

definePageMeta({
  layout: 'entry',
});

title.value = i18n.t('magic.$self');

setActions([
  // {
  //   id:      'edit',
  //   icon:    'lucide:edit',
  //   handler: () => {
  //     console.log('编辑卡牌');
  //   },
  // },
  {
    id:      'random',
    icon:    'tabler:arrows-shuffle',
    handler: async () => {
      const cardId = await $orpc.magic.card.random();

      await navigateTo(`/magic/card/${cardId}`);
    },
  },
]);

</script>

<style lang="scss" scoped>
</style>
