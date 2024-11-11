import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

export const yourTable = pgTable('your_table', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  value: text('value').notNull(),
  // Add more fields as needed
});

// Type inference
export type YourTable = typeof yourTable.$inferSelect;
export type NewYourTable = typeof yourTable.$inferInsert; 