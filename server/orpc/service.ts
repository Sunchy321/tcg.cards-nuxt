import { os } from './orpc';

import { z } from 'zod';

import { db } from '@nuxthub/db';
import { users } from 'hub:db:schema';

const hello = os
  .input(z.void())
  .output(z.string())
  .handler(() => {
    return 'Hello, oRPC!';
  });

const test = os
  .input(z.void())
  .output(z.object({ count: z.number() }))
  .handler(async () => {
    const count = await db.$count(users);

    return { count };
  });

export const router = {
  hello,
  test,
};

export type Router = typeof router;
