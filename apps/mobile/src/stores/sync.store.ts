import { create } from 'zustand';

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
  setOnline(isOnline) {
    set({ isOnline });
  },
}));
