<<<<<<< HEAD
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

=======
>>>>>>> b6ea756efb67345bda2263b0f14deb536b617b7e
// server/index.ts
import express from "express";

// server/routes.ts
import { createServer } from "http";

<<<<<<< HEAD
// server/db.ts
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  insertProductSchema: () => insertProductSchema,
  insertSaleSchema: () => insertSaleSchema,
  insertSalespersonSchema: () => insertSalespersonSchema,
  insertServiceOrderSchema: () => insertServiceOrderSchema,
  insertStoreSettingsSchema: () => insertStoreSettingsSchema,
  insertUserSchema: () => insertUserSchema,
  products: () => products,
  sales: () => sales,
  salespersons: () => salespersons,
  serviceOrders: () => serviceOrders,
  storeSettings: () => storeSettings,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  image: text("image")
});
var salespersons = pgTable("salespersons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  commission: decimal("commission", { precision: 5, scale: 2 }).notNull(),
  totalSales: decimal("total_sales", { precision: 10, scale: 2 }).notNull().default("0"),
  active: integer("active").notNull().default(1),
  entryDate: date("entry_date").notNull().default(sql`CURRENT_DATE`)
});
var sales = pgTable("sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  salespersonId: varchar("salesperson_id").references(() => salespersons.id),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  items: text("items").notNull(),
  observation: text("observation"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var serviceOrders = pgTable("service_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(),
  customer: text("customer").notNull(),
  customerContact: text("customer_contact").notNull(),
  device: text("device").notNull(),
  issue: text("issue").notNull(),
  status: text("status").notNull().default("Or\xE7amento"),
  priority: text("priority").notNull().default("M\xE9dia"),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  date: date("date").notNull().default(sql`CURRENT_DATE`),
  deadline: date("deadline").notNull(),
  exitDate: date("exit_date")
});
var storeSettings = pgTable("store_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  storeName: text("store_name").notNull().default("BRINKPDV"),
  storeLogo: text("store_logo")
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true
});
var insertSalespersonSchema = createInsertSchema(salespersons).omit({
  id: true,
  totalSales: true
});
var insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true
});
var insertServiceOrderSchema = createInsertSchema(serviceOrders).omit({
  id: true
});
var insertStoreSettingsSchema = createInsertSchema(storeSettings).omit({
  id: true
});

// server/db.ts
function getDatabaseUrl() {
  return (process.env.DATABASE_URL || "").trim();
}
function isDatabaseConfigured() {
  return Boolean(getDatabaseUrl());
}
function getDb() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    return null;
  }
  const client = postgres(databaseUrl, {
    ssl: "require",
    max: 1
  });
  return drizzle(client, { schema: schema_exports });
}
var db = getDb();

// server/storage-sqlite.ts
import { randomUUID } from "crypto";

// server/db-sqlite.ts
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var dbPath = process.env.SQLITE_DB_PATH || path.resolve(__dirname, "..", "data", "brinkpdv.sqlite");
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}
var sqliteDb = new Database(dbPath);
sqliteDb.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price TEXT NOT NULL,
    stock TEXT NOT NULL DEFAULT '0',
    image TEXT
  );

  CREATE TABLE IF NOT EXISTS salespersons (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    commission TEXT NOT NULL,
    total_sales TEXT NOT NULL DEFAULT '0',
    active INTEGER NOT NULL DEFAULT 1,
    entry_date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    salesperson_id TEXT,
    total TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    items TEXT NOT NULL,
    observation TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY,
    entity TEXT NOT NULL,
    payload TEXT NOT NULL,
    created_at TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0
  );
`);
sqliteDb.prepare(`
  INSERT OR IGNORE INTO salespersons (id, name, email, phone, commission, total_sales, active, entry_date)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  "salesperson-default",
  "Vendedor Padr\xE3o",
  "vendedor@brinkcell.com",
  "000000000",
  "0.00",
  "0",
  1,
  (/* @__PURE__ */ new Date()).toISOString()
);
sqliteDb.prepare(`
  INSERT OR IGNORE INTO products (id, sku, name, category, price, stock, image)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`).run(
  "product-demo-1",
  "SKU-001",
  "Caf\xE9 Especial",
  "Bebidas",
  "12.90",
  "25",
  null
);
sqliteDb.prepare(`
  INSERT OR IGNORE INTO products (id, sku, name, category, price, stock, image)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`).run(
  "product-demo-2",
  "SKU-002",
  "Sandu\xEDche Artesanal",
  "Lanches",
  "24.50",
  "15",
  null
);
sqliteDb.prepare(`
  INSERT OR IGNORE INTO products (id, sku, name, category, price, stock, image)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`).run(
  "product-demo-3",
  "SKU-003",
  "P\xE3o de Queijo",
  "Padaria",
  "6.90",
  "40",
  null
);

