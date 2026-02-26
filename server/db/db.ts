import { drizzle } from 'drizzle-orm/postgres-js';

interface HyperdriveBinding {
  connectionString: string;
}

function getHyperdrive(): HyperdriveBinding {
  const binding = (process.env.HYPERDRIVE as unknown as HyperdriveBinding)
    ?? (globalThis as any).__env__?.HYPERDRIVE
    ?? (globalThis as any).HYPERDRIVE;

  if (binding == null) {
    console.log(process.env);

    throw new Error('[db] HYPERDRIVE binding not found');
  }

  return binding;
}

function createDb() {
  return drizzle({ connection: getHyperdrive().connectionString });
}

type Db = ReturnType<typeof createDb>;

export const db: Db = new Proxy({} as Db, {
  get(_, prop: string | symbol) {
    return createDb()[prop as keyof Db];
  },
});
