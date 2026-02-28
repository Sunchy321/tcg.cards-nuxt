import { type Game, GAMES } from '~~/shared';

export const useGame = () => {
  const route = useRoute();

  return computed<Game | null>(() => {
    const gamePath = route.path.split('/')[1];

    if (GAMES.includes(gamePath as Game)) {
      return gamePath as Game;
    } else {
      return null;
    }
  });
};
