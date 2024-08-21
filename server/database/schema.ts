import { pgTable,  varchar, pgSchema, uuid, serial } from 'drizzle-orm/pg-core';

const authSchema = pgSchema('auth');

const users = authSchema.table('users', {
	id: uuid('id').primaryKey(),
});


export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  user_id: uuid('user_id').references(() => users.id).notNull()
});




