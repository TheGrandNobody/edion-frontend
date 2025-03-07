
import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, ShieldCheck, RotateCcw } from 'lucide-react';
import ImageCropper from './ImageCropper';
import { UserSettings as UserSettingsType } from '../types';
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface UserSettingsProps {
  settings: UserSettingsType;
  onClose: () => void;
  onSave: (settings: UserSettingsType) => void;
}

const UserSettings: React.FC<UserSettingsProps> = ({ settings, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<string>("general");
  const [username, setUsername] = useState(settings.username);
  const [fullName, setFullName] = useState(settings.fullName);
  const [email, setEmail] = useState(settings.email);
  const [profilePicture, setProfilePicture] = useState(settings.profilePicture);
  const [darkMode, setDarkMode] = useState(settings.darkMode);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  
  // Password change state
  const [changePassword, setChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Email change state
  const [changeEmail, setChangeEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  
  // 2FA state
  const [enable2FA, setEnable2FA] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [setupKey, setSetupKey] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);
  
  const { toast } = useToast();

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

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Password validation logic
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords match",
        variant: "destructive"
      });
      return;
    }
    
    if (newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, you would verify the current password and update with a backend call
    // For this demo, we'll just show a success message
    toast({
      title: "Password updated",
      description: "Your password has been successfully changed",
    });
    
    // Reset form
    setChangePassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Email validation logic
    if (!/^\S+@\S+\.\S+$/.test(newEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, you would verify the password and update email with a backend call
    // For this demo, we'll just update the local state and show a success message
    setEmail(newEmail);
    
    toast({
      title: "Email updated",
      description: "Your email has been successfully changed",
    });
    
    // Reset form
    setChangeEmail(false);
    setNewEmail("");
    setEmailPassword("");
  };

  const handle2FASetup = () => {
    // In a real app, you would generate a setup key and QR code
    // For this demo, we'll just generate a fake setup key
    const fakeSetupKey = "ABCD EFGH IJKL MNOP";
    setSetupKey(fakeSetupKey);
    setShowQRCode(true);
  };

  const handle2FAVerify = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Code validation logic
    if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
      toast({
        title: "Invalid code",
        description: "Please enter a valid 6-digit code",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, you would verify the code with a backend call
    // For this demo, we'll just show a success message
    toast({
      title: "2FA enabled",
      description: "Two-factor authentication has been successfully enabled",
    });
    
    // Reset form
    setEnable2FA(true);
    setShowQRCode(false);
    setVerificationCode("");
  };

  const renderPasswordSection = () => {
    if (!changePassword) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Change your password to keep your account secure.</p>
          <Button 
            onClick={() => setChangePassword(true)}
            className="w-full sm:w-auto"
          >
            <Lock className="mr-2 h-4 w-4" /> Change Password
          </Button>
        </div>
      );
    }
    
    return (
      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Current Password
          </label>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1"
            required
          />
        </div>
        
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            New Password
          </label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1"
            required
          />
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm New Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1"
            required
          />
        </div>
        
        <div className="flex space-x-2">
          <Button type="submit" variant="default">Save Password</Button>
          <Button variant="outline" onClick={() => setChangePassword(false)}>Cancel</Button>
        </div>
      </form>
    );
  };

  const renderEmailSection = () => {
    if (!changeEmail) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Your current email is: <span className="font-medium">{email}</span></p>
          <Button 
            onClick={() => setChangeEmail(true)}
            className="w-full sm:w-auto"
          >
            <Mail className="mr-2 h-4 w-4" /> Change Email
          </Button>
        </div>
      );
    }
    
    return (
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div>
          <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            New Email
          </label>
          <Input
            id="newEmail"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="mt-1"
            required
          />
        </div>
        
        <div>
          <label htmlFor="emailPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password (to confirm)
          </label>
          <Input
            id="emailPassword"
            type="password"
            value={emailPassword}
            onChange={(e) => setEmailPassword(e.target.value)}
            className="mt-1"
            required
          />
        </div>
        
        <div className="flex space-x-2">
          <Button type="submit" variant="default">Update Email</Button>
          <Button variant="outline" onClick={() => setChangeEmail(false)}>Cancel</Button>
        </div>
      </form>
    );
  };

  const render2FASection = () => {
    if (enable2FA && !showQRCode) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">2FA is currently enabled.</p>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => {
                setEnable2FA(false);
                toast({
                  title: "2FA disabled",
                  description: "Two-factor authentication has been disabled",
                });
              }}
            >
              Disable 2FA
            </Button>
          </div>
        </div>
      );
    }
    
    if (showQRCode) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Scan this QR code with your authenticator app or enter the setup key manually:
          </p>
          
          <div className="bg-white p-4 rounded-lg inline-block">
            {/* Placeholder for QR code - in a real app, this would be a real QR code */}
            <div className="w-40 h-40 bg-gray-200 flex items-center justify-center">
              <p className="text-sm text-gray-500">QR Code Placeholder</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Setup key:</p>
            <code className="block p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm mt-1">
              {setupKey}
            </code>
          </div>
          
          <form onSubmit={handle2FAVerify} className="space-y-4">
            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Verification Code
              </label>
              <Input
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="mt-1"
                placeholder="Enter the 6-digit code"
                maxLength={6}
                required
              />
            </div>
            
            <div className="flex space-x-2">
              <Button type="submit" variant="default">Verify & Enable</Button>
              <Button variant="outline" onClick={() => setShowQRCode(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Protect your account with two-factor authentication. You'll need to enter a code from your authenticator app when you log in.
        </p>
        <Button onClick={handle2FASetup} className="w-full sm:w-auto">
          <ShieldCheck className="mr-2 h-4 w-4" /> Set Up 2FA
        </Button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={handleBackdropClick}>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">User Settings</h2>
          <button onClick={handleClose} className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <Tabs 
          defaultValue="general" 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-4 mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6">
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
              <Input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="fullName" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Full Name
              </label>
              <Input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
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
          </TabsContent>
          
          <TabsContent value="password" className="space-y-6">
            {renderPasswordSection()}
          </TabsContent>
          
          <TabsContent value="email" className="space-y-6">
            {renderEmailSection()}
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6">
            {render2FASection()}
          </TabsContent>
        </Tabs>

        {showCropper && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <ImageCropper
              src={tempImageSrc}
              onCrop={setCroppedImage}
              onCancel={() => setShowCropper(false)}
            />
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <Button 
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
