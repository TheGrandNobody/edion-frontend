
import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { UserSettings } from '../types';

export function useThemeEffect(userSettings: UserSettings) {
  const { setTheme } = useTheme();

  useEffect(() => {
    // Use a microtask to ensure state updates are processed first
    queueMicrotask(() => {
      // Apply theme changes based on state
      if (userSettings.darkMode) {
        setTheme('dark');
        document.documentElement.classList.add('dark');
        console.log('Setting theme to dark from Hook');
      } else {
        setTheme('light');
        document.documentElement.classList.remove('dark');
        console.log('Setting theme to light from Hook');
      }
    });
  }, [userSettings.darkMode, setTheme]);

  return null;
}
