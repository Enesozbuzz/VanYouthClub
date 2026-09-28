import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  inet,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * VanYouthClub — PostgreSQL schema (Drizzle ORM).
 * Design reference: docs/DATABASE_PLAN.md
 */

export const adminRole = pgEnum("AdminRole", ["ADMIN", "SUPER_ADMIN"]);
export const eventStatus = pgEnum("EventStatus", [
  "DRAFT",
  "PUBLISHED",
  "CANCELLED",
  "COMPLETED",
]);

export const admins = pgTable(
  "admins",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    fullName: text("full_name").notNull(),
    role: adminRole("role").notNull().default("ADMIN"),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (t) => [uniqueIndex("admins_email_key").on(t.email)],
);

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    adminId: uuid("admin_id").notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
  },
  (t) => [
    uniqueIndex("admin_sessions_token_hash_key").on(t.tokenHash),
    index("admin_sessions_admin_id_idx").on(t.adminId),
    index("admin_sessions_expires_at_idx").on(t.expiresAt),
    foreignKey({
      columns: [t.adminId],
      foreignColumns: [admins.id],
      name: "admin_sessions_admin_id_fkey",
    })
      .onDelete("cascade")
      .onUpdate("no action"),
  ],
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("categories_name_key").on(t.name),
    uniqueIndex("categories_slug_key").on(t.slug),
  ],
);

export const events = pgTable(
  "events",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull(),
    categoryId: uuid("category_id").notNull(),
    location: text("location").notNull(),
    startAt: timestamp("start_at", { withTimezone: true, mode: "date" }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true, mode: "date" }).notNull(),
    capacity: integer("capacity"),
    coverImageUrl: text("cover_image_url"),
    status: eventStatus("status").notNull().default("DRAFT"),
    publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("events_slug_key").on(t.slug),
    index("events_category_id_idx").on(t.categoryId),
    index("events_status_start_at_idx").on(t.status, t.startAt),
    foreignKey({
      columns: [t.categoryId],
      foreignColumns: [categories.id],
      name: "events_category_id_fkey",
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    check("events_end_after_start_check", sql`${t.endAt} > ${t.startAt}`),
  ],
);

export const galleryImages = pgTable(
  "gallery_images",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    imageUrl: text("image_url").notNull(),
    altText: text("alt_text").notNull(),
    title: text("title"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
);

export const siteSettings = pgTable(
  "site_settings",
  {
    key: text("key").primaryKey(),
    value: jsonb("value").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedByAdminId: uuid("updated_by_admin_id"),
  },
  (t) => [
    foreignKey({
      columns: [t.updatedByAdminId],
      foreignColumns: [admins.id],
      name: "site_settings_updated_by_admin_id_fkey",
    })
      .onDelete("set null")
      .onUpdate("no action"),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    actorAdminId: uuid("actor_admin_id"),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id"),
    entityLabel: text("entity_label"),
    metadata: jsonb("metadata"),
    ipAddress: inet("ip_address"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("audit_logs_actor_admin_id_idx").on(t.actorAdminId),
    index("audit_logs_entity_type_entity_id_idx").on(t.entityType, t.entityId),
    index("audit_logs_created_at_idx").on(t.createdAt),
    foreignKey({
      columns: [t.actorAdminId],
      foreignColumns: [admins.id],
      name: "audit_logs_actor_admin_id_fkey",
    })
      .onDelete("set null")
      .onUpdate("no action"),
  ],
);

/* ------------------------------------------------------------------ */
/* Relations (typed query helpers)                                     */
/* ------------------------------------------------------------------ */

export const adminsRelations = relations(admins, ({ many }) => ({
  sessions: many(adminSessions),
  auditLogs: many(auditLogs),
  settingUpdates: many(siteSettings),
}));

export const adminSessionsRelations = relations(adminSessions, ({ one }) => ({
  admin: one(admins, {
    fields: [adminSessions.adminId],
    references: [admins.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  events: many(events),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  category: one(categories, {
    fields: [events.categoryId],
    references: [categories.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(admins, {
    fields: [auditLogs.actorAdminId],
    references: [admins.id],
  }),
}));

export const siteSettingsRelations = relations(siteSettings, ({ one }) => ({
  updatedBy: one(admins, {
    fields: [siteSettings.updatedByAdminId],
    references: [admins.id],
  }),
}));

/* ------------------------------------------------------------------ */
/* Foreign key for site_settings.updated_by_admin_id                   */
/* (declared here because the table has no extra-config callback)      */
/* ------------------------------------------------------------------ */

export const siteSettingsUpdaterFkey = foreignKey({
  columns: [siteSettings.updatedByAdminId],
  foreignColumns: [admins.id],
  name: "site_settings_updated_by_admin_id_fkey",
})
  .onDelete("set null")
  .onUpdate("no action");
