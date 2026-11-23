/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PLATFORM?: "mock" | "yandex";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
