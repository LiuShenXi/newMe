import { Injectable, Optional } from '@nestjs/common';
import {
  SyncPullRequest,
  SyncPullResponse,
  SyncPushItem,
  SyncPushRequest,
  SyncPushResultItem,
  SyncTableName,
} from '@newme/shared';
import { PrismaService } from '../../prisma/prisma.service';

export interface SyncServiceOptions {
  now?: () => Date;
}

type PrismaDelegate = {
  findUnique?: (args: unknown) => Promise<Record<string, unknown> | null>;
  findMany?: (args: unknown) => Promise<Record<string, unknown>[]>;
  create?: (args: unknown) => Promise<Record<string, unknown>>;
  update?: (args: unknown) => Promise<Record<string, unknown>>;
};

const TABLE_TO_DELEGATE: Record<SyncTableName, string> = {
  visions: 'vision',
  annual_objectives: 'annualObjective',
  quarter_goals: 'quarterGoal',
  month_goals: 'monthGoal',
  month_plans: 'monthPlan',
  week_plans: 'weekPlan',
  weekly_focuses: 'weeklyFocus',
  todos: 'todo',
  energy_entries: 'energyEntry',
  weekly_settlements: 'weeklySettlement',
  tree_fruits: 'treeFruit',
  quarter_honors: 'quarterHonor',
  ai_generations: 'aiGeneration',
};

@Injectable()
export class SyncService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly options?: SyncServiceOptions,
  ) {}

  async pushChanges(
    userId: string,
    request: SyncPushRequest,
  ): Promise<SyncPushResultItem[]> {
    const results: SyncPushResultItem[] = [];

    for (const item of request.items) {
      results.push(await this.pushOne(userId, item));
    }

    return results;
  }

  async pullChanges(
    userId: string,
    request: SyncPullRequest,
  ): Promise<SyncPullResponse> {
    const lastPulledAt = new Date(request.lastPulledAt);
    const changes: SyncPullResponse['changes'] = [];

    for (const [tableName, delegateName] of Object.entries(TABLE_TO_DELEGATE) as [
      SyncTableName,
      string,
    ][]) {
      const delegate = this.getDelegate(delegateName);
      if (!delegate?.findMany) continue;

      const records = await delegate.findMany({
        where: {
          userId,
          updatedAt: { gt: lastPulledAt },
        },
        orderBy: { updatedAt: 'asc' },
      });

      for (const record of records) {
        changes.push({
          tableName,
          remoteId: String(record.id),
          operation: record.deletedAt ? 'delete' : 'create',
          data: record,
          version: Number(record.version),
          updatedAt: (record.updatedAt as Date).toISOString(),
        });
      }
    }

    return {
      changes,
      pulledAt: (this.options?.now?.() ?? new Date()).toISOString(),
    };
  }

  private async pushOne(
    userId: string,
    item: SyncPushItem,
  ): Promise<SyncPushResultItem> {
    try {
      const delegate = this.getDelegate(TABLE_TO_DELEGATE[item.tableName]);
      if (!delegate) {
        throw new Error(`Unsupported sync table: ${item.tableName}`);
      }

      if (item.operation === 'create' || !item.remoteId) {
        if (!delegate.create) throw new Error('Create is not supported');
        const created = await delegate.create({
          data: {
            ...item.data,
            userId,
            version: 1,
          },
        });

        return {
          localId: item.localId,
          remoteId: String(created.id),
          status: 'success',
          newVersion: Number(created.version),
        };
      }

      if (!delegate.findUnique) throw new Error('Lookup is not supported');
      const existing = await delegate.findUnique({
        where: { id: item.remoteId },
      });
      if (!existing) {
        throw new Error('Remote record not found');
      }
      const serverVersion = Number(existing.version);
      if (serverVersion > item.version) {
        return {
          localId: item.localId,
          remoteId: item.remoteId,
          status: 'conflict',
          newVersion: serverVersion,
          error: '服务端版本更新',
        };
      }

      if (!delegate.update) throw new Error('Update is not supported');
      const nextVersion = serverVersion + 1;
      const updated = await delegate.update({
        where: { id: item.remoteId },
        data: {
          ...item.data,
          ...(item.operation === 'delete'
            ? { deletedAt: this.options?.now?.() ?? new Date() }
            : {}),
          version: nextVersion,
        },
      });

      return {
        localId: item.localId,
        remoteId: String(updated.id),
        status: 'success',
        newVersion: Number(updated.version),
      };
    } catch (error) {
      return {
        localId: item.localId,
        remoteId: item.remoteId ?? item.localId,
        status: 'error',
        newVersion: item.version,
        error: error instanceof Error ? error.message : '同步失败',
      };
    }
  }

  private getDelegate(delegateName: string): PrismaDelegate | undefined {
    return (this.prisma as unknown as Record<string, PrismaDelegate>)[
      delegateName
    ];
  }
}
