
import React, { useState } from 'react';
import { Lock } from 'lucide-react';

interface PasswordChangeSectionProps {
  onPasswordChange: (currentPassword: string, newPassword: string) => boolean;
}

const PasswordChangeSection: React.FC<PasswordChangeSectionProps> = ({
  onPasswordChange,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

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
    return onPasswordChange(currentPassword, newPassword);
  };

  return (
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
  );
};

export default PasswordChangeSection;
