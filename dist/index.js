// server/index.ts
import express from "express";

// server/routes.ts
import { createServer } from "http";

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
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales" });
    }
  });
  app2.get("/api/sales/today", async (req, res) => {
    try {
      const sales = await storage.getTodaySales();
      const salesWithDetails = await Promise.all(
        sales.map(async (sale) => {
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
import fs from "fs";
import path from "path";
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
  const distPath = path.resolve(import.meta.dirname, "..", "client", "dist");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path2 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path2.startsWith("/api")) {
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
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
