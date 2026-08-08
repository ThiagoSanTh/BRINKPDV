import { eq, and, gte, lte } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  products,
  salespersons,
  sales,
  serviceOrders,
  type InsertUser,
  type InsertSale,
  type InsertServiceOrder,
  type User,
  type Sale,
  type Salesperson,
  type InsertProduct,
  type Product,
  type ServiceOrder,
} from "@shared/schema";
import { randomUUID } from "crypto";

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
  getServiceOrders(): Promise<ServiceOrder[]>;
  getServiceOrderById(id: string): Promise<ServiceOrder | undefined>;
  createServiceOrder(order: InsertServiceOrder): Promise<ServiceOrder>;
  updateServiceOrder(id: string, order: Partial<InsertServiceOrder>): Promise<ServiceOrder | undefined>;
}

export class PostgresStorage implements IStorage {
  constructor(private readonly dbClient: typeof db) {}

  async getUser(id: string): Promise<User | undefined> {
    if (!this.dbClient) return undefined;
    const rows = await this.dbClient.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0] as User | undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!this.dbClient) return undefined;
    const rows = await this.dbClient.select().from(users).where(eq(users.username, username)).limit(1);
    return rows[0] as User | undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!this.dbClient) {
      throw new Error("Database is not configured");
    }

    const id = randomUUID();
    const user = { ...insertUser, id } as User;
    await this.dbClient.insert(users).values(user);
    return user;
  }

  async getProducts(): Promise<Product[]> {
    if (!this.dbClient) return [];
    const rows = await this.dbClient.select().from(products);
    return rows as Product[];
  }

  async getProductById(id: string): Promise<Product | undefined> {
    if (!this.dbClient) return undefined;
    const rows = await this.dbClient.select().from(products).where(eq(products.id, id)).limit(1);
    return rows[0] as Product | undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    if (!this.dbClient) {
      throw new Error("Database is not configured");
    }

    const id = randomUUID();
    const product = { ...insertProduct, id, image: insertProduct.image ?? null } as Product;
    await this.dbClient.insert(products).values(product);
    return product;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    if (!this.dbClient) return undefined;
    const existing = await this.getProductById(id);
    if (!existing) return undefined;
    const next = { ...existing, ...product, image: product.image ?? existing.image } as Product;
    await this.dbClient.update(products).set(next).where(eq(products.id, id));
    return next;
  }

  async deleteProduct(id: string): Promise<void> {
    if (!this.dbClient) return;
    await this.dbClient.delete(products).where(eq(products.id, id));
  }

  async getSales(): Promise<Sale[]> {
    if (!this.dbClient) return [];
    const rows = await this.dbClient.select().from(sales);
    return rows as Sale[];
  }

  async getTodaySales(): Promise<Sale[]> {
    if (!this.dbClient) return [];

    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const rows = await this.dbClient
      .select()
      .from(sales)
      .where(and(gte(sales.createdAt, start), lte(sales.createdAt, end)));

    return rows as Sale[];
  }

  async getSaleById(id: string): Promise<Sale | undefined> {
    if (!this.dbClient) return undefined;
    const rows = await this.dbClient.select().from(sales).where(eq(sales.id, id)).limit(1);
    return rows[0] as Sale | undefined;
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    if (!this.dbClient) {
      throw new Error("Database is not configured");
    }

    const id = randomUUID();
    const sale = {
      ...insertSale,
      id,
      salespersonId: insertSale.salespersonId || null,
      observation: insertSale.observation || null,
      createdAt: new Date(),
    } as Sale;

    await this.dbClient.insert(sales).values(sale);
    return sale;
  }

  async getSalespersonById(id: string): Promise<Salesperson | undefined> {
    if (!this.dbClient) return undefined;
    const rows = await this.dbClient.select().from(salespersons).where(eq(salespersons.id, id)).limit(1);
    return rows[0] as Salesperson | undefined;
  }

  async getServiceOrders(): Promise<ServiceOrder[]> {
    if (!this.dbClient) return [];
    const rows = await this.dbClient.select().from(serviceOrders);
    return rows as ServiceOrder[];
  }

  async getServiceOrderById(id: string): Promise<ServiceOrder | undefined> {
    if (!this.dbClient) return undefined;
    const rows = await this.dbClient.select().from(serviceOrders).where(eq(serviceOrders.id, id)).limit(1);
    return rows[0] as ServiceOrder | undefined;
  }

  async createServiceOrder(insertOrder: InsertServiceOrder): Promise<ServiceOrder> {
    if (!this.dbClient) {
      throw new Error("Database is not configured");
    }

    const id = randomUUID();
    const order = {
      ...insertOrder,
      id,
      serial: insertOrder.serial ?? null,
      exitDate: insertOrder.exitDate ?? null,
    } as ServiceOrder;

    await this.dbClient.insert(serviceOrders).values(order);
    return order;
  }

  async updateServiceOrder(id: string, update: Partial<InsertServiceOrder>): Promise<ServiceOrder | undefined> {
    if (!this.dbClient) return undefined;
    const existing = await this.getServiceOrderById(id);
    if (!existing) return undefined;

    const next = {
      ...existing,
      ...update,
      serial: update.serial ?? existing.serial ?? null,
      exitDate: update.exitDate ?? existing.exitDate ?? null,
    } as ServiceOrder;

    await this.dbClient.update(serviceOrders).set(next).where(eq(serviceOrders.id, id));
    return next;
  }
}
