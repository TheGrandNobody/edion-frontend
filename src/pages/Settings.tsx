import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Lock, Mail, Shield, Check, RefreshCw, User, Bell } from 'lucide-react';
import ImageCropper from '../components/ImageCropper';
import { UserSettings as UserSettingsType } from '../types';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getUserSettingsFromStorage, updateUserSettings } from '../utils/storageUtils';
import { Switch } from "@/components/ui/switch";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Email change state
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  
  // 2FA state
  const [showQRCode, setShowQRCode] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'sms' | 'authenticator'>('authenticator');
  const [setupStep, setSetupStep] = useState(1);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [desktopNotifications, setDesktopNotifications] = useState(true);

  useEffect(() => {
    const settings = getUserSettingsFromStorage();
    setUsername(settings.username);
    setFullName(settings.fullName);
    setEmail(settings.email);
    setProfilePicture(settings.profilePicture);
    setDarkMode(settings.darkMode);
  }, []);

  useEffect(() => {
    if (croppedImage) {
      setProfilePicture(croppedImage);
      setShowCropper(false);

      const newSettings = getUserSettingsFromStorage();
      updateUserSettings({
        ...newSettings,
        profilePicture: croppedImage
      });
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

  const handleCancel = () => {
    const originalSettings = getUserSettingsFromStorage();
    navigate(-1);
  };

  const handleSave = () => {
    const newSettings = {
      username,
      fullName,
      email,
      profilePicture,
      darkMode,
    };
    
    updateUserSettings(newSettings);
    
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully",
    });
    
    navigate(-1);
  };

  const handleDisableTwoFactor = () => {
    setTwoFactorEnabled(false);
    toast({
      title: "2FA Disabled",
      description: "Two-factor authentication has been disabled for your account",
    });
  };

  const goToNextSetupStep = () => {
    if (setupStep === 1) {
      setSetupStep(2);
    } else {
      setTwoFactorEnabled(true);
      setShowQRCode(false);
      setTwoFactorCode("");
      setSetupStep(1);
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been enabled for your account",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <Button variant="outline" onClick={handleCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
        
        <div className="space-y-8">
          {/* Profile Section */}
          <div className="bg-card rounded-lg shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Profile</h2>
            </div>

            <div className="flex items-center space-x-6 mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-muted">
                <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label htmlFor="profilePicture" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded cursor-pointer inline-block">
                  Change Picture
                </label>
                <p className="text-sm text-muted-foreground mt-2">
                  Recommended: Square image, at least 400x400px
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-2">
                  Username
                </label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="email"
                    value={email}
                    readOnly
                    disabled
                    className="flex-1 bg-muted"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEmailChange(true)}
                  >
                    Change
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-card rounded-lg shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Security</h2>
            </div>

            <div className="space-y-4">
              {/* Password Change */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">Password</h3>
                      <p className="text-sm text-muted-foreground">Change your password</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setShowPasswordChange(true)} 
                    variant="outline"
                  >
                    Change
                  </Button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-muted-foreground">
                        {twoFactorEnabled ? "Enabled" : "Add an extra layer of security"}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => {
                      if (twoFactorEnabled) {
                        handleDisableTwoFactor();
                      } else {
                        setShowQRCode(true);
                      }
                    }} 
                    variant="outline"
                  >
                    {twoFactorEnabled ? "Disable" : "Enable"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-card rounded-lg shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Notifications</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="font-medium">Desktop Notifications</h3>
                  <p className="text-sm text-muted-foreground">Show notifications on your desktop</p>
                </div>
                <Switch
                  checked={desktopNotifications}
                  onCheckedChange={setDesktopNotifications}
                />
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="bg-card rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Dark Mode</h3>
                <p className="text-sm text-muted-foreground">Toggle dark mode theme</p>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
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
        
        <div className="flex justify-end mt-8 space-x-3">
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
