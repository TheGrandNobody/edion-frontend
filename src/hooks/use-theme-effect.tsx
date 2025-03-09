import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { UserSettings } from '../types';

export function useThemeEffect(userSettings: UserSettings) {
  const { setTheme } = useTheme();

  useEffect(() => {
    if (userSettings.darkMode) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, [userSettings.darkMode, setTheme]);

  return null;
}
