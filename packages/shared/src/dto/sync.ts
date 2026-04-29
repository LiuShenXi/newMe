export interface SyncPushItem {
  tableName: string;
  localId: string;
  remoteId: string | null;
  operation: 'create' | 'update' | 'delete';
  data: Record<string, unknown>;
  version: number;
}

export interface SyncPushRequest {
  items: SyncPushItem[];
  deviceId: string;
}

export interface SyncPushResultItem {
  localId: string;
  remoteId: string;
  status: 'success' | 'conflict' | 'error';
  newVersion: number;
  error?: string;
}

export interface SyncPullRequest {
  deviceId: string;
  lastPulledAt: string;
}

export interface SyncPullResponse {
  changes: {
    tableName: string;
    remoteId: string;
    operation: 'create' | 'update' | 'delete';
    data: Record<string, unknown>;
    version: number;
    updatedAt: string;
  }[];
  pulledAt: string;
}
