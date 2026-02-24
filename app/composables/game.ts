import type { Game } from '~~/shared';

export const useGame = () => {
  const route = useRoute();

  const currentGame = computed<Game | null>(() => {
    return route.meta.game ?? null;
  });

  return currentGame;
};
