import {
  type User,
  type InsertUser,
  type Sale,
  type InsertSale,
  type Salesperson,
  type Product,
  type InsertProduct,
  type ServiceOrder,
  type InsertServiceOrder,
} from "@shared/schema";
import { db, isDatabaseConfigured } from "./db";
import { SqliteStorage } from "./storage-sqlite";
import { PostgresStorage } from "./storage-postgres";

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

export class HybridStorage implements IStorage {
  private readonly sqliteStorage = new SqliteStorage();
  private readonly postgresStorage = new PostgresStorage(db as any);

  private async readWithFallback<T>(
    remoteRead: () => Promise<T>,
    localRead: () => Promise<T>,
  ): Promise<T> {
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

  async getUser(id: string): Promise<User | undefined> {
    return this.readWithFallback(
      () => this.postgresStorage.getUser(id),
      () => this.sqliteStorage.getUser(id),
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.readWithFallback(
      () => this.postgresStorage.getUserByUsername(username),
      () => this.sqliteStorage.getUserByUsername(username),
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const localUser = await this.sqliteStorage.createUser(user);

    if (!isDatabaseConfigured()) {
      return localUser;
    }

    try {
      await this.postgresStorage.createUser(localUser as any);
    } catch (error) {
      console.warn("[STORAGE] Não foi possível sincronizar usuário com o Postgres/Supabase.", error);
    }

    return localUser;
  }

  async getProducts(): Promise<Product[]> {
    return this.readWithFallback(
      () => this.postgresStorage.getProducts(),
      () => this.sqliteStorage.getProducts(),
    );
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return this.readWithFallback(
      () => this.postgresStorage.getProductById(id),
      () => this.sqliteStorage.getProductById(id),
    );
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const localProduct = await this.sqliteStorage.createProduct(product);

    if (!isDatabaseConfigured()) {
      return localProduct;
    }

    try {
      await this.postgresStorage.createProduct(localProduct as any);
    } catch (error) {
      console.warn("[STORAGE] Não foi possível sincronizar produto com o Postgres/Supabase.", error);
    }

    return localProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const localProduct = await this.sqliteStorage.updateProduct(id, product);

    if (!isDatabaseConfigured()) {
      return localProduct;
    }

    try {
      await this.postgresStorage.updateProduct(id, product);
    } catch (error) {
      console.warn("[STORAGE] Não foi possível sincronizar atualização de produto.", error);
    }

    return localProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.sqliteStorage.deleteProduct(id);

    if (!isDatabaseConfigured()) {
      return;
    }

    try {
      await this.postgresStorage.deleteProduct(id);
    } catch (error) {
      console.warn("[STORAGE] Não foi possível remover produto no Postgres/Supabase.", error);
    }
  }

  async getSales(): Promise<Sale[]> {
    return this.readWithFallback(
      () => this.postgresStorage.getSales(),
      () => this.sqliteStorage.getSales(),
    );
  }

  async getTodaySales(): Promise<Sale[]> {
    return this.readWithFallback(
      () => this.postgresStorage.getTodaySales(),
      () => this.sqliteStorage.getTodaySales(),
    );
  }

  async getSaleById(id: string): Promise<Sale | undefined> {
    return this.readWithFallback(
      () => this.postgresStorage.getSaleById(id),
      () => this.sqliteStorage.getSaleById(id),
    );
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const localSale = await this.sqliteStorage.createSale(sale);

    if (!isDatabaseConfigured()) {
      return localSale;
    }

    try {
      await this.postgresStorage.createSale(localSale as any);
    } catch (error) {
      console.warn("[STORAGE] Não foi possível sincronizar a venda com o Postgres/Supabase.", error);
    }

    return localSale;
  }

  async getSalespersonById(id: string): Promise<Salesperson | undefined> {
    return this.readWithFallback(
      () => this.postgresStorage.getSalespersonById(id),
      () => this.sqliteStorage.getSalespersonById(id),
    );
  }

  async getServiceOrders(): Promise<ServiceOrder[]> {
    return this.readWithFallback(
      () => this.postgresStorage.getServiceOrders(),
      () => this.sqliteStorage.getServiceOrders(),
    );
  }

  async getServiceOrderById(id: string): Promise<ServiceOrder | undefined> {
    return this.readWithFallback(
      () => this.postgresStorage.getServiceOrderById(id),
      () => this.sqliteStorage.getServiceOrderById(id),
    );
  }

  async createServiceOrder(order: InsertServiceOrder): Promise<ServiceOrder> {
    const localOrder = await this.sqliteStorage.createServiceOrder(order);

    if (!isDatabaseConfigured()) {
      return localOrder;
    }

    try {
      await this.postgresStorage.createServiceOrder(localOrder as any);
    } catch (error) {
      console.warn("[STORAGE] Não foi possível sincronizar a ordem de serviço com o Postgres/Supabase.", error);
    }

    return localOrder;
  }

  async updateServiceOrder(id: string, order: Partial<InsertServiceOrder>): Promise<ServiceOrder | undefined> {
    const localOrder = await this.sqliteStorage.updateServiceOrder(id, order);

    if (!isDatabaseConfigured()) {
      return localOrder;
    }

    try {
      await this.postgresStorage.updateServiceOrder(id, order);
    } catch (error) {
      console.warn("[STORAGE] Não foi possível sincronizar atualização da ordem de serviço.", error);
    }

    return localOrder;
  }
}

export const storage = new HybridStorage();
