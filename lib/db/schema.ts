import { sql, type InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';

export const RoleEnum = pgEnum('role', ['nurse', 'patient']);
export const MedsSignalEnum = pgEnum('meds_signal', [
  'took',
  'skipped',
  'unknown',
]);

export const clinic = pgTable(
  'clinic',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    name: varchar('name', { length: 120 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    nameIdx: index('idx_clinic_name').on(table.name),
  }),
);

export type Clinic = InferSelectModel<typeof clinic>;

export const user = pgTable(
  'user',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    username: varchar('username', { length: 48 }).notNull().unique(),
    role: RoleEnum('role').notNull(),
    clinicId: uuid('clinic_id').references((): any => clinic.id, {
      onDelete: 'set null',
    }),
    pinHash: varchar('pin_hash', { length: 120 }),
    passwordHash: varchar('password_hash', { length: 120 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    usernameIdx: index('idx_user_username').on(table.username),
    clinicIdx: index('idx_user_clinic').on(table.clinicId),
  }),
);

export type User = InferSelectModel<typeof user>;

export const patientProfile = pgTable(
  'patient_profile',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references((): any => user.id, { onDelete: 'cascade' }),
    clinicId: uuid('clinic_id').references((): any => clinic.id, {
      onDelete: 'set null',
    }),
    diseases: json('diseases'),
    medications: json('medications'),
    religion: text('religion'),
    family: json('family'),
    preferences: json('preferences'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    profileUserIdx: index('idx_patient_profile_user').on(table.userId),
    profileClinicIdx: index('idx_patient_profile_clinic').on(table.clinicId),
  }),
);

export type PatientProfile = InferSelectModel<typeof patientProfile>;

export const patientStatus = pgTable(
  'patient_status',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    patientProfileId: uuid('patient_profile_id')
      .notNull()
      .references((): any => patientProfile.id, { onDelete: 'cascade' }),
    lastActiveAt: timestamp('last_active_at'),
    lastMood: text('last_mood'),
    medsSignal: MedsSignalEnum('meds_signal').notNull().default('unknown'),
    concerns: json('concerns'),
    lastCheckInAt: timestamp('last_check_in_at'),
    dailySummary: text('daily_summary'),
    dailySummaryDate: timestamp('daily_summary_date'),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    statusProfileIdx: index('idx_patient_status_profile').on(
      table.patientProfileId,
    ),
  }),
);

export type PatientStatus = InferSelectModel<typeof patientStatus>;

export const chat = pgTable('chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references((): any => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  title: text('title').notNull().default('Care Chat'),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable('message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chat_id')
    .notNull()
    .references((): any => chat.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 16 }).notNull(),
  parts: json('parts').notNull(),
  attachments: json('attachments').notNull().default(sql`'[]'::json`),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Message = InferSelectModel<typeof message>;
