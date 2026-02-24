<template>
  <div class="flex flex-col items-center justify-center h-full py-8 gap-6">
    <UFieldGroup class="w-[90%] md:w-[75%] mt-50 text-black bg-white rounded-md shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden" size="xl">
      <USelect v-model="game" :items="gameOptions" :ui="{ content: 'min-w-fit' }">
        <template #item="{ item }">
          <div class="flex items-center gap-2 w-full">
            <Icon :name="item.icon" class="w-5 h-5 text-default" />
            <span>{{ item.label }}</span>
          </div>
        </template>
        <template #default>
          <Icon :name="gameIcon(game)" class="w-5 h-5 text-default" />
        </template>
      </USelect>
      <UInput class="flex-1" color="neutral" />
    </UFieldGroup>

    <div class="flex gap-4">
      <NuxtLink v-for="g in games" :key="g" :to="`/${g}`">
        <UButton class="flex items-center gap-2" color="neutral">
          <Icon :name="gameIcon(g)" class="w-5 h-5 text-white" />
          <span>{{ gameName(g) }}</span>
        </UButton>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GAMES, type Game } from '#shared';

const i18n = useI18n();
const title = useTitle();

type GameFilter = Game | 'omni';

definePageMeta({
  layout: 'main',
});

title.value = 'tcg.cards';

const games = ['omni', ...GAMES] as const;

const game = ref<GameFilter>('omni');

function gameIcon(gameId: GameFilter) {
  if (gameId === 'omni') {
    return 'i:logo';
  }
  return `i:${gameId}-logo`;
}

function gameName(gameId: GameFilter) {
  if (gameId === 'omni') {
    return i18n.t('omni.$self');
  }
  return i18n.t(`${gameId}.$self`);
}

const gameOptions = games.map(g => ({
  value: g,
  label: gameName(g),
  icon:  gameIcon(g),
}));

</script>

<style lang="scss" scoped>
</style>