// server/storage-sqlite.ts
var SqliteStorage = class {
  async getUser(id) {
    const row = sqliteDb.prepare("SELECT * FROM users WHERE id = ?").get(id);
    return row ? { ...row, id: row.id } : void 0;
  }
  async getUserByUsername(username) {
    const row = sqliteDb.prepare("SELECT * FROM users WHERE username = ?").get(username);
    return row ? { ...row, id: row.id } : void 0;
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    sqliteDb.prepare("INSERT INTO users (id, username, password) VALUES (?, ?, ?)").run(id, user.username, user.password);
    return user;
  }
  async getProducts() {
    const rows = sqliteDb.prepare("SELECT * FROM products ORDER BY name ASC").all();
    return rows.map((row) => ({
      ...row,
      id: row.id,
      price: Number(row.price),
      stock: Number(row.stock)
    }));
  }
  async getProductById(id) {
    const row = sqliteDb.prepare("SELECT * FROM products WHERE id = ?").get(id);
    return row ? {
      ...row,
      id: row.id,
      price: Number(row.price),
      stock: Number(row.stock)
    } : void 0;
  }
  async createProduct(insertProduct) {
    const id = randomUUID();
    const product = {
      ...insertProduct,
      id,
      image: insertProduct.image ?? null,
      stock: Number(insertProduct.stock ?? 0),
      price: Number(insertProduct.price)
    };
    sqliteDb.prepare(
      "INSERT INTO products (id, sku, name, category, price, stock, image) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(product.id, product.sku, product.name, product.category, product.price.toString(), product.stock, product.image ?? null);
    return product;
  }
  async updateProduct(id, product) {
    const existing = await this.getProductById(id);
    if (!existing) return void 0;
    const next = {
      ...existing,
      ...product,
      price: Number(product.price ?? existing.price),
      stock: Number(product.stock ?? existing.stock)
    };
    sqliteDb.prepare(
      "UPDATE products SET sku = ?, name = ?, category = ?, price = ?, stock = ?, image = ? WHERE id = ?"
    ).run(next.sku, next.name, next.category, next.price.toString(), next.stock, next.image ?? null, id);
    return next;
  }
  async deleteProduct(id) {
    sqliteDb.prepare("DELETE FROM products WHERE id = ?").run(id);
  }
  async getSales() {
    const rows = sqliteDb.prepare("SELECT * FROM sales ORDER BY created_at DESC").all();
    return rows.map((row) => ({
      ...row,
      id: row.id,
      salespersonId: row.salesperson_id,
      paymentMethod: row.payment_method,
      createdAt: new Date(row.created_at)
    }));
  }
  async getTodaySales() {
    const today = /* @__PURE__ */ new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0).toISOString();
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString();
    const rows = sqliteDb.prepare("SELECT * FROM sales WHERE created_at BETWEEN ? AND ? ORDER BY created_at DESC").all(start, end);
    return rows.map((row) => ({
      ...row,
      id: row.id,
      salespersonId: row.salesperson_id,
      paymentMethod: row.payment_method,
      createdAt: new Date(row.created_at)
    }));
  }
  async getSaleById(id) {
    const row = sqliteDb.prepare("SELECT * FROM sales WHERE id = ?").get(id);
    return row ? {
      ...row,
      id: row.id,
      salespersonId: row.salesperson_id,
      paymentMethod: row.payment_method,
      createdAt: new Date(row.created_at)
    } : void 0;
  }
  async createSale(insertSale) {
    const id = randomUUID();
    const createdAt = /* @__PURE__ */ new Date();
    const sale = {
      ...insertSale,
      id,
      salespersonId: insertSale.salespersonId || null,
      observation: insertSale.observation || null,
      createdAt
    };
    sqliteDb.prepare(
      "INSERT INTO sales (id, salesperson_id, total, payment_method, items, observation, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(
      sale.id,
      sale.salespersonId ?? null,
      sale.total.toString(),
      sale.paymentMethod,
      JSON.stringify(sale.items),
      sale.observation ?? null,
      createdAt.toISOString()
    );
    sqliteDb.prepare(
      "INSERT INTO sync_queue (id, entity, payload, created_at, synced) VALUES (?, ?, ?, ?, 0)"
    ).run(randomUUID(), "sales", JSON.stringify(sale), (/* @__PURE__ */ new Date()).toISOString());
    return sale;
  }
  async getSalespersonById(id) {
    const row = sqliteDb.prepare("SELECT * FROM salespersons WHERE id = ?").get(id);
    return row ? { ...row, id: row.id, commission: row.commission, totalSales: row.total_sales, active: Boolean(row.active), entryDate: row.entry_date } : void 0;
  }
};

