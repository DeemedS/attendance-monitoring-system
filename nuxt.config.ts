import path from 'path';

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  alias: 
  {
    "~": path.resolve(__dirname),
  },
  css: [
    '~/assets/css/main.css',
    'bootstrap/dist/css/bootstrap.min.css'
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  modules: ['@nuxtjs/supabase'],
  typescript: {
    typeCheck: true
  },
  supabase: {
      redirectOptions: {
        login: '/',
        include: [
        ],
        callback: '/confirm',
        exclude: [
          '/register',
        ],
        cookieRedirect: false,
      },
    cookieOptions: {
      maxAge: 60 * 60 * 8,
      sameSite: 'lax',
      secure: true
    }
  },
  plugins: [
    '~/plugins/bootstrap.client.ts'
  ],
  app: {
    head: {
      script: [
        {
          src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
          type: 'text/javascript',
        },
        {
          src: '/js/students-scripts.js'
        }
      ],
    },
  },
})