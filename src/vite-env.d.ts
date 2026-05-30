/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SURVEYCAKE_URL?: string;
  readonly VITE_SURVEYCAKE_USERID_PARAM?: string;
  readonly VITE_GA_MEASUREMENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
