import tailwindcss from '@tailwindcss/vite';

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
  ],

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
});
