
import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { UserSettings } from '../types';

export function useThemeEffect(userSettings: UserSettings) {
  const { setTheme } = useTheme();

  useEffect(() => {
    const applyTheme = () => {
      if (userSettings.darkMode) {
        document.documentElement.classList.add('dark');
        setTheme('dark');
        console.log('Setting theme to dark from Header');
      } else {
        document.documentElement.classList.remove('dark');
        setTheme('light');
        console.log('Setting theme to light from Header');
      }
    };
    
    applyTheme();
    
    const timeoutId = setTimeout(applyTheme, 50);
    return () => clearTimeout(timeoutId);
  }, [userSettings.darkMode, setTheme]);

  return null;
}
