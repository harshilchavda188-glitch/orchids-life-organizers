import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  authMethod: text("auth_method").default("email"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const shoppingItems = sqliteTable("shopping_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category").default("Groceries"),
  quantity: text("quantity").default(""),
  notes: text("notes"),
  purchased: integer("purchased").default(0),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  amount: real("amount").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  date: text("date").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const recipes = sqliteTable("recipes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category").default("Lunch"),
  ingredients: text("ingredients").default("[]"),
  steps: text("steps").default("[]"),
  notes: text("notes"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const weeklyTasks = sqliteTable("weekly_tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  day: text("day").notNull(),
  task: text("task").notNull(),
  completed: integer("completed").default(0),
});

export const monthlyEvents = sqliteTable("monthly_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  title: text("title").notNull(),
  eventDate: text("event_date"),
  notes: text("notes"),
  type: text("type").default("event"),
});

export const yearlyEvents = sqliteTable("yearly_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  year: integer("year").notNull(),
  title: text("title").notNull(),
  month: text("month"),
  description: text("description"),
  type: text("type").default("other"),
});
