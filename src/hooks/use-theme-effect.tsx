
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
        console.log('Setting theme to dark from Hook');
      } else {
        document.documentElement.classList.remove('dark');
        setTheme('light');
        console.log('Setting theme to light from Hook');
      }
    };
    
    applyTheme();
    
    // Add a small delay to ensure the theme is applied after any animations
    const timeoutId = setTimeout(applyTheme, 50);
    return () => clearTimeout(timeoutId);
  }, [userSettings.darkMode, setTheme]);

  return null;
}
