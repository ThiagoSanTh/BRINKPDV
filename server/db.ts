import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

export function getDatabaseUrl(): string {
  return (process.env.DATABASE_URL || "").trim();
}

export function isDatabaseConfigured(): boolean {
  return Boolean(getDatabaseUrl());
}

export function getDb() {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    return null;
  }

  const client = postgres(databaseUrl, {
    ssl: "require",
    max: 1,
  });

  return drizzle(client, { schema });
}

export const db = getDb();
