
import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { UserSettings } from '../types';

export function useThemeEffect(userSettings: UserSettings) {
  const { setTheme } = useTheme();

  useEffect(() => {
    const applyTheme = () => {
      // Apply theme changes immediately
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
    
    // Apply theme immediately
    applyTheme();
    
    // No delay needed anymore as we're focusing on immediate updates
  }, [userSettings.darkMode, setTheme]);

  return null;
}
