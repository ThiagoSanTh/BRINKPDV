import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.SQLITE_DB_PATH || path.resolve(__dirname, "..", "data", "brinkpdv.sqlite");

if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

export const sqliteDb = new Database(dbPath);

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
  "Vendedor Padrão",
  "vendedor@brinkcell.com",
  "000000000",
  "0.00",
  "0",
  1,
  new Date().toISOString(),
);

sqliteDb.prepare(`
  INSERT OR IGNORE INTO products (id, sku, name, category, price, stock, image)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`).run(
  "product-demo-1",
  "SKU-001",
  "Café Especial",
  "Bebidas",
  "12.90",
  "25",
  null,
);

sqliteDb.prepare(`
  INSERT OR IGNORE INTO products (id, sku, name, category, price, stock, image)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`).run(
  "product-demo-2",
  "SKU-002",
  "Sanduíche Artesanal",
  "Lanches",
  "24.50",
  "15",
  null,
);

sqliteDb.prepare(`
  INSERT OR IGNORE INTO products (id, sku, name, category, price, stock, image)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`).run(
  "product-demo-3",
  "SKU-003",
  "Pão de Queijo",
  "Padaria",
  "6.90",
  "40",
  null,
);
