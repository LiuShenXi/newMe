import { useOnboardingStore } from '../../../stores/onboarding.store';

export function useOnboarding() {
  const store = useOnboardingStore();

  return {
    ...store,
    getInput: (key: Parameters<typeof store.setInput>[0]) => store.inputs[key] ?? '',
  };
}
