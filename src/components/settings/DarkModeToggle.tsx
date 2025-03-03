
import React from 'react';

interface DarkModeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
  isDarkMode,
  onToggle,
}) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Dark Mode</span>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-5 sm:h-6 w-9 sm:w-11 items-center rounded-full transition-colors focus:outline-none ${
          isDarkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span
          className={`inline-block h-4 sm:h-5 w-4 sm:w-5 transform rounded-full bg-white transition-transform ${
            isDarkMode ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
          }`}
        />
        <span className="sr-only">Toggle Dark Mode</span>
      </button>
    </div>
  );
};

export default DarkModeToggle;
