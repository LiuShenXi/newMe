import type * as SQLite from 'expo-sqlite';

import { SyncStatus } from '@newme/shared';

export const migrationV1 = {
  version: 1,
  async up(db: SQLite.SQLiteDatabase) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS local_goals (
        id TEXT PRIMARY KEY NOT NULL,
        remote_id TEXT,
        level TEXT NOT NULL,
        parent_id TEXT,
        period_id TEXT,
        title TEXT NOT NULL,
        content TEXT,
        source TEXT NOT NULL,
        metadata_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        sync_status TEXT NOT NULL DEFAULT '${SyncStatus.PENDING}',
        version INTEGER NOT NULL DEFAULT 1
      );

      CREATE INDEX IF NOT EXISTS idx_local_goals_remote_id ON local_goals(remote_id);
      CREATE INDEX IF NOT EXISTS idx_local_goals_level_period ON local_goals(level, period_id);
      CREATE INDEX IF NOT EXISTS idx_local_goals_sync_status ON local_goals(sync_status);

      CREATE TABLE IF NOT EXISTS local_weekly_focuses (
        id TEXT PRIMARY KEY NOT NULL,
        remote_id TEXT,
        week_id TEXT NOT NULL,
        title TEXT NOT NULL,
        reason TEXT,
        source TEXT NOT NULL,
        invalidated_at TEXT,
        metadata_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        sync_status TEXT NOT NULL DEFAULT '${SyncStatus.PENDING}',
        version INTEGER NOT NULL DEFAULT 1
      );

      CREATE INDEX IF NOT EXISTS idx_local_weekly_focuses_week_id ON local_weekly_focuses(week_id);
      CREATE INDEX IF NOT EXISTS idx_local_weekly_focuses_sync_status ON local_weekly_focuses(sync_status);

      CREATE TABLE IF NOT EXISTS local_todos (
        id TEXT PRIMARY KEY NOT NULL,
        remote_id TEXT,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        estimated_minutes INTEGER,
        source_focus_id TEXT,
        source TEXT NOT NULL,
        user_edited INTEGER NOT NULL DEFAULT 0,
        metadata_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        sync_status TEXT NOT NULL DEFAULT '${SyncStatus.PENDING}',
        version INTEGER NOT NULL DEFAULT 1
      );

      CREATE INDEX IF NOT EXISTS idx_local_todos_date ON local_todos(date);
      CREATE INDEX IF NOT EXISTS idx_local_todos_source_focus_id ON local_todos(source_focus_id);
      CREATE INDEX IF NOT EXISTS idx_local_todos_sync_status ON local_todos(sync_status);

      CREATE TABLE IF NOT EXISTS local_energy_entries (
        id TEXT PRIMARY KEY NOT NULL,
        remote_id TEXT,
        date TEXT NOT NULL,
        week_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        has_viewed_todos INTEGER NOT NULL DEFAULT 0,
        metadata_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        sync_status TEXT NOT NULL DEFAULT '${SyncStatus.PENDING}',
        version INTEGER NOT NULL DEFAULT 1
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_local_energy_entries_date ON local_energy_entries(date);
      CREATE INDEX IF NOT EXISTS idx_local_energy_entries_week_id ON local_energy_entries(week_id);
      CREATE INDEX IF NOT EXISTS idx_local_energy_entries_sync_status ON local_energy_entries(sync_status);

      CREATE TABLE IF NOT EXISTS local_settlements (
        id TEXT PRIMARY KEY NOT NULL,
        remote_id TEXT,
        week_id TEXT NOT NULL,
        suggested_score INTEGER NOT NULL,
        final_score INTEGER NOT NULL,
        reflection TEXT,
        snapshot_json TEXT NOT NULL DEFAULT '{}',
        confirmed_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        sync_status TEXT NOT NULL DEFAULT '${SyncStatus.PENDING}',
        version INTEGER NOT NULL DEFAULT 1
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_local_settlements_week_id ON local_settlements(week_id);
      CREATE INDEX IF NOT EXISTS idx_local_settlements_sync_status ON local_settlements(sync_status);

      CREATE TABLE IF NOT EXISTS local_tree_data (
        id TEXT PRIMARY KEY NOT NULL,
        remote_id TEXT,
        year INTEGER NOT NULL,
        week_id TEXT,
        quarter_id TEXT,
        kind TEXT NOT NULL,
        score INTEGER,
        label TEXT,
        capsule_summary TEXT,
        payload_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        sync_status TEXT NOT NULL DEFAULT '${SyncStatus.PENDING}',
        version INTEGER NOT NULL DEFAULT 1
      );

      CREATE INDEX IF NOT EXISTS idx_local_tree_data_year ON local_tree_data(year);
      CREATE INDEX IF NOT EXISTS idx_local_tree_data_kind ON local_tree_data(kind);
      CREATE INDEX IF NOT EXISTS idx_local_tree_data_sync_status ON local_tree_data(sync_status);

      CREATE TABLE IF NOT EXISTS local_ai_drafts (
        id TEXT PRIMARY KEY NOT NULL,
        remote_id TEXT,
        scenario TEXT NOT NULL,
        status TEXT NOT NULL,
        context_version TEXT,
        input_json TEXT NOT NULL DEFAULT '{}',
        output_json TEXT,
        error TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        sync_status TEXT NOT NULL DEFAULT '${SyncStatus.PENDING}',
        version INTEGER NOT NULL DEFAULT 1
      );

      CREATE INDEX IF NOT EXISTS idx_local_ai_drafts_scenario ON local_ai_drafts(scenario);
      CREATE INDEX IF NOT EXISTS idx_local_ai_drafts_status ON local_ai_drafts(status);
      CREATE INDEX IF NOT EXISTS idx_local_ai_drafts_sync_status ON local_ai_drafts(sync_status);

      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY NOT NULL,
        table_name TEXT NOT NULL,
        local_id TEXT NOT NULL,
        remote_id TEXT,
        operation TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT '${SyncStatus.PENDING}',
        retry_count INTEGER NOT NULL DEFAULT 0,
        last_error TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_table_local_id ON sync_queue(table_name, local_id);
    `);
  },
} as const;
