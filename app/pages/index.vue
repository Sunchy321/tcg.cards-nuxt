<template>
  <div class="flex items-center justify-center h-full py-8">
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
                  <img
                    :src="game.id === 'omni' ? '/favicon.svg' : `/${game.id}/logo.svg`"
                    alt="Logo"
                    class="w-6 h-6"
                  >
                  <span class="flex-1">{{ game.label }}</span>
                </div>
              </SelectItem>
            </template>
          </SelectContent>
        </Select>
      </InputGroupAddon>
      <InputGroupInput class="px-6 py-6" />
    </InputGroup>
  </div>
</template>

<script setup lang="ts">
import { InputGroup, InputGroupAddon, InputGroupInput } from '~/components/ui/input-group';
import { Select } from '~/components/ui/select';

import { GAMES, type Game } from '@/shared';

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

</script>

<style lang="scss" scoped>
</style>
