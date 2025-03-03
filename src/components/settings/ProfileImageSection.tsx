
import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface ProfileImageSectionProps {
  profilePicture: string;
  onImageChange: (newImage: string) => void;
}

const ProfileImageSection: React.FC<ProfileImageSectionProps> = ({
  profilePicture,
  onImageChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative">
        <img
          src={profilePicture}
          alt="Profile"
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-lg"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 p-1.5 sm:p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 backdrop-blur-sm"
        >
          <Upload className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700 dark:text-gray-300" />
        </button>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />
    </div>
  );
};

export default ProfileImageSection;
