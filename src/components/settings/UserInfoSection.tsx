
import React from 'react';

interface UserInfoSectionProps {
  username: string;
  fullName: string;
  email: string;
  onUsernameChange: (value: string) => void;
  onFullNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
}

const UserInfoSection: React.FC<UserInfoSectionProps> = ({
  username,
  fullName,
  email,
  onUsernameChange,
  onFullNameChange,
  onEmailChange,
}) => {
  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => onUsernameChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200 bg-white/70 dark:bg-gray-800/70 border-gray-300 dark:border-gray-700 backdrop-blur-sm"
      />
      <input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => onFullNameChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200 bg-white/70 dark:bg-gray-800/70 border-gray-300 dark:border-gray-700 backdrop-blur-sm"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200 bg-white/70 dark:bg-gray-800/70 border-gray-300 dark:border-gray-700 backdrop-blur-sm"
      />
    </div>
  );
};

export default UserInfoSection;
