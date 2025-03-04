
import React, { useRef, useState, useEffect } from 'react';
import { Upload, Lock, Trash2 } from 'lucide-react';
import { UserSettings } from '../types';

interface UserSettingsModalProps {
  settings: UserSettings;
  onClose: () => void;
  onSave: (settings: UserSettings) => void;
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  settings,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState(settings);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const originalDarkMode = useRef<boolean>(settings.darkMode);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (backdropRef.current === event.target) {
        handleCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePicture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = () => {
    setFormData({ ...formData, profilePicture: '' });
  };

  const handleDarkModeToggle = () => {
    // Update form data with new dark mode value
    const newDarkModeValue = !formData.darkMode;
    setFormData({ ...formData, darkMode: newDarkModeValue });
    
    // Apply dark mode change immediately for better UX
    if (newDarkModeValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handlePasswordChange = () => {
    // Simple validation
    if (!currentPassword) {
      setPasswordError('Current password is required');
      return false;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return false;
    }
    
    // In a real app, you would verify the current password against stored value
    // and then update with the new password
    
    setPasswordError('');
    return true;
  };

  const handleSave = () => {
    // If password fields are filled, validate password change
    if (currentPassword || newPassword || confirmPassword) {
      if (!handlePasswordChange()) {
        return;
      }
      // Password change successful, would save in a real app
    }
    
    // Update the original dark mode reference to prevent reverting on next open
    originalDarkMode.current = formData.darkMode;
    
    onSave(formData);
    onClose();
  };

  const handleCancel = () => {
    // Revert to original dark mode setting if it was changed but not saved
    if (formData.darkMode !== originalDarkMode.current) {
      if (originalDarkMode.current) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    // Close the modal
    onClose();
  };

  return (
    <div ref={backdropRef} className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div ref={modalRef} className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-md rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">User Settings</h2>
          
          <div className="space-y-4">
            {/* Profile Picture */}
            <div className="flex flex-col items-center space-y-2">
              <div className="relative">
                {formData.profilePicture ? (
                  <img
                    src={formData.profilePicture}
                    alt="Profile"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-lg">
                    <span className="text-gray-500 dark:text-gray-400 text-2xl">JS</span>
                  </div>
                )}
                <div className="absolute bottom-0 right-0 flex space-x-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 sm:p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 backdrop-blur-sm"
                  >
                    <Upload className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700 dark:text-gray-300" />
                  </button>
                  {formData.profilePicture && (
                    <button
                      onClick={handleRemoveProfilePicture}
                      className="p-1.5 sm:p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 backdrop-blur-sm"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                    </button>
                  )}
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>

            {/* User Info */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200 bg-white/70 dark:bg-gray-800/70 border-gray-300 dark:border-gray-700 backdrop-blur-sm"
              />
              <input
                type="text"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200 bg-white/70 dark:bg-gray-800/70 border-gray-300 dark:border-gray-700 backdrop-blur-sm"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200 bg-white/70 dark:bg-gray-800/70 border-gray-300 dark:border-gray-700 backdrop-blur-sm"
              />
            </div>

            {/* Password Change Section */}
            <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1">
                <Lock className="w-4 h-4" />
                Change Password
              </h3>
              
              {passwordError && (
                <p className="text-xs text-red-500">{passwordError}</p>
              )}
              
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200 bg-white/70 dark:bg-gray-800/70 border-gray-300 dark:border-gray-700 backdrop-blur-sm"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200 bg-white/70 dark:bg-gray-800/70 border-gray-300 dark:border-gray-700 backdrop-blur-sm"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200 bg-white/70 dark:bg-gray-800/70 border-gray-300 dark:border-gray-700 backdrop-blur-sm"
              />
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Dark Mode</span>
              <button
                onClick={handleDarkModeToggle}
                className={`relative inline-flex h-5 sm:h-6 w-9 sm:w-11 items-center rounded-full transition-colors focus:outline-none ${
                  formData.darkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 sm:h-5 w-4 sm:w-5 transform rounded-full bg-white transition-transform ${
                    formData.darkMode ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                  }`}
                />
                <span className="sr-only">Toggle Dark Mode</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={handleCancel}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-gray-800/70 rounded-lg backdrop-blur-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-lg"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsModal;
