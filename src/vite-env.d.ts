/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SURVEYCAKE_URL?: string;
  readonly VITE_SURVEYCAKE_USERID_PARAM?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
