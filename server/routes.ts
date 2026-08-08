import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
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

  app.delete("/api/products/:id", async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  app.get("/api/sales", async (_req, res) => {
    try {
      const sales = await storage.getSales();
      res.json(sales);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales" });
    }
  });

  app.get("/api/sales/today", async (_req, res) => {
    try {
      const sales = await storage.getTodaySales();

      const salesWithDetails = await Promise.all(
        sales.map(async (sale) => {
          let salespersonName = undefined;
          if (sale.salespersonId) {
            const salesperson = await storage.getSalespersonById(sale.salespersonId);
            salespersonName = salesperson?.name;
          }
          return {
            ...sale,
            salespersonName,
          };
        }),
      );

      res.json(salesWithDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch today's sales" });
    }
  });

  app.get("/api/sales/:id", async (req, res) => {
    try {
      const sale = await storage.getSaleById(req.params.id);
      if (!sale) {
        return res.status(404).json({ error: "Sale not found" });
      }

      const salespersonName = sale.salespersonId
        ? (await storage.getSalespersonById(sale.salespersonId))?.name
        : undefined;

      res.json({
        ...sale,
        salespersonName,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sale" });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const sale = await storage.createSale(req.body);
      res.status(201).json(sale);
    } catch (error) {
      res.status(500).json({ error: "Failed to create sale" });
    }
  });

  app.get("/api/service-orders", async (_req, res) => {
    try {
      const orders = await storage.getServiceOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service orders" });
    }
  });

  app.get("/api/service-orders/:id", async (req, res) => {
    try {
      const order = await storage.getServiceOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Service order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service order" });
    }
  });

  app.post("/api/service-orders", async (req, res) => {
    try {
      const order = await storage.createServiceOrder(req.body);
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to create service order" });
    }
  });

  app.put("/api/service-orders/:id", async (req, res) => {
    try {
      const order = await storage.updateServiceOrder(req.params.id, req.body);
      if (!order) {
        return res.status(404).json({ error: "Service order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update service order" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
