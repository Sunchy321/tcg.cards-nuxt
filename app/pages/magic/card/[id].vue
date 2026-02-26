<template>
  <div class="container mx-auto px-4 py-8 pt-16">
    <div v-if="data" class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Left column: Card image -->
      <div class="lg:col-span-3">
        <div class="sticky top-24">
          <UCard>
            <MagicCardImage
              :lang="imageLang"
              :set="data.set"
              :number="data.number"
              :layout="data.print.layout"
              :full-image-type="data.print.fullImageType"
              :image-status="data.print.imageStatus"
            />
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
            {{ data.cardPartLocalization.name }}
          </h1>
          <p class="text-gray-600 mb-4">
            {{ data.cardPart.name }}
          </p>

          <div class="border-t border-b py-4 my-4 space-y-3">
            <div class="flex">
              <span class="w-32 font-semibold text-gray-700">Type:</span>
              <span>{{ data.cardPartLocalization.typeline }}</span>
            </div>
            <div v-if="data.cardPart.cost" class="flex">
              <span class="w-32 font-semibold text-gray-700">Cost:</span>
              <span>{{ data.cardPart.cost.join('') }}</span>
            </div>
            <div class="flex">
              <span class="w-32 font-semibold text-gray-700">Rarity:</span>
              <span :class="getRarityColor(data.print.rarity)">{{ data.print.rarity }}</span>
            </div>
            <div class="flex">
              <span class="w-32 font-semibold text-gray-700">Set:</span>
              <span>{{ data.set }}</span>
            </div>
            <div v-if="data.cardPart.power != null" class="flex">
              <span class="w-32 font-semibold text-gray-700">P/T:</span>
              <span>{{ data.cardPart.power }}/{{ data.cardPart.toughness }}</span>
            </div>
            <div v-if="data.cardPart.loyalty != null" class="flex">
              <span class="w-32 font-semibold text-gray-700">Loyalty:</span>
              <span>{{ data.cardPart.loyalty }}</span>
            </div>
          </div>

          <div class="mb-6">
            <h2 class="text-xl font-semibold mb-3">
              Card Effect
            </h2>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-gray-800 leading-relaxed whitespace-pre-line">
                {{ data.cardPartLocalization.text }}
              </p>
            </div>
          </div>

          <div v-if="data.printPart.flavorText" class="mb-6">
            <h2 class="text-xl font-semibold mb-3">
              Flavor Text
            </h2>
            <p class="text-gray-600 italic">
              {{ data.printPart.flavorText }}
            </p>
          </div>

          <div v-if="data.card.keywords.length > 0" class="mb-6">
            <h2 class="text-xl font-semibold mb-3">
              Keywords
            </h2>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="keyword in data.card.keywords"
                :key="keyword"
                color="info"
                variant="subtle"
              >
                {{ keyword }}
              </UBadge>
            </div>
          </div>

          <div v-if="data.rulings.length > 0" class="mb-6">
            <h2 class="text-xl font-semibold mb-3">
              Rulings
            </h2>
            <div class="space-y-3">
              <div
                v-for="(ruling, i) in data.rulings"
                :key="i"
                class="bg-gray-50 rounded-lg p-3"
              >
                <div class="text-xs text-gray-400 mb-1">
                  {{ ruling.source }} · {{ ruling.date }}
                </div>
                <p class="text-sm text-gray-800">
                  {{ ruling.text }}
                </p>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Right column: Card printing information -->
      <div class="lg:col-span-3">
        <div class="sticky top-24">
          <UCard>
            <h2 class="text-xl font-semibold mb-4">
              Versions
            </h2>

            <div class="space-y-4">
              <!-- Locale/lang row -->
              <div class="flex flex-wrap gap-1">
                <div
                  v-for="lv in uniqueLocales"
                  :key="`${lv.locale}-${lv.lang}`"
                  class="flex cursor-pointer gap-1 hover:opacity-70"
                  :class="{ 'opacity-100': lv.locale === data.locale, 'opacity-40': lv.locale !== data.locale }"
                  @click="navigateToLocale(lv.locale)"
                >
                  <template v-if="lv.locale !== lv.lang">
                    <span class="rounded border border-blue-300 bg-blue-100 px-1 font-mono text-xs text-blue-700">{{ lv.locale }}</span>
                  </template>
                  <template v-else>
                    <span class="rounded bg-gray-100 px-1 font-mono text-xs text-gray-600">{{ lv.lang }}</span>
                  </template>
                </div>
              </div>

              <!-- Set/number section -->
              <div class="space-y-3">
                <div v-for="group in visibleGroups" :key="group.set">
                  <div
                    class="mb-0.5 cursor-pointer font-mono text-xs font-semibold uppercase hover:opacity-70"
                    :class="group.set === data.set ? 'text-primary' : 'text-gray-400'"
                    @click="navigateToSet(group.set)"
                  >
                    {{ group.set }}
                  </div>
                  <div class="flex flex-wrap gap-x-2 gap-y-0.5">
                    <div
                      v-for="version in group.versions"
                      :key="`${version.set}-${version.number}`"
                      class="cursor-pointer text-sm hover:opacity-70"
                      :class="version.number === data.number && version.set === data.set ? 'font-semibold text-primary' : 'text-gray-500'"
                      @click="navigateToNumber(version.set, version.number)"
                    >
                      #{{ version.number }}
                    </div>
                  </div>
                </div>

                <div v-if="!showAllSets && groupedVersions.length > SETS_LIMIT">
                  <UButton size="sm" variant="ghost" @click="showAllSets = true">
                    Show all ({{ groupedVersions.length }} sets)
                  </UButton>
                </div>
              </div>
            </div>

            <div class="mt-4 space-y-2 border-t pt-4 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Release:</span>
                <span>{{ data.print.releaseDate }}</span>
              </div>
              <div v-if="data.printPart.artist" class="flex justify-between">
                <span class="text-gray-600">Artist:</span>
                <span>{{ data.printPart.artist }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Number:</span>
                <span>{{ data.number }}</span>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { locale as localeSchema } from '#model/magic/schema/basic';

import _ from 'lodash';

const { $orpc } = useNuxtApp();
const route = useRoute('magic-card-id');
const router = useRouter();
const gameLocale = useGameLocale('magic');
const { setActions } = useActions();
const { randomAction } = useMagicActions();

definePageMeta({
  layout:  'main',
  actions: [{ id: 'random', icon: 'tabler:arrows-shuffle' }],
});

setActions([randomAction]);

const query = computed(() => {
  const q = {
    cardId:    route.params.id as string,
    locale:    localeSchema.safeParse(route.query.locale as string).data ?? gameLocale.value,
    set:       route.query.set as string,
    number:    route.query.number as string,
    partIndex: route.query.part as string ?? '0',
  };

  return _.omitBy(q, v => v == null) as Parameters<typeof $orpc.magic.card.fuzzy>[0];
});

const asyncDataKey = () => [
  'magic-card-fuzzy',
  query.value.cardId,
  query.value.locale,
  query.value.set ?? '',
  query.value.number ?? '',
  query.value.partIndex ?? '',
].join(':');

const { data } = await useAsyncData(
  asyncDataKey,
  () => $orpc.magic.card.fuzzy(query.value),
  { watch: [query] },
);

const getRarityColor = (rarity: string) => {
  const colors: Record<string, string> = {
    common:   'text-gray-700',
    uncommon: 'text-blue-600',
    rare:     'text-yellow-600',
    mythic:   'text-orange-600',
    bonus:    'text-purple-600',
    special:  'text-red-600',
  };
  return colors[rarity] ?? 'text-gray-700';
};

const SETS_LIMIT = 10;
const showAllSets = ref(false);

const uniqueLocales = computed(() => {
  if (!data.value) return [];
  const uniq = _.uniqBy(
    data.value.versions.map(v => ({ locale: v.locale, lang: v.lang })),
    v => `${v.locale}-${v.lang}`,
  );
  return _.sortBy(uniq, v => localeSchema.options.indexOf(v.locale));
});

const numberPrefix = (n: string) => parseInt(n.match(/^\d+/)?.[0] ?? '0', 10);

const groupedVersions = computed(() => {
  if (!data.value) return [];
  const setsInOrder = _.uniqBy(data.value.versions, 'set').map(v => v.set);
  const grouped = _.groupBy(data.value.versions, 'set');
  return setsInOrder.map(set => ({
    set,
    versions: _.sortBy(_.uniqBy(grouped[set]!, 'number'), [v => numberPrefix(v.number), 'number']),
  }));
});

const visibleGroups = computed(() => {
  return showAllSets.value ? groupedVersions.value : groupedVersions.value.slice(0, SETS_LIMIT);
});

const navigateToLocale = (targetLocale: string) => {
  const versions = data.value?.versions ?? [];
  const currentSet = query.value.set;

  const candidate
    = versions.find(v => v.locale === targetLocale && v.set === currentSet)
      ?? versions.find(v => v.locale === targetLocale);

  router.push({
    query: {
      ...route.query,
      locale: targetLocale,
      set:    candidate?.set ?? currentSet,
      number: undefined,
    },
  });
};

const navigateToSet = (targetSet: string) => {
  const versions = data.value?.versions ?? [];
  const currentLocale = query.value.locale;

  const candidate
    = versions.find(v => v.set === targetSet && v.locale === currentLocale)
      ?? versions.find(v => v.set === targetSet);

  router.push({
    query: {
      ...route.query,
      set:    targetSet,
      locale: candidate?.locale ?? currentLocale,
      number: undefined,
    },
  });
};

const navigateToNumber = (targetSet: string, targetNumber: string) => {
  const versions = data.value?.versions ?? [];
  const currentLocale = query.value.locale;

  const candidate
    = versions.find(v => v.set === targetSet && v.number === targetNumber && v.locale === currentLocale)
      ?? versions.find(v => v.set === targetSet && v.number === targetNumber);

  router.push({
    query: {
      ...route.query,
      set:    targetSet,
      number: targetNumber,
      locale: candidate?.locale ?? currentLocale,
    },
  });
};

const imageLang = computed(() => {
  if (!data.value) return 'en';
  if (data.value.print.imageStatus !== 'placeholder') return data.value.lang;

  const sameSetNumber = data.value.versions.filter(
    v => v.set === data.value!.set && v.number === data.value!.number,
  );

  const fallback = localeSchema.options
    .map(loc => sameSetNumber.find(v => v.lang === loc))
    .find(v => v != null);

  return fallback?.lang ?? 'en';
});
</script>
