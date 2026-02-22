import { os } from './orpc';

import { z } from 'zod';

const test = os
  .input(z.void())
  .output(z.string())
  .handler(() => {
    return 'Hello, oRPC!';
  });

export const router = {
  test,
};

export type Router = typeof router;
