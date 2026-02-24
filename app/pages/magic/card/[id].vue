<template>
  <div class="container mx-auto px-4 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left column: Card image -->
      <div class="lg:col-span-3">
        <div class="sticky top-24">
          <UCard>
            <img
              :src="cardData.imageUrl"
              :alt="cardData.name"
              class="w-full rounded-lg"
            >
            <div class="mt-4 space-y-2">
              <UButton class="w-full" variant="outline">
                View Original
              </UButton>
              <UButton class="w-full" variant="outline">
                Download Image
              </UButton>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Middle column: Card details -->
      <div class="lg:col-span-6">
        <UCard>
          <h1 class="text-3xl font-bold mb-2">
            {{ cardData.name }}
          </h1>
          <p class="text-gray-600 mb-4">
            {{ cardData.nameEn }}
          </p>

          <div class="border-t border-b py-4 my-4 space-y-3">
            <div class="flex">
              <span class="w-32 font-semibold text-gray-700">Type:</span>
              <span>{{ cardData.type }}</span>
            </div>
            <div class="flex">
              <span class="w-32 font-semibold text-gray-700">Cost:</span>
              <span>{{ cardData.cost }}</span>
            </div>
            <div class="flex">
              <span class="w-32 font-semibold text-gray-700">Rarity:</span>
              <span :class="getRarityColor(cardData.rarity)">{{ cardData.rarity }}</span>
            </div>
            <div class="flex">
              <span class="w-32 font-semibold text-gray-700">Set:</span>
              <span>{{ cardData.set }}</span>
            </div>
          </div>

          <div class="mb-6">
            <h2 class="text-xl font-semibold mb-3">
              Card Effect
            </h2>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-gray-800 leading-relaxed">
                {{ cardData.text }}
              </p>
            </div>
          </div>

          <div v-if="cardData.flavorText" class="mb-6">
            <h2 class="text-xl font-semibold mb-3">
              Flavor Text
            </h2>
            <p class="text-gray-600 italic">
              {{ cardData.flavorText }}
            </p>
          </div>

          <div class="mb-6">
            <h2 class="text-xl font-semibold mb-3">
              Keywords
            </h2>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="keyword in cardData.keywords"
                :key="keyword"
                color="info"
                variant="subtle"
              >
                {{ keyword }}
              </UBadge>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Right column: Card printing information -->
      <div class="lg:col-span-3">
        <div class="sticky top-24">
          <UCard>
            <h2 class="text-xl font-semibold mb-4">
              Printing Info
            </h2>
            <div class="space-y-3">
              <div
                v-for="printing in cardData.printings"
                :key="printing.id"
                class="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div class="flex items-center gap-3 mb-2">
                  <img
                    :src="printing.setIcon"
                    :alt="printing.setName"
                    class="w-6 h-6"
                  >
                  <span class="font-medium">{{ printing.setName }}</span>
                </div>
                <div class="text-sm text-gray-600">
                  <div>Number: {{ printing.number }}</div>
                  <div>Release: {{ printing.releaseDate }}</div>
                  <div class="mt-1">
                    <span :class="getRarityColor(printing.rarity)">
                      {{ printing.rarity }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4 pt-4 border-t">
              <h3 class="font-semibold mb-2">
                Collection Info
              </h3>
              <div class="text-sm space-y-1">
                <div class="flex justify-between">
                  <span class="text-gray-600">Market Price:</span>
                  <span class="font-semibold">¥{{ cardData.price }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Owned:</span>
                  <span class="font-semibold">{{ cardData.owned }}</span>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Locale } from '#model/magic/schema/basic';

import { locale as localeSchema } from '#model/magic/schema/basic';

import _ from 'lodash';

const { $orpc } = useNuxtApp();
const route = useRoute('magic-card-id');
const locale = useGameLocale('magic');

definePageMeta({
  layout: 'main',
});

const query = (() => {
  const query = {
    cardId:    route.params.id as string,
    locale:    localeSchema.safeParse(route.query.locale as string).data ?? locale.value,
    set:       route.query.set as string,
    number:    route.query.number as string,
    partIndex: route.query.part as string ?? '0',
  };

  return _.omitBy(query, v => v == null) as {
    cardId:  string;
    locale:  Locale;
    set?:    string;
    number?: string;
  };
})();

console.log(query);

const data = await $orpc.magic.card.fuzzy(query);

console.log(data);

// Mock data
const cardData = ref({
  name:       '闪电箭',
  nameEn:     'Lightning Bolt',
  imageUrl:   'https://via.placeholder.com/300x420/4A90E2/FFFFFF?text=Card+Image',
  type:       '瞬间',
  cost:       '{R}',
  rarity:     '常见',
  set:        '核心系列2021',
  text:       '闪电箭对任意一个目标造成3点伤害。',
  flavorText: '雷霆万钧，一击致命。',
  keywords:   ['瞬间', '伤害'],
  price:      '15.00',
  owned:      3,
  printings:  [
    {
      id:          '1',
      setName:     '核心系列2021',
      setIcon:     'https://via.placeholder.com/24/4A90E2/FFFFFF?text=M21',
      number:      '163',
      releaseDate: '2020-07-03',
      rarity:      '常见',
    },
    {
      id:          '2',
      setName:     '核心系列2020',
      setIcon:     'https://via.placeholder.com/24/E74C3C/FFFFFF?text=M20',
      number:      '142',
      releaseDate: '2019-07-12',
      rarity:      '常见',
    },
    {
      id:          '3',
      setName:     '秘稀档案',
      setIcon:     'https://via.placeholder.com/24/F39C12/FFFFFF?text=STA',
      number:      '99',
      releaseDate: '2021-04-23',
      rarity:      '稀有',
    },
  ],
});

const getRarityColor = (rarity: string) => {
  const colors: Record<string, string> = {
    常见:   'text-gray-700',
    非常见:  'text-blue-600',
    稀有:   'text-yellow-600',
    秘稀:   'text-orange-600',
    神话稀有: 'text-red-600',
  };
  return colors[rarity] || 'text-gray-700';
};
</script>
