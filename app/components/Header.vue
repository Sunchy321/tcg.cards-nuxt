<template>
  <header class="fixed top-0 left-0 w-full bg-white/10 backdrop-blur-md border-b border-white/20 z-50">
    <div class="container mx-auto px-6 py-4 flex items-center gap-4">
      <NuxtLink :to="homeLink" class="flex items-center hover:opacity-80 transition-opacity">
        <Icon :name="logo" :size="32" class="text-white" />
        <span class="ml-3 font-semibold text-white text-lg">{{ title }}</span>
      </NuxtLink>

      <div class="flex-1" />

      <div v-if="actions.length > 0" class="flex gap-2">
        <UButton
          v-for="action in actions"
          :key="action.id"
          :icon="action.icon"
          variant="subtle"
          color="neutral"
          size="xl"
          class="rounded-full"
          @click="action.handler"
        />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { Game } from '#shared';

const route = useRoute();
const title = useTitle();
const { getActions } = useActions();

const actions = getActions();

const gameMap: Record<Game | 'omni', string> = {
  omni:        'Omnisearch',
  magic:       'MTG',
  hearthstone: 'Hearthstone',
};

const currentGame = computed(() => {
  const path = route.path.split('/')[1];
  return gameMap[path as Game] ? (path as Game) : null;
});

const logo = computed(() => {
  if (currentGame.value == null) {
    return 'i:logo';
  }

  return `i:${currentGame.value}-logo`;
});

const homeLink = computed(() => {
  return currentGame.value ? `/${currentGame.value}` : '/';
});
</script>
