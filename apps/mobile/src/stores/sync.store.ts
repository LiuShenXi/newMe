import { create } from 'zustand';

import { RuntimeSyncInput, RuntimeSyncSummary, syncOfflineChanges } from '../db/sync/runtime';

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastError: string | null;
  lastPulledAt: string | null;
  pendingCount: number;
  decrementPending: (count?: number) => void;
  incrementPending: (count?: number) => void;
  markSyncFailure: (error: string) => void;
  markSyncStart: () => void;
  markSyncSuccess: (lastPulledAt?: string) => void;
  runRuntimeSync: (input: RuntimeSyncInput) => Promise<RuntimeSyncSummary>;
  setOnline: (isOnline: boolean) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isOnline: true,
  isSyncing: false,
  lastError: null,
  lastPulledAt: null,
  pendingCount: 0,
  decrementPending(count = 1) {
    set((state) => ({ pendingCount: Math.max(0, state.pendingCount - count) }));
  },
  incrementPending(count = 1) {
    set((state) => ({ pendingCount: state.pendingCount + count }));
  },
  markSyncFailure(error) {
    set({ isSyncing: false, lastError: error });
  },
  markSyncStart() {
    set({ isSyncing: true, lastError: null });
  },
  markSyncSuccess(lastPulledAt = new Date().toISOString()) {
    set({ isSyncing: false, lastError: null, lastPulledAt });
  },
  async runRuntimeSync(input) {
    set({ isSyncing: true, lastError: null });

    try {
      const summary = await syncOfflineChanges(input);
      const lastError =
        summary.conflicts > 0 || summary.errors > 0
          ? `Sync completed with ${summary.conflicts} conflict(s) and ${summary.errors} error(s)`
          : null;

      set((state) => ({
        isSyncing: false,
        lastError,
        lastPulledAt: summary.pulledAt,
        pendingCount: Math.max(0, state.pendingCount - summary.pushed),
      }));

      return summary;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sync failed';
      set({ isSyncing: false, lastError: message });
      throw error;
    }
  },
  setOnline(isOnline) {
    set({ isOnline });
  },
}));
