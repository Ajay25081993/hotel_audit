import { pgTable, text, integer, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'admin', 'auditor', 'reviewer', 'corporate', 'hotelgm'
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const hotelGroups = pgTable("hotel_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // e.g., "Taj Hotels", "Marriott", "Hilton"
  sop: text("sop"), // Standard Operating Procedures as JSON text
  sopFiles: text("sop_files"), // JSON array of uploaded SOP file paths and metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  region: text("region").notNull(),
  hotelGroupId: integer("hotel_group_id").references(() => hotelGroups.id),
  image: text("image"),
  lastAuditScore: integer("last_audit_score"),
  nextAuditDate: timestamp("next_audit_date"),
  status: text("status").default('green'), // 'green', 'amber', 'red'
  createdAt: timestamp("created_at").defaultNow(),
});

export const audits = pgTable("audits", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  auditorId: integer("auditor_id").references(() => users.id),
  reviewerId: integer("reviewer_id").references(() => users.id),
  hotelGroupId: integer("hotel_group_id").references(() => hotelGroups.id),
  sop: text("sop"), // Hotel group SOP snapshot at audit time
  sopFiles: text("sop_files"), // JSON array of SOP file paths for this audit
  status: text("status").default('scheduled'), // 'scheduled', 'in_progress', 'submitted', 'reviewed', 'completed'
  overallScore: integer("overall_score"),
  cleanlinessScore: integer("cleanliness_score"),
  brandingScore: integer("branding_score"),
  operationalScore: integer("operational_score"),
  complianceZone: text("compliance_zone"), // 'green', 'amber', 'red'
  findings: text("findings"), // JSON as text
  actionPlan: text("action_plan"), // JSON as text
  submittedAt: timestamp("submitted_at"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditItems = pgTable("audit_items", {
  id: serial("id").primaryKey(),
  auditId: integer("audit_id").notNull().references(() => audits.id),
  category: text("category").notNull(),
  item: text("item").notNull(),
  score: integer("score"),
  comments: text("comments"),
  aiAnalysis: text("ai_analysis"), // AI-generated analysis and insights
  photos: text("photos"), // JSON as text
  status: text("status").default('pending'), // 'pending', 'completed'
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  name: true,
  email: true,
});

export const insertHotelGroupSchema = createInsertSchema(hotelGroups).pick({
  name: true,
  sop: true,
});

export const insertPropertySchema = createInsertSchema(properties).pick({
  name: true,
  location: true,
  region: true,
  hotelGroupId: true,
  image: true,
});

export const insertAuditSchema = createInsertSchema(audits).pick({
  propertyId: true,
  auditorId: true,
  reviewerId: true,
  hotelGroupId: true,
  sop: true,
  sopFiles: true,
});

export const insertAuditItemSchema = createInsertSchema(auditItems).pick({
  auditId: true,
  category: true,
  item: true,
  score: true,
  comments: true,
  photos: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Audit = typeof audits.$inferSelect;
export type InsertAudit = z.infer<typeof insertAuditSchema>;
export type AuditItem = typeof auditItems.$inferSelect;
export type InsertAuditItem = z.infer<typeof insertAuditItemSchema>;

export type UserRole = 'admin' | 'auditor' | 'reviewer' | 'corporate' | 'hotelgm';
export type ComplianceZone = 'green' | 'amber' | 'red';
export type AuditStatus = 'scheduled' | 'in_progress' | 'submitted' | 'reviewed' | 'completed' | 'approved' | 'needs_revision';
