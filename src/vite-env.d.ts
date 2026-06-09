/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_APP_URL: string
  readonly VITE_CYMATONES_API_URL: string
  readonly VITE_TRACKS_AUDIO_BASE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
