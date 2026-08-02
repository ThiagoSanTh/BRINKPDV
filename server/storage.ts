import { 
  type User, 
  type InsertUser,
  type Sale,
  type InsertSale,
  type Salesperson
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Sales methods
  getSales(): Promise<Sale[]>;
  getTodaySales(): Promise<Sale[]>;
  getSaleById(id: string): Promise<Sale | undefined>;
  createSale(sale: InsertSale): Promise<Sale>;
  
  // Salesperson methods
  getSalespersonById(id: string): Promise<Salesperson | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private sales: Map<string, Sale>;
  private salespersons: Map<string, Salesperson>;

  constructor() {
    this.users = new Map();
    this.sales = new Map();
    this.salespersons = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getSales(): Promise<Sale[]> {
    return Array.from(this.sales.values());
  }

  async getTodaySales(): Promise<Sale[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.sales.values()).filter(sale => {
      const saleDate = new Date(sale.createdAt);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === today.getTime();
    });
  }

  async getSaleById(id: string): Promise<Sale | undefined> {
    return this.sales.get(id);
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const id = randomUUID();
    const sale: Sale = { 
      ...insertSale,
      salespersonId: insertSale.salespersonId || null,
      observation: insertSale.observation || null,
      id,
      createdAt: new Date()
    };
    this.sales.set(id, sale);
    return sale;
  }

  async getSalespersonById(id: string): Promise<Salesperson | undefined> {
    return this.salespersons.get(id);
  }
}

export const storage = new MemStorage();
