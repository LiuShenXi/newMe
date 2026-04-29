import { create } from 'zustand';

type OnboardingPath = 'deep' | 'manual' | 'quick';
type OnboardingLevel = 'annual' | 'quarter' | 'month' | 'week' | 'today';

interface OnboardingDraft {
  id?: string;
  output: Record<string, unknown>;
  updatedAt: string;
}

interface OnboardingState {
  activePath: OnboardingPath | null;
  aiDrafts: Partial<Record<OnboardingLevel, OnboardingDraft>>;
  currentStep: number;
  inputs: Partial<Record<OnboardingLevel | 'vision' | 'quarterGoal', string>>;
  skippedLevels: OnboardingLevel[];
  applyAiDraft: (level: OnboardingLevel, draft: OnboardingDraft) => void;
  reset: () => void;
  setInput: (level: OnboardingLevel | 'vision' | 'quarterGoal', value: string) => void;
  setPath: (path: OnboardingPath) => void;
  setStep: (step: number) => void;
  skipLevel: (level: OnboardingLevel) => void;
}

const initialState = {
  activePath: null,
  aiDrafts: {},
  currentStep: 0,
  inputs: {},
  skippedLevels: [],
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,
  applyAiDraft(level, draft) {
    set((state) => ({ aiDrafts: { ...state.aiDrafts, [level]: draft } }));
  },
  reset() {
    set(initialState);
  },
  setInput(level, value) {
    set((state) => ({ inputs: { ...state.inputs, [level]: value } }));
  },
  setPath(path) {
    set({ activePath: path, currentStep: 0 });
  },
  setStep(step) {
    set({ currentStep: Math.max(0, step) });
  },
  skipLevel(level) {
    set((state) => ({
      skippedLevels: state.skippedLevels.includes(level)
        ? state.skippedLevels
        : [...state.skippedLevels, level],
    }));
  },
}));
