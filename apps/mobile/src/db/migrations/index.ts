import type * as SQLite from 'expo-sqlite';

import { migrationV1 } from './v1';

interface Migration {
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
  version: number;
}

const migrations: Migration[] = [migrationV1];

export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const currentVersion = await getUserVersion(db);
  const pendingMigrations = migrations.filter((migration) => migration.version > currentVersion);

  for (const migration of pendingMigrations) {
    await db.withTransactionAsync(async () => {
      await migration.up(db);
      await db.execAsync(`PRAGMA user_version = ${migration.version}`);
    });
  }
}

async function getUserVersion(db: SQLite.SQLiteDatabase): Promise<number> {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');

  return result?.user_version ?? 0;
}
