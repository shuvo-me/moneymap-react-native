import { Appearance } from 'react-native';
import { create } from 'zustand';

interface ThemeState {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
    theme: Appearance.getColorScheme() === 'dark' ? 'dark' : 'light',
    toggleTheme: () => set((state) => {
        const nextTheme = state.theme === 'light' ? 'dark' : 'light';
        // This is the magic line that changes the system-level app style
        Appearance.setColorScheme(nextTheme);
        return { theme: nextTheme };
    }),
}));
