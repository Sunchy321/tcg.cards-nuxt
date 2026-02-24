import { useLocalStorage } from '@vueuse/core';

import type { Game } from '~~/shared';

import type { Locale as MagicLocale } from '~~/model/magic/schema/basic';

import { locale as magicLocale } from '~~/model/magic/schema/basic';

import z from 'zod';

type Locale<G extends Game> = {
  magic:       MagicLocale;
  hearthstone: 'en';
}[G];

const schemas = {
  magic:       magicLocale,
  hearthstone: z.enum(['en']),
} as const;

export const useGameLocale = (game: Game) => {
  const locale = useLocalStorage(`${game}_locale`, 'en');

  const localeSchema = schemas[game];

  return computed({
    get() {
      return localeSchema.safeParse(locale.value).data ?? localeSchema.options[0]!;
    },
    set(newValue: Locale<Game>) {
      const newLocale = localeSchema.safeParse(newValue);

      if (newLocale.success) {
        locale.value = newValue;
      }
    },
  });
};
