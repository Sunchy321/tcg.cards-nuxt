import type { Game } from '#shared';
import type { ActionDef } from '~/composables/actions';

declare module '#app' {
  interface PageMeta {
    game?:    Game | null;
    actions?: ActionDef[];
  }
}

export {};