// server/storage-postgres.ts
import { eq, and, gte, lte } from "drizzle-orm";
import { randomUUID as randomUUID2 } from "crypto";
var PostgresStorage = class {
  constructor(dbClient) {
    this.dbClient = dbClient;
  }
  async getUser(id) {
    if (!this.dbClient) return void 0;
    const rows = await this.dbClient.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0];
  }
  async getUserByUsername(username) {
    if (!this.dbClient) return void 0;
    const rows = await this.dbClient.select().from(users).where(eq(users.username, username)).limit(1);
    return rows[0];
  }
  async createUser(insertUser) {
    if (!this.dbClient) {
      throw new Error("Database is not configured");
    }
    const id = randomUUID2();
    const user = { ...insertUser, id };
    await this.dbClient.insert(users).values(user);
    return user;
  }
  async getProducts() {
    if (!this.dbClient) return [];
    const rows = await this.dbClient.select().from(products);
    return rows;
  }
  async getProductById(id) {
    if (!this.dbClient) return void 0;
    const rows = await this.dbClient.select().from(products).where(eq(products.id, id)).limit(1);
    return rows[0];
  }
  async createProduct(insertProduct) {
    if (!this.dbClient) {
      throw new Error("Database is not configured");
    }
    const id = randomUUID2();
    const product = { ...insertProduct, id, image: insertProduct.image ?? null };
    await this.dbClient.insert(products).values(product);
    return product;
  }
  async updateProduct(id, product) {
    if (!this.dbClient) return void 0;
    const existing = await this.getProductById(id);
    if (!existing) return void 0;
    const next = { ...existing, ...product, image: product.image ?? existing.image };
    await this.dbClient.update(products).set(next).where(eq(products.id, id));
    return next;
  }
  async deleteProduct(id) {
    if (!this.dbClient) return;
    await this.dbClient.delete(products).where(eq(products.id, id));
  }
  async getSales() {
    if (!this.dbClient) return [];
    const rows = await this.dbClient.select().from(sales);
    return rows;
  }
  async getTodaySales() {
    if (!this.dbClient) return [];
    const today = /* @__PURE__ */ new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    const rows = await this.dbClient.select().from(sales).where(and(gte(sales.createdAt, start), lte(sales.createdAt, end)));
    return rows;
  }
  async getSaleById(id) {
    if (!this.dbClient) return void 0;
    const rows = await this.dbClient.select().from(sales).where(eq(sales.id, id)).limit(1);
    return rows[0];
  }
  async createSale(insertSale) {
    if (!this.dbClient) {
      throw new Error("Database is not configured");
    }
    const id = randomUUID2();
    const sale = {
      ...insertSale,
      id,
      salespersonId: insertSale.salespersonId || null,
      observation: insertSale.observation || null,
      createdAt: /* @__PURE__ */ new Date()
    };
    await this.dbClient.insert(sales).values(sale);
    return sale;
  }
  async getSalespersonById(id) {
    if (!this.dbClient) return void 0;
    const rows = await this.dbClient.select().from(salespersons).where(eq(salespersons.id, id)).limit(1);
    return rows[0];
  }
};

