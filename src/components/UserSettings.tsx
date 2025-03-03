
import React, { useRef, useState } from 'react';
import { UserSettings } from '../types';
import { useTheme } from '../hooks/useTheme';
import ProfileImageSection from './settings/ProfileImageSection';
import UserInfoSection from './settings/UserInfoSection';
import PasswordChangeSection from './settings/PasswordChangeSection';
import DarkModeToggle from './settings/DarkModeToggle';
import ActionButtons from './settings/ActionButtons';

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
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useTheme();

  // Handle click outside to close
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (backdropRef.current === event.target) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleProfileImageChange = (newImage: string) => {
    setFormData({ ...formData, profilePicture: newImage });
  };

  const handleDarkModeToggle = () => {
    // Update form data with new dark mode value
    setFormData({ ...formData, darkMode: !formData.darkMode });
  };

  const handlePasswordChange = (currentPwd: string, newPwd: string) => {
    // If we get here, validation has already passed in the child component
    // In a real app, would validate and update password
    return true;
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div ref={backdropRef} className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div ref={modalRef} className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">User Settings</h2>
          
          <div className="space-y-4">
            {/* Profile Picture */}
            <ProfileImageSection 
              profilePicture={formData.profilePicture}
              onImageChange={handleProfileImageChange}
            />

            {/* User Info */}
            <UserInfoSection 
              username={formData.username}
              fullName={formData.fullName}
              email={formData.email}
              onUsernameChange={(value) => setFormData({ ...formData, username: value })}
              onFullNameChange={(value) => setFormData({ ...formData, fullName: value })}
              onEmailChange={(value) => setFormData({ ...formData, email: value })}
            />

            {/* Password Change Section */}
            <PasswordChangeSection
              onPasswordChange={handlePasswordChange}
            />

            {/* Dark Mode Toggle */}
            <DarkModeToggle 
              isDarkMode={formData.darkMode}
              onToggle={handleDarkModeToggle}
            />
          </div>

          {/* Actions */}
          <ActionButtons
            onCancel={onClose}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
};

export default UserSettingsModal;
