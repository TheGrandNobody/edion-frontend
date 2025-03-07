import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ImageCropper from './ImageCropper';
import { UserSettings as UserSettingsType } from '../types';
import { Switch } from "@/components/ui/switch";

interface UserSettingsProps {
  settings: UserSettingsType;
  onClose: () => void;
  onSave: (settings: UserSettingsType) => void;
}

const UserSettings: React.FC<UserSettingsProps> = ({ settings, onClose, onSave }) => {
  const [username, setUsername] = useState(settings.username);
  const [fullName, setFullName] = useState(settings.fullName);
  const [email, setEmail] = useState(settings.email);
  const [profilePicture, setProfilePicture] = useState(settings.profilePicture);
  const [darkMode, setDarkMode] = useState(settings.darkMode);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  // We'll use the original settings as a reference so we can revert if needed
  const originalDarkMode = settings.darkMode;

  useEffect(() => {
    if (croppedImage) {
      setProfilePicture(croppedImage);
      setShowCropper(false);
    }
  }, [croppedImage]);

  // Apply dark mode in real-time when the toggle changes
  useEffect(() => {
    // Apply dark mode to document based on current state
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Cleanup function to handle component unmount or changes
    return () => {
      // Restore original dark mode setting if user hasn't saved
      if (originalDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
  }, [darkMode, originalDarkMode]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImageSrc(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    // Revert to original settings if user closes without saving
    setDarkMode(originalDarkMode);
    
    // Make sure the document class matches the original dark mode setting
    if (originalDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if user clicks the backdrop (not the modal content)
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSave = () => {
    const newSettings = {
      username,
      fullName,
      email,
      profilePicture,
      darkMode,
    };
    onSave(newSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={handleBackdropClick}>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">User Settings</h2>
          <button onClick={handleClose} className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <label htmlFor="profilePicture" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
            Profile Picture
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden">
              <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <input
              type="file"
              id="profilePicture"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <label htmlFor="profilePicture" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
              Change
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="fullName" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-500"
          />
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
            <Switch
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>
        </div>

        {showCropper && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <ImageCropper
              src={tempImageSrc}
              onCrop={setCroppedImage}
              onCancel={() => setShowCropper(false)}
            />
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button 
            onClick={handleClose} 
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