// server/storage.ts
var HybridStorage = class {
  sqliteStorage = new SqliteStorage();
  postgresStorage = new PostgresStorage(db);
  async readWithFallback(remoteRead, localRead) {
    if (!isDatabaseConfigured()) {
      return localRead();
    }
    try {
      return await remoteRead();
    } catch (error) {
      console.warn("[STORAGE] Falha no Postgres/Supabase, usando fallback local do SQLite.", error);
      return localRead();
    }
  }
  async getUser(id) {
    return this.readWithFallback(
      () => this.postgresStorage.getUser(id),
      () => this.sqliteStorage.getUser(id)
    );
  }
  async getUserByUsername(username) {
    return this.readWithFallback(
      () => this.postgresStorage.getUserByUsername(username),
      () => this.sqliteStorage.getUserByUsername(username)
    );
  }
  async createUser(user) {
    const localUser = await this.sqliteStorage.createUser(user);
    if (!isDatabaseConfigured()) {
      return localUser;
    }
    try {
      await this.postgresStorage.createUser(localUser);
    } catch (error) {
      console.warn("[STORAGE] N\xE3o foi poss\xEDvel sincronizar usu\xE1rio com o Postgres/Supabase.", error);
    }
    return localUser;
  }
  async getProducts() {
    return this.readWithFallback(
      () => this.postgresStorage.getProducts(),
      () => this.sqliteStorage.getProducts()
    );
  }
  async getProductById(id) {
    return this.readWithFallback(
      () => this.postgresStorage.getProductById(id),
      () => this.sqliteStorage.getProductById(id)
    );
  }
  async createProduct(product) {
    const localProduct = await this.sqliteStorage.createProduct(product);
    if (!isDatabaseConfigured()) {
      return localProduct;
    }
    try {
      await this.postgresStorage.createProduct(localProduct);
    } catch (error) {
      console.warn("[STORAGE] N\xE3o foi poss\xEDvel sincronizar produto com o Postgres/Supabase.", error);
    }
    return localProduct;
  }
  async updateProduct(id, product) {
    const localProduct = await this.sqliteStorage.updateProduct(id, product);
    if (!isDatabaseConfigured()) {
      return localProduct;
    }
    try {
      await this.postgresStorage.updateProduct(id, product);
    } catch (error) {
      console.warn("[STORAGE] N\xE3o foi poss\xEDvel sincronizar atualiza\xE7\xE3o de produto.", error);
    }
    return localProduct;
  }
  async deleteProduct(id) {
    await this.sqliteStorage.deleteProduct(id);
    if (!isDatabaseConfigured()) {
      return;
    }
    try {
      await this.postgresStorage.deleteProduct(id);
    } catch (error) {
      console.warn("[STORAGE] N\xE3o foi poss\xEDvel remover produto no Postgres/Supabase.", error);
    }
  }
  async getSales() {
    return this.readWithFallback(
      () => this.postgresStorage.getSales(),
      () => this.sqliteStorage.getSales()
    );
  }
  async getTodaySales() {
    return this.readWithFallback(
      () => this.postgresStorage.getTodaySales(),
      () => this.sqliteStorage.getTodaySales()
    );
  }
  async getSaleById(id) {
    return this.readWithFallback(
      () => this.postgresStorage.getSaleById(id),
      () => this.sqliteStorage.getSaleById(id)
    );
  }
  async createSale(sale) {
    const localSale = await this.sqliteStorage.createSale(sale);
    if (!isDatabaseConfigured()) {
      return localSale;
    }
    try {
      await this.postgresStorage.createSale(localSale);
    } catch (error) {
      console.warn("[STORAGE] N\xE3o foi poss\xEDvel sincronizar a venda com o Postgres/Supabase.", error);
    }
    return localSale;
  }
  async getSalespersonById(id) {
    return this.readWithFallback(
      () => this.postgresStorage.getSalespersonById(id),
      () => this.sqliteStorage.getSalespersonById(id)
    );
  }
};
var storage = new HybridStorage();

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/products", async (_req, res) => {
    try {
      const products2 = await storage.getProducts();
      res.json(products2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });
  app2.post("/api/products", async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to create product" });
    }
  });
  app2.put("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });
  app2.delete("/api/products/:id", async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });
  app2.get("/api/sales", async (_req, res) => {
    try {
      const sales2 = await storage.getSales();
      res.json(sales2);
=======
// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  sales;
  salespersons;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.sales = /* @__PURE__ */ new Map();
    this.salespersons = /* @__PURE__ */ new Map();
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async getSales() {
    return Array.from(this.sales.values());
  }
  async getTodaySales() {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from(this.sales.values()).filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === today.getTime();
    });
  }
  async getSaleById(id) {
    return this.sales.get(id);
  }
  async createSale(insertSale) {
    const id = randomUUID();
    const sale = {
      ...insertSale,
      salespersonId: insertSale.salespersonId || null,
      observation: insertSale.observation || null,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.sales.set(id, sale);
    return sale;
  }
  async getSalespersonById(id) {
    return this.salespersons.get(id);
  }
};
var storage = new MemStorage();

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/sales", async (req, res) => {
    try {
      const sales = await storage.getSales();
      res.json(sales);
>>>>>>> b6ea756efb67345bda2263b0f14deb536b617b7e
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales" });
    }
  });
