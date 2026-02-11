// https://nuxt.com/docs/api/configuration/nuxt-config
// eslint-disable-next-line nuxt/nuxt-config-keys-order
export default defineNuxtConfig({
  modules: [
    '@nuxthub/core',
    '@onmax/nuxt-better-auth',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    '@vueuse/nuxt',
    'nuxt-og-image'
  ],

  devtools: {
    enabled: true
  },

  hub: {
    db: 'sqlite',
    kv: true
  },

  auth: {
    serverConfig: 'server/auth.config',
    clientConfig: 'app/auth.config',
    secondaryStorage: true,
    redirects: {
      login: '/login',
      guest: '/app'
    }
  },

  runtimeConfig: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || ''
    },
    resend: {
      apiKey: process.env.RESEND_API_KEY || '',
      from: process.env.RESEND_FROM || ''
    },
    polar: {
      accessToken: process.env.POLAR_ACCESS_TOKEN || '',
      webhookSecret: process.env.POLAR_WEBHOOK_SECRET || '',
      server: process.env.POLAR_SERVER === 'sandbox' ? 'sandbox' : 'production'
    },
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/app/**': { auth: 'user', prerender: false },
    '/login': { auth: 'guest', prerender: false },
    '/signup': { auth: 'guest', prerender: false },
    '/forget-password': { auth: 'guest', prerender: false },
    '/reset-password': { auth: 'guest', prerender: false },
    '/docs': { redirect: '/docs/getting-started', prerender: false }
  },

  compatibilityDate: '2026-02-10',

  nitro: {
    preset: 'cloudflare-module',
    cloudflare: {
      wrangler: {
        observability: {
          enabled: true,
          logs: { enabled: true }
        }
      }
    },
    // Disable prerender crawler for worker builds.
    // Nitro defaults to crawling links and will try to prerender `/`,
    // which runs a Node prerender worker that can't resolve `hub:` imports.
    prerender: {
      crawlLinks: false,
      routes: []
    },
    hooks: {
      // Some Nuxt modules (e.g. content/docs) can add routes to prerender via hooks.
      // For Workers deploys we want pure SSR; no prerender step.
      'prerender:routes': (routes) => {
        routes.clear()
      }
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
