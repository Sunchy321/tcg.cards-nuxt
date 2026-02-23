import type { Game } from '~~/shared';

declare module '#app' {
  interface PageMeta {
    game?: Game | null;
  }
}

export {};
