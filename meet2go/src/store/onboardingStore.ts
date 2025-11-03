import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingState {
  hasSeenTutorial: boolean;
  hasSeenOnboarding: boolean;
  setHasSeenTutorial: (seen: boolean) => Promise<void>;
  setHasSeenOnboarding: (seen: boolean) => Promise<void>;
  loadOnboardingState: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  hasSeenTutorial: false,
  hasSeenOnboarding: false,
  
  setHasSeenTutorial: async (seen: boolean) => {
    await AsyncStorage.setItem('hasSeenTutorial', JSON.stringify(seen));
    set({ hasSeenTutorial: seen });
  },
  
  setHasSeenOnboarding: async (seen: boolean) => {
    await AsyncStorage.setItem('hasSeenOnboarding', JSON.stringify(seen));
    set({ hasSeenOnboarding: seen });
  },
  
  loadOnboardingState: async () => {
    try {
      const tutorial = await AsyncStorage.getItem('hasSeenTutorial');
      const onboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      
      set({
        hasSeenTutorial: tutorial ? JSON.parse(tutorial) : false,
        hasSeenOnboarding: onboarding ? JSON.parse(onboarding) : false,
      });
    } catch (error) {
      console.error('Error loading onboarding state:', error);
    }
  },
}));


