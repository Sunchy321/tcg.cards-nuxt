import { GAMES, type Game } from '~~/shared';

export default defineNuxtRouteMiddleware(to => {
  const gamePath = to.path.split('/')[1];

  if (GAMES.includes(gamePath as Game)) {
    to.meta.game = gamePath as Game;
  } else {
    to.meta.game = null;
  }
});