<<<<<<< HEAD
  app2.get("/api/sales/today", async (_req, res) => {
    try {
      const sales2 = await storage.getTodaySales();
      const salesWithDetails = await Promise.all(
        sales2.map(async (sale) => {
=======
  app2.get("/api/sales/today", async (req, res) => {
    try {
      const sales = await storage.getTodaySales();
      const salesWithDetails = await Promise.all(
        sales.map(async (sale) => {
>>>>>>> b6ea756efb67345bda2263b0f14deb536b617b7e
          let salespersonName = void 0;
          if (sale.salespersonId) {
            const salesperson = await storage.getSalespersonById(sale.salespersonId);
            salespersonName = salesperson?.name;
          }
          return {
            ...sale,
            salespersonName
          };
        })
      );
      res.json(salesWithDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch today's sales" });
    }
  });
  app2.post("/api/sales", async (req, res) => {
    try {
      const sale = await storage.createSale(req.body);
      res.status(201).json(sale);
    } catch (error) {
      res.status(500).json({ error: "Failed to create sale" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
<<<<<<< HEAD
import fs2 from "fs";
import path2 from "path";

// server/db-init.ts
function logDatabaseStatus() {
  if (!isDatabaseConfigured()) {
    console.log("[DB] Banco n\xE3o configurado. Usando storage em mem\xF3ria.");
    return false;
  }
  console.log(`[DB] Banco configurado via DATABASE_URL. Preparado para Supabase/Postgres.`);
  return true;
}

// server/sync.ts
function getSupabaseUrl() {
  return process.env.SUPABASE_URL?.trim();
}
function getSupabaseKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_ANON_KEY?.trim();
}
async function syncPendingToSupabase() {
  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabaseKey();
  if (!supabaseUrl || !supabaseKey) {
    return { ok: false, reason: "missing_supabase_config" };
  }
  const pending = sqliteDb.prepare(
    "SELECT * FROM sync_queue WHERE synced = 0 ORDER BY created_at ASC"
  ).all();
  if (pending.length === 0) {
    return { ok: true, synced: 0 };
  }
  for (const item of pending) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/${item.entity}`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: item.payload
      });
      if (response.ok) {
        sqliteDb.prepare("UPDATE sync_queue SET synced = 1 WHERE id = ?").run(item.id);
      }
    } catch (error) {
      console.warn(`[SYNC] Falha ao sincronizar ${item.entity}:`, error);
      break;
    }
  }
  return { ok: true, synced: pending.filter((item) => item.synced === 1).length };
}
function scheduleSync() {
  if (typeof setInterval !== "function") return;
  const runSync = () => {
    void syncPendingToSupabase().catch(() => void 0);
  };
  runSync();
  const interval = setInterval(runSync, 15e3);
  if (typeof globalThis.addEventListener === "function") {
    globalThis.addEventListener("online", runSync);
    globalThis.addEventListener("offline", () => void 0);
  }
  return interval;
}

// server/index.ts
=======
import fs from "fs";
import path from "path";
>>>>>>> b6ea756efb67345bda2263b0f14deb536b617b7e
if (!process.env.NODE_ENV) {
  const npmScript = process.env.npm_lifecycle_event;
  if (npmScript === "start") {
    process.env.NODE_ENV = "production";
  } else {
    process.env.NODE_ENV = "development";
  }
  console.log(`[AUTO] NODE_ENV detectado: ${process.env.NODE_ENV} (via ${npmScript || "default"})`);
}
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
function serveStatic(app2) {
<<<<<<< HEAD
  const distPath = path2.resolve(import.meta.dirname, "..", "client", "dist");
  if (!fs2.existsSync(distPath)) {
=======
  const distPath = path.resolve(import.meta.dirname, "..", "client", "dist");
  if (!fs.existsSync(distPath)) {
>>>>>>> b6ea756efb67345bda2263b0f14deb536b617b7e
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
<<<<<<< HEAD
    res.sendFile(path2.resolve(distPath, "index.html"));
=======
    res.sendFile(path.resolve(distPath, "index.html"));
>>>>>>> b6ea756efb67345bda2263b0f14deb536b617b7e
  });
}
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
<<<<<<< HEAD
  const path3 = req.path;
=======
  const path2 = req.path;
>>>>>>> b6ea756efb67345bda2263b0f14deb536b617b7e
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
<<<<<<< HEAD
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
=======
    if (path2.startsWith("/api")) {
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
>>>>>>> b6ea756efb67345bda2263b0f14deb536b617b7e
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
<<<<<<< HEAD
  logDatabaseStatus();
  scheduleSync();
=======
>>>>>>> b6ea756efb67345bda2263b0f14deb536b617b7e
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
