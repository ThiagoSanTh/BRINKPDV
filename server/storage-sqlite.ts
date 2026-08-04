import { randomUUID } from "crypto";
import { sqliteDb } from "./db-sqlite";
import {
  type InsertUser,
  type InsertSale,
  type User,
  type Sale,
  type Salesperson,
  type Product,
  type InsertProduct,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<void>;
  getSales(): Promise<Sale[]>;
  getTodaySales(): Promise<Sale[]>;
  getSaleById(id: string): Promise<Sale | undefined>;
  createSale(sale: InsertSale): Promise<Sale>;
  getSalespersonById(id: string): Promise<Salesperson | undefined>;
}

export class SqliteStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const row = sqliteDb.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    return row ? { ...row, id: row.id } : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const row = sqliteDb.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
    return row ? { ...row, id: row.id } : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user = { ...insertUser, id } as User;
    sqliteDb.prepare('INSERT INTO users (id, username, password) VALUES (?, ?, ?)').run(id, user.username, user.password);
    return user;
  }

  async getProducts(): Promise<Product[]> {
    const rows = sqliteDb.prepare('SELECT * FROM products ORDER BY name ASC').all() as any[];
    return rows.map((row) => ({
      ...row,
      id: row.id,
      price: Number(row.price),
      stock: Number(row.stock),
    })) as Product[];
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const row = sqliteDb.prepare('SELECT * FROM products WHERE id = ?').get(id) as any;
    return row ? ({
      ...row,
      id: row.id,
      price: Number(row.price),
      stock: Number(row.stock),
    }) as Product : undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      image: insertProduct.image ?? null,
      stock: Number(insertProduct.stock ?? 0),
      price: Number(insertProduct.price),
    } as Product;

    sqliteDb.prepare(
      'INSERT INTO products (id, sku, name, category, price, stock, image) VALUES (?, ?, ?, ?, ?, ?, ?)' 
    ).run(product.id, product.sku, product.name, product.category, product.price.toString(), product.stock, product.image ?? null);

    return product;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existing = await this.getProductById(id);
    if (!existing) return undefined;

    const next = {
      ...existing,
      ...product,
      price: Number(product.price ?? existing.price),
      stock: Number(product.stock ?? existing.stock),
    } as Product;

    sqliteDb.prepare(
      'UPDATE products SET sku = ?, name = ?, category = ?, price = ?, stock = ?, image = ? WHERE id = ?'
    ).run(next.sku, next.name, next.category, next.price.toString(), next.stock, next.image ?? null, id);

    return next;
  }

  async deleteProduct(id: string): Promise<void> {
    sqliteDb.prepare('DELETE FROM products WHERE id = ?').run(id);
  }

  async getSales(): Promise<Sale[]> {
    const rows = sqliteDb.prepare('SELECT * FROM sales ORDER BY created_at DESC').all() as any[];
    return rows.map((row) => ({
      ...row,
      id: row.id,
      salespersonId: row.salesperson_id,
      paymentMethod: row.payment_method,
      createdAt: new Date(row.created_at),
    })) as Sale[];
  }

  async getTodaySales(): Promise<Sale[]> {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0).toISOString();
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString();
    const rows = sqliteDb.prepare('SELECT * FROM sales WHERE created_at BETWEEN ? AND ? ORDER BY created_at DESC').all(start, end) as any[];

    return rows.map((row) => ({
      ...row,
      id: row.id,
      salespersonId: row.salesperson_id,
      paymentMethod: row.payment_method,
      createdAt: new Date(row.created_at),
    })) as Sale[];
  }

  async getSaleById(id: string): Promise<Sale | undefined> {
    const row = sqliteDb.prepare('SELECT * FROM sales WHERE id = ?').get(id) as any;
    return row ? ({
      ...row,
      id: row.id,
      salespersonId: row.salesperson_id,
      paymentMethod: row.payment_method,
      createdAt: new Date(row.created_at),
    }) as Sale : undefined;
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const id = randomUUID();
    const createdAt = new Date();
    const sale: Sale = {
      ...insertSale,
      id,
      salespersonId: insertSale.salespersonId || null,
      observation: insertSale.observation || null,
      createdAt,
    } as Sale;

    sqliteDb.prepare(
      'INSERT INTO sales (id, salesperson_id, total, payment_method, items, observation, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      sale.id,
      sale.salespersonId ?? null,
      sale.total.toString(),
      sale.paymentMethod,
      JSON.stringify(sale.items),
      sale.observation ?? null,
      createdAt.toISOString(),
    );

    sqliteDb.prepare(
      'INSERT INTO sync_queue (id, entity, payload, created_at, synced) VALUES (?, ?, ?, ?, 0)'
    ).run(randomUUID(), 'sales', JSON.stringify(sale), new Date().toISOString());

    return sale;
  }

  async getSalespersonById(id: string): Promise<Salesperson | undefined> {
    const row = sqliteDb.prepare('SELECT * FROM salespersons WHERE id = ?').get(id) as any;
    return row ? ({ ...row, id: row.id, commission: row.commission, totalSales: row.total_sales, active: Boolean(row.active), entryDate: row.entry_date }) as Salesperson : undefined;
  }
}
