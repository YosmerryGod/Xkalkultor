import { neon } from '@neondatabase/serverless';

// [ADDED] Resolve the Neon connection string only on the server.
const getDatabaseUrl = () => {
  const databaseUrl =
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

  if (!databaseUrl) {
    throw new Error('Database connection is not configured. Set POSTGRES_URL or DATABASE_URL.');
  }

  return databaseUrl;
};

// [ADDED] Create a Neon SQL client when a database operation is requested.
export const getDb = () => neon(getDatabaseUrl());
