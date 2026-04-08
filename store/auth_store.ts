// store.ts
import { mmkvStorage } from '@/services/storage.service';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';


interface User  {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
    createdAt: string | undefined;
}
interface AuthStoreState {
  session: User | null;
  setSession: (session: User) => void;
  removeSession: () => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      removeSession: () => set({ session: null }), 
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({ session: state.session }),
    }
  )
);