<template>
  <header class="fixed top-0 left-0 w-full bg-white/10 backdrop-blur-md border-b border-white/20 z-50 flex flex-col">
    <div class="container mx-auto px-6 py-4 flex items-center gap-4">
      <NuxtLink :to="homeLink" class="flex items-center hover:opacity-80 transition-opacity">
        <Icon :name="logo" :size="32" class="text-white" />
      </NuxtLink>

      <template v-if="route.meta.titleType === 'input'">
        <UInput
          v-model="searchInput"
          class="ml-3 flex-1"
          size="xl"
          :ui="{ base: 'font-semibold text-white bg-transparent border-white/60 focus:border-white w-full' }"
          @keydown.enter="commitSearch"
        />
      </template>
      <span v-else class="ml-3 font-semibold text-white text-lg flex-1">{{ title }}</span>

      <template v-for="p in params" :key="p.id">
        <USelect
          v-if="p.type === 'select'"
          :model-value="p.value"
          :items="p.items"
          size="xl"
          class="w-40"
          trailing-icon=""
          :ui="{ base: 'text-white bg-white/10 hover:bg-white/20 border-white/20 ring-white/20', content: 'min-w-fit' }"
          @update:model-value="p.onChange"
        />
        <UButton
          v-else-if="p.type === 'switch'"
          :icon="p.icon"
          :variant="p.value ? 'solid' : 'ghost'"
          size="xl"
          class="rounded-full size-10 text-white hover:bg-white/20 border border-white/20 flex items-center justify-center"
          @click="p.onChange(!p.value)"
        />
      </template>

      <USelect
        v-if="currentGame != null && localeOptions.length > 1"
        v-model="gameLocale"
        :items="localeOptions"
        size="xl"
        class="w-16"
        trailing-icon=""
        :ui="{ base: 'text-center text-white bg-white/10 hover:bg-white/20 border-white/20 ring-white/20', content: 'min-w-fit' }"
      >
        <template #default>
          <div class="flex w-full justify-center">
            <span class="uppercase">{{ gameLocale }}</span>
          </div>
        </template>
        <template #item="{ item }">
          <div class="grid items-baseline gap-x-2" style="grid-template-columns: 3rem auto">
            <span class="font-mono text-xs">{{ item.value }}</span>
            <span>{{ item.label }}</span>
          </div>
        </template>
      </USelect>

      <div v-if="actions.length > 0" class="flex gap-2">
        <UButton
          v-for="action in actions"
          :key="action.id"
          :icon="action.icon"
          :disabled="action.disabled"
          variant="ghost"
          size="xl"
          class="rounded-full size-10 text-white hover:bg-white/20 border border-white/20 flex items-center justify-center"
          @click="action.handler()"
        />
      </div>
    </div>
    <!-- Subheader portal: pages Teleport content here -->
    <div id="subheader-portal" />
  </header>
</template>

<script setup lang="ts">
import type { Game } from '#shared';

import { mainLocale as magicLocaleSchema } from '#model/magic/schema/basic';
import { useParams } from '~/composables/params';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const game = useGame();
const title = useTitle();

const searchInput = useSearchInput();

const commitSearch = () => {
  if (game.value != null) {
    router.push({
      path:  `/${game.value}/search`,
      query: { q: searchInput.value },
    });
  }
};

const { getActions } = useActions();

const actions = getActions();

// ── Generic params ────────────────────────────────────────────────────────────

const { getParams } = useParams();

const params = getParams();

const magicLocale = useGameLocale('magic');
const hearthstoneLocale = useGameLocale('hearthstone');

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

const localeOptions = computed(() => {
  const toOption = (code: string) => ({ value: code, label: t(`lang.${code}`) });

  if (currentGame.value === 'magic') return magicLocaleSchema.options.map(toOption);
  if (currentGame.value === 'hearthstone') return [toOption('en')];
  return [];
});

const gameLocale = computed({
  get() {
    if (currentGame.value === 'magic') return magicLocale.value;
    if (currentGame.value === 'hearthstone') return hearthstoneLocale.value;
    return 'en';
  },
  set(val: string) {
    if (currentGame.value === 'magic') (magicLocale as any).value = val;
    if (currentGame.value === 'hearthstone') (hearthstoneLocale as any).value = val;
  },
});
</script>
