import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ImageCropper from './ImageCropper';
import { UserSettings as UserSettingsType } from '../types';

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

  useEffect(() => {
    if (croppedImage) {
      setProfilePicture(croppedImage);
      setShowCropper(false);
    }
  }, [croppedImage]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">User Settings</h2>
          <button onClick={onClose} className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
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

        <div className="mb-4">
          <label className="inline-flex items-center cursor-pointer">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Dark Mode</span>
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-blue-500 rounded focus:ring-0 cursor-pointer dark:bg-gray-700 dark:border-gray-500"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
          </label>
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

        <div className="flex justify-end">
          <button onClick={handleSave} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
