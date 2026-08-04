import { getDatabaseUrl, isDatabaseConfigured } from "./db";

export function logDatabaseStatus() {
  if (!isDatabaseConfigured()) {
    console.log("[DB] Banco não configurado. Usando storage em memória.");
    return false;
  }

  console.log(`[DB] Banco configurado via DATABASE_URL. Preparado para Supabase/Postgres.`);
  return true;
}

export function getDatabaseConnectionHint() {
  return {
    configured: isDatabaseConfigured(),
    databaseUrl: getDatabaseUrl() ? "***configurado***" : "não configurado",
  };
}
