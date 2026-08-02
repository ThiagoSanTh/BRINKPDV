import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Sales routes
  
  // Get all sales
  app.get("/api/sales", async (req, res) => {
    try {
      const sales = await storage.getSales();
      res.json(sales);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales" });
    }
  });

  // Get today's sales with salesperson info
  app.get("/api/sales/today", async (req, res) => {
    try {
      const sales = await storage.getTodaySales();
      
      // Enrich with salesperson names
      const salesWithDetails = await Promise.all(
        sales.map(async (sale) => {
          let salespersonName = undefined;
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

  // Create a sale
  app.post("/api/sales", async (req, res) => {
    try {
      const sale = await storage.createSale(req.body);
      res.status(201).json(sale);
    } catch (error) {
      res.status(500).json({ error: "Failed to create sale" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
