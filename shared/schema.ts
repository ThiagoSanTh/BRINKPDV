import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), //colocaria como float e trataria no front como decimal
  stock: integer("stock").notNull().default(0),
  image: text("image"),
});

export const salespersons = pgTable("salespersons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  commission: decimal("commission", { precision: 5, scale: 2 }).notNull(),
  totalSales: decimal("total_sales", { precision: 10, scale: 2 }).notNull().default("0"),
  active: integer("active").notNull().default(1),// mudar para boolean True/False
  entryDate: date("entry_date").notNull().default(sql`CURRENT_DATE`),
});

export const sales = pgTable("sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  salespersonId: varchar("salesperson_id").references(() => salespersons.id),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),// poderia ser enum 
  items: text("items").notNull(),
  observation: text("observation"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const serviceOrders = pgTable("service_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(),
  customer: text("customer").notNull(),
  customerContact: text("customer_contact").notNull(),
  device: text("device").notNull(),
  issue: text("issue").notNull(),
  status: text("status").notNull().default("Orçamento"),
  priority: text("priority").notNull().default("Média"),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  date: date("date").notNull().default(sql`CURRENT_DATE`),
  deadline: date("deadline").notNull(),
  exitDate: date("exit_date"),
});

export const storeSettings = pgTable("store_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  storeName: text("store_name").notNull().default("BRINKPDV"),
  storeLogo: text("store_logo"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertSalespersonSchema = createInsertSchema(salespersons).omit({
  id: true,
  totalSales: true,
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
});

export const insertServiceOrderSchema = createInsertSchema(serviceOrders).omit({
  id: true,
});

export const insertStoreSettingsSchema = createInsertSchema(storeSettings).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertSalesperson = z.infer<typeof insertSalespersonSchema>;
export type Salesperson = typeof salespersons.$inferSelect;

export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof sales.$inferSelect;

export type InsertServiceOrder = z.infer<typeof insertServiceOrderSchema>;
export type ServiceOrder = typeof serviceOrders.$inferSelect;

export type InsertStoreSettings = z.infer<typeof insertStoreSettingsSchema>;
export type StoreSettings = typeof storeSettings.$inferSelect;
