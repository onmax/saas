import { sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

const authUser = sqliteTable('user', {
  id: text('id').primaryKey()
})

// Nuxt Better Auth preview currently exposes only user/account in generated schema.
// Keep legacy auth tables in schema to avoid accidental drop migrations.
export const legacySession = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expiresAt').notNull(),
  token: text('token').notNull(),
  createdAt: integer('createdAt')
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer('updatedAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => authUser.id, { onDelete: 'cascade' })
}, table => [
  uniqueIndex('session_token_unique').on(table.token),
  index('session_userId_idx').on(table.userId)
])

export const legacyVerification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expiresAt').notNull(),
  createdAt: integer('createdAt')
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer('updatedAt')
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull()
}, table => [index('verification_identifier_idx').on(table.identifier)])

export const todoItem = sqliteTable('todo_item', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => authUser.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull()
}, table => [index('todo_item_userId_idx').on(table.userId)])
