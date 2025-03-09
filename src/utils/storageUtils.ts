
import { UserSettings, ChatHistoryItem } from '../types';

export const getUserSettingsFromStorage = (): UserSettings => {
  const storedSettings = localStorage.getItem('userSettings');
  if (storedSettings) {
    return JSON.parse(storedSettings);
  }
  return {
    username: 'teacher_jane',
    fullName: 'Jane Smith',
    email: 'jane.smith@school.edu',
    profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
    darkMode: false,
  };
};

export const getChatHistoryFromStorage = (): ChatHistoryItem[] => {
  const storedHistory = localStorage.getItem('chatHistory');
  if (storedHistory) {
    return JSON.parse(storedHistory);
  }
  return [];
};

export const updateUserSettings = (newSettings: UserSettings): void => {
  localStorage.setItem('userSettings', JSON.stringify(newSettings));
  
  // Use requestAnimationFrame to ensure DOM updates have occurred
  requestAnimationFrame(() => {
    window.dispatchEvent(new Event('storage'));
  });
};
