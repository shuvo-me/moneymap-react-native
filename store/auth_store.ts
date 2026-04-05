// store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define types for state & actions
interface AuthStoreState {
    session: string | null;
    setSession: (session: string) => void;
    removeSession: () => void;
}

// Create store using the curried form of `create`
export const useAuthStore = create<AuthStoreState>()(persist((set) => ({
    session: null, // default value for session
    setSession: (session: string) => set({ session }),
    removeSession: () => set({ session: '' }),
}), {
    name: 'auth-storage', // name of the item in storage
    partialize: (state) => ({ session: state.session }), // only persist the session
}))
