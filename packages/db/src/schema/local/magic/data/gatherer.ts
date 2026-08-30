import { integer, jsonb, timestamp } from 'drizzle-orm/pg-core';

import { dataSchema } from '../../../shared/magic/schema';

import type { GathererData } from '#model/magic/schema/data/gatherer/card';

/**
 * Raw Gatherer card cache. One row per multiverseId, holding the CardData
 * payload extracted from the site's Next.js App Router RSC flight data.
 */
export const Gatherer = dataSchema.table('gatherer', {
  multiverseId: integer('multiverse_id').primaryKey(),
  data:         jsonb('data').$type<GathererData>(),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  expiresAt:    timestamp('expires_at').notNull(),
});
