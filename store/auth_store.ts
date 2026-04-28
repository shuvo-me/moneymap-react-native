// store.ts
import { mmkvStorage } from '@/services/storage.service';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';


export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt: string | undefined;
  onboardingComplete?: boolean; // Add this field to track onboarding status
}
interface AuthStoreState {
  session: User | null;
  setSession: (session: User) => void;
  removeSession: () => void;
  _hasHydrated?: boolean;
  hasSeenWelcome: boolean;
  completeWelcome: () => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      removeSession: () => set({ session: null }),
      _hasHydrated: false,
      hasSeenWelcome: false,
      completeWelcome: () => set({ hasSeenWelcome: true }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({ session: state.session, hasSeenWelcome: state.hasSeenWelcome }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
        }
      }
    }
  )
);