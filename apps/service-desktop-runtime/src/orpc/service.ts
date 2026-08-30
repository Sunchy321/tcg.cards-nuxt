import { hearthstoneRouter } from './hearthstone';
import { imageRouter } from './image';
import { runtimeRouter } from './runtime';
import { tagRouter } from './tag';
import { taskRouter } from './task';
import { testRouter } from './test-task';
import { yugiohRouter } from './yugioh';

/** Desktop runtime RPC router served from the local Bun process. */
export const router = {
  runtime:     runtimeRouter,
  hsdata:      hearthstoneRouter,
  hearthstone: hearthstoneRouter,
  image:       imageRouter,
  tag:         tagRouter,
  task:        taskRouter,
  test:        testRouter,
  yugioh:      yugiohRouter,
};

/** Desktop runtime router type exported for local typed clients. */
export type Router = typeof router;
