import tailwindcss from '@tailwindcss/vite';

import { fileURLToPath } from 'url';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools:          { enabled: true },

  nitro: {
    preset: 'cloudflare_module',

    cloudflare: {
      deployConfig: true,
      nodeCompat:   true,
    },
  },

  modules: [
    'nitro-cloudflare-dev',
    'shadcn-nuxt',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxthub/core',
    '@nuxtjs/i18n',
  ],

  alias: {
    '#model': fileURLToPath(new URL('./model', import.meta.url)),
  },

  shadcn: {
    prefix: '',

    componentDir: './app/components/ui',
  },

  css: ['~/assets/css/tailwind.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  icon: {
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
