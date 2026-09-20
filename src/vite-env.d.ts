/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GA_ID: string;
  readonly VITE_CONTACT_API_BASE_URL?: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
