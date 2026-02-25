import { fileURLToPath } from 'url';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools:          { enabled: true },

  runtimeConfig: {
    public: {
      assetBaseUrl: process.env.ASSET_BASE_URL ?? 'https://asset.tcg.cards',
    },
  },
  nitro: {
    preset: 'cloudflare_module',

    cloudflare: {
      deployConfig: true,
      nodeCompat:   true,
    },
  },

  modules: [
    'nitro-cloudflare-dev',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxthub/core',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    '@nuxt/ui',
  ],

  alias: {
    '#model':  fileURLToPath(new URL('./model', import.meta.url)),
    '#schema': fileURLToPath(new URL('./server/db/schema', import.meta.url)),
  },

  imports: {
    dirs: [
      'composables/**',
      'components/**',
    ],
  },

  css: ['~/assets/css/tailwind.css'],

  experimental: {
    typedPages: true,
  },

  icon: {
    provider:          'server',
    customCollections: [
      {
        prefix:    'i',
        dir:       './app/assets/icons/icon',
        recursive: true,
      },
      {
        prefix:    's',
        dir:       './app/assets/icons/symbol',
        recursive: true,
      },
    ],
  },

  hub: {
    db: {
      dialect: 'postgresql',
      driver:  'postgres-js',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales:       [
      { code: 'en', language: 'en-US', name: 'English', file: 'en/index.ts' },
      { code: 'zhs', language: 'zh-CN', name: 'Chinese (Simplified)', file: 'zhs/index.ts' },
    ],
    strategy:              'no_prefix',
    detectBrowserLanguage: {
      useCookie:  true,
      redirectOn: 'root',
    },
  },
});
