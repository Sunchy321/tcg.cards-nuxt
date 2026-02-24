// import type { LocaleMessageValue } from 'vue-i18n';

// import { GAMES } from '#shared';

// const gameI18n = import.meta.glob<LocaleMessageValue>('./*/index.ts', { eager: true, import: 'default' });

import omni from './omni';
import magic from './magic';
import hearthstone from './hearthstone';

export default {
  lang: {
    '$self': 'English',

    'en':  'English',
    'de':  'German',
    'es':  'Spanish',
    'fr':  'French',
    'it':  'Italian',
    'ja':  'Japanese',
    'ko':  'Korean',
    'mx':  'Mexican Spanish',
    'pl':  'Polish',
    'pt':  'Portuguese',
    'ru':  'Russian',
    'th':  'Thai',
    'zhs': 'Simplified Chinese',
    'zht': 'Traditional Chinese',
    'he':  'Hebrew',
    'la':  'Latin',
    'grc': 'Ancient Greek',
    'ar':  'Arabic',
    'sa':  'Sanskrit',
    'ph':  'Phyrexian',

    'en:asia': 'English (Asia)',
    'zhs:pro': 'Simplified Chinese (YGOPro)',
    'zhs:nw':  'Simplified Chinese (NW)',
    'zhs:cn':  'Simplified Chinese (CNOCG)',
    'zhs:md':  'Simplified Chinese (Master Duel)',
  },

  // omnisearch: gameI18n['./omnisearch/index.ts'],

  // ...Object.fromEntries(GAMES.map(g => [g, gameI18n[`./${g}/index.ts`]])),

  omni,
  magic,
  hearthstone,
};
