import { text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { dataSchema } from '../../shared/magic/schema';

/**
 * Manual slug ↔ oracle_id annotation. Records the disambiguated cardId slug
 * a human assigned to a Scryfall oracle object when multiple distinct oracle
 * cards normalize to the same English-name slug (e.g. a paper card and its
 * online rebalance, or genuine duplicate names).
 */
export const CardSlugAnnotation = dataSchema.table('card_slug_annotations', {
  slug:      text('slug').primaryKey(),
  oracleId:  uuid('oracle_id').notNull(),
  reason:    text('reason'),
  notes:     text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
