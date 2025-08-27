/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string
  readonly VITE_API_URL?: string
  readonly VITE_SITE_URL?: string
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_UIV2_MOCK?: string
  readonly VITE_MOCK_AUTH?: string
}

interface ImportMeta { 
  readonly env: ImportMetaEnv 
}