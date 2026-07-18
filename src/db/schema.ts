import {
  pgTable,
  pgEnum,
  text,
  jsonb,
  smallint,
  serial,
  timestamp,
  index,
} from 'drizzle-orm/pg-core'

export const entityType = pgEnum('entity_type', ['block', 'mob', 'structure'])

export const entities = pgTable(
  'entities',
  {
    id: text('id').primaryKey(),
    type: entityType('type').notNull(),
    name: text('name').notNull(),
    category: text('category').notNull(),
    imageUrl: text('image_url'),
    properties: jsonb('properties').notNull(),
    sourceVersion: text('source_version'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('idx_entities_type_category').on(table.type, table.category),
    index('idx_entities_properties_gin').using('gin', table.properties),
  ]
)

export const triviaHooks = pgTable(
  'trivia_hooks',
  {
    id: serial('id').primaryKey(),
    entityId: text('entity_id')
      .notNull()
      .references(() => entities.id, { onDelete: 'cascade' }),
    category: text('category').notNull(),
    difficulty: text('difficulty').notNull(),
    questionSeed: text('question_seed').notNull(),
    answer: text('answer').notNull(),
  },
  (table) => [
    index('idx_hooks_entity').on(table.entityId),
    index('idx_hooks_category_difficulty').on(table.category, table.difficulty),
  ]
)

export const questionBank = pgTable(
  'question_bank',
  {
    id: serial('id').primaryKey(),
    entityId: text('entity_id')
      .notNull()
      .references(() => entities.id, { onDelete: 'cascade' }),
    entityType: entityType('entity_type').notNull(),
    category: text('category').notNull(),
    difficulty: text('difficulty').notNull(),
    questionText: text('question_text').notNull(),
    correctAnswer: text('correct_answer').notNull(),
    options: jsonb('options').notNull(),
    correctIndex: smallint('correct_index').notNull(),
    explanation: text('explanation'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('idx_qbank_type_category_diff').on(
      table.entityType,
      table.category,
      table.difficulty
    ),
  ]
)
