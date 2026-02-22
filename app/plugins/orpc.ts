import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';

import type { RouterClient } from '@orpc/server';
import type { Router } from '~~/server/orpc/service';

export default defineNuxtPlugin(() => {
  const event = useRequestEvent();

  const link = new RPCLink({
    url:     `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/rpc`,
    headers: event?.headers,
  });

  const orpc: RouterClient<Router> = createORPCClient(link);

  return {
    provide: {
      orpc,
    },
  };
});
