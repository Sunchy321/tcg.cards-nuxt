<template>
  <div class="flex flex-col items-center justify-center h-full py-8 gap-6">
    <InputGroup class="w-[90%] md:w-[75%] mt-50 text-[150%] md:text-[150%] bg-white h-auto rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden">
      <InputGroupAddon>
        <Select v-model="selectedGame">
          <SelectTrigger class="w-auto h-auto px-4 py-6 border-0 shadow-none">
            <SelectValue placeholder="Game">
              <div class="flex items-center gap-2 w-full">
                <img
                  :src="selectedGame === 'omni' ? '/favicon.svg' : `/${selectedGame}/logo.svg`"
                  alt="Logo"
                  class="w-6 h-6"
                >
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <template v-for="game in gameOptions" :key="game.id">
              <SelectItem :value="game.id" class="text-base py-2">
                <div class="flex items-center gap-2 w-full">
                  <Icon :name="gameIcon(game.id)" />
                  <span class="flex-1">{{ game.label }}</span>
                </div>
              </SelectItem>
            </template>
          </SelectContent>
        </Select>
      </InputGroupAddon>
      <InputGroupInput class="px-6 py-6" />
    </InputGroup>

    <div class="flex gap-4">
      <NuxtLink v-for="game in gameOptions" :key="game.id" :to="`/${game.id}`">
        <Button class="flex items-center gap-2">
          <Icon :name="gameIcon(game.id)" class="w-5 h-5 text-white" />
          <span>{{ game.label }}</span>
        </Button>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { InputGroup, InputGroupAddon, InputGroupInput } from '~/components/ui/input-group';
import { Select } from '~/components/ui/select';
import { Button } from '~/components/ui/button';

import { GAMES, type Game } from '~~/shared';

type GameFilter = Game | 'omni';

type GameOption = {
  id:    GameFilter;
  label: string;
};

definePageMeta({
  layout: 'main',
});

const gameOptions = [
  { id: 'omni', label: 'Omnisearch' },
  { id: 'magic', label: 'MTG' },
  { id: 'hearthstone', label: 'Hearthstone' },
] satisfies GameOption[];

const selectedGame = ref<GameFilter>('omni');

function gameIcon(gameId: GameFilter) {
  if (gameId === 'omni') {
    return 'i:logo';
  }
  return `i:${gameId}-logo`;
}

</script>

<style lang="scss" scoped>
</style>
