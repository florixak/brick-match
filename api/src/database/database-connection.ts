import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

export function createDatabaseConnection(databaseUrl: string) {
  const sql = neon(databaseUrl);
  return drizzle({ client: sql, schema });
}

export type Database = ReturnType<typeof createDatabaseConnection>;
