import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  points: integer("points").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  avatarUrl: text("avatar_url"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  points: true,
  streak: true,
});

// Meal schema
export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // breakfast, lunch, dinner
  date: timestamp("date").notNull(),
  day: integer("day").notNull(), // 1-5
  beforePhotoUrl: text("before_photo_url"),
  afterPhotoUrl: text("after_photo_url"),
  status: text("status").notNull().default("pending"), // pending, completed
  wastePercentage: integer("waste_percentage"), // 0-100
  pointsEarned: integer("points_earned").default(0),
});

export const insertMealSchema = createInsertSchema(meals).omit({
  id: true,
  pointsEarned: true,
});

export const updateMealSchema = createInsertSchema(meals).omit({
  id: true,
  userId: true,
  type: true,
  date: true,
  day: true,
}).partial();

// Badge schema
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // streak, sustainability, recycling, etc.
  level: text("level").notNull(), // bronze, silver, gold
  count: integer("count").notNull().default(1),
  earnedAt: timestamp("earned_at").notNull(),
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
});

// Activity schema
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // garden, recycling, etc.
  date: timestamp("date").notNull(),
  points: integer("points").notNull(),
  location: text("location").notNull(),
  participantsCount: integer("participants_count").notNull().default(0),
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  participantsCount: true,
});

// ActivityParticipant schema
export const activityParticipants = pgTable("activity_participants", {
  id: serial("id").primaryKey(),
  activityId: integer("activity_id").notNull(),
  userId: integer("user_id").notNull(),
  registered: boolean("registered").notNull().default(true),
  attended: boolean("attended").notNull().default(false),
});

export const insertActivityParticipantSchema = createInsertSchema(activityParticipants).omit({
  id: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Meal = typeof meals.$inferSelect;
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type UpdateMeal = z.infer<typeof updateMealSchema>;

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type ActivityParticipant = typeof activityParticipants.$inferSelect;
export type InsertActivityParticipant = z.infer<typeof insertActivityParticipantSchema>;
